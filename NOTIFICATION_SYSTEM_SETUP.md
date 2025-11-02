# 🔔 Notification System Setup Guide

## Overview

This notification system sends automatic notifications to students when:
1. **New job is posted** - Instant notification to all students
2. **Application deadline is tomorrow** - Daily check and reminder to students who haven't applied

## Architecture

- **Next.js API Routes**: For immediate notifications and manual triggers
- **Appwrite Functions**: For event-driven and scheduled notifications
- **Real-time Updates**: Using Appwrite Realtime API

## Setup Steps

### 1. Create Notifications Collection

Run the setup script to create the notifications collection in Appwrite:

```bash
cd /home/balaji/Desktop/placementsocr/gct-placements
node scripts/setup-notifications-collection.js
```

This will create a collection with the following fields:
- `userId` (string) - Student user ID
- `title` (string) - Notification title
- `message` (string) - Notification message
- `type` (string) - Type: new_job, deadline_reminder, placement_update
- `jobId` (string, optional) - Related job ID
- `read` (boolean) - Read status
- `createdAt` (string) - Timestamp
- `readAt` (string, optional) - When marked as read

### 2. Update Environment Variables

Add the notifications collection ID to your `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
```

### 3. Set Up Appwrite Functions

#### Option A: Using Appwrite Console (Recommended)

1. **Open Appwrite Console**: http://localhost/console
2. **Navigate to Functions**
3. **Create Function 1: Send Job Notification**
   - Name: `Send Job Notification`
   - Runtime: `Node.js 18`
   - Trigger: `Event`
   - Events: Select `databases.*.collections.*.documents.*.create`
   - Filter to your jobs collection ID
   - Environment Variables:
     ```
     APPWRITE_DATABASE_ID=688f68ce000b6ff368f2
     APPWRITE_USERS_COLLECTION_ID=6889e525003d49691ea5
     APPWRITE_NOTIFICATIONS_COLLECTION_ID=<your-notifications-collection-id>
     ```
   - Upload code from: `appwrite-functions/send-job-notification`

4. **Create Function 2: Check Deadlines**
   - Name: `Check Job Deadlines`
   - Runtime: `Node.js 18`
   - Trigger: `Schedule`
   - Schedule: `0 9 * * *` (Every day at 9 AM IST)
   - Environment Variables:
     ```
     APPWRITE_DATABASE_ID=688f68ce000b6ff368f2
     APPWRITE_JOBS_COLLECTION_ID=6889e553000da1e450f0
     APPWRITE_USERS_COLLECTION_ID=6889e525003d49691ea5
     APPWRITE_APPLICATIONS_COLLECTION_ID=6889e57f003000b4cba6
     APPWRITE_NOTIFICATIONS_COLLECTION_ID=<your-notifications-collection-id>
     ```
   - Upload code from: `appwrite-functions/check-deadlines`

#### Option B: Using Appwrite CLI

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Set project
appwrite client \
  --endpoint http://localhost/v1 \
  --projectId 688f685d001a09b9e73f

# Create functions (see scripts/setup-appwrite-functions.sh for full commands)
```

### 4. Test the System

#### Test Notification Sending

```bash
# Send test notification to all students
curl -X POST http://localhost:3000/api/notifications/send-to-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test notification to all students",
    "type": "new_job"
  }'
```

#### Test Deadline Check

```bash
# Manually trigger deadline check
curl -X POST http://localhost:3000/api/notifications/check-deadlines
```

### 5. Verify Notifications

1. **Login as a student**
2. **Check the notification bell** in the dashboard header
3. **Create a new job** (as admin) and verify notification is sent
4. **Set a job deadline** for tomorrow and run deadline check

## How It Works

### New Job Notification Flow

1. Admin creates a new job
2. Appwrite Function triggers on document create event
3. Function fetches all students from users collection
4. Creates notification document for each student
5. Real-time API pushes notification to active users
6. Notification bell updates with count

### Deadline Reminder Flow

1. Appwrite Function runs daily at 9 AM
2. Fetches all active jobs
3. Filters jobs with deadline tomorrow
4. For each job, gets list of students who haven't applied
5. Creates deadline reminder notification for each student
6. Real-time API pushes notifications

### Real-time Updates

- Uses Appwrite Realtime API
- Subscribes to notifications collection
- Automatically updates notification bell when new notification arrives
- No polling required

## API Endpoints

### `POST /api/notifications/send-to-all`

Send notification to all students.

**Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "new_job",
  "jobId": "optional-job-id"
}
```

### `POST /api/notifications/check-deadlines`

Check for jobs with deadlines tomorrow and send reminders.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalJobs": 10,
    "jobsWithDeadlines": 2,
    "notificationsSent": 50
  }
}
```

## Troubleshooting

### Notifications not appearing

1. **Check collection ID**: Verify `NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID` is set
2. **Check permissions**: Ensure collection has read/write permissions for users
3. **Check Appwrite console**: View logs in Functions > Executions
4. **Check browser console**: Look for real-time connection errors

### Function not triggering

1. **Check function status**: Should be "Active" in Appwrite console
2. **Check event configuration**: Verify event path matches your collections
3. **Check environment variables**: All required variables must be set
4. **Check logs**: View execution logs in Appwrite console

### Deadline reminders not sending

1. **Check schedule**: Ensure cron expression is correct (`0 9 * * *`)
2. **Check timezone**: Appwrite uses UTC, adjust schedule accordingly
3. **Test manually**: Use API endpoint to test deadline check
4. **Check job deadlines**: Verify jobs have applicationDeadline field set

## Monitoring

### View Notifications in Database

```bash
# Using Appwrite console
# Navigate to: Databases > placement-db > notifications collection
```

### View Function Logs

```bash
# Using Appwrite console
# Navigate to: Functions > [function-name] > Executions
```

### Monitor Real-time Connections

Check browser console for:
```
WebSocket connection established
Subscribed to: databases.xxx.collections.yyy.documents
```

## Production Deployment

### Vercel

1. **Deploy Next.js app** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Appwrite Functions** continue running on your Appwrite server
4. **Update NEXT_PUBLIC_APP_URL** to your Vercel domain

### Self-hosted

1. **Run Next.js app** with PM2 or Docker
2. **Ensure Appwrite** is accessible from Next.js
3. **Configure firewall** to allow Appwrite → Next.js communication
4. **Set up SSL** for both services

## Performance Considerations

- **Batch processing**: Notifications created in batches of 50
- **Pagination**: User fetching uses offset pagination
- **Rate limiting**: Appwrite has default rate limits (check console)
- **Database indexes**: userId, type, and read fields are indexed

## Future Enhancements

- [ ] Push notifications (web push API)
- [ ] Email notifications
- [ ] SMS notifications (Twilio integration)
- [ ] Notification preferences per user
- [ ] Notification categories/filters
- [ ] Digest notifications (daily/weekly summary)
- [ ] Admin notification dashboard

## Support

For issues or questions:
1. Check Appwrite console logs
2. Review Next.js console output
3. Check browser console for errors
4. Verify all environment variables are set correctly
