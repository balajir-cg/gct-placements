# Automated Appwrite Setup Scripts

# 🛠️ Scripts Directory

This directory contains utility scripts for setting up, seeding, and managing the GCT Placement Portal.

---

## 📋 Available Scripts

### 1. **setup-forum-collections.js** - Forum Database Setup
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

### 2. **seed-database.js** - Test Data Generator
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

---

### 3. **setup-arrears-collection.js** - Arrear Tracking Database Setup ⭐ NEW
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

### 4. **view-arrears.js** - Arrear Records Viewer ⭐ NEW
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
- ✅ Respects foreign key constraints
- ✅ Creates realistic data with proper relationships
- ✅ Handles errors gracefully
- ✅ Shows detailed progress logs

---

### 3. **create-initial-admin.js** - Admin Setup
Creates the first admin user for the system.

**Usage:**
```bash
node scripts/create-initial-admin.js
```

---

### 4. **export.js** - Data Export Utility
Exports data from Appwrite collections to JSON files.

**Usage:**
```bash
node scripts/export.js
```

---

### 5. **import.js** - Data Import Utility
Imports data from JSON files into Appwrite collections.

**Usage:**
```bash
node scripts/import.js
```

---

## 🚀 Quick Start Guide

### Prerequisites

1. **Appwrite Setup**: Ensure Appwrite project is configured
2. **Environment Variables**: Set up `.env.local` with all required variables
3. **Collections Created**: Run `setup-forum-collections.js` first
4. **API Key**: Set `APPWRITE_API_KEY` in `.env.local`

### Step-by-Step Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Appwrite credentials

# 3. Create forum collections
node scripts/setup-forum-collections.js

# 4. Seed test data
node scripts/seed-database.js

# 5. Start development server
pnpm dev
```

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

# Storage
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=placement-files
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
- [Project Setup Guide](../README.md)

---

**Need help?** Open an issue on GitHub or check the main README.md

## Quick Setup Guide

### 1. Prerequisites

- Appwrite project created (either cloud or self-hosted)
- Environment variables configured in `.env.local`
- API key with proper permissions

### 2. Get Your API Key

1. Go to your Appwrite console
2. Navigate to **Settings** > **API Keys**
3. Click **Create API Key**
4. Set the following scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `indexes.read`
   - `indexes.write`
   - `buckets.read`
   - `buckets.write`
5. Copy the generated API key

### 3. Update Environment Variables

Add the API key to your `.env.local` file:

```env
# Your existing variables...
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=placement-db
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=placement-files

# Collection IDs
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID=jobs
NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID=applications
NEXT_PUBLIC_APPWRITE_PLACEMENTS_COLLECTION_ID=placements
NEXT_PUBLIC_APPWRITE_COMPANIES_COLLECTION_ID=companies

# Email Domain
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=gct.ac.in

# Add this for the setup script
APPWRITE_API_KEY=your-api-key-here
```

### 4. Run the Setup Script

```bash
# Using npm script
pnpm run setup:appwrite

# Or directly
node scripts/setup-collections.js
```

### 5. What the Script Does

The automated setup script will:

✅ **Create Storage Bucket** (`placement-files`)
- 10MB file size limit
- Supports: jpg, jpeg, png, gif, pdf, doc, docx
- Proper user permissions

✅ **Create Collections:**

**Users Collection** (`users`)
- 23 attributes including profile data, academic info
- Indexes on userId, email, role
- User-level permissions

**Jobs Collection** (`jobs`)
- 19 attributes for job postings
- Indexes on status, company, createdAt
- User-level permissions

**Applications Collection** (`applications`)
- 5 attributes for tracking applications
- Indexes on jobId, userId, status, appliedAt
- User-level permissions

**Placements Collection** (`placements`)
- 6 attributes for placement records
- Indexes on userId, company, placedAt
- User-level permissions

**Companies Collection** (`companies`)
- 8 attributes for company information
- Index on company name
- User-level permissions

### 6. Verify Setup

After running the script:

1. Check your Appwrite console
2. Verify all collections are created with correct attributes
3. Confirm storage bucket exists
4. Test the application: `pnpm dev`

### 7. Troubleshooting

**Common Issues:**

1. **API Key Errors**: Ensure your API key has all required permissions
2. **Project Not Found**: Verify `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is correct
3. **Permission Errors**: Check your API key permissions in Appwrite console
4. **Network Issues**: Ensure you can reach your Appwrite endpoint

**Script Output:**
- ✅ Success indicators
- ⚠️ Warnings for existing resources
- ❌ Error messages with details

### 8. Manual Verification

After setup, manually verify in Appwrite console:

1. **Database** > `placement-db` exists
2. **Collections** > All 5 collections present
3. **Attributes** > Each collection has correct attributes
4. **Indexes** > Performance indexes created
5. **Storage** > `placement-files` bucket exists
6. **Permissions** > All resources have `users` permissions

### 9. Next Steps

After successful setup:

1. Start development server: `pnpm dev`
2. Create your first test account
3. Test file uploads and job posting
4. Set initial admin user roles in the database

### 10. Security Notes

⚠️ **Important**: 
- Keep your API key secure and never commit it to version control
- The API key is only needed for initial setup
- Consider deleting the API key after setup is complete
- Use proper environment-specific projects for staging/production

For detailed manual setup instructions, see `setup-appwrite.md`. 