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

function applyCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      userMessage: 'Metodo non consentito.',
    });
  }

  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(400).json({
        error: 'Missing access code',
        userMessage: 'Codice di accesso mancante.',
      });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Resend not configured',
        userMessage: 'Servizio email non configurato.',
      });
    }

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Supabase not configured',
        userMessage: 'Database non configurato.',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: snapshot, error: snapshotError } = await supabase.rpc('app_get_snapshot', {
      p_code: accessCode,
    });

    if (snapshotError) {
      return res.status(400).json({
        error: 'Failed to get player snapshot',
        userMessage: 'Impossibile recuperare i dati del giocatore.',
        details: snapshotError.message,
      });
    }

    if (!snapshot?.access_code_id) {
      return res.status(404).json({
        error: 'Player not found',
        userMessage: 'Giocatore non trovato.',
      });
    }

    const { data: accessCodeRow, error: accessCodeError } = await supabase
      .from('access_codes')
      .select('email')
      .eq('id', snapshot.access_code_id)
      .single();

    if (accessCodeError) {
      return res.status(500).json({
        error: 'Failed to load recipient email',
        userMessage: "Impossibile recuperare l'email del destinatario.",
        details: accessCodeError.message,
      });
    }

    const progress = snapshot.progress || {};
    const roomProgress = progress.room_progress || {};
    const serieFilmProgress = roomProgress['serie-film'];

    if (!serieFilmProgress || !serieFilmProgress.prizeWon) {
      return res.status(403).json({
        error: 'Serie-film room not completed',
        userMessage: 'Devi completare la Sala Serie & Film per ricevere questa email.',
      });
    }

    const { data: progressRow, error: progressRowError } = await supabase
      .from('player_progress')
      .select('email_state')
      .eq('access_code_id', snapshot.access_code_id)
      .single();

    if (progressRowError) {
      return res.status(500).json({
        error: 'Failed to load player progress',
        userMessage: 'Impossibile leggere lo stato email del giocatore.',
        details: progressRowError.message,
      });
    }

    const emailState = normalizeJsonObject(progressRow?.email_state);
    const artifactMailState = normalizeJsonObject(emailState.serie_film_artifact);

    if (artifactMailState.sent_at) {
      return res.status(409).json({
        error: 'Email already sent',
        userMessage: 'Questa email è già stata inviata.',
        sentAt: artifactMailState.sent_at,
      });
    }

    const playerEmail = process.env.TEST_EMAIL?.trim() || accessCodeRow?.email?.trim() || '';

    if (!playerEmail) {
      return res.status(400).json({
        error: 'No email address',
        userMessage: "Indirizzo email non disponibile. Contatta l'amministratore.",
      });
    }

    const baseUrl = process.env.VITE_BASE_URL || 'https://la-mostra-delle-ombre.vercel.app';

    const emailHtml = `
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>Fotogramma Maledetto</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#14141d;border-radius:12px;overflow:hidden;border:1px solid #262637;">
            <tr>
              <td style="padding:24px 24px 16px 24px;background:linear-gradient(135deg,#191927,#262637);border-bottom:1px solid #262637;">
                <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b3b3ff;">
                  La Mostra delle Ombre Illuminate
                </p>
                <h1 style="margin:8px 0 0 0;font-size:22px;line-height:1.3;color:#ffffff;">
                  Sala Serie &amp; Film · Esito della Prova
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 24px 8px 24px;">
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#e5e5f5;">
                  Ciao Francesca,
                </p>
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#c5c5dd;">
                  hai attraversato la <strong>Sala delle Serie &amp; Film</strong> e hai tenuto insieme
                  immagini, voci e ricordi senza lasciarti piegare dal buio della sala.
                </p>
                <p style="margin:0 0 4px 0;font-size:13px;line-height:1.6;color:#9f9fb8;">
                  Ogni volto riconosciuto, ogni collegamento ricomposto, ogni citazione restituita al suo autore:
                  il percorso è ormai tuo.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 24px 8px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:10px;border:1px solid #2c2c3b;background:radial-gradient(circle at 0% 0%,#23233a,#151520);">
                  <tr>
                    <td style="padding:16px 18px 14px 18px;">
                      <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b3b3ff;">
                        Artefatto ottenuto
                      </p>
                      <h2 style="margin:0 0 8px 0;font-size:18px;line-height:1.4;color:#ffffff;">
                        Fotogramma Maledetto
                      </h2>
                      <p style="margin:0 0 8px 0;font-size:13px;line-height:1.7;color:#d0d0ea;">
                        È il frammento che resta quando una scena smette di spaventare e comincia a rivelarsi.
                        La sala lo consegna solo a chi sa riconoscere cosa c'è davvero dentro le immagini.
                      </p>
                      <p style="margin:0;font-size:12px;line-height:1.7;color:#9f9fb8;">
                        Nel gioco, il Fotogramma Maledetto ti concede <strong>un indizio extra basato sulle immagini</strong>
                        che hai raccolto durante il percorso finale.
                      </p>
                    </td>
                    <td style="padding:16px 18px 14px 0;width:120px;" align="right" valign="middle">
                      <div style="width:96px;height:96px;border-radius:12px;border:1px solid rgba(255,255,255,0.18);box-shadow:0 0 18px rgba(167,139,250,0.35);display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,rgba(44,44,72,0.9),rgba(20,20,34,0.95));font-size:40px;">
                        🎞️
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 24px 16px 24px;">
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.7;color:#c5c5dd;">
                  Nella <strong>Sala delle Ombre</strong> vedrai la traccia di questo artefatto affiancarsi alla sala superata,
                  come prova del fatto che hai saputo guardare oltre la superficie.
                </p>
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.7;color:#9f9fb8;">
                  Se hai conquistato anche premi reali, troverai un'altra mail dedicata con il riepilogo di ciò che hai sbloccato.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 24px 24px;">
                <p style="margin:0 0 4px 0;font-size:13px;line-height:1.6;color:#c5c5dd;">
                  A presto,
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#e5e5f5;">
                  <strong>Andrea</strong><br />
                  Curatrice della Mostra delle Ombre
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px 20px 24px;border-top:1px solid #262637;background-color:#111118;">
                <p style="margin:0;font-size:11px;line-height:1.6;color:#6e6e86;">
                  Questa mail fa parte dell'esperienza interattiva <strong>"La Mostra delle Ombre Illuminate"</strong> ·
                  <a href="${baseUrl}" style="color:#818cf8;text-decoration:none;">Torna alla mostra</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'La Mostra <noreply@la-mostra-delle-ombre.vercel.app>',
      to: [playerEmail],
      subject: 'Il tuo artefatto dalla Sala Serie & Film - Path to Graduation',
      html: emailHtml,
    });

    if (emailError) {
      return res.status(500).json({
        error: 'Failed to send email',
        userMessage: "Impossibile inviare l'email premio.",
        details: emailError.message,
      });
    }

    const nowIso = new Date().toISOString();
    const updatedEmailState = {
      ...emailState,
      serie_film_artifact: {
        sent_at: nowIso,
        email_id: emailData?.id ?? null,
      },
    };

    await supabase
      .from('player_progress')
      .update({ email_state: updatedEmailState })
      .eq('access_code_id', snapshot.access_code_id);

    return res.status(200).json({
      success: true,
      emailId: emailData?.id,
      userMessage: 'Email artefatto Serie & Film inviata!',
      sentAt: nowIso,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      userMessage: 'Si è verificato un errore interno.',
      details: error.message,
    });
  }
}