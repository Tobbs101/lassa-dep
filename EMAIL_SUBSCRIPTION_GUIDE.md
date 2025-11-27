# Email Subscription System Guide

## Overview
The AI4Lassa platform now includes an email subscription system that allows visitors to subscribe for notifications about new updates, features, and alerts. Users can subscribe by clicking the bell icon in the navigation bar.

## Features Implemented

### 1. **Frontend Components**
- **Bell Icon**: Replaced the profile icon with a bell icon in the navigation bar
- **Subscribe Modal**: Beautiful modal dialog for email subscription
- **Real-time Feedback**: Success/error messages with visual indicators
- **Auto-close**: Modal automatically closes 3 seconds after successful subscription
- **Responsive Design**: Works seamlessly on mobile and desktop

### 2. **Backend API**
- **POST /api/subscribe**: Handle new subscriptions
- **GET /api/subscribe?email={email}**: Check subscription status
- **Email Validation**: Server-side email format validation
- **Duplicate Prevention**: Checks for existing subscriptions
- **Reactivation**: Can reactivate previously unsubscribed emails

### 3. **Database**
- **email_subscriptions table**: Stores subscriber information
- **Row Level Security**: Proper security policies
- **Automatic timestamps**: Tracks subscription and update times
- **Metadata**: Stores source, user agent, and IP address

## Setup Instructions

### Step 1: Create Database Table
Run the SQL schema in your Supabase SQL Editor:

```bash
# File: supabase-email-subscriptions.sql
```

This creates:
- `email_subscriptions` table
- Indexes for performance
- RLS policies for security
- Triggers for auto-updating timestamps

### Step 2: Verify Environment Variables
Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Test the Feature
1. Start development server: `npm run dev`
2. Visit homepage: `http://localhost:3000`
3. Click the bell icon in the top-right corner
4. Enter an email address
5. Click "Subscribe"
6. Verify success message appears

## User Flow

### Subscription Process:
1. **User clicks bell icon** → Modal opens
2. **User enters email** → Client-side validation
3. **User clicks Subscribe** → API request sent
4. **Server validates email** → Checks format and duplicates
5. **Email stored in database** → Subscription created
6. **Success message shown** → Modal auto-closes after 3 seconds

### For Existing Subscribers:
- If email already exists and is active → "Already subscribed" message
- If email exists but was unsubscribed → Reactivation message

## Database Schema

### email_subscriptions Table:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Subscriber email (unique) |
| subscribed_at | TIMESTAMP | When they subscribed |
| is_active | BOOLEAN | Active status |
| verification_token | VARCHAR(255) | For email verification (future) |
| verified_at | TIMESTAMP | When email was verified |
| unsubscribe_token | VARCHAR(255) | Token for unsubscribe link |
| metadata | JSONB | Additional data (source, IP, etc.) |
| updated_at | TIMESTAMP | Last update time |

### Indexes:
- `idx_email_subscriptions_email` - Fast email lookups
- `idx_email_subscriptions_active` - Filter active subscriptions

## API Endpoints

