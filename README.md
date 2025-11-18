# 🎓 GCT Placement Portal

A comprehensive, modern, and intelligent placement management system for Government College of Technology (GCT) built with Next.js 15, React 19, TypeScript, and Appwrite BaaS. Features AI-powered marksheet processing, smart notifications, real-time communication, and complete Docker support.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-18.2-f02e65)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

---

## ✨ Features Overview

### 🔐 **Authentication & Authorization**
- **Secure Login System**: Email and password authentication via Appwrite
- **Domain Validation**: Restricted to `@gct.ac.in` email addresses
- **Role-Based Access Control (RBAC)**: Four distinct user roles
  - 🎓 **Students**: Browse jobs, apply, track applications
  - 👥 **Placement Representatives**: Student + admin dual access
  - 🏢 **Placement Officers**: Full admin access for job management
  - ⚙️ **Placement Coordinators**: Complete system administration
- **Protected Routes**: Client and server-side route protection
- **Session Management**: Secure, persistent user sessions

### 👥 **User Management System**
- **Comprehensive Student Profiles**:
  - Personal information (name, email, phone, DOB, gender, address)
  - Academic records (10th, 12th, diploma, semester-wise CGPA, backlogs)
  - **AI-Powered Marksheet Upload**: Automatically extract academic data
  - Professional details (skills, projects, internships)
  - Documents (resume, profile picture, certificates)
- **Intelligent Arrear Tracking**:
  - History of Arrears: Total arrears ever had (never decreases)
  - Current Arrears: Active arrears (decreases when cleared)
  - Auto-calculated from marksheet uploads
- **Profile Completion Tracking**: Real-time progress indicator
- **Admin Management**: Dedicated interface for managing admin roles
- **User Search & Filter**: Advanced search across all user attributes
- **Bulk Operations**: Export user data, bulk status updates

### 📄 **AI-Powered Marksheet Processing** (NEW!)
- **Smart Marksheet Upload**:
  - Upload semester marksheet images (JPEG, PNG, WebP)
  - AI extraction using OpenRouter Qwen 2.5 VL 32B vision model
  - Automatic data extraction: Student details, CGPA, courses, grades
  - Roman numeral semester support (V, VI, VII, VIII → 5, 6, 7, 8)
- **🔒 Fraud Detection & Document Verification**:
  - **7-Point Authenticity Check System**:
    1. ✅ Institution Name Verification (Government College of Technology)
    2. ✅ Location Validation (Coimbatore - 641 013)
    3. ✅ Document Type Check (Statement of Grades)
    4. ✅ Register Number Format Validation (10-15 digit numeric)
    5. ✅ Official Footer Elements (Seal, Date, Controller Signature)
    6. ✅ Course Data Structure Validation
    7. ✅ CGPA Summary Section Verification
  - **Fraud Score Calculation**: Automatic rejection if >40% checks fail
  - **Visual Authenticity Badges**: Green for verified, yellow for warnings
  - **Prevents Fake Documents**: Detects manipulated or non-GCT marksheets
  - **Real-time Alerts**: Immediate feedback on suspicious documents
- **Review & Edit Before Save**:
  - Preview extracted data in user-friendly format
  - Edit any field before applying to profile
  - Real-time validation (register number matching, semester range)
- **Intelligent Academic Tracking**:
  - Semester-wise CGPA storage (sem1Cgpa to sem8Cgpa)
  - Current CGPA based on highest semester uploaded
  - Automatic arrear detection and tracking
  - Arrear clearance detection (failed → passed in later semester)
- **Data Validation**:
  - Verify marksheet belongs to correct student
  - Prevent uploading others' marksheets
  - Semester number validation (1-8)
  - CGPA range validation (0-10)

### 💼 **Job Management System**
- **Detailed Job Postings**:
  - Company information with logo upload
  - Job title, role, description, and requirements
  - Salary range and job type (full-time, internship, etc.)
  - Department eligibility and CGPA requirements
  - Backlog restrictions and application deadlines
  - Placement drive dates and locations
- **🔥 Smart Deadline Filtering** (NEW!):
  - **Students**: See only jobs with active application periods
  - **Auto-hide**: Jobs with passed deadlines automatically hidden from student view
  - **Admins**: View all jobs including expired ones for management
  - **Real-time**: Updates automatically as deadlines pass
- **Smart Application System**:
  - Automatic eligibility validation
  - One-click job applications
  - Application withdrawal option
  - Duplicate application prevention
- **Application Tracking**:
  - Status workflow: Applied → Under Review → Interview Scheduled → Shortlisted/Rejected
  - Email notifications for status updates
  - Admin dashboard for application management
  - Bulk status updates for multiple applications
- **Job Search & Filters**:
  - Search by company, title, or description
  - Filter by department, location, CGPA, salary
  - Sort by date, salary, or relevance

### 📊 **Placement Records & Analytics**
- **Placement Database**:
  - Track successful placements with company, package, role
  - Student placement history
  - Company-wise placement statistics
- **Analytics Dashboard**:
  - Total applications, interviews, selections
  - Department-wise placement rates
  - Average package and highest package
  - Trend analysis and visualizations
  - Export reports (CSV, PDF)
- **Company Management**:
  - Company profiles with visit history
  - Job posting history per company
  - Company performance metrics

### 💬 **Discussion Forum** (Real-time)
- **Community Discussions**:
  - Create posts with titles, content, categories, tags
  - Comment on posts with real-time updates
  - Nested comment support (replies)
  - Post search and filtering
- **Real-time Features** (Appwrite Realtime API):
  - Instant new post notifications
  - Live comment updates without refresh
  - View count tracking
  - Comment count auto-updates
- **Categories**:
  - General, Interview Experiences, Company Reviews
  - Placement Tips, Technical Doubts, Resume Review
  - Job Opportunities, Other
- **Engagement Metrics**:
  - View counts, comment counts
  - Popular tags, trending posts
  - Author attribution and avatars
- **Moderation** (Admin):
  - Pin important posts
  - Close posts to prevent new comments
  - Delete inappropriate content
  - Edit any post/comment

### 🔔 **Intelligent Notification System** (NEW!)
- **🎯 Targeted Notifications**:
  - **Smart Eligibility Filtering**: Notifications sent ONLY to students who meet job criteria
  - **CGPA Matching**: Only notify students with sufficient CGPA
  - **Department Filtering**: Notifications to eligible departments only
  - **Backlog Checking**: Respects job backlog/arrear requirements
  - **77-80% Reduction** in irrelevant notifications
- **Multi-Channel Delivery**:
  - **In-App Notifications**: Real-time notifications with Appwrite Realtime
  - **📧 Email Notifications**: SMTP (Gmail) with mobile-responsive HTML templates
  - **Notification Bell**: Unread count badge, mark as read/unread
