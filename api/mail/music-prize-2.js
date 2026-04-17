import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function normalizeJsonObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value;
}

/**
 * API endpoint for sending Music Room Prize Mail 2 (concert gift announcement)
 * POST /api/mail/music-prize-2
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

    if (!snapshot.access_code_id) {
      return res.status(500).json({
        error: 'Missing access code id',
        userMessage: 'Impossibile recuperare il profilo del giocatore.'
      });
    }

    // Extract progress data
    const progress = snapshot.progress || {};
    const roomProgress = progress.room_progress || {};
    const musicRoomProgress = roomProgress.musica;

    const { data: progressRow, error: progressRowError } = await supabase
      .from('player_progress')
      .select('email_state')
      .eq('access_code_id', snapshot.access_code_id)
      .single();

    if (progressRowError) {
      return res.status(500).json({
        error: 'Failed to load player progress',
        userMessage: 'Impossibile leggere lo stato email del giocatore.',
        details: progressRowError.message
      });
    }

    const emailState = normalizeJsonObject(progressRow?.email_state);
    const mail2State = normalizeJsonObject(emailState.music_prize_2);

    // Check if player has completed the Music Room
    if (!musicRoomProgress || !musicRoomProgress.prizeWon) {
      return res.status(403).json({
        error: 'Music room not completed',
        userMessage: 'Devi completare la Sala Musica per ricevere questa email.'
      });
    }

    // Check if Mail 2 was already sent
    if (mail2State.sent_at) {
      return res.status(409).json({
        error: 'Email already sent',
        userMessage: 'Questa email è già stata inviata.',
        sentAt: mail2State.sent_at
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
    <meta charset="UTF-8" />
    <title>Concerto per due</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#14141d;border-radius:12px;overflow:hidden;border:1px solid #262637;">
            <!-- Header -->
            <tr>
              <td style="padding:24px 24px 16px 24px;background:linear-gradient(135deg,#191927,#262637);border-bottom:1px solid #262637;">
                <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b3b3ff;">
                  La Mostra delle Ombre Illuminate
                </p>
                <h1 style="margin:8px 0 0 0;font-size:22px;line-height:1.3;color:#ffffff;">
                  Un biglietto fuori dalla sala
                </h1>
              </td>
            </tr>

            <!-- Saluto -->
            <tr>
              <td style="padding:20px 24px 8px 24px;">
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#e5e5f5;">
                  Ciao Francesca,
                </p>
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#c5c5dd;">
                  alcune ombre, quando le attraversi, lasciano qualcosa che non può stare
                  dentro una stanza virtuale. Questa volta è una di quelle.
                </p>
              </td>
            </tr>

            <!-- Blocco regalo -->
            <tr>
              <td style="padding:8px 24px 16px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:10px;border:1px solid #2c2c3b;background:radial-gradient(circle at 0% 0%,#25253a,#171720);">
                  <tr>
                    <td style="padding:16px 18px 18px 18px;">
                      <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#ffd59e;">
                        Regalo reale
                      </p>
                      <h2 style="margin:0 0 10px 0;font-size:18px;line-height:1.4;color:#ffffff;">
                        Concerto dei Pinguini Tattici Nucleari · x2
                      </h2>
                      <p style="margin:0 0 10px 0;font-size:13px;line-height:1.8;color:#d0d0ea;">
                        Per celebrare la Sala delle Frequenze, il regalo è una serata da tenere
                        fuori dallo schermo: un <strong>concerto dei Pinguini Tattici Nucleari</strong>,
                        per due persone.
                      </p>
                      <p style="margin:0 0 10px 0;font-size:13px;line-height:1.8;color:#c5c5dd;">
                        Il biglietto è valido per due persone e ti permetterà di vivere un'esperienza musicale unica.
                      </p>
                      <p style="margin:0;font-size:12px;line-height:1.8;color:#9f9fb8;">
                        Consideralo il corrispettivo, nel mondo reale, della Frequenza Nascosta:
                        un appuntamento che puoi far suonare quando vuoi.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Invito a parlarne -->
            <tr>
              <td style="padding:0 24px 20px 24px;">
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.7;color:#c5c5dd;">
                  Non c’è nessuna scadenza nascosta: il biglietto resta qui,
                  in sospeso, finché non vorrai usarlo.
                </p>
              </td>
            </tr>

            <!-- Firma -->
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <p style="margin:0 0 4px 0;font-size:13px;line-height:1.6;color:#c5c5dd;">
                  Con calma, ma con entusiasmo,
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#e5e5f5;">
                  <strong>Andrea</strong><br />
                  Curatrice della Mostra delle Ombre
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px 20px 24px;border-top:1px solid #262637;background-color:#111118;">
                <p style="margin:0;font-size:11px;line-height:1.6;color:#6e6e86;">
                  Questa mail è legata al tuo percorso nella
                  <strong>“Mostra delle Ombre Illuminate”</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `.trim();

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'andrea@mostra-ombre.org';
    const fromName = process.env.RESEND_FROM_NAME || 'Andrea Sachs';

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: playerEmail,
      subject: 'Un regalo speciale per te - Path to Graduation',
      html: emailHtml,
    });

    if (emailError) {
      return res.status(500).json({
        error: 'Failed to send email',
        userMessage: 'Impossibile inviare l\'email.',
        details: emailError
      });
    }

    // Update email_state in player_progress
    const now = new Date().toISOString();
    const nextEmailState = {
      ...emailState,
      music_prize_2: {
        ...mail2State,
        sent_at: now,
        email_id: emailData?.id ?? null,
        recipient: playerEmail,
      },
    };

    const { error: saveError } = await supabase
      .from('player_progress')
      .update({ email_state: nextEmailState })
      .eq('access_code_id', snapshot.access_code_id);

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
    console.error('Error in music-prize-2 endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      userMessage: 'Errore interno del server.',
      details: error.message
    });
  }
}
