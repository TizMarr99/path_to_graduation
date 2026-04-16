/**
 * Music Room Email Infrastructure - Implementation Guide
 *
 * This document explains the email infrastructure for the Music Room prizes.
 */

## Overview

This PR adds email sending infrastructure using Resend for Music Room completion rewards:
- **Mail 1**: Artifact + gettone (token) details
- **Mail 2**: Concert gift announcement

Emails are tracked in Supabase to prevent duplicate sends.

## Architecture

### API Endpoints (Serverless Functions)

Located in `/api/mail/`:
- `music-prize-1.js` - Sends Mail 1 (artifact + gettone)
- `music-prize-2.js` - Sends Mail 2 (concert announcement)

Both endpoints:
1. Validate the player's access code
2. Check if the Music Room was completed (`prizeWon === true`)
3. Check if the email was already sent (via `music_mail1_sent_at` / `music_mail2_sent_at`)
4. Send the email via Resend
5. Update the tracking timestamp in Supabase

### Client-Side API

Located in `/src/lib/emailApi.js`:
- `sendMusicPrizeMail1(accessCode)` - Call to send Mail 1
- `sendMusicPrizeMail2(accessCode)` - Call to send Mail 2

Both return promises with success/error handling and user-friendly Italian messages.

### Data Model

Added to `PlayerState` in `/src/types/challenge.d.ts`:
```typescript
{
  music_mail1_sent_at?: string | null  // ISO timestamp when Mail 1 was sent
  music_mail2_sent_at?: string | null  // ISO timestamp when Mail 2 was sent
}
```

**Note**: Database columns must be added manually to Supabase `player_progress` table:
- `music_mail1_sent_at` (timestamptz, nullable)
- `music_mail2_sent_at` (timestamptz, nullable)

## Configuration

### Environment Variables

Required variables in `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=andrea@mostre-ombre.it
RESEND_FROM_NAME=Andrea

# Optional: Test email override (development only)
TEST_EMAIL=test@example.com
```

Existing Supabase variables are reused:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Resend Setup

1. Create account at https://resend.com
2. Verify domain `mostre-ombre.it`
3. Create API key
4. Add to environment variables

## Usage

### Example: Trigger Email from UI

```javascript
import { sendMusicPrizeMail1, sendMusicPrizeMail2 } from '@/lib/emailApi'
import { usePlayerState } from '@/hooks/usePlayerState'

function MusicRoomVictoryModal() {
  const { accessCode } = usePlayerState()

  const handleSendPrizeMail = async () => {
    try {
      const result = await sendMusicPrizeMail1(accessCode)
      console.log('Email sent!', result.emailId)
      alert(result.userMessage) // "Email inviata con successo!"
    } catch (error) {
      console.error('Error:', error)
      alert(error.userMessage) // User-friendly error message
    }
  }

  return (
    <div>
      <button onClick={handleSendPrizeMail}>
        Invia email premio
      </button>
    </div>
  )
}
```

### API Response Format

**Success (200)**:
```json
{
  "success": true,
  "emailId": "abc123",
  "userMessage": "Email inviata con successo!",
  "sentAt": "2026-04-16T23:30:00.000Z"
}
```

**Error (4xx/5xx)**:
```json
{
  "error": "Email already sent",
  "userMessage": "Questa email è già stata inviata.",
  "sentAt": "2026-04-15T12:00:00.000Z"
}
```

### Common Error Codes

- **400**: Missing access code or invalid player data
- **403**: Music room not completed
- **404**: Player not found
- **409**: Email already sent
- **500**: Server error (Resend, Supabase, etc.)

## Email Templates

### Current State (Placeholder)

Both emails use minimal HTML placeholders:

```html
<!-- TODO: email 1 template -->
<h1>Congratulazioni!</h1>
<p>Hai completato la Sala Musica e vinto l'artefatto!</p>
```

```html
<!-- TODO: email 2 template -->
<h1>Un regalo speciale per te!</h1>
<p>Abbiamo una sorpresa per te legata al tuo successo nella Sala Musica!</p>
```

### Future Work

Replace placeholder HTML with final copy and design:
1. Update `emailHtml` in `/api/mail/music-prize-1.js`
2. Update `emailHtml` in `/api/mail/music-prize-2.js`

Templates should include:
- Mail 1: Artifact details, gettone information, redemption instructions
- Mail 2: Concert gift details, event information, how to claim

## Database Migration (Manual)

**IMPORTANT**: The following SQL must be run on Supabase manually:

```sql
-- Add email tracking columns to player_progress table
ALTER TABLE public.player_progress
ADD COLUMN music_mail1_sent_at TIMESTAMPTZ NULL,
ADD COLUMN music_mail2_sent_at TIMESTAMPTZ NULL;

-- Add indexes for performance (optional)
CREATE INDEX idx_player_progress_music_mail1_sent_at
ON public.player_progress(music_mail1_sent_at);

CREATE INDEX idx_player_progress_music_mail2_sent_at
ON public.player_progress(music_mail2_sent_at);
```

## Testing

### Local Testing

1. Set `TEST_EMAIL` in `.env.local` to override recipient
2. Ensure Music Room is completed (`prizeWon === true`)
3. Call API endpoints via client functions
4. Verify email received at test address
5. Verify timestamp saved in Supabase

### Production Checklist

- [ ] Resend domain verified
- [ ] API key configured in production environment
- [ ] Database columns created in Supabase
- [ ] Final email templates replaced
- [ ] Test send to real player
- [ ] Verify tracking prevents duplicate sends

## Security Considerations

- API key stored securely in environment variables (never committed)
- Player email addresses validated before sending
- Rate limiting should be added if needed (Resend has built-in limits)
- Access code validated via Supabase RPC before sending

## Limitations & Future Improvements

1. **Email Address Storage**: Currently using placeholder/test email. Need to add email field to player profile.
2. **Email Templates**: Using basic HTML placeholders. Need final design/copy.
3. **Notification**: No in-app notification when email sent. Consider adding UI feedback.
4. **Retry Logic**: No automatic retry on failure. Consider adding queue system.
5. **Analytics**: No tracking of open/click rates. Resend provides webhooks for this.

## Related Files

- `/api/mail/music-prize-1.js` - API endpoint for Mail 1
- `/api/mail/music-prize-2.js` - API endpoint for Mail 2
- `/src/lib/emailApi.js` - Client-side API helpers
- `/src/types/challenge.d.ts` - TypeScript types
- `/.env.example` - Environment variables documentation
- `/package.json` - Resend dependency added
