# Automated Appwrite Setup Scripts

# 🛠️ Scripts Directory

This directory contains utility scripts for setting up, seeding, testing, and managing the GCT Placement Portal.

---

## 📋 Available Scripts

### Setup & Configuration Scripts

#### 1. **setup-forum-collections.js** - Forum Database Setup
Creates the forum_posts and forum_comments collections in Appwrite with proper attributes, indexes, and permissions.

**Usage:**
```bash
node scripts/setup-forum-collections.js
```

**What it does:**
- ✅ Creates `forum_posts` collection with all attributes
- ✅ Creates `forum_comments` collection with all attributes
- ✅ Sets up proper indexes for performance
- ✅ Configures read/write permissions

---

#### 2. **setup-arrears-collection.js** - Arrear Tracking Database Setup ⭐
Creates the arrears collection for individual arrear paper tracking with proper clearance detection.

**Usage:**
```bash
node scripts/setup-arrears-collection.js
```

**What it does:**
- ✅ Creates `arrears` collection with comprehensive attributes
- ✅ Tracks individual arrear papers (not just counts)
- ✅ Records when courses are failed and when cleared
- ✅ Sets up indexes for efficient queries (userId, courseCode, isCleared)
- ✅ Enables accurate arrear history that never decreases

**Why this is important:**
- Fixes bug where `historyOfArrearsCount` was reset to 0 when arrears cleared
- Properly handles multiple arrears (e.g., Math + Physics)
- Tracks which specific courses need clearance
- Maintains full audit trail of failures and clearances

**See also:** `ARREAR_TRACKING_SYSTEM.md` for complete documentation

---

#### 3. **setup-notifications-collection.js** - Notification System Setup ⭐ NEW
Creates the notifications collection for in-app notification tracking and history.

**Usage:**
```bash
node scripts/setup-notifications-collection.js
```

**What it does:**
- ✅ Creates `notifications` collection with proper schema
- ✅ Sets up attributes: userId, type, title, message, read status
- ✅ Configures indexes for fast queries (userId, isRead, createdAt)
- ✅ Sets permissions for user-specific access
- ✅ Enables real-time notification updates

**Notification Types:**
- `job_alert` - New job posting notifications
- `deadline_reminder` - Application deadline reminders
- `application_update` - Application status changes
- `placement_confirmation` - Successful placement notifications

---

#### 4. **add-arrear-fields.js** - Add Arrear Fields to Users Collection ⭐ NEW
Adds arrear-related fields to the existing users collection.

**Usage:**
```bash
node scripts/add-arrear-fields.js
```

**Fields Added:**
- `historyOfArrear` - "Yes"/"No" indicator
- `historyOfArrearsCount` - Total arrears ever had (integer)
- `currentArrearsCount` - Active arrears count (integer)
- `activeBacklog` - "Yes"/"No" for current backlogs

---

### Testing & Debugging Scripts

#### 5. **test-email-sending.js** - Email Configuration Tester ⭐ NEW
Tests SMTP email configuration and sends a test email.

**Usage:**
```bash
node scripts/test-email-sending.js
```

**What it tests:**
- ✅ SMTP connection to Gmail (smtp.gmail.com:587)
- ✅ Authentication with app password
- ✅ Email template rendering (HTML/Plain text)
- ✅ Nodemailer transport configuration
- ✅ Environment variable setup

**Expected Output:**
```
✅ Test email sent successfully!
Message ID: <unique-message-id>
Check your inbox: your-email@gmail.com
```

**Troubleshooting:**
- Ensure `SMTP_USER`, `SMTP_PASS` are set in `.env.local`
- Use Gmail app password (not regular password)
- Check Gmail settings allow less secure apps

---

#### 6. **test-job-notification.js** - Notification System Tester ⭐ NEW
Tests the job notification API endpoint with eligibility filtering.

**Usage:**
```bash
node scripts/test-job-notification.js <jobId>
```

**Example:**
```bash
node scripts/test-job-notification.js 688f6dd3002c50df09df
```

