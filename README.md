# 🎓 GCT Placement Portal

A comprehensive, modern placement management system for Government College of Technology (GCT) built with Next.js 15, React 19, TypeScript, and Appwrite BaaS.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-BaaS-f02e65)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)

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
  - Academic records (10th, 12th, diploma, CGPA, backlogs)
  - Professional details (skills, projects, internships)
  - Documents (resume, profile picture, certificates)
- **Profile Completion Tracking**: Real-time progress indicator
- **Admin Management**: Dedicated interface for managing admin roles
- **User Search & Filter**: Advanced search across all user attributes
- **Bulk Operations**: Export user data, bulk status updates

### 💼 **Job Management System**
- **Detailed Job Postings**:
  - Company information with logo upload
  - Job title, role, description, and requirements
  - Salary range and job type (full-time, internship, etc.)
  - Department eligibility and CGPA requirements
  - Backlog restrictions and application deadlines
  - Placement drive dates and locations
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
| **Appwrite** | Complete backend solution |
| ↳ Database | NoSQL document database for all collections |
| ↳ Authentication | User authentication and session management |
| ↳ Storage | File storage with CDN delivery |
| ↳ Realtime | WebSocket-based real-time updates |

### **Core Libraries**
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Modern icon library
- **next-themes**: Theme management (light/dark mode)
- **zod**: Schema validation
- **class-variance-authority**: Component variant management

### **Development Tools**
- **pnpm**: Fast, disk-efficient package manager
- **ESLint**: Code linting and quality checks
- **Prettier**: Code formatting
- **Git**: Version control
- **Docker**: Appwrite self-hosting (optional)

---

## 📊 Database Structure (Appwrite Collections)

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

Update `.env.local` with your Appwrite credentials:

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

# Domain Configuration
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=gct.ac.in

# Optional: Self-hosted Appwrite
# NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
```

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

#### 6. Create Initial Admin

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

#### 7. Run Development Server

```bash
pnpm dev
```

🎉 Visit **http://localhost:3000** to see the application!

#### 8. Build for Production

```bash
pnpm build
pnpm start
```

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
│   │   └── 📁 files/[fileId]/       # File operations API
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
│   ├── database.ts                  # Database operations (CRUD)
│   ├── forum.ts                     # Forum-specific operations
│   └── utils.ts                     # Utility functions (cn, etc.)
│
├── 📁 hooks/                         # Custom React hooks
│   ├── use-toast.ts                 # Toast notifications hook
│   └── use-mobile.tsx               # Mobile detection hook
│
├── 📁 scripts/                       # Setup and utility scripts
│   ├── setup-appwrite.md            # Detailed Appwrite setup guide
│   ├── setup-forum-collections.js   # Forum database setup
│   ├── create-initial-admin.js      # Create first admin user
│   ├── export.js                    # Export data utility
│   ├── import.js                    # Import data utility
│   └── README.md                    # Scripts documentation
│
├── 📁 public/                        # Static assets
│   └── ... (images, icons, etc.)
│
├── 📁 styles/                        # Additional styles
│   └── globals.css                  # Global CSS
│
├── 📄 components.json                # shadcn/ui configuration
├── 📄 next.config.mjs                # Next.js configuration
├── 📄 tailwind.config.ts             # Tailwind CSS configuration
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 package.json                   # Dependencies & scripts
├── 📄 pnpm-lock.yaml                # Dependency lock file
├── 📄 .env.example                   # Environment variables template
├── 📄 .env.local                     # Your environment variables (gitignored)
│
├── 📄 README.md                      # This file
├── 📄 FORUM_GUIDE.md                # Forum feature documentation
├── 📄 FORUM_SETUP_COMPLETE.md       # Forum setup completion guide
└── 📄 ADMIN_DASHBOARD_IMPROVEMENTS.md # Admin dashboard docs

```

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
  // Job Management
  static async createJob(jobData: JobData): Promise<Job>
  static async getJobs(): Promise<Job[]>
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

### Deploy to Vercel (Recommended)

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Select the `gct-placements` project

2. **Configure Environment Variables**:
   - Add all variables from `.env.local`
   - Use production Appwrite project credentials

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

### Deploy to Other Platforms

**Netlify, Railway, Render, etc.**
- Similar process: Connect repo → Add env vars → Deploy
- Ensure Node.js 18+ is supported

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

- **Appwrite Team** for the amazing BaaS platform
- **Vercel** for Next.js and hosting
- **shadcn** for the beautiful UI components
- **GCT Students & Faculty** for feedback and testing
- **Open Source Community** for inspiration and resources

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅ (Completed)
- [x] Authentication & user management
- [x] Job posting & application system
- [x] Admin dashboard with analytics
- [x] Student profiles & document uploads
- [x] Real-time discussion forum

### Phase 2: Enhancements 🚧 (In Progress)
- [ ] Email notifications for application updates
- [ ] Advanced search & filtering
- [ ] Bulk operations for admins
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)

### Phase 3: Advanced Features 📋 (Planned)
- [ ] AI-powered resume analyzer
- [ ] Interview scheduling system
- [ ] Video interview integration
- [ ] Chatbot for FAQs
- [ ] Analytics ML predictions
- [ ] Multi-language support

### Phase 4: Scale & Optimize ⏳ (Future)
- [ ] Microservices architecture
- [ ] Redis caching layer
- [ ] Advanced monitoring & logging
- [ ] A/B testing framework
- [ ] Progressive Web App (PWA)

---

<div align="center">

## 🌟 Star this repo if you find it helpful!

**Built with ❤️ for Government College of Technology**

[![GitHub stars](https://img.shields.io/github/stars/balajir-cg/gct-placements?style=social)](https://github.com/balajir-cg/gct-placements)
[![GitHub forks](https://img.shields.io/github/forks/balajir-cg/gct-placements?style=social)](https://github.com/balajir-cg/gct-placements/fork)

Made with Next.js 15, React 19, TypeScript, Appwrite, and Tailwind CSS

</div> 