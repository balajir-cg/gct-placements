# How to Configure SMTP in Appwrite Console

## Step-by-Step Guide with Screenshots

### Step 1: Access Appwrite Console

1. Open your browser and go to: **http://localhost/console**
2. Login with your admin credentials

### Step 2: Navigate to Project Settings

1. Click on your project (e.g., "gct-placements")
2. On the left sidebar, scroll down and click on **"Settings"**
3. In the Settings menu, look for **"SMTP"** or **"Email"** section

### Step 3: Configure SMTP Settings

You'll see a form with the following fields:

```
┌─────────────────────────────────────────────────────────────┐
│  SMTP Configuration                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sender Name                                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ GCT Placement Portal                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Sender Email                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ placements@gct.ac.in                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Reply-To Name (optional)                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Reply-To Email (optional)                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SMTP Host                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ smtp.gmail.com                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SMTP Port                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 587                                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SMTP Secure                                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ○ None   ● TLS   ○ SSL                               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SMTP Username                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ your-email@gmail.com                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SMTP Password                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ••••••••••••••••                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [ Test Configuration ]  [ Save ]                          │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Choose Your Email Provider

#### Option A: Gmail (Most Common)

**Important: You MUST use an App Password, not your regular Gmail password!**

##### Creating Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click **"Security"** in the left menu
3. Scroll down to **"2-Step Verification"** 
   - If not enabled, **ENABLE IT FIRST** (App Passwords won't work without it)
4. After enabling 2-Step Verification, go to: https://myaccount.google.com/apppasswords
5. Click **"Select app"** → Choose **"Mail"**
6. Click **"Select device"** → Choose **"Other (Custom name)"**
7. Enter: **"GCT Placement Portal"**
8. Click **"Generate"**
9. Copy the **16-character password** (spaces don't matter)
10. Use this password in Appwrite SMTP configuration

**Gmail SMTP Settings:**
```
Sender Name:     GCT Placement Portal
Sender Email:    your-email@gmail.com
SMTP Host:       smtp.gmail.com
SMTP Port:       587
SMTP Secure:     TLS
SMTP Username:   your-email@gmail.com
SMTP Password:   xxxx xxxx xxxx xxxx  (App Password from step 9)
```

#### Option B: Outlook/Office 365

**Outlook SMTP Settings:**
```
Sender Name:     GCT Placement Portal
Sender Email:    your-email@outlook.com
SMTP Host:       smtp.office365.com
SMTP Port:       587
SMTP Secure:     TLS
SMTP Username:   your-email@outlook.com
SMTP Password:   your-regular-password
```

#### Option C: Custom College SMTP (If Available)

**Example for GCT Email:**
```
Sender Name:     GCT Placement Portal
Sender Email:    placements@gct.ac.in
SMTP Host:       mail.gct.ac.in (check with IT department)
SMTP Port:       587 or 465
SMTP Secure:     TLS or SSL
SMTP Username:   placements@gct.ac.in
SMTP Password:   your-password
```

> **Note:** Contact your college IT department for SMTP server details

#### Option D: SendGrid (Free Tier - Recommended for Production)

1. Sign up at: https://sendgrid.com/ (Free: 100 emails/day)
2. Create an API Key in SendGrid dashboard
3. Use these settings:

**SendGrid SMTP Settings:**
```
Sender Name:     GCT Placement Portal
Sender Email:    your-verified-email@domain.com
SMTP Host:       smtp.sendgrid.net
SMTP Port:       587
SMTP Secure:     TLS
SMTP Username:   apikey  (literally type "apikey")
SMTP Password:   SG.xxxxxxxxxxxxxxxxxxxxx (your API key)
```

### Step 5: Test Configuration

1. After entering all details, click **"Test Configuration"** button
2. Enter a test email address (your personal email)
3. Click **"Send Test Email"**
4. Check your inbox (and spam folder)
5. If you receive the test email, configuration is correct! ✅

### Step 6: Save Configuration

1. Click the **"Save"** button at the bottom
2. You should see a success message: "SMTP settings saved successfully"
3. Emails will now be sent automatically for:
   - New job notifications
   - Deadline reminders
   - Password resets
   - Email verifications

## Alternative: Environment Variables Method

If you prefer to configure via environment variables, edit the Appwrite `.env` file:

```bash
# Navigate to appwrite directory
cd /home/balaji/Desktop/placementsocr/gct-placements/appwrite

# Edit .env file
nano .env
```

Add these lines (example for Gmail):

```bash
_APP_SMTP_HOST=smtp.gmail.com
_APP_SMTP_PORT=587
_APP_SMTP_SECURE=tls
_APP_SMTP_USERNAME=your-email@gmail.com
_APP_SMTP_PASSWORD=your-app-password
_APP_SYSTEM_EMAIL_NAME=GCT Placement Portal
_APP_SYSTEM_EMAIL_ADDRESS=your-email@gmail.com
```

Save and restart Appwrite:

```bash
docker-compose down
docker-compose up -d
```

## Verification

### Check if SMTP is working:

1. **Create a new job as admin**
   - All students should receive email notifications
   
2. **Check Appwrite logs:**
   ```bash
   cd appwrite
   docker-compose logs -f appwrite | grep -i mail
   ```

3. **Check API response:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send-to-all \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","message":"Testing emails","type":"placement_update"}'
   ```

## Troubleshooting

### 🔴 "Authentication failed" error

**For Gmail:**
- Make sure 2-Step Verification is enabled
- Use App Password, NOT your regular password
- Remove any spaces from the app password (or include them - Appwrite handles both)

**For Other Providers:**
- Verify username and password are correct
- Check if account has SMTP access enabled

### 🔴 "Connection timeout" error

- Check SMTP host and port are correct
- Verify firewall allows outbound connections on port 587/465
- Try using port 465 with SSL instead of 587 with TLS

### 🔴 Emails going to spam

- Add SPF record to your domain DNS
- Add DKIM record to your domain DNS
- Use a verified sender email
- Ask recipients to add sender to contacts

### 🔴 "SSL certificate problem" error

- For development: This is usually okay
- For production: Ensure SMTP server has valid SSL certificate
- Try using TLS (port 587) instead of SSL (port 465)

## Quick Reference Table

| Provider | Host | Port | Security | Username | Password |
|----------|------|------|----------|----------|----------|
| Gmail | smtp.gmail.com | 587 | TLS | email@gmail.com | App Password |
| Outlook | smtp.office365.com | 587 | TLS | email@outlook.com | Regular Password |
| Yahoo | smtp.mail.yahoo.com | 587 | TLS | email@yahoo.com | App Password |
| SendGrid | smtp.sendgrid.net | 587 | TLS | apikey | API Key |
| Mailgun | smtp.mailgun.org | 587 | TLS | postmaster@domain | API Key |

## Next Steps

Once SMTP is configured:

1. ✅ Create a test job posting as admin
2. ✅ Verify students receive email notifications
3. ✅ Check that deadline reminders work (test with tomorrow's date)
4. ✅ Monitor email delivery rates
5. ✅ Consider upgrading to dedicated email service for production

## Production Recommendations

For production deployment, consider:

1. **Use dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Set up custom domain** for professional emails
3. **Configure SPF/DKIM records** to improve deliverability
4. **Monitor email quotas** to avoid service interruption
5. **Set up email templates** for consistent branding

---

**Need help?** Check the Appwrite documentation: https://appwrite.io/docs/email-delivery