**What it tests:**
- ✅ Notification API endpoint (`/api/notifications/send-job-notification`)
- ✅ Eligibility filtering (CGPA, department, backlogs)
- ✅ In-app notification creation
- ✅ Email sending to eligible students only
- ✅ Detailed stats reporting

**Output:**
```json
{
  "success": true,
  "message": "Notifications sent to 45 eligible students",
  "stats": {
    "totalStudents": 150,
    "eligibleStudents": 45,
    "success": 45,
    "errors": 0,
    "emailsPrepared": 45,
    "criteria": {
      "minCGPA": 7.0,
      "noBacklogs": true,
      "departments": ["CSE", "IT"]
    }
  }
}
```

---

#### 7. **view-notifications.js** - Notification History Viewer ⭐ NEW
View all notifications for a specific user (for debugging).

**Usage:**
```bash
node scripts/view-notifications.js <userId>
```

**Example:**
```bash
node scripts/view-notifications.js 688f6dd3002c50df09df
```

**Output:**
- 📊 Notification summary (total, unread, by type)
- 🔔 List of all notifications with timestamps
- 📧 Email status and delivery confirmation
- 💡 Notification content and job details

---

#### 8. **view-arrears.js** - Arrear Records Viewer ⭐
View all arrear records for a specific student (for debugging).

**Usage:**
```bash
node scripts/view-arrears.js <userId>
```

**Example:**
```bash
node scripts/view-arrears.js 688f6dd3002c50df09df
```

**Output:**
- 📊 Arrear summary (total, active, cleared counts)
- 🔴 List of active (uncleared) arrears
- ✅ List of cleared arrears with clearance details
- 💡 Expected profile values for verification

**Use cases:**
- Debug arrear tracking issues
- Verify which courses are marked as arrears
- Check if clearance detection is working
- Audit student arrear history

---

### Data Management Scripts

#### 9. **cleanup-duplicate-arrears.js** - Duplicate Arrears Cleaner ⭐
Finds and removes duplicate arrear records caused by slight variations in course codes or register numbers.

**Usage:**
```bash
node scripts/cleanup-duplicate-arrears.js
```

**What it does:**
- ✅ Scans all users for duplicate arrear records
- ✅ Groups records by normalized course code (e.g., "CS 101" = "CS101" = "cs-101")
- ✅ Keeps the oldest record, deletes duplicates
- ✅ Provides detailed report of removed duplicates

**When to use:**
- After AI model extracted slightly different course codes
- When register numbers had variations (e.g., "21CS001" vs "21CS 001")
- If same course appears multiple times in database
- Regular maintenance to keep database clean

**Example output:**
```
👤 User: student@gct.ac.in
   Total arrear records: 5
   📝 Course CS101: 2 duplicate records
      ✅ Keeping: CS 101 (older record)
      ❌ Deleted: CS-101 (duplicate)
   ✅ Removed 1/1 duplicates

📊 CLEANUP SUMMARY
Total users processed:      50
Users with duplicates:      3
Total duplicates found:     5
Total duplicates removed:   5
```

---

#### 10. **seed-database.js** - Test Data Generator
Populates the database with realistic test data for development and testing purposes.

**Usage:**
```bash
node scripts/seed-database.js
```

**What it creates:**
- 👥 **3 Admin Roles**: Coordinator, Officer, Placement Rep
- 🎓 **16 Students**: With complete profiles across 6 departments
- 💼 **8 Jobs**: From companies like Google, Microsoft, Amazon, TCS
- 📋 **Applications**: 3-8 applications per job with various statuses
- 🏆 **Placements**: Automatic placement records for shortlisted students
- 💬 **5 Forum Posts**: Discussion topics across different categories
- 💭 **Comments**: 2-5 comments per forum post

**Test Login Credentials:**
- **Student**: Any generated email (e.g., `rajesh.kumar.21cs001@gct.ac.in`)
- **Password**: `Test@123` (for all students)
- **Admin**: `coordinator@gct.ac.in` (set password in Appwrite console)

