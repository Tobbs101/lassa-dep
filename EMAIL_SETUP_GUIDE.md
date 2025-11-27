# Email Service Setup Guide - Resend Integration

## Overview
This guide will help you set up email notifications for the AI4Lassa subscription system using Resend.

## Why Resend?
- ✅ Free tier: 3,000 emails/month, 100 emails/day
- ✅ Simple API - no complex configuration
- ✅ Excellent deliverability
- ✅ Modern, developer-friendly
- ✅ No credit card required for free tier

## Step-by-Step Setup

### Step 1: Create Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email or GitHub account
3. Verify your email address
4. Complete the onboarding

### Step 2: Get API Key

1. Once logged in, go to **API Keys** section
2. Click **Create API Key**
3. Name it: `AI4Lassa Production` (or whatever you prefer)
4. Select **Full Access** permission
5. Click **Create**
6. **IMPORTANT**: Copy the API key immediately (you won't see it again!)

### Step 3: Configure Domain (Optional but Recommended)

For production, you should use your own domain instead of the default `onboarding@resend.dev`:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `ai4lassa.com`)
4. Follow DNS configuration steps:
   - Add the provided DNS records to your domain registrar
   - Wait for verification (usually takes a few minutes)
5. Once verified, you can send from `noreply@ai4lassa.com` or any address

### Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM="AI4Lassa <noreply@ai4lassa.com>"
SUPPORT_EMAIL="support@ai4lassa.com"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

**For Development/Testing:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="AI4Lassa <onboarding@resend.dev>"
SUPPORT_EMAIL="support@ai4lassa.com"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Step 5: Create Supabase Table

If you haven't already, run the SQL schema:

```bash
# In Supabase SQL Editor, run:
# File: supabase-email-subscriptions.sql
```

### Step 6: Test Email Sending

1. Start your development server:
```bash
npm run dev
```

2. Go to homepage: `http://localhost:3000`

3. Click the bell icon and subscribe with your email

4. Check your inbox for the welcome email

5. Upload data in admin panel to test update notifications

## Email Types Sent

### 1. Welcome Email
**Trigger**: When user subscribes
**Subject**: "Welcome to AI4Lassa Updates!"
**Content**:
- Welcome message
- What they'll receive
- Link to view live alerts
- Unsubscribe option

### 2. Data Update Notification
**Trigger**: When admin uploads new data
**Subject**: "📊 New Data Update Available - AI4Lassa"
**Content**:
- Number of records added
- States/LGAs affected
- Timestamp
- Links to database and alerts
- Unsubscribe option

## Testing Checklist

- [ ] Resend account created
- [ ] API key obtained and added to `.env.local`
- [ ] Environment variables configured
- [ ] Supabase table created
- [ ] Development server running
- [ ] Welcome email received after subscribing
- [ ] Update email received after data upload
- [ ] Emails display correctly in inbox
- [ ] Links in emails work correctly
- [ ] Unsubscribe link included (placeholder for now)

## Troubleshooting

### Issue: "Email not received"

**Possible Causes:**
1. API key not configured
2. Invalid email address
3. Email in spam folder
4. Resend rate limits exceeded

**Solutions:**
1. Check `.env.local` has `RESEND_API_KEY`
2. Verify email address is valid
3. Check spam/junk folder
4. Check Resend dashboard for error logs
5. Verify you haven't exceeded daily limit (100 emails/day on free tier)

### Issue: "Failed to send welcome email" in console

**Solutions:**
1. Check API key is correct
2. Ensure Resend package is installed: `npm install resend`
3. Restart development server
4. Check Resend dashboard logs

### Issue: "Module not found: resend"

**Solution:**
```bash
npm install resend
npm run dev
```

### Issue: "Emails going to spam"

**Solutions:**
1. Configure custom domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Don't use spam-trigger words in subject/body
4. Ensure unsubscribe link is present

## Rate Limits

### Resend Free Tier:
- **100 emails per day**
- **3,000 emails per month**
- **Single API key**

### Handling Rate Limits:
The system sends emails in batches with delays:
- Batch size: 10 emails at a time
- Delay between batches: 1 second
- This ensures smooth delivery without hitting rate limits

### Upgrade Options:
If you need more:
- **Pro**: $20/month - 50,000 emails/month
- **Enterprise**: Custom pricing

## Email Templates

Templates are defined in `src/lib/email.ts` and include:
- Responsive HTML design
- AI4Lassa branding (red color scheme)
- Mobile-friendly layout
- Proper text fallbacks
- Unsubscribe links

### Customizing Templates:

Edit `src/lib/email.ts` to modify:
- Colors and styling
- Content and messaging
- Links and CTAs
- Footer information

## Production Deployment

### Before Going Live:

1. ✅ Configure custom domain in Resend
2. ✅ Update `EMAIL_FROM` to use your domain
3. ✅ Update `NEXT_PUBLIC_SITE_URL` to production URL
4. ✅ Test all email flows
5. ✅ Verify DNS records are correct
6. ✅ Check spam score using mail-tester.com
7. ✅ Set up email monitoring

### Environment Variables for Production:

```env
RESEND_API_KEY=re_live_xxxxxxxxxxxxxxx
EMAIL_FROM="AI4Lassa <noreply@ai4lassa.com>"
SUPPORT_EMAIL="support@ai4lassa.com"
NEXT_PUBLIC_SITE_URL="https://ai4lassa.com"
```

## Monitoring Email Delivery

### Resend Dashboard:
1. Go to **Logs** section
2. View all sent emails
3. Check delivery status
4. View bounce/complaint rates

### Metrics to Track:
- Emails sent
- Delivery rate
- Bounce rate
- Complaint rate
- Open rate (if enabled)

## Best Practices

### Email Content:
- ✅ Keep subject lines clear and concise
- ✅ Include unsubscribe link
- ✅ Use responsive HTML templates
- ✅ Test on multiple email clients
- ✅ Avoid spam trigger words

### Technical:
- ✅ Use domain authentication (SPF/DKIM)
- ✅ Handle bounces properly
- ✅ Respect rate limits
- ✅ Log all email attempts
- ✅ Make email sending non-blocking

### Legal Compliance:
- ✅ Include physical address (optional)
- ✅ Provide easy unsubscribe
- ✅ Honor opt-out requests immediately
- ✅ Don't buy email lists
- ✅ Get explicit consent

## Alternative Email Services

If you prefer a different service:

### SendGrid:
```bash
npm install @sendgrid/mail
```

### Mailgun:
```bash
npm install mailgun-js
```

### AWS SES:
```bash
npm install @aws-sdk/client-ses
```

The `emailService` abstraction in `src/lib/email.ts` makes it easy to swap providers.

## Support

### Resend Support:
- Documentation: https://resend.com/docs
- Discord: https://resend.com/discord
- Email: support@resend.com

### AI4Lassa Support:
- Check server logs for errors
- Review Resend dashboard logs
- Verify environment variables
- Test with different email providers

## Next Steps

After setup:
1. Test subscribe flow completely
2. Test upload notification flow
3. Monitor first batch of emails
4. Gather feedback from users
5. Implement unsubscribe page (future enhancement)
6. Add email templates for alerts (future enhancement)

---

**Last Updated**: October 8, 2025
**Version**: 1.0 - Resend Email Integration
**Status**: Ready for Testing