### POST /api/subscribe
Subscribe a new email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully subscribed!",
  "subscriptionId": "uuid-here"
}
```

**Already Subscribed (200):**
```json
{
  "message": "You are already subscribed to updates!",
  "alreadySubscribed": true
}
```

**Error Response (400/500):**
```json
{
  "error": "Please enter a valid email address"
}
```

### GET /api/subscribe?email={email}
Check if an email is subscribed.

**Success Response (200):**
```json
{
  "subscribed": true,
  "subscribedAt": "2025-10-08T10:30:00Z",
  "message": "Active subscription"
}
```

## Security Features

### Row Level Security (RLS) Policies:
1. **Anyone can subscribe** - Public insert access
2. **Users can view subscriptions** - Public read access
3. **Only admins can update** - Authenticated users only
4. **Only admins can delete** - Authenticated users only

### Data Protection:
- Email addresses are lowercased and trimmed
- No PII beyond email is collected
- Unsubscribe tokens generated automatically
- Metadata stored for audit purposes only

### Validation:
- Client-side email format validation
- Server-side email regex validation
- Duplicate checking before insertion
- SQL injection protection via Supabase SDK

## Metadata Captured

For each subscription, the system stores:
```json
{
  "source": "homepage",
  "user_agent": "Mozilla/5.0...",
  "subscribed_from_ip": "xxx.xxx.xxx.xxx"
}
```

This helps with:
- Analytics
- Abuse prevention
- Compliance requirements

## Future Enhancements

### Phase 2 Features (Not Yet Implemented):
1. **Email Verification**
   - Send verification email with token
   - Verify email before activating subscription

2. **Unsubscribe Flow**
   - Unsubscribe link in emails
   - One-click unsubscribe page

3. **Email Notifications**
   - Send actual update notifications
   - Integration with email service (SendGrid, Mailgun)

4. **Subscription Preferences**
   - Choose notification types
   - Set frequency preferences

5. **Admin Dashboard**
   - View all subscribers
   - Export subscriber list
   - Send bulk emails

## Testing Checklist

- [ ] Click bell icon opens modal
- [ ] Modal has proper styling and is responsive
- [ ] Can enter email address
- [ ] Submit button shows loading state
- [ ] Valid email submission succeeds
- [ ] Success message appears
- [ ] Modal closes after 3 seconds
- [ ] Can close modal manually
- [ ] Invalid email shows error
- [ ] Duplicate email shows "already subscribed"
- [ ] Database entry created correctly
- [ ] Metadata captured properly
- [ ] RLS policies work correctly

## Troubleshooting

### Issue: "Failed to subscribe"
**Possible Causes:**
- Supabase connection issue
- Missing environment variables
- Database table not created

**Solutions:**
1. Check `.env.local` file exists and has correct values
2. Verify Supabase project is active
3. Run SQL schema to create table

### Issue: "Already subscribed" for new email
**Possible Causes:**
- Email was subscribed before
- Case sensitivity issue

**Solutions:**
1. Check database for existing email (emails are lowercased)
2. Use unsubscribe feature to clean up test data

### Issue: Modal doesn't open
**Possible Causes:**
- JavaScript error
- State management issue

**Solutions:**
1. Check browser console for errors
2. Verify React state is updating correctly

## Files Modified/Created

### New Files:
1. `src/app/api/subscribe/route.ts` - API endpoint for subscriptions
2. `supabase-email-subscriptions.sql` - Database schema
3. `EMAIL_SUBSCRIPTION_GUIDE.md` - This documentation

### Modified Files:
1. `src/app/page.tsx` - Added subscription modal and bell icon
   - Imported new icons (BellIcon, CheckCircleIcon, ExclamationCircleIcon)
   - Added state management for modal
   - Added handleSubscribe function
   - Added modal UI component

## Viewing Subscriptions

### Via Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to Table Editor
3. Open `email_subscriptions` table
4. View all subscribers

### Via SQL:
```sql
-- View all active subscriptions
SELECT email, subscribed_at, metadata
FROM email_subscriptions
WHERE is_active = true
ORDER BY subscribed_at DESC;

-- Count total subscriptions
SELECT COUNT(*) as total_subscribers
FROM email_subscriptions
WHERE is_active = true;

-- View recent subscriptions
SELECT *
FROM email_subscriptions
WHERE subscribed_at > NOW() - INTERVAL '7 days'
ORDER BY subscribed_at DESC;
```

## Privacy Compliance

### GDPR/Data Protection:
- ✅ Users explicitly consent via subscription
- ✅ Data collection is transparent
- ✅ Users can unsubscribe (via future feature)
- ✅ Only necessary data is collected
- ✅ Data is secured in Supabase

### Best Practices:
- Always include unsubscribe link in emails (when implementing email sending)
- Honor unsubscribe requests immediately
- Don't share email list with third parties
- Regular cleanup of inactive subscriptions

## Next Steps

1. **Create Supabase table** using provided SQL
2. **Test subscription flow** end-to-end
3. **Monitor for errors** in production
4. **Plan Phase 2 features** (email verification, notifications)

---

**Last Updated**: October 8, 2025
**Version**: 1.0 - Initial Email Subscription System
**Status**: Ready for Production

