# Resend Email Infrastructure - Quick Start

## Overview

This PR adds email infrastructure using Resend for Music Room completion rewards.

## What's Included

### API Endpoints
- `/api/mail/music-prize-1` - Send Mail 1 (artifact + gettone)
- `/api/mail/music-prize-2` - Send Mail 2 (concert announcement)

### Client Functions
```javascript
import { sendMusicPrizeMail1, sendMusicPrizeMail2 } from '@/lib/emailApi'

// Send Mail 1
await sendMusicPrizeMail1(accessCode)

// Send Mail 2
await sendMusicPrizeMail2(accessCode)
```

### TypeScript Types
Added to `PlayerState`:
- `music_mail1_sent_at?: string | null`
- `music_mail2_sent_at?: string | null`

## Setup Required

### 1. Environment Variables

Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=andrea@mostre-ombre.it
RESEND_FROM_NAME=Andrea
```

### 2. Supabase Database Migration

**IMPORTANT**: Run this SQL on Supabase:

```sql
ALTER TABLE public.player_progress
ADD COLUMN music_mail1_sent_at TIMESTAMPTZ NULL,
ADD COLUMN music_mail2_sent_at TIMESTAMPTZ NULL;
```

### 3. Resend Account Setup

1. Create account at https://resend.com
2. Verify domain `mostre-ombre.it`
3. Create API key
4. Add key to environment variables

## Email Templates

Both emails use **placeholder HTML** marked with `<!-- TODO: email X template -->`.

Replace the `emailHtml` content in:
- `/api/mail/music-prize-1.js` - Mail 1 template
- `/api/mail/music-prize-2.js` - Mail 2 template

## Testing

For local testing, add to `.env.local`:
```env
TEST_EMAIL=your-test@email.com
```

All emails will be sent to this address instead of the player's email.

## Documentation

See `/docs/EMAIL_INFRASTRUCTURE.md` for complete documentation including:
- Architecture details
- API specifications
- Error handling
- Security considerations
- Future improvements

## Integration with UI

The client functions are ready to use but **not yet connected to the UI**.

Example integration in `MusicRoomVictoryModal.jsx`:

```javascript
import { sendMusicPrizeMail1 } from '@/lib/emailApi'
import { usePlayerState } from '@/hooks/usePlayerState'

function MusicRoomVictoryModal() {
  const { accessCode } = usePlayerState()

  const handleSendEmail = async () => {
    try {
      const result = await sendMusicPrizeMail1(accessCode)
      alert(result.userMessage)
    } catch (error) {
      alert(error.userMessage)
    }
  }

  // Add button or auto-send on modal open
}
```

## What's NOT Included

1. **Email address storage** - Players don't have email addresses yet. Currently uses `TEST_EMAIL` env var.
2. **Final email templates** - Placeholders only. Add real copy later.
3. **UI integration** - Functions exported but not called from components.
4. **Database migration** - Must be run manually on Supabase.

## Next Steps

1. [ ] Run database migration on Supabase
2. [ ] Configure Resend account and verify domain
3. [ ] Add email field to player profile (or use admin-provided list)
4. [ ] Replace placeholder email templates with final copy
5. [ ] Add UI triggers to send emails (buttons or automatic)
6. [ ] Test with real email addresses
