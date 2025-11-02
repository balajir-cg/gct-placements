# Email Notification Setup Guide

## Overview
The system now supports both in-app notifications and email notifications for:
- ✅ New job postings (sent to all students)
- ✅ Deadline reminders (sent only to students who haven't applied, 1 day before deadline)

## Features Implemented

### 1. **New Job Notifications**
When an admin creates a new job:
- ✅ In-app notification sent to all students
- ✅ Email prepared with job title, company name, and deadline
- ✅ Email includes direct link to job details page

### 2. **Deadline Reminders**  
Automatically checks daily at 9 AM:
- ✅ Finds jobs with deadlines tomorrow
- ✅ Identifies students who haven't applied
- ✅ Sends both in-app and email reminders
- ✅ **Only** to students who haven't applied yet

## Configure Email Sending in Appwrite

To enable actual email sending, configure SMTP in Appwrite:

### Option 1: Using Appwrite Console (Recommended)

1. Open http://localhost/console
2. Go to your project
3. Navigate to **Settings** → **SMTP**
4. Configure your SMTP provider:

**For Gmail:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Security: TLS
SMTP Username: your-email@gmail.com
SMTP Password: your-app-password (not regular password!)
Sender Email: your-email@gmail.com
Sender Name: GCT Placement Portal
```

**For Outlook/Office365:**
```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP Security: TLS
SMTP Username: your-email@outlook.com
SMTP Password: your-password
Sender Email: your-email@outlook.com
Sender Name: GCT Placement Portal
```

**For Custom SMTP:**
```
SMTP Host: your-smtp-host.com
SMTP Port: 587 (or 465 for SSL)
SMTP Security: TLS or SSL
SMTP Username: your-username
SMTP Password: your-password
Sender Email: noreply@yourdomain.com
Sender Name: GCT Placement Portal
```

5. Click **Save**
6. Send a test email to verify configuration

### Option 2: Using .env Variables

Add to `/appwrite/.env`:

```bash
_APP_SMTP_HOST=smtp.gmail.com
_APP_SMTP_PORT=587
_APP_SMTP_SECURE=tls
_APP_SMTP_USERNAME=your-email@gmail.com
_APP_SMTP_PASSWORD=your-app-password
_APP_SYSTEM_EMAIL_NAME=GCT Placement Portal
_APP_SYSTEM_EMAIL_ADDRESS=your-email@gmail.com
```

Then restart Appwrite:
```bash
cd appwrite
docker-compose down
docker-compose up -d
```

## Gmail App Password Setup

If using Gmail, you need to create an App Password:

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (required)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Enter "GCT Placement Portal"
6. Copy the 16-character password
7. Use this password in SMTP configuration

## Email Templates

### New Job Email
- **Subject**: "New Job Opening: [Job Title] at [Company]"
- **Content**: Professional HTML email with:
  - Job title and company name
  - Application deadline
  - Call-to-action button
  - Direct link to job details

### Deadline Reminder Email
- **Subject**: "⏰ Deadline Tomorrow: [Job Title] at [Company]"
- **Content**: Urgent reminder with:
  - Job title and company
  - Deadline date and time
  - Prominent call-to-action
  - Only sent to students who haven't applied

## Testing

### Test New Job Notification
1. Login as admin
2. Create a new job posting
3. All students will receive:
   - In-app notification (immediate)
   - Email notification (if SMTP configured)

### Test Deadline Reminder
```bash
# Manually trigger deadline check
curl -X POST http://localhost:3000/api/notifications/check-deadlines
```

Or wait for the automatic daily check at 9 AM.

### View Email Logs
Check Appwrite logs for email sending status:
```bash
cd appwrite
docker-compose logs -f appwrite
```

## Monitoring

### Check Notification Stats
```bash
# View recent notifications
node scripts/view-notifications.js

# Test job notification system
node scripts/test-job-notification.js
```

### Email Delivery Status
- Check Appwrite Console → Logs
- Look for "Email sent" or "Email failed" messages
- Verify email count in API responses

## Production Recommendations

1. **Use a dedicated email service**:
   - SendGrid (Free tier: 100 emails/day)
   - Mailgun (Free tier: 5,000 emails/month)
   - AWS SES (Very cheap, reliable)
   - Postmark (Transactional email specialist)

2. **Configure SPF and DKIM**:
   - Add DNS records to improve deliverability
   - Reduces chance of emails going to spam

3. **Monitor email quotas**:
   - Check remaining daily/monthly limits
   - Set up alerts for quota exhaustion

4. **Email templates**:
   - Current templates are production-ready
   - Mobile-responsive HTML
   - Professional styling

5. **Rate limiting**:
   - System sends emails in batches of 50
   - 1-second delay between batches
   - Prevents SMTP server overload

## Troubleshooting

### Emails not sending
1. Verify SMTP credentials in Appwrite Console
2. Check Appwrite logs: `docker-compose logs appwrite`
3. Ensure firewall allows outbound SMTP (port 587/465)
4. Verify sender email is authorized

### Emails going to spam
1. Configure SPF/DKIM DNS records
2. Use professional sender name
3. Avoid spam trigger words
4. Use dedicated IP (premium services)

### Gmail blocking
1. Use App Password (not regular password)
2. Enable "Less secure app access" (if available)
3. Check Google Account security alerts
4. Consider using SendGrid/Mailgun instead

## API Endpoints

### Send Job Notification
```bash
POST /api/notifications/send-job-notification
Body: {
  "jobId": "job-id",
  "jobTitle": "Software Engineer",
  "companyName": "Google",
  "applicationDeadline": "2025-12-31T23:59:59.000Z"
}
```

### Check Deadlines
```bash
POST /api/notifications/check-deadlines
# No body required
```

## Summary

✅ **In-app notifications**: Working (real-time via Appwrite)
✅ **Email notifications**: Ready (configure SMTP to activate)
✅ **Deadline reminders**: Automated (only to non-applicants)
✅ **Email templates**: Professional HTML (mobile-responsive)
✅ **Batch processing**: Optimized (prevents rate limiting)

Configure SMTP in Appwrite Console to start sending emails!