**Features:**
- ✅ Clears existing test data before seeding (optional)
- ✅ Respects foreign key constraints
- ✅ Creates realistic data with proper relationships
- ✅ Handles errors gracefully
- ✅ Shows detailed progress logs

---

#### 11. **create-initial-admin.js** - Admin Setup
Creates the first admin user for the system.

**Usage:**
```bash
node scripts/create-initial-admin.js

# Or use npm script
pnpm run create:admin
```

---

#### 12. **export.js** - Data Export Utility
Exports data from Appwrite collections to JSON files.

**Usage:**
```bash
node scripts/export.js

# Or use npm script
pnpm run setup:appwrite-export
```

---

#### 13. **import.js** - Data Import Utility
Imports data from JSON files into Appwrite collections.

**Usage:**
```bash
node scripts/import.js

# Or use npm script
pnpm run setup:appwrite-import
```

---

### Marksheet Processing Scripts

#### 14. **test-marksheet-api.sh** - Marksheet API Integration Tester ⭐
Tests the AI marksheet processing API endpoints.

**Usage:**
```bash
bash scripts/test-marksheet-api.sh /path/to/marksheet.jpg
```

**What it tests:**
- ✅ Image upload to Appwrite Storage
- ✅ AI OCR extraction via OpenRouter
- ✅ Data validation and parsing
- ✅ Fraud detection system (7-point check)
- ✅ Academic record processing
- ✅ Arrear detection and tracking

---

## 🔑 Required Environment Variables

For scripts to work, ensure these variables are set in `.env.local`:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=placement-db
APPWRITE_API_KEY=your-api-key

# Collection IDs
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID=jobs
NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID=applications
NEXT_PUBLIC_APPWRITE_PLACEMENTS_COLLECTION_ID=placements
NEXT_PUBLIC_APPWRITE_ADMIN_ROLES_COLLECTION_ID=admin_roles
NEXT_PUBLIC_APPWRITE_FORUM_POSTS_COLLECTION_ID=forum_posts
NEXT_PUBLIC_APPWRITE_FORUM_COMMENTS_COLLECTION_ID=forum_comments
NEXT_PUBLIC_APPWRITE_ARREARS_COLLECTION_ID=arrears
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID=academic_records

# Storage
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=placement-files

# Email Configuration (for notification testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=GCT Placements <your-email@gmail.com>

# OpenRouter (for marksheet testing)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---
- Check if clearance detection is working
- Audit student arrear history

---

### 5. **cleanup-duplicate-arrears.js** - Duplicate Arrears Cleaner ⭐ NEW
Finds and removes duplicate arrear records caused by slight variations in course codes or register numbers.

**Usage:**
```bash
node scripts/cleanup-duplicate-arrears.js
```

**What it does:**
- ✅ Scans all users for duplicate arrear records
- ✅ Groups records by normalized course code (e.g., "CS 101" = "CS101" = "cs-101")
- ✅ Keeps the oldest record, deletes duplicates
- ✅ Provides detailed report of removed duplicates

**When to use:**
- After AI model extracted slightly different course codes
- When register numbers had variations (e.g., "21CS001" vs "21CS 001")
- If same course appears multiple times in database
- Regular maintenance to keep database clean

**Example output:**
```
👤 User: student@gct.ac.in
   Total arrear records: 5
   📝 Course CS101: 2 duplicate records
      ✅ Keeping: CS 101 (older record)
      ❌ Deleted: CS-101 (duplicate)
   ✅ Removed 1/1 duplicates

📊 CLEANUP SUMMARY
Total users processed:      50
Users with duplicates:      3
Total duplicates found:     5
Total duplicates removed:   5
```

---

## 🚀 Quick Start Guide

### Prerequisites

1. **Appwrite Setup**: Ensure Appwrite project is configured
2. **Environment Variables**: Set up `.env.local` with all required variables
3. **Collections Created**: Run setup scripts for collections
4. **API Key**: Set `APPWRITE_API_KEY` in `.env.local` with full permissions

### Step-by-Step Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Appwrite credentials

