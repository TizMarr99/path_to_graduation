import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

/**
 * API endpoint for sending Music Room Prize Mail 1 (artifact + gettone)
 * POST /api/mail/music-prize-1
 * Body: { accessCode: string }
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      userMessage: 'Metodo non consentito.'
    });
  }

  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(400).json({
        error: 'Missing access code',
        userMessage: 'Codice di accesso mancante.'
      });
    }

    // Validate Resend configuration
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Resend not configured',
        userMessage: 'Servizio email non configurato.'
      });
    }

    // Validate Supabase configuration
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Supabase not configured',
        userMessage: 'Database non configurato.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get player snapshot via RPC
    const { data: snapshot, error: snapshotError } = await supabase.rpc('app_get_snapshot', {
      p_code: accessCode
    });

    if (snapshotError) {
      return res.status(400).json({
        error: 'Failed to get player snapshot',
        userMessage: 'Impossibile recuperare i dati del giocatore.',
        details: snapshotError.message
      });
    }

    if (!snapshot) {
      return res.status(404).json({
        error: 'Player not found',
        userMessage: 'Giocatore non trovato.'
      });
    }

    // Extract progress data
    const progress = snapshot.progress || {};
    const roomProgress = progress.room_progress || {};
    const musicRoomProgress = roomProgress.musica;

    // Check if player has completed the Music Room
    if (!musicRoomProgress || !musicRoomProgress.prizeWon) {
      return res.status(403).json({
        error: 'Music room not completed',
        userMessage: 'Devi completare la Sala Musica per ricevere questa email.'
      });
    }

    // Check if Mail 1 was already sent
    if (progress.music_mail1_sent_at) {
      return res.status(409).json({
        error: 'Email already sent',
        userMessage: 'Questa email è già stata inviata.',
        sentAt: progress.music_mail1_sent_at
      });
    }

    // Get player email (placeholder - will need to be implemented properly)
    // For now, use a test email from environment or return error
    const playerEmail = process.env.TEST_EMAIL || snapshot.email;

    if (!playerEmail) {
      return res.status(400).json({
        error: 'No email address',
        userMessage: 'Indirizzo email non disponibile. Contatta l\'amministratore.'
      });
    }

    // Prepare email content (placeholder)
    const emailHtml = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Il tuo premio dalla Sala Musica</title>
</head>
<body>
  <!-- TODO: email 1 template -->
  <h1>Congratulazioni!</h1>
  <p>Hai completato la Sala Musica e vinto l'artefatto!</p>
  <p>Questo è un template placeholder. Il contenuto definitivo verrà inserito successivamente.</p>
</body>
</html>
    `.trim();

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'andrea@mostre-ombre.it';
    const fromName = process.env.RESEND_FROM_NAME || 'Andrea';

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: playerEmail,
      subject: 'Il tuo premio dalla Sala Musica - Path to Graduation',
      html: emailHtml,
    });

    if (emailError) {
      return res.status(500).json({
        error: 'Failed to send email',
        userMessage: 'Impossibile inviare l\'email.',
        details: emailError
      });
    }

    // Update music_mail1_sent_at in player_progress
    const now = new Date().toISOString();
    progress.music_mail1_sent_at = now;

    // Save updated progress via RPC
    const { error: saveError } = await supabase.rpc('app_save_snapshot', {
      p_code: accessCode,
      p_progress: progress,
      p_daily: snapshot.daily || {}
    });

    if (saveError) {
      // Email was sent but tracking update failed - log this
      console.error('Email sent but tracking update failed:', saveError);
      return res.status(200).json({
        success: true,
        emailId: emailData?.id,
        warning: 'Email inviata ma impossibile aggiornare il tracking.',
        sentAt: now
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      emailId: emailData?.id,
      userMessage: 'Email inviata con successo!',
      sentAt: now
    });

  } catch (error) {
    console.error('Error in music-prize-1 endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      userMessage: 'Errore interno del server.',
      details: error.message
    });
  }
}