- **Notification Types**:
  - 🆕 **New Job Alerts**: When admin creates a job (only to eligible students)
  - ⏰ **Deadline Reminders**: Daily cron (9 AM) for jobs expiring soon
  - ✅ **Application Updates**: Status changes (interview, shortlisted, rejected)
  - 🏆 **Placement Confirmations**: When student gets placed
- **Smart Features**:
  - **Skip Applied Students**: Deadline reminders only for students who haven't applied
  - **Detailed Stats**: Notification count, success rate, eligibility breakdown
  - **Email Queue**: Batched sending for performance
  - **Notification History**: Track all sent notifications

### 🕐 **Automated Deadline Management** (NEW!)
- **Daily Cron Job** (9 AM):
  - Checks all jobs with deadlines in next 24 hours
  - Sends reminders only to eligible students who haven't applied
  - Automatic email notifications via Nodemailer
- **Appwrite Functions**:
  - `check-deadlines`: Automated deadline monitoring
  - `send-job-notification`: New job announcement system
  - Serverless execution with Node.js 18.x

### 📁 **File Management**
- **Appwrite Storage Integration**:
  - Resume uploads (PDF, DOC, DOCX)
  - Profile pictures (JPG, PNG, WEBP)
  - Company logos and documents
  - File size validation (max 10MB)
  - File type restrictions
- **Secure Access**:
  - Role-based file permissions
  - Signed URLs for temporary access
  - File preview generation
  - Download tracking

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark Mode Support**: Theme switching capability
- **shadcn/ui Components**: Accessible, customizable UI library
- **Tailwind CSS**: Utility-first styling for rapid development
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback for user actions

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | React framework with App Router, SSR, and API routes |
| **React** | 19.x | UI library for component-based development |
| **TypeScript** | 5.x | Static typing for improved code quality |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Accessible component library based on Radix UI |

### **Backend (BaaS)**
| Technology | Purpose |
|------------|---------|
| **Appwrite 18.2** | Complete backend solution |
| ↳ Database | NoSQL document database for all collections |
| ↳ Authentication | User authentication and session management |
| ↳ Storage | File storage with CDN delivery |
| ↳ Realtime | WebSocket-based real-time updates |
| ↳ Functions | Serverless functions (cron jobs, webhooks) |
| **OpenRouter API** | AI API gateway for marksheet processing |
| ↳ Qwen 2.5 VL 32B | Vision model for OCR and data extraction |
| **Nodemailer 7.0.10** | Email notification service (SMTP) |
| ↳ Gmail SMTP | Email transport (smtp.gmail.com:587) |

### **Core Libraries**
- **date-fns 4.1.0**: Date formatting and manipulation
- **lucide-react**: Modern icon library (400+ icons)
- **next-themes**: Theme management (light/dark mode)
- **zod 3.24.1**: Schema validation
- **react-hook-form 7.54.1**: Form state management
- **class-variance-authority**: Component variant management
- **shadcn/ui**: 40+ accessible UI components (Radix UI)
- **recharts 2.15.0**: Data visualization and charts
- **sonner**: Toast notification system

### **Development Tools**
- **pnpm 10.19.0**: Fast, disk-efficient package manager
- **ESLint**: Code linting and quality checks
- **TypeScript 5**: Static type checking
- **PostCSS**: CSS transformation
- **Git**: Version control
- **Docker & Docker Compose**: Containerization and deployment

---

## 📊 Database Structure (Appwrite Collections)

### **Collections Overview**
The system uses **9 Appwrite collections** for complete data management:

1. **users** - Student profiles and academic data
2. **jobs** - Job postings and openings
3. **applications** - Job application tracking
4. **placements** - Successful placement records
5. **admin_roles** - Admin user management
6. **forum_posts** - Discussion forum posts
7. **forum_comments** - Forum post comments
8. **arrears** - Individual arrear paper tracking ⭐ NEW
9. **notifications** - In-app notification history ⭐ NEW
10. **academic_records** - Semester-wise marksheet data ⭐ NEW

### **1. Users Collection** (`users`)
Primary collection for student data and profiles.

```typescript
{
  $id: string                    // Unique user ID
  email: string                  // User email (must be @gct.ac.in)
  name: string                   // Full name
  
  // Personal Information
  personalEmail?: string         // Personal email
  phoneNo?: string              // Contact number
  dateOfBirth?: string          // DOB in ISO format
  gender?: string               // Male/Female/Other
  currentAddress?: string       // Current address
  permanentAddress?: string     // Permanent address
  city?: string                 // City
  state?: string                // State
  pincode?: string              // Postal code
  
  // Academic Information
  rollNo?: string               // College roll number
  batch?: string                // Academic batch (e.g., "2021-2025")
  department: string            // Department name
  currentCgpa?: string          // Current CGPA
  activeBacklog?: string        // "Yes"/"No" - has active backlogs
  
  // 10th Standard
  tenthMarkPercent?: string     // 10th percentage
  tenthBoard?: string           // Education board
  tenthYearOfPassing?: string   // Year of passing
  
  // 12th Standard / Diploma
  twelthMarkPercent?: string    // 12th/Diploma percentage
  twelthBoard?: string          // Education board
  twelthYearOfPassing?: string  // Year of passing
  hasDiploma?: string           // "Yes"/"No"
  
  // Professional
  skills?: string[]             // Array of skills
  projects?: string            // Projects description
  internships?: string         // Internship details
  
  // Files
  resume?: string              // File ID of uploaded resume
  profilePicture?: string      // File ID of profile picture
  
  // System Fields
  isPlacementRep?: boolean     // Is placement representative
  repDepartment?: string       // Department if rep
  createdAt: string           // Account creation timestamp
  updatedAt: string           // Last update timestamp
}
```

**Indexes:**
- `email_idx` on `email` (unique)
- `rollNo_idx` on `rollNo`
- `department_idx` on `department`
- `batch_idx` on `batch`

---

### **2. Jobs Collection** (`jobs`)
All job postings and openings.