# 3. Create forum collections
node scripts/setup-forum-collections.js

# 4. Create arrears collection
node scripts/setup-arrears-collection.js

# 5. Create notifications collection
node scripts/setup-notifications-collection.js

# 6. Add arrear fields to users
node scripts/add-arrear-fields.js

# 7. Seed test data (optional)
node scripts/seed-database.js

# 8. Test email configuration
node scripts/test-email-sending.js

# 9. Start development server
pnpm dev
```

---

## 🧪 Testing Workflow

### Test Email Notifications
```bash
# 1. Configure SMTP in .env.local
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 2. Test email sending
node scripts/test-email-sending.js

# 3. Create a test job in admin panel
# 4. Test job notification
node scripts/test-job-notification.js <jobId>

# 5. View notification history
node scripts/view-notifications.js <userId>
```

### Test Arrear Tracking
```bash
# 1. Upload marksheet with arrears via UI
# 2. View arrear records
node scripts/view-arrears.js <userId>

# 3. Check for duplicates
node scripts/cleanup-duplicate-arrears.js
```

### Test Marksheet Processing
```bash
# 1. Test AI OCR extraction
bash scripts/test-marksheet-api.sh /path/to/marksheet.jpg

# 2. Check fraud detection scores
# 3. Verify academic data extraction
```

---

## 📊 Seeded Data Details

### Students (16 total)
- **Departments**: Distributed across 6 departments
- **Batches**: 2021-2025 (8 students), 2022-2026 (8 students)
- **CGPA Range**: 6.5 to 9.5
- **Profiles**: Complete with academic records, contact info, skills
- **Roll Numbers**: Generated in format: `21CS001`, `22IT002`, etc.

### Jobs (8 companies)
| Company | Location | Min CGPA | Salary Range (LPA) |
|---------|----------|----------|-------------------|
| Google | Bangalore | 8.0 | 20 - 25 |
| Microsoft | Hyderabad | 7.5 | 18 - 22 |
| Amazon | Bangalore | 7.0 | 15 - 20 |
| TCS | Chennai | 6.0 | 3.5 - 6 |
| Infosys | Bangalore | 6.5 | 4.5 - 7 |
| Wipro | Chennai | 6.0 | 4 - 6.5 |
| Zoho | Chennai | 7.0 | 6 - 12 |
| Freshworks | Chennai | 7.5 | 8 - 15 |

### Applications
- **Status Distribution**:
  - Applied: ~30%
  - Under Review: ~25%
  - Interview Scheduled: ~20%
  - Shortlisted: ~15%
  - Rejected: ~10%
- **Per Job**: 3-8 applications
- **Eligibility**: Only eligible students apply (department + CGPA match)

### Forum Posts (5 categories)
- Interview Experiences
- Placement Tips
- Company Reviews
- Resume Review
- Technical Doubts

---

## 🧹 Clearing Data

The seed script includes a `clearCollections()` function that removes all existing test data before seeding. This ensures a clean slate.

To keep existing data while adding new data:
1. Comment out the `await clearCollections()` line in `seed-database.js`
2. Run the script

---

## ⚠️ Important Notes

### Security
- ⚠️ **Never use seeded data in production!**
- ⚠️ All test users have the same password: `Test@123`
- ⚠️ Change passwords before deploying to production
- ⚠️ The API key should have full permissions for scripts to work
- ⚠️ Keep `.env.local` secure and never commit to version control

### Appwrite Limits
- Free tier has limits on documents, users, and storage
- Consider using self-hosted Appwrite for heavy testing
- Monitor your usage in Appwrite dashboard

### Data Integrity
- Scripts respect foreign key relationships
- Deletion order: Comments → Posts → Applications → Placements → Jobs → Users
- Creation order: Admins → Users → Jobs → Applications → Posts → Comments

---

## 🐛 Troubleshooting

### Error: "Collection not found"
**Solution**: Run collection setup scripts first:
```bash
node scripts/setup-forum-collections.js
node scripts/setup-arrears-collection.js
node scripts/setup-notifications-collection.js
```

### Error: "Invalid API key"
**Solution**: Set `APPWRITE_API_KEY` in `.env.local` with full permissions

### Error: "Attribute not available"
**Solution**: Wait 5-10 seconds after creating collections for attributes to become available

### Error: "Document already exists"
**Solution**: The script auto-clears data, but you can manually delete from Appwrite console

### Error: "Rate limit exceeded"
**Solution**: Add delays in script or use self-hosted Appwrite

### Error: "SMTP connection failed"
**Solution**: 
- Check Gmail app password is correct
- Ensure 2-factor authentication is enabled
- Verify SMTP credentials in `.env.local`
- Try using a different email provider

### Error: "Notification not created"
**Solution**:
- Verify notifications collection exists
- Check user has permission to create notifications
- Ensure notification data is valid

---

## 📝 Customizing Seed Data

### Adding More Students
Edit the `STUDENT_NAMES` array in `seed-database.js`:

```javascript
const STUDENT_NAMES = [
  'Your Name 1',
  'Your Name 2',
  // ... add more
];
```

### Adding More Companies
Edit the `COMPANIES` array:

```javascript
const COMPANIES = [
  { 
    name: 'Your Company', 
    location: 'City', 
    minCGPA: '7.0', 
    salary: [800000, 1500000] 
  },
  // ... add more
];
```

### Changing Application Distribution
Modify the `statuses` array probabilities in `seedApplications()`:

```javascript
// Current: equal distribution
const statuses = ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected'];

