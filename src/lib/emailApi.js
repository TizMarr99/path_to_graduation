/**
 * Client-side API helpers for sending Music Room prize emails
 *
 * These functions call the serverless API endpoints to send emails
 * with tracking to prevent duplicate sends.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Send Music Room Prize Mail 1 (artifact + gettone)
 *
 * @param {string} accessCode - Player's access code
 * @returns {Promise<{success: boolean, emailId?: string, userMessage: string, sentAt?: string}>}
 * @throws {Error} with userMessage property on failure
 */
export async function sendMusicPrizeMail1(accessCode) {
  if (!accessCode) {
    const error = new Error('Access code is required');
    error.userMessage = 'Codice di accesso mancante.';
    throw error;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/mail/music-prize-1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Failed to send email');
      error.userMessage = data.userMessage || 'Impossibile inviare l\'email.';
      error.statusCode = response.status;
      error.details = data.details;
      throw error;
    }

    return {
      success: data.success,
      emailId: data.emailId,
      userMessage: data.userMessage || 'Email inviata con successo!',
      sentAt: data.sentAt,
      warning: data.warning,
    };
  } catch (error) {
    // Network or parsing errors
    if (!error.userMessage) {
      error.userMessage = 'Errore di connessione. Verifica la tua connessione internet.';
    }
    throw error;
  }
}

/**
 * Send Music Room Prize Mail 2 (concert gift announcement)
 *
 * @param {string} accessCode - Player's access code
 * @returns {Promise<{success: boolean, emailId?: string, userMessage: string, sentAt?: string}>}
 * @throws {Error} with userMessage property on failure
 */
export async function sendMusicPrizeMail2(accessCode) {
  if (!accessCode) {
    const error = new Error('Access code is required');
    error.userMessage = 'Codice di accesso mancante.';
    throw error;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/mail/music-prize-2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Failed to send email');
      error.userMessage = data.userMessage || 'Impossibile inviare l\'email.';
      error.statusCode = response.status;
      error.details = data.details;
      throw error;
    }

    return {
      success: data.success,
      emailId: data.emailId,
      userMessage: data.userMessage || 'Email inviata con successo!',
      sentAt: data.sentAt,
      warning: data.warning,
    };
  } catch (error) {
    // Network or parsing errors
    if (!error.userMessage) {
      error.userMessage = 'Errore di connessione. Verifica la tua connessione internet.';
    }
    throw error;
  }
}

/**
 * Example usage:
 *
 * // In a React component:
 * import { sendMusicPrizeMail1, sendMusicPrizeMail2 } from '@/lib/emailApi'
 *
 * // Send Mail 1
 * try {
 *   const result = await sendMusicPrizeMail1(playerState.accessCode)
 *   console.log('Email sent!', result.emailId)
 *   // Show success message to user
 *   alert(result.userMessage)
 * } catch (error) {
 *   console.error('Failed to send email:', error)
 *   // Show error message to user
 *   alert(error.userMessage)
 * }
 *
 * // Send Mail 2
 * try {
 *   const result = await sendMusicPrizeMail2(playerState.accessCode)
 *   console.log('Email sent!', result.emailId)
 *   alert(result.userMessage)
 * } catch (error) {
 *   console.error('Failed to send email:', error)
 *   alert(error.userMessage)
 * }
 */