```typescript
{
  $id: string                   // Unique job ID
  
  // Company Information
  company: string               // Company name
  companyLogo?: string          // File ID of company logo
  companyWebsite?: string       // Company website URL
  
  // Job Details
  title: string                 // Job title
  role: string                  // Job role/position
  description: string           // Detailed job description
  requirements?: string         // Job requirements
  responsibilities?: string     // Key responsibilities
  
  // Compensation & Type
  salaryMin?: number           // Minimum salary
  salaryMax?: number           // Maximum salary
  salaryCurrency?: string      // Currency (INR, USD, etc.)
  jobType: string              // Full-time, Internship, Contract
  
  // Eligibility Criteria
  departments: string[]        // Eligible departments
  minCGPA: string              // Minimum CGPA required
  noBacklogs: boolean          // Are backlogs allowed?
  eligibleBatches?: string[]   // Eligible batches
  
  // Dates & Location
  applicationDeadline: string  // Last date to apply
  placementDriveDate?: string  // Date of placement drive
  location: string             // Job location
  workMode?: string            // On-site, Remote, Hybrid
  
  // Application Stats
  totalApplications?: number   // Total applications received
  shortlistedCount?: number    // Number shortlisted
  selectedCount?: number       // Number selected
  
  // System Fields
  status: string               // "open", "closed", "on-hold"
  postedBy: string             // Admin user ID who posted
  createdAt: string
  updatedAt: string
}
```

**Indexes:**
- `company_idx` on `company`
- `status_idx` on `status`
- `deadline_idx` on `applicationDeadline`

---

### **3. Applications Collection** (`applications`)
Tracks student job applications and their status.

```typescript
{
  $id: string                   // Unique application ID
  
  // References
  jobId: string                 // Reference to Jobs collection
  userId: string                // Reference to Users collection
  
  // Job Info (Denormalized for performance)
  jobTitle: string              // Job title
  company: string               // Company name
  
  // Application Status
  status: 'applied' | 'under_review' | 'interview_scheduled' | 'shortlisted' | 'rejected'
  
  // Timestamps
  appliedAt: string             // When application was submitted
  createdAt: string
  updatedAt: string             // Last status update
}
```

**Indexes:**
- `jobId_idx` on `jobId`
- `userId_idx` on `userId`
- `status_idx` on `status`
- `composite_idx` on `[userId, jobId]` (unique - prevent duplicates)

---

### **4. Placements Collection** (`placements`)
Records of successful placements.

```typescript
{
  $id: string                   // Unique placement ID
  
  // Student Information
  studentId: string             // Reference to Users collection
  studentName: string           // Student full name
  studentRollNo: string         // Roll number
  studentDepartment: string     // Department
  studentBatch: string          // Batch
  
  // Placement Details
  company: string               // Company name
  role: string                  // Job role/position
  package: number               // Annual package (in LPA)
  packageCurrency?: string      // Currency
  jobType: string               // Full-time, Internship, etc.
  location: string              // Job location
  
  // Dates
  placementDate: string         // Date of placement offer
  joiningDate?: string          // Expected/actual joining date
  
  // System Fields
  createdAt: string
  updatedAt: string
}
```

**Indexes:**
- `studentId_idx` on `studentId`
- `company_idx` on `company`
- `batch_idx` on `studentBatch`
- `department_idx` on `studentDepartment`

---

### **5. Admin Roles Collection** (`admin_roles`)
Manages admin users and their permissions.

```typescript
{
  $id: string                   // Unique role ID
  
  // User Information
  email: string                 // Admin email (@gct.ac.in)
  name: string                  // Full name
  department?: string           // Department affiliation
  
  // Role & Status
  role: 'placement_officer' | 'placement_coordinator' | 'placement_rep'
  isActive: boolean             // Is account active?
  
  // Permissions (for future enhancement)
  permissions?: string[]        // Array of permission strings
  
  // System Fields
  createdAt: string
  updatedAt: string
  createdBy?: string            // Admin who created this role
}
```

**Indexes:**
- `email_idx` on `email` (unique)
- `role_idx` on `role`
- `isActive_idx` on `isActive`

---

### **6. Forum Posts Collection** (`forum_posts`)
Discussion forum posts created by students.

```typescript
{
  $id: string                   // Unique post ID
  
  // Content
  title: string                 // Post title (max 255 chars)
  content: string               // Post content (max 10,000 chars)
  
  // Author Information
  authorId: string              // Reference to Users collection
  authorName: string            // Author display name
  
  // Categorization
  category: string              // Post category (default: "General")
  tags?: string[]               // Array of tags (max 5)
  
  // Engagement Metrics
  viewCount: number             // Number of views (default: 0)
  commentCount: number          // Number of comments (default: 0)
  
  // Moderation
  isPinned: boolean             // Is post pinned? (default: false)
  isClosed: boolean             // Is post closed for comments? (default: false)
  
  // System Fields
  $createdAt: string            // Appwrite managed timestamp
  $updatedAt: string            // Appwrite managed timestamp
}
```

**Indexes:**
- `authorId_idx` on `authorId`
- `category_idx` on `category`

**Available Categories:**
- General
- Interview Experiences
- Company Reviews
- Placement Tips
- Technical Doubts
- Resume Review
- Job Opportunities
- Other

---

### **7. Forum Comments Collection** (`forum_comments`)
Comments on forum posts with nested reply support.

```typescript
{
  $id: string                   // Unique comment ID
  
  // References
  postId: string                // Reference to forum_posts
  parentCommentId?: string      // For nested replies (optional)
  
  // Content
  content: string               // Comment text (max 5,000 chars)
  
  // Author Information
  authorId: string              // Reference to Users collection
  authorName: string            // Author display name
  
  // System Fields
  $createdAt: string            // Appwrite managed timestamp
  $updatedAt: string            // Appwrite managed timestamp
}
```

**Indexes:**
- `postId_idx` on `postId`
- `authorId_idx` on `authorId`

---

## 🔒 Collection Permissions

All collections use Appwrite's built-in permission system:

```typescript
// Example: Forum Posts Collection
Permissions: [
  Permission.read(Role.any()),              // Anyone can read
  Permission.create(Role.users()),          // Any authenticated user can create
  Permission.update(Role.user('[USER_ID]')), // Only author can update
  Permission.delete(Role.user('[USER_ID]'))  // Only author can delete
]
```

**Permission Levels:**
- `Role.any()` - Public access (no auth required)
- `Role.users()` - Any authenticated user
- `Role.user('[USER_ID]')` - Specific user only
- `Role.team('[TEAM_ID]')` - Team members (for admin roles)

---

## 📦 Storage Buckets

### **Placement Files Bucket** (`placement-files`)

**Allowed File Types:**
- **Resumes**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG, WEBP, GIF
- **Documents**: PDF, DOC, DOCX, TXT

**Configuration:**
- Max file size: 10 MB
- Compression: Enabled for images
- Encryption: At rest
- File security: Yes

