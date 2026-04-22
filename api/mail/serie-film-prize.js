import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PRIZE_COPY = {
  'fixed-association-prize': {
    eyebrow: 'Premio fisso',
    title: 'Premio fisso della sala',
    description:
      'Hai superato almeno cinque prove su sei tra associazioni principali e love matching. Questo riconoscimento premia la parte piu tecnica e relazionale dell’intera sala.',
  },
  'cinema-ticket-base': {
    eyebrow: 'Premio incrementale',
    title: 'Cinema Base',
    description: 'Hai conquistato il livello base: un biglietto cinema.',
  },
  'cinema-ticket-premium': {
    eyebrow: 'Premio incrementale',
    title: 'Cinema Premium',
    description: 'Hai conquistato il livello premium: biglietto cinema con aperitivo in sala.',
  },
  'cinema-ticket-diamond': {
    eyebrow: 'Premio incrementale',
    title: 'Cinema Diamond',
    description: 'Hai conquistato il livello diamond: biglietto cinema con pranzo o cena in sala.',
  },
};

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

function resolveWonPrizeIds(serieFilmProgress) {
  const persistedSummary = normalizeJsonObject(serieFilmProgress?.lastOutcomeSummary);
  const completedSessionSummary = normalizeJsonObject(serieFilmProgress?.lastCompletedSession?.outcomeSummary);
  const summary = Object.keys(persistedSummary).length > 0 ? persistedSummary : completedSessionSummary;
  const rawPrizeIds = Array.isArray(summary?.subPrizesWon) ? summary.subPrizesWon : [];

  const hasDiamond = rawPrizeIds.includes('cinema-ticket-diamond');
  const hasPremium = rawPrizeIds.includes('cinema-ticket-premium');
  const hasBase = rawPrizeIds.includes('cinema-ticket-base');

  const filteredPrizeIds = rawPrizeIds.filter((prizeId) => {
    if (prizeId === 'cinema-ticket-base') {
      return !hasPremium && !hasDiamond;
    }

    if (prizeId === 'cinema-ticket-premium') {
      return !hasDiamond;
    }

    return true;
  });

  if (!hasBase && !hasPremium && !hasDiamond) {
    return filteredPrizeIds;
  }

  return filteredPrizeIds;
}

function buildPrizeBlocks(prizeIds) {
  return prizeIds
    .map((prizeId) => {
      const prizeCopy = PRIZE_COPY[prizeId];

      if (!prizeCopy) {
        return '';
      }

      return `
        <tr>
          <td style="padding:0 24px 14px 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#1a1a2e;border-radius:8px;border:1px solid #2a2a44;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a78bfa;">
                    ${prizeCopy.eyebrow}
                  </p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">
                    ${prizeCopy.title}
                  </p>
                  <p style="margin:8px 0 0 0;font-size:13px;line-height:1.6;color:#c5c5dd;">
                    ${prizeCopy.description}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join('');
}

/**
 * API endpoint for sending Serie & Film Room Prize Mail
 * POST /api/mail/serie-film-prize
 * Body: { accessCode: string }
 */
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

    if (!snapshot) {
      return res.status(404).json({
        error: 'Player not found',
        userMessage: 'Giocatore non trovato.',
      });
    }

    if (!snapshot.access_code_id) {
      return res.status(500).json({
        error: 'Missing access code id',
        userMessage: 'Impossibile recuperare il profilo del giocatore.',
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
    const serieFilmPrizeState = normalizeJsonObject(emailState.serie_film_prize);
    const wonPrizeIds = resolveWonPrizeIds(serieFilmProgress);

    if (!serieFilmProgress || !serieFilmProgress.prizeWon) {
      return res.status(403).json({
        error: 'Serie & Film room not completed',
        userMessage: 'Devi completare la Sala Serie & Film per ricevere questa email.',
      });
    }

    if (serieFilmPrizeState.sent_at) {
      return res.status(409).json({
        error: 'Email already sent',
        userMessage: 'Questa email è già stata inviata.',
        sentAt: serieFilmPrizeState.sent_at,
      });
    }

    const playerEmail = process.env.TEST_EMAIL?.trim() || accessCodeRow?.email?.trim() || '';

    if (!playerEmail) {
      return res.status(400).json({
        error: 'No email address',
        userMessage: "Indirizzo email non disponibile. Contatta l'amministratore.",
      });
    }

    if (!wonPrizeIds.length) {
      return res.status(403).json({
        error: 'No real prize won',
        userMessage: 'Nessun premio reale sbloccato per questa sala.',
      });
    }

    const baseUrl = process.env.VITE_BASE_URL || 'https://la-mostra-delle-ombre.vercel.app';
    const prizeBlocksHtml = buildPrizeBlocks(wonPrizeIds);

    const emailHtml = `
  <!DOCTYPE html>
  <html lang="it">
    <head>
    <meta charset="UTF-8" />
    <title>L'Archivio Segreto - Sala Serie &amp; Film</title>
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
            Sala Serie &amp; Film · Esito della Prova
          </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:20px 24px 8px 24px;">
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#e5e5f5;">
            Ciao Francesca,
          </p>
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#c5c5dd;">
            hai portato a termine la <strong>Sala delle Serie &amp; Film</strong> e il percorso
            ha convertito ciò che hai sbloccato in premi reali. Le immagini ora hanno lasciato
            qualcosa anche fuori dallo schermo.
          </p>
          <p style="margin:0 0 4px 0;font-size:13px;line-height:1.6;color:#9f9fb8;">
            Qui sotto trovi solo ciò che hai davvero conquistato in questa corsa.
          </p>
          </td>
        </tr>

        ${prizeBlocksHtml}

        <tr>
          <td style="padding:8px 24px 20px 24px;">
            <p style="margin:0;font-size:13px;line-height:1.7;color:#9f9fb8;">
              Se vorrai, potrai usare questo riepilogo come traccia per ricordare esattamente
              quale livello del premio incrementale hai raggiunto.
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

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px 24px 24px;border-top:1px solid #262637;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#6b6b8a;">
            La Mostra delle Ombre Illuminate ·
            <a href="${baseUrl}" style="color:#818cf8;text-decoration:none;">Torna alla mostra</a>
          </p>
          </td>
        </tr>
        </table>
      </td>
      </tr>
    </table>
    </body>
  </html>`;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'La Mostra <noreply@la-mostra-delle-ombre.vercel.app>',
      to: [playerEmail],
      subject: 'Premi reali sbloccati - Sala Serie & Film',
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
      serie_film_prize: {
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
      userMessage: 'Email premio Serie & Film inviata!',
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