// Custom: more applications pending
const statuses = ['applied', 'applied', 'applied', 'under_review', 'rejected'];
```

---

## 🔄 Resetting Database

To completely reset and reseed:

```bash
# 1. Clear all data (script does this automatically)
node scripts/seed-database.js

# 2. Or manually delete from Appwrite console
# Go to Database → Collections → Delete all documents
```

---

## � Docker Scripts (NEW)

The project now includes Docker support for easy deployment.

### Docker Build Scripts

**Build Production Image:**
```bash
# Multi-stage build (optimized)
docker build -t gct-placements:latest .

# Build with specific tag
docker build -t gct-placements:v1.0.0 .
```

**Run Container:**
```bash
# Run with environment file
docker run -p 3000:3000 --env-file .env.local gct-placements:latest

# Run with specific env vars
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
  -e NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id \
  gct-placements:latest
```

**Docker Compose:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f gct-placements

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

**Push to Docker Hub:**
```bash
# Tag image
docker tag gct-placements:latest yourusername/gct-placements:latest

# Login
docker login

# Push
docker push yourusername/gct-placements:latest
```

### Docker Image Info
- **Base Image**: Node.js 18 Alpine
- **Size**: ~200MB (multi-stage build)
- **Output**: Next.js standalone
- **Port**: 3000
- **Health Check**: Included
- **User**: Non-root for security

---

## 📖 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Node SDK](https://appwrite.io/docs/getting-started-for-server)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Project Main README](../README.md)
- [Notification System Guide](../TARGETED_NOTIFICATION_SYSTEM.md)
- [Email Setup Guide](../EMAIL_SYSTEM_COMPLETE.md)
- [Deadline Filtering Docs](../DEADLINE_FILTERING_IMPLEMENTATION.md)
- [Arrear Tracking Guide](../ARREAR_TRACKING_SYSTEM.md)

---

**Need help?** Open an issue on GitHub or check the comprehensive guides in the documentation files.

## 📊 Seeded Data Details

### Students (16 total)
- **Departments**: Distributed across 6 departments
- **Batches**: 2021-2025 (8 students), 2022-2026 (8 students)
- **CGPA Range**: 6.5 to 9.5
- **Profiles**: Complete with academic records, contact info, skills
- **Roll Numbers**: Generated in format: `21CS001`, `22IT002`, etc.

### Jobs (8 companies)
| Company | Location | Min CGPA | Salary Range (LPA) |
|---------|----------|----------|-------------------|
| Google | Bangalore | 8.0 | 20 - 25 |
| Microsoft | Hyderabad | 7.5 | 18 - 22 |
| Amazon | Bangalore | 7.0 | 15 - 20 |
| TCS | Chennai | 6.0 | 3.5 - 6 |
| Infosys | Bangalore | 6.5 | 4.5 - 7 |
| Wipro | Chennai | 6.0 | 4 - 6.5 |
| Zoho | Chennai | 7.0 | 6 - 12 |
| Freshworks | Chennai | 7.5 | 8 - 15 |

### Applications
- **Status Distribution**:
  - Applied: ~30%
  - Under Review: ~25%
  - Interview Scheduled: ~20%
  - Shortlisted: ~15%
  - Rejected: ~10%
- **Per Job**: 3-8 applications
- **Eligibility**: Only eligible students apply (department + CGPA match)

### Forum Posts (5 categories)
- Interview Experiences
- Placement Tips
- Company Reviews
- Resume Review
- Technical Doubts

---

## 🧹 Clearing Data

The seed script includes a `clearCollections()` function that removes all existing test data before seeding. This ensures a clean slate.

To keep existing data while adding new data:
1. Comment out the `await clearCollections()` line in `seed-database.js`
2. Run the script

---

## ⚠️ Important Notes

### Security
- ⚠️ **Never use seeded data in production!**
- ⚠️ All test users have the same password: `Test@123`
- ⚠️ Change passwords before deploying to production
- ⚠️ The API key should have full permissions for scripts to work

### Appwrite Limits
- Free tier has limits on documents, users, and storage
- Consider using self-hosted Appwrite for heavy testing
- Monitor your usage in Appwrite dashboard

### Data Integrity
- Scripts respect foreign key relationships
- Deletion order: Comments → Posts → Applications → Placements → Jobs → Users
- Creation order: Admins → Users → Jobs → Applications → Posts → Comments

---

## 🐛 Troubleshooting

### Error: "Collection not found"
**Solution**: Run `setup-forum-collections.js` first to create collections

### Error: "Invalid API key"
**Solution**: Set `APPWRITE_API_KEY` in `.env.local` with full permissions

### Error: "Attribute not available"
**Solution**: Wait 5-10 seconds after creating collections for attributes to become available

### Error: "Document already exists"
**Solution**: The script auto-clears data, but you can manually delete from Appwrite console

### Error: "Rate limit exceeded"
**Solution**: Add delays in script or use self-hosted Appwrite

---

## 📝 Customizing Seed Data

### Adding More Students
Edit the `STUDENT_NAMES` array in `seed-database.js`:

```javascript
const STUDENT_NAMES = [
  'Your Name 1',
  'Your Name 2',
  // ... add more
];
```

### Adding More Companies
Edit the `COMPANIES` array:

```javascript
const COMPANIES = [
  { 
    name: 'Your Company', 
    location: 'City', 
    minCGPA: '7.0', 
    salary: [800000, 1500000] 
  },
  // ... add more
];
```

### Changing Application Distribution
Modify the `statuses` array probabilities in `seedApplications()`:

```javascript
// Current: equal distribution
const statuses = ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected'];

// Custom: more applications pending
const statuses = ['applied', 'applied', 'applied', 'under_review', 'rejected'];
```

---

## 🔄 Resetting Database

To completely reset and reseed:

```bash
# 1. Clear all data (script does this automatically)
node scripts/seed-database.js

# 2. Or manually delete from Appwrite console
# Go to Database → Collections → Delete all documents
```

---

## 📖 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Node SDK](https://appwrite.io/docs/getting-started-for-server)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Project Main README](../README.md)
- [Notification System Guide](../TARGETED_NOTIFICATION_SYSTEM.md)
- [Email Setup Guide](../EMAIL_SYSTEM_COMPLETE.md)
- [Deadline Filtering Docs](../DEADLINE_FILTERING_IMPLEMENTATION.md)
- [Arrear Tracking Guide](../ARREAR_TRACKING_SYSTEM.md)

---

**Need help?** Open an issue on GitHub or check the comprehensive guides in the documentation files. 