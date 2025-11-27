# Quick Email Setup - 5 Minutes ⚡

## What You Need to Do NOW

### 1. Create Resend Account (2 minutes)
1. Go to: https://resend.com/signup
2. Sign up (free, no credit card needed)
3. Click "Create API Key"
4. Copy the API key

### 2. Add to .env.local (1 minute)
Create or edit `.env.local` file in your project root:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="AI4Lassa <onboarding@resend.dev>"
SUPPORT_EMAIL="support@ai4lassa.com"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Create Database Table (1 minute)
In Supabase SQL Editor, run this file:
```sql
-- File: supabase-email-subscriptions.sql
```

### 4. Restart Server (30 seconds)
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 5. Test It! (1 minute)
1. Go to `http://localhost:3000`
2. Click the bell icon (top right)
3. Enter your email
4. Click "Subscribe"
5. Check your inbox!

## ✅ What Now Works

### When Someone Subscribes:
- ✅ Email saved to database
- ✅ Welcome email sent immediately
- ✅ Beautiful HTML email with branding

### When You Upload Data:
- ✅ All subscribers get notified
- ✅ Shows upload statistics
- ✅ Links to view data

## 📧 Email Preview

**Welcome Email:**
- Subject: "Welcome to AI4Lassa Updates!"
- Shows what they'll receive
- Link to live alerts
- Professional design

**Update Notification:**
- Subject: "📊 New Data Update Available"
- Shows record count
- Shows states/LGAs affected
- Links to database & alerts

## Free Tier Limits

- 100 emails per day
- 3,000 emails per month
- Perfect for starting out!

## Need Help?

Read detailed guide: `EMAIL_SETUP_GUIDE.md`

## Common Issues

**Emails not sending?**
- Check `.env.local` has `RESEND_API_KEY`
- Restart server after adding env vars
- Check spam folder
- Check Resend dashboard for errors

**"Module not found: resend"?**
```bash
npm install resend
npm run dev
```

That's it! 🎉

---

**Next**: Test by subscribing and uploading data in admin panel!