**Permissions:**
```typescript
Permissions: [
  Permission.create(Role.users()),  // Any user can upload
  Permission.read(Role.users()),    // Only authenticated users can view
  Permission.delete(Role.user('[USER_ID]')) // Only uploader can delete
]
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18.x or higher
- **pnpm** package manager (`npm install -g pnpm`)
- **Appwrite account** (Cloud or self-hosted)
- **Git** for version control
- **GCT email** for testing (@gct.ac.in domain)

---

### 📥 Installation Steps

#### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/balajir-cg/gct-placements.git
cd gct-placements

# Or clone a specific branch (e.g., forum-feature)
git clone --branch forum-feature https://github.com/balajir-cg/gct-placements.git
cd gct-placements
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=placement-db
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=placement-files

# API Key (for server-side operations)
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

# Domain Configuration
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=gct.ac.in

# OpenRouter API (for AI Marksheet Processing)
# Get your API key from https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here

# 📧 Email Configuration (for Notifications)
# Get App Password: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=GCT Placements <your-email@gmail.com>

# Optional: Self-hosted Appwrite
# NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
```

> **⚠️ Security Note**: Never commit `.env.local` to version control. The `.env.local` file is automatically gitignored. Always use placeholders in documentation and never expose API keys in committed files.

#### 4. Appwrite Setup

**Option A: Using Appwrite Cloud (Recommended)**

1. Go to [Appwrite Cloud](https://cloud.appwrite.io/)
2. Create a new project
3. Note your Project ID and API endpoint
4. Create an API key with full permissions

**Option B: Self-hosting Appwrite with Docker**

**Linux/Mac:**
```bash
docker run -it --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
    --entrypoint="install" \
    appwrite/appwrite:1.7.4
```

**Windows (Command Prompt):**
```bash
docker run -it --rm ^
    --volume //var/run/docker.sock:/var/run/docker.sock ^
    --volume "%cd%"/appwrite:/usr/src/code/appwrite:rw ^
    --entrypoint="install" ^
    appwrite/appwrite:1.7.4
```

**Windows (PowerShell):**
```bash
docker run -it --rm `
    --volume /var/run/docker.sock:/var/run/docker.sock `
    --volume ${pwd}/appwrite:/usr/src/code/appwrite:rw `
    --entrypoint="install" `
    appwrite/appwrite:1.7.4
```

#### 5. Database Setup

Run the automated setup scripts to create collections:

```bash
# Create forum collections (forum_posts, forum_comments)
node scripts/setup-forum-collections.js

# For initial admin setup, follow scripts/setup-appwrite.md
```

**Manual Setup:**
- Follow the detailed guide: `scripts/setup-appwrite.md`
- Create all 7 collections listed in the Database Structure section
- Set up proper indexes and permissions
- Configure the storage bucket

#### 6. Email Notification Setup (Optional but Recommended)

The system supports intelligent email notifications for job alerts and deadline reminders.

**Step 1: Enable Gmail App Password**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create new app password for "Mail"
5. Copy the 16-character password

**Step 2: Configure Environment Variables**

Add to `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd-efgh-ijkl-mnop  # 16-char app password
EMAIL_FROM=GCT Placements <your-email@gmail.com>
```

**Step 3: Test Email Sending**

```bash
node scripts/test-email-sending.js
```

✅ If successful, you'll receive a test email!

**Email Features**:
- 🎯 **Targeted Notifications**: Only eligible students receive emails
- 📱 **Mobile-Responsive**: HTML templates optimized for all devices
- ⚡ **Batched Sending**: Efficient email queue management
- 🔒 **Secure**: App passwords, no plain-text credentials

**Notification Types**:
1. **New Job Alerts** - When admin creates a job (only eligible students)
2. **Deadline Reminders** - Daily at 9 AM for jobs expiring soon
3. **Application Updates** - Status changes (interview, shortlisted)

> **Note**: Without SMTP configuration, in-app notifications will still work via Appwrite Realtime.

For detailed email setup guide, see `SMTP_CONFIGURATION_GUIDE.md` and `EMAIL_SYSTEM_COMPLETE.md`.

---

#### 7. Create Initial Admin

Add your first admin user in Appwrite Console:

1. Go to your Appwrite project dashboard
2. Navigate to Databases → `admin_roles` collection
3. Create a new document:

```json
{
  "email": "your-email@gct.ac.in",
  "name": "Your Name",
  "role": "placement_coordinator",
  "department": "Computer Science and Engineering",
  "isActive": true
}
```

#### 8. Run Development Server

```bash
pnpm dev
```

🎉 Visit **http://localhost:3000** to see the application!

#### 9. Build for Production

```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start
```

**Production Build Stats**:
- ✅ 27 routes compiled (16 static, 11 dynamic)
- ✅ First Load JS: ~102 kB (optimized)
- ✅ Next.js 15 App Router with standalone output
- ✅ Automatic code splitting and optimization

---

## 📂 Project File Structure

```
gct-placements/
│
├── 📁 app/                           # Next.js App Router (pages & API routes)
│   ├── 📁 admin/                     # Admin-only routes
│   │   ├── 📁 add-job/              # Create new job postings
│   │   ├── 📁 add-placement/        # Add placement records
│   │   ├── 📁 dashboard/            # Admin analytics dashboard
│   │   ├── 📁 edit-placement/[id]/  # Edit placement records
│   │   ├── 📁 login/                # Admin login page
│   │   ├── 📁 manage-admins/        # Manage admin roles
│   │   └── 📁 placements/           # View all placements
│   │
│   ├── 📁 api/                       # API routes
│   │   ├── 📁 extract-marksheet/   # AI marksheet OCR endpoint
│   │   ├── 📁 process-marksheet/   # Marksheet validation & processing
│   │   ├── 📁 save-academic-data/  # Save semester data to profile
│   │   ├── 📁 files/[fileId]/      # File operations API
│   │   └── 📁 notifications/       # Notification system APIs ⭐ NEW
│   │       ├── 📁 send-job-notification/  # New job alerts (targeted)
│   │       └── 📁 check-deadlines/        # Deadline reminder cron
│   │
│   ├── 📁 dashboard/                 # Student dashboard
│   │   └── page.tsx                 # Main dashboard page
│   │
│   ├── 📁 forum/                     # Discussion forum
│   │   ├── page.tsx                 # Forum listing page
│   │   ├── 📁 new/                  # Create new post
│   │   └── 📁 [id]/                 # Individual post view
│   │
│   ├── 📁 jobs/                      # Job management
│   │   ├── page.tsx                 # Job listings
│   │   └── 📁 [id]/                 # Job details
│   │       └── 📁 apply/            # Apply for job
│   │
│   ├── 📁 login/                     # Student login
│   ├── 📁 signup/                    # Student registration
│   ├── 📁 profile/                   # User profile management
│   ├── 📁 marksheet-upload/          # AI marksheet processing page ⭐
│   ├── 📁 placements/                # View placement records
│   │
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
│
├── 📁 components/                    # Reusable React components
│   ├── 📁 ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ... (40+ components)
│   │
│   ├── ProtectedRoute.tsx            # Route protection wrapper
│   ├── NotificationBell.tsx          # Real-time notification UI ⭐ NEW
│   ├── MarksheetUploadSection.tsx    # AI marksheet upload UI ⭐
│   ├── StudentProfileModal.tsx       # Student details modal
│   ├── BulkUpdateModal.tsx          # Bulk operations modal
│   ├── ExportModal.tsx              # Data export modal
│   └── theme-provider.tsx           # Theme context provider
│
├── 📁 contexts/                      # React Context providers
│   └── AuthContext.tsx              # Authentication state management
│
├── 📁 lib/                           # Core utilities and services
│   ├── appwrite.ts                  # Appwrite SDK configuration & types
│   ├── auth.ts                      # Authentication service
│   ├── database.ts                  # Database operations (CRUD, deadline filtering)
│   ├── forum.ts                     # Forum-specific operations
│   ├── notifications.ts             # Notification service ⭐ NEW
│   ├── email.ts                     # Email service (Nodemailer) ⭐ NEW
│   ├── arrears.ts                   # Arrear tracking service ⭐ NEW
│   └── utils.ts                     # Utility functions (cn, etc.)
│
├── 📁 hooks/                         # Custom React hooks
│   ├── use-toast.ts                 # Toast notifications hook
│   └── use-mobile.tsx               # Mobile detection hook
│
├── 📁 scripts/                       # Setup and utility scripts
│   ├── setup-appwrite.md            # Detailed Appwrite setup guide
│   ├── setup-forum-collections.js   # Forum database setup
│   ├── setup-arrears-collection.js  # Arrear tracking setup ⭐ NEW
│   ├── setup-notifications-collection.js # Notifications setup ⭐ NEW
│   ├── add-arrear-fields.js         # Add arrear fields to users ⭐ NEW
│   ├── view-arrears.js              # Debug arrear records ⭐ NEW
│   ├── cleanup-duplicate-arrears.js # Remove duplicate arrears ⭐ NEW
│   ├── test-email-sending.js       # Test SMTP configuration ⭐ NEW
│   ├── test-job-notification.js    # Test notification system ⭐ NEW
│   ├── view-notifications.js       # View notification history ⭐ NEW
│   ├── create-initial-admin.js      # Create first admin user
│   ├── seed-database.js            # Generate test data
│   ├── export.js                    # Export data utility
│   ├── import.js                    # Import data utility
│   └── README.md                    # Scripts documentation
│
├── 📁 appwrite-functions/            # Appwrite Functions (Serverless) ⭐ NEW
│   ├── 📁 check-deadlines/          # Daily cron for deadline reminders
│   │   ├── package.json
│   │   └── src/main.js              # Node.js 18 function
│   └── 📁 send-job-notification/    # Webhook for new job alerts
│       ├── package.json
│       └── src/main.js              # Node.js 18 function
│
├── 📁 public/                        # Static assets
│   └── ... (images, icons, etc.)
│
├── 📁 styles/                        # Additional styles
│   └── globals.css                  # Global CSS
│
├── 📁 docs/                          # Documentation files ⭐ NEW
│   └── marksheet-sample-data.json   # Sample AI extraction format
│
├── 📄 components.json                # shadcn/ui configuration
├── 📄 next.config.mjs                # Next.js configuration
├── 📄 tailwind.config.ts             # Tailwind CSS configuration
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 package.json                   # Dependencies & scripts
├── 📄 pnpm-lock.yaml                # Dependency lock file
├── 📄 .env.example                   # Environment variables template
├── 📄 .env.local                     # Your environment variables (gitignored)
├── 📄 .dockerignore                  # Docker ignore file ⭐ NEW
├── 📄 Dockerfile                     # Production Docker image ⭐ NEW
├── 📄 docker-compose.yml             # Docker Compose config ⭐ NEW
│
├── 📄 README.md                      # This file (comprehensive guide)
├── 📄 QUICK_START.md                 # Quick start guide
├── 📄 IMPLEMENTATION_COMPLETE.md     # Feature implementation log
├── 📄 AI_VISION_TROUBLESHOOTING.md   # AI marksheet debugging
├── 📄 ARREAR_TRACKING_SYSTEM.md      # Arrear tracking documentation
├── 📄 ARREAR_BUG_FIXES.md            # Arrear bug fix history
├── 📄 MARKSHEET_REVIEW_ENHANCEMENT.md # Marksheet UI improvements
├── 📄 TARGETED_NOTIFICATION_SYSTEM.md # Notification system guide ⭐ NEW
├── 📄 DEADLINE_FILTERING_IMPLEMENTATION.md # Deadline filtering docs ⭐ NEW
├── 📄 EMAIL_SYSTEM_COMPLETE.md       # Email setup guide ⭐ NEW
├── 📄 EMAIL_NOTIFICATION_SETUP.md    # Email configuration ⭐ NEW
├── 📄 SMTP_CONFIGURATION_GUIDE.md    # SMTP setup instructions ⭐ NEW
├── 📄 NOTIFICATION_SYSTEM_SETUP.md   # Notification architecture ⭐ NEW
├── 📄 FORUM_GUIDE.md                 # Forum feature documentation
├── 📄 FORUM_SETUP_COMPLETE.md        # Forum setup completion guide
├── 📄 ADMIN_DASHBOARD_IMPROVEMENTS.md # Admin dashboard docs
└── 📄 SECURITY_FIX_APPLIED.md        # Security patch log

```

---

## 📖 Usage Guide

### 🎓 For Students: Uploading Marksheets

The AI-powered marksheet upload feature automatically extracts academic data from your semester marksheets.

#### Step-by-Step Instructions:

1. **Navigate to Profile**:
   - Log in to your student account
   - Go to **Profile** → **Files & Links** tab
   - Scroll to the **Marksheet Upload** section

2. **Upload Your Marksheet**:
   - Click **Upload Marksheet Image**
   - Select a clear image of your semester marksheet (JPEG, PNG, or WebP)
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp` (max 10MB)
   - Wait for AI extraction (typically 5-15 seconds)

3. **Review Extracted Data**:
   - The AI will extract:
     - Student Register Number
     - Student Name
     - Semester Number (supports Roman numerals: V, VI, VII, VIII)
     - CGPA (Cumulative Grade Point Average)
     - Course details (name, code, credits, grade, attempts)
   - Preview shows all extracted information

4. **Edit if Needed**:
   - Click **✏️ Edit** button
   - Correct any misread values
   - Click **Save** when done

5. **Apply to Profile**:
   - Click **Apply to Profile**
   - System validates:
     - ✅ Register number matches your profile
     - ✅ Semester is between 1-8
     - ✅ CGPA is between 0-10
     - ✅ **Fraud detection checks** (7-point authenticity verification)
   - Your profile updates automatically with:
     - Semester-wise CGPA (e.g., `sem5Cgpa: 8.75`)
     - Current CGPA (from highest semester uploaded)
     - Arrear counts (history and current)

#### 🔒 Fraud Detection & Security:

- **7-Point Authenticity Verification**:
  1. Institution name must be "Government College of Technology"
  2. Location must be "Coimbatore - 641 013"
  3. Document type must be "Statement of Grades"
  4. Register number must follow GCT format (10-15 digits)
  5. Must have official seal and date
  6. Must have Controller of Examinations signature
  7. Must have proper course structure and CGPA calculation

- **Automatic Fraud Detection**:
  - ✅ **Green Badge**: Verified GCT marksheet (all checks passed)
  - ⚠️ **Yellow Badge**: Partial verification (some checks failed)
  - 🚨 **Red Alert**: Fraud detected (>40% checks failed) - **Upload Blocked**

- **What Gets Blocked**:
  - Marksheets from other institutions
  - Handwritten or fake documents
  - Screenshots without proper formatting
  - Manipulated/edited marksheets
  - Documents missing official elements

- **Fraud Score Display**: Real-time percentage shown during validation

#### 🎯 Smart Features:

- **Arrear Detection**: Automatically identifies failed courses (grades like RA, SA, U, F)
- **Arrear Clearance**: Detects when you clear a course in a later semester (attempts > 1)
- **History vs Current Arrears**:
  - **History of Arrears**: Total arrears you've ever had (never decreases)
  - **Current Arrears**: Active arrears (decreases when cleared)
- **CGPA Tracking**: Updates your current CGPA based on the highest semester uploaded
- **Security**: Prevents uploading someone else's marksheet by validating register number

#### 💡 Tips:

- **Only upload official GCT marksheets** - Other documents will be rejected
- Upload marksheets in order (Semester 1, 2, 3...)
- Ensure images are clear and well-lit
- All text should be readable (including seal, signature, and footer)
- Avoid shadows or glare on the marksheet
- If AI misreads data, use the Edit button to correct it
- **Do not upload fake or manipulated documents** - The system will detect them

---

## 🎯 Key Features Implementation

### Authentication Flow

```typescript
// lib/auth.ts
export class AuthService {
  // Sign up new user
  static async signup(email: string, password: string, name: string)
  
  // Login user
  static async login(email: string, password: string)
  
  // Logout
  static async logout()
  
  // Get current session
  static async getCurrentUser()
  
  // Check if user is admin
  static async checkAdminRole(email: string)
}
```

### Database Operations

```typescript
// lib/database.ts
export class DatabaseService {
  // Job Management (with Deadline Filtering)
  static async createJob(jobData: JobData): Promise<Job>
  static async getJobs(): Promise<Job[]>  // ⭐ Only active jobs (for students)
  static async getAllJobs(): Promise<Job[]>  // ⭐ All jobs including expired (for admins)
  static async updateJob(jobId: string, updates: Partial<Job>)
  
  // Application Management
  static async createApplication(data: ApplicationData): Promise<Application>
  static async getUserApplications(userId: string): Promise<Application[]>
  static async updateApplicationStatus(appId: string, status: Status)
  
  // User Profile
  static async updateUserProfile(userId: string, data: ProfileData)
  static async getUserProfile(userId: string): Promise<UserProfile>
}
```

### Notification System

```typescript
// lib/notifications.ts
export class NotificationService {
  // Create notification
  static async createNotification(data: NotificationData): Promise<Notification>
  
  // Get user notifications
  static async getUserNotifications(userId: string): Promise<Notification[]>
  
  // Mark as read/unread
  static async markAsRead(notificationId: string): Promise<void>
  static async markAllAsRead(userId: string): Promise<void>
  
  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void>
  
  // Subscribe to real-time updates
  static subscribeToNotifications(userId: string, callback: Function)
}

// lib/email.ts
export class EmailService {
  // Send job notification email
  static async sendJobNotificationEmail(student: Student, job: Job): Promise<void>
  
  // Send deadline reminder email
  static async sendDeadlineReminderEmail(student: Student, job: Job): Promise<void>
  
  // Send application status update email
  static async sendStatusUpdateEmail(student: Student, application: Application): Promise<void>
}
```

### Smart Eligibility Filtering

```typescript
// Example from app/api/notifications/send-job-notification/route.ts
const eligibleStudents = allStudents.filter(student => {
  // 1. Check department eligibility
  if (eligibleDepartments.length > 0 && 
      !eligibleDepartments.includes(student.department)) {
    return false;
  }
  
  // 2. Check CGPA requirement
  const studentCGPA = parseFloat(student.currentCgpa) || 0;
  if (studentCGPA < minCGPA) {
    return false;
  }
  
  // 3. Check backlog/arrear requirement
  if (noBacklogs) {
    if (student.activeBacklog === 'Yes' || 
        student.historyOfArrear === 'Yes') {
      return false;
    }
  }
  
  return true; // Student is eligible
});

// Send notifications ONLY to eligible students
for (const student of eligibleStudents) {
  await createNotification(student);
  await sendEmail(student);
}
```

### Forum Operations (Real-time)

```typescript
// lib/forum.ts
export class ForumService {
  // Posts
  static async createPost(postData: PostData): Promise<ForumPost>
  static async getPosts(filters?: Filters): Promise<ForumPost[]>
  static async subscribeToNewPosts(callback: Function): UnsubscribeFunction
  
  // Comments
  static async createComment(commentData: CommentData): Promise<ForumComment>
  static async getComments(postId: string): Promise<ForumComment[]>
  static async subscribeToComments(postId: string, callback: Function)
  
  // Search
  static async searchPosts(query: string): Promise<ForumPost[]>
}
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
<ProtectedRoute requireAuth adminOnly>
  <AdminDashboard />
</ProtectedRoute>

// Usage in pages
export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth adminOnly>
      {/* Admin content */}
    </ProtectedRoute>
  )
}
```



---

## 👥 User Roles & Permissions

| Role | Access Level | Permissions |
|------|-------------|-------------|
| **🎓 Student** | Student Portal | • Create & manage profile<br>• Browse & apply for jobs<br>• Track application status<br>• Upload resumes & documents<br>• Participate in forum discussions<br>• View placement statistics |
| **👥 Placement Representative** | Dual Access | • All student permissions<br>• Switch between portals<br>• Access basic admin features<br>• Assist in placement coordination |
| **⚙️ Placement Coordinator** | Full Admin Access | • Manage job postings<br>• Review applications<br>• Update application status<br>• Create placement records<br>• Manage admin roles<br>• View analytics & reports<br>• Moderate forum content<br>• System administration |

---

## 🔐 Security Features

- ✅ **Email Domain Validation**: Only `@gct.ac.in` emails allowed
- ✅ **Role-Based Access Control (RBAC)**: Granular permission system
- ✅ **Protected API Routes**: Server-side authentication checks
- ✅ **Secure File Uploads**: File type and size validation
- ✅ **XSS Protection**: Input sanitization and output encoding
- ✅ **CSRF Protection**: Next.js built-in security
- ✅ **Rate Limiting**: (Coming soon) Prevent abuse
- ✅ **Session Management**: Secure, httpOnly cookies

---

## 🚢 Deployment

### 🐳 Docker Deployment (Recommended for Production)

The application is fully containerized with Docker support for easy deployment.

#### **Quick Start with Docker**

```bash
# 1. Build the Docker image
docker build -t gct-placements:latest .

# 2. Run the container
docker run -p 3000:3000 \
  --env-file .env.local \
  --name gct-placements \
  gct-placements:latest

# 3. Visit http://localhost:3000
```

#### **Docker Compose (Recommended)**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### **Docker Hub Deployment**

```bash
# 1. Tag your image
docker tag gct-placements:latest yourusername/gct-placements:latest

# 2. Login to Docker Hub
docker login

# 3. Push to Docker Hub
docker push yourusername/gct-placements:latest

# 4. Pull and run on any server
docker pull yourusername/gct-placements:latest
docker run -p 3000:3000 --env-file .env.production yourusername/gct-placements:latest
```

#### **Production Docker Compose**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  gct-placements:
    image: yourusername/gct-placements:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Deploy to production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### **Docker Image Features**

- ✅ **Multi-stage Build**: Optimized image size (~200MB)
- ✅ **Next.js Standalone**: Minimal runtime dependencies
- ✅ **Non-root User**: Security best practices
- ✅ **Health Checks**: Built-in container monitoring
- ✅ **Environment Variables**: Configurable at runtime
- ✅ **Production Ready**: Optimized for performance

#### **Docker Environment Variables**

Create `.env.production` for production deployment:

```env
# Appwrite Production
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=prod-project-id
APPWRITE_API_KEY=prod-api-key

