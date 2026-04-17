# Email Configuration Guide

This guide helps you configure email sending for Path to Graduation using Resend.

## Overview

The application sends prize emails to players when they complete the Music Room (Sala delle Frequenze). Two emails are sent:
1. **Music Prize 1**: Artifact details and gettone (token) information
2. **Music Prize 2**: Concert gift announcement

## Prerequisites

1. A Resend account (free tier is sufficient)
2. A verified domain in Resend
3. Access to your domain's DNS settings (e.g., Cloudflare)

## Setup Steps

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Add Your Domain to Resend

1. Log in to the Resend dashboard
2. Navigate to **Domains** section: [https://resend.com/domains](https://resend.com/domains)
3. Click **Add Domain**
4. Enter your domain (e.g., `mostra-ombre.org`)
5. Resend will provide DNS records that need to be added to your domain

### 3. Configure DNS Records in Cloudflare

1. Log in to your Cloudflare account
2. Select your domain (e.g., `mostra-ombre.org`)
3. Go to **DNS** > **Records**
4. Add the DNS records provided by Resend:
   - **MX record**: For mail routing
   - **TXT record**: For SPF verification
   - **TXT record**: For DKIM verification
5. Save the changes

**Important**: DNS propagation can take from a few minutes to 24 hours. Be patient!

### 4. Verify Domain in Resend

1. Return to the Resend dashboard
2. Click **Verify** next to your domain
3. Resend will check if the DNS records are correctly configured
4. Once verified, you'll see a green checkmark

### 5. Get Your API Key

1. In the Resend dashboard, go to **API Keys**: [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Give it a name (e.g., "Path to Graduation Production")
4. Select appropriate permissions (at minimum: "Sending access")
5. Copy the API key (it starts with `re_`)

### 6. Configure Environment Variables

Create or update your `.env` file with:

```bash
# Resend API Key (required)
RESEND_API_KEY=re_your_actual_api_key_here

# Sender email (must use verified domain)
RESEND_FROM_EMAIL=andrea@mostra-ombre.org

# Sender name
RESEND_FROM_NAME=Andrea Sachs

# Optional: Test email (for development/testing)
# TEST_EMAIL=your-test-email@example.com
```

**Important notes:**
- `RESEND_FROM_EMAIL` MUST use your verified domain
- If using Cloudflare with the domain `mostra-ombre.org`, the email should be something like `andrea@mostra-ombre.org` (NOT `andrea.sachs@mostra-ombre.org`)
- The email local part (before @) can be anything, it doesn't need to exist as a mailbox

### 7. Deploy Your Changes

If you're using Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add the environment variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `RESEND_FROM_NAME`
4. Redeploy your application

## Troubleshooting

### Error 500: "Servizio email non configurato"

**Cause**: The `RESEND_API_KEY` environment variable is not set.

**Solution**:
1. Verify the API key is set in your environment variables
2. Make sure it starts with `re_`
3. Redeploy your application if using a hosting service

### Error 500: "Impossibile inviare l'email" or Error 550

**Cause**: The sender email domain is not verified in Resend, or DNS records are incorrect.

**Solution**:
1. Check if your domain is verified in Resend dashboard
2. Verify DNS records are correctly configured in Cloudflare:
   - Log in to Cloudflare
   - Go to DNS settings
   - Check that all Resend DNS records are present
3. Wait for DNS propagation (can take up to 24 hours)
4. Make sure `RESEND_FROM_EMAIL` uses your verified domain

### Error 500: "Database non configurato"

**Cause**: Supabase environment variables are missing.

**Solution**:
1. Make sure these environment variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`
2. Redeploy your application

### Error 409: "Email già stata inviata"

**Cause**: The email was already sent to this player (idempotency check).

**Solution**: This is expected behavior. Each email is sent only once per player.

### Email Not Received

**Possible causes**:
1. Check spam/junk folder
2. Email provider blocking the email
3. Incorrect recipient email address

**Solution**:
1. Check the server logs for the actual email sent
2. Use the `TEST_EMAIL` environment variable to test with a different email address
3. Check Resend dashboard for delivery status

## Testing Email Configuration

### Development Testing

Set the `TEST_EMAIL` environment variable to send all emails to a test address:

```bash
TEST_EMAIL=your-test-email@example.com
```

This ensures all emails go to your test address instead of player emails during development.

### Production Testing

1. Create a test player account with a valid email address
2. Complete the Music Room (8/12 challenges)
3. Check if the victory modal appears
4. Verify the email is sent
5. Check the Resend dashboard for delivery status

## Email Content

The emails contain:
- Character dialogues from the Music Room
- Artifact information (La Frequenza Nascosta)
- Game progress details
- HTML formatted content with inline styles

## API Endpoints

Two API endpoints handle email sending:
- `/api/mail/music-prize-1` - Sends artifact and token email
- `/api/mail/music-prize-2` - Sends concert gift email

Both endpoints:
- Validate the access code
- Check if the music room was completed
- Prevent duplicate sends
- Track email sending status in the database

## Common Configuration Issues

### Wrong Domain Format

❌ **Incorrect**: `andrea.sachs@mostra-ombre.org` (subdomain style)
✅ **Correct**: `andrea@mostra-ombre.org`

### API Key Issues

- API keys must start with `re_`
- Keys are sensitive - don't commit them to git
- Keys can be regenerated in Resend dashboard if compromised

### DNS Configuration

- All three DNS records (MX, SPF, DKIM) must be added
- DNS propagation takes time - be patient
- You can check DNS records using tools like `dig` or online DNS checkers

## Support

If you continue to have issues:

1. Check Resend dashboard for detailed error messages
2. Review server logs for specific error details
3. Verify all environment variables are correctly set
4. Contact Resend support for domain verification issues

## Free Tier Limits

Resend free tier includes:
- 100 emails per day
- 1 verified domain
- Full API access

This is sufficient for most small-to-medium sized applications.