# Database
NEXT_PUBLIC_APPWRITE_DATABASE_ID=placement-db

# Collections
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID=jobs
NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID=applications
# ... other collections

# Email (Production SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=placements@gct.ac.in
SMTP_PASS=prod-app-password
EMAIL_FROM=GCT Placements <placements@gct.ac.in>

# OpenRouter
OPENROUTER_API_KEY=prod-openrouter-key

# Domain
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=gct.ac.in
```

#### **Cloud Deployment Options**

**1. AWS ECS/Fargate**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com
docker tag gct-placements:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/gct-placements:latest
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/gct-placements:latest

# Deploy with ECS
aws ecs update-service --cluster gct-cluster --service gct-placements --force-new-deployment
```

**2. Google Cloud Run**
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/gct-placements

# Deploy to Cloud Run
gcloud run deploy gct-placements \
  --image gcr.io/PROJECT_ID/gct-placements \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**3. Azure Container Instances**
```bash
# Push to Azure Container Registry
az acr build --registry <registry-name> --image gct-placements:latest .

# Deploy to ACI
az container create \
  --resource-group gct-rg \
  --name gct-placements \
  --image <registry-name>.azurecr.io/gct-placements:latest \
  --dns-name-label gct-placements \
  --ports 3000
```

**4. DigitalOcean App Platform**
```bash
# Use Docker Hub image
doctl apps create --spec .do/app.yaml

# Or connect GitHub repo for auto-deploy
```

---

### 🚀 Vercel Deployment (Serverless)

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Select the `gct-placements` project

2. **Configure Environment Variables**:
   - Add all variables from `.env.local`
   - Use production Appwrite project credentials
   - Add email SMTP credentials

3. **Deploy**:
   ```bash
   # Automatic deployment on git push
   git push origin main
   
   # Or deploy manually
   vercel --prod
   ```

4. **Custom Domain** (Optional):
   - Add your custom domain in Vercel settings
   - Update Appwrite platform settings to allow your domain

**Vercel Advantages**:
- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs
- ✅ Global CDN with 100+ edge locations
- ✅ Zero-config Next.js optimization
- ✅ Free SSL certificates
- ✅ Serverless functions included

---

### 📦 Other Platform Deployments

**Netlify**
```bash
# netlify.toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Railway**
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Render**
```yaml
# render.yaml
services:
  - type: web
    name: gct-placements
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
```

---

### 🔧 Production Checklist

Before deploying to production:

- [ ] Set all environment variables in production
- [ ] Use production Appwrite project (not development)
- [ ] Configure SMTP with production email credentials
- [ ] Set up proper domain in Appwrite platform settings
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure database backups in Appwrite
- [ ] Set up monitoring and logging
- [ ] Test all features in staging environment
- [ ] Update `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` if needed
- [ ] Review and tighten CORS policies
- [ ] Enable rate limiting (if implemented)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Optimize images and assets
- [ ] Run security audit: `pnpm audit`

---

## 🛠️ Development Guidelines

### Adding New Features

1. **Plan the Feature**:
   - Define requirements and user stories
   - Design database schema if needed
   - Sketch UI/UX mockups

2. **Database First**:
   - Create Appwrite collections with proper attributes
   - Set up indexes for performance
   - Configure permissions correctly

3. **Define TypeScript Types**:
   ```typescript
   // lib/appwrite.ts
   export interface YourNewFeature {
     $id: string
     fieldName: string
     // ... other fields
   }
   ```

4. **Implement Service Layer**:
   ```typescript
   // lib/your-feature.ts
   export class YourFeatureService {
     static async createItem(data: ItemData) { }
     static async getItems() { }
     // ... CRUD operations
   }
   ```

5. **Create UI Components**:
   - Use shadcn/ui components
   - Follow existing patterns
   - Add loading and error states

6. **Add Route Protection**:
   ```typescript
   <ProtectedRoute requireAuth adminOnly={isAdminFeature}>
     <YourComponent />
   </ProtectedRoute>
   ```

7. **Test Thoroughly**:
   - Test all CRUD operations
   - Verify permissions work correctly
   - Check mobile responsiveness
   - Test error scenarios

### Code Style Guidelines

- **TypeScript**: Always use TypeScript, avoid `any` types
- **Naming**: Use camelCase for variables, PascalCase for components
- **Components**: Keep components small and focused
- **Comments**: Add JSDoc comments for complex functions
- **Formatting**: Use Prettier (run `pnpm format`)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **Authentication Errors**

**Problem**: "Invalid credentials" or "Session expired"

**Solutions**:
- Clear browser cookies and local storage
- Check Appwrite project ID and endpoint in `.env.local`
- Verify email domain matches allowed domain
- Check Appwrite console for session issues

#### 2. **Database Permission Errors**

**Problem**: "Missing permissions" or "Unauthorized"

**Solutions**:
- Review collection permissions in Appwrite dashboard
- Ensure user is logged in (check `AuthContext`)
- Verify user role assignments in `admin_roles` collection
- Check document-level permissions

#### 3. **File Upload Failures**

**Problem**: "File upload failed" or "Invalid file type"

**Solutions**:
- Check file size (max 10MB)
- Verify file type is allowed (PDF, DOC, images)
- Check storage bucket permissions in Appwrite
- Ensure bucket ID in `.env.local` is correct

#### 4. **Real-time Updates Not Working**

**Problem**: Forum posts/comments not updating in real-time

**Solutions**:
- Check WebSocket connection in browser console
- Verify Appwrite Realtime API is enabled
- Ensure correct channel subscriptions
- Check network firewall/proxy settings

#### 5. **Build Errors**

**Problem**: `pnpm build` fails with TypeScript errors

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install

# Check for type errors
pnpm type-check

# Fix ESLint issues
pnpm lint --fix
```

#### 6. **Environment Variables Not Loading**

**Problem**: `undefined` values for env vars

**Solutions**:
- Restart dev server after changing `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side vars
- Check `.env.local` is in root directory
- Verify no typos in variable names

### Getting Help

- 📖 **Documentation**: Check `scripts/setup-appwrite.md` and feature-specific docs
- 🐛 **Issues**: Open an issue on GitHub
- 💬 **Appwrite Docs**: [https://appwrite.io/docs](https://appwrite.io/docs)
- 🔍 **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Propose new features via GitHub issues
3. **Improve Documentation**: Fix typos, add examples, clarify instructions
4. **Submit Code**: Fix bugs or implement features via pull requests

### Contribution Workflow

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/gct-placements.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Go to original repo on GitHub
   - Click "New Pull Request"
   - Describe your changes clearly

### Code Review Process

- All PRs require at least one approval
- CI checks must pass
- Follow feedback from reviewers
- Keep PRs focused and reasonably sized

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 GCT Placement Portal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📧 Contact & Support

- **Project Lead**: Government College of Technology
- **Repository**: [github.com/balajir-cg/gct-placements](https://github.com/balajir-cg/gct-placements)
- **Issues**: [GitHub Issues](https://github.com/balajir-cg/gct-placements/issues)
- **Email**: placement@gct.ac.in

---

## 🙏 Acknowledgments

- **Appwrite Team** for the amazing BaaS platform with Realtime, Functions, and more
- **Vercel** for Next.js framework and serverless deployment platform
- **shadcn** for the beautiful, accessible UI component library
- **OpenRouter** for AI API gateway and vision model access
- **Radix UI** for primitive accessible components
- **Tailwind Labs** for the utility-first CSS framework
- **GCT Students & Faculty** for invaluable feedback, testing, and feature requests
- **Open Source Community** for inspiration, tools, and endless resources
- **Node.js & React Teams** for the incredible ecosystems
- **Docker Community** for containerization best practices

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅ (Completed - Jan 2025)
- [x] Authentication & user management with RBAC
- [x] Job posting & application system
- [x] Admin dashboard with analytics
- [x] Student profiles & document uploads
- [x] Real-time discussion forum
- [x] AI-powered marksheet processing with OCR
- [x] 7-point fraud detection for marksheets
- [x] Intelligent arrear tracking system
- [x] Semester-wise academic records

### Phase 2: Smart Features ✅ (Completed - Jan 2025)
- [x] 🎯 **Targeted notification system** (CGPA, dept, backlog filtering)
- [x] 📧 **Email notifications** (SMTP with Gmail)
- [x] ⏰ **Deadline filtering** (auto-hide expired jobs)
- [x] 🔔 **In-app notifications** with Appwrite Realtime
- [x] 🤖 **Automated cron jobs** (daily deadline reminders)
- [x] 🐳 **Docker support** (production-ready containers)
- [x] 📊 **Bulk operations** for admins
- [x] 📤 **Data export** (CSV, XLSX)
- [x] 🔒 **Enhanced security** (fraud detection, validation)

### Phase 3: Enhancement & Scale 🚧 (In Progress)
- [ ] Advanced analytics dashboard with charts (recharts integrated)
- [ ] Real-time application status tracking
- [ ] SMS notifications (Twilio integration)
- [ ] Push notifications (Web Push API)
- [ ] Advanced search with filters and sorting
- [ ] Mobile-responsive improvements
- [ ] Performance optimization (caching, lazy loading)
- [ ] Comprehensive admin reporting system

### Phase 4: Advanced Features 📋 (Planned - Q2 2025)
- [ ] AI-powered resume analyzer and scoring
- [ ] Interview scheduling system with calendar integration
- [ ] Video interview integration (Zoom/Google Meet)
- [ ] Chatbot for FAQs (AI-powered)
- [ ] Placement prediction ML model
- [ ] Multi-language support (Tamil, Hindi)
- [ ] Advanced analytics with ML insights
- [ ] Company portal for direct job posting

### Phase 5: Scale & Optimize ⏳ (Future - 2026)
- [ ] Microservices architecture migration
- [ ] Redis caching layer for performance
- [ ] Elasticsearch for advanced search
- [ ] Advanced monitoring with Grafana/Prometheus
- [ ] A/B testing framework
- [ ] Progressive Web App (PWA) with offline support
- [ ] Mobile apps (React Native for iOS/Android)
- [ ] API rate limiting and throttling
- [ ] Multi-tenant support for other colleges

---

<div align="center">

## 🌟 Star this repo if you find it helpful!

**Built with ❤️ for Government College of Technology**

[![GitHub stars](https://img.shields.io/github/stars/balajir-cg/gct-placements?style=social)](https://github.com/balajir-cg/gct-placements)
[![GitHub forks](https://img.shields.io/github/forks/balajir-cg/gct-placements?style=social)](https://github.com/balajir-cg/gct-placements/fork)

**Tech Stack**: Next.js 15.2.4 • React 19 • TypeScript 5 • Appwrite 18.2 • Tailwind CSS • Docker

**Features**: AI Marksheet OCR • Smart Notifications • Real-time Forum • Deadline Management • Email Alerts • Docker Ready

**Production Ready**: ✅ Build Successful (27 routes, 102KB First Load) • Docker Optimized • Cloud Deployable

</div> 