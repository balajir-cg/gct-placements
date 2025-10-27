# Academic Records Collection Setup

This document describes the Appwrite collection structure for storing OCR-extracted academic data.

## Collection Details

**Collection ID:** `academic_records`  
**Collection Name:** Academic Records  
**Purpose:** Store semester-wise academic records extracted from marksheets

## Attributes Schema

| Attribute | Type | Size | Required | Default | Array | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `userId` | string | 255 | ✅ | - | ❌ | User ID (links to users collection) |
| `studentName` | string | 100 | ✅ | - | ❌ | Student full name |
| `registerNumber` | string | 12 | ✅ | - | ❌ | 12-digit register number |
| `department` | string | 100 | ✅ | - | ❌ | Department name |
| `batch` | string | 9 | ✅ | - | ❌ | Batch (format: 2021-2025) |
| `semester` | integer | - | ✅ | - | ❌ | Semester number (1-8) |
| `academicYear` | string | 9 | ✅ | - | ❌ | Academic year (2022-2023) |
| `creditsRegistered` | float | - | ✅ | 0 | ❌ | Total credits registered |
| `creditsEarned` | float | - | ✅ | 0 | ❌ | Total credits earned |
| `weightedGradePoints` | float | - | ✅ | 0 | ❌ | Total weighted grade points |
| `sgpa` | float | - | ✅ | 0 | ❌ | Semester GPA (0-10) |
| `cgpa` | float | - | ✅ | 0 | ❌ | Cumulative GPA (0-10) |
| `subjects` | string | 10000 | ❌ | [] | ❌ | JSON array of subjects |
| `extractionDate` | datetime | - | ✅ | now() | ❌ | Date of extraction |
| `confidenceScore` | float | - | ❌ | 0 | ❌ | OCR confidence (0-100) |
| `isVerified` | boolean | - | ✅ | false | ❌ | Manual verification status |
| `verifiedBy` | string | 255 | ❌ | - | ❌ | Admin who verified |
| `verifiedAt` | datetime | - | ❌ | - | ❌ | Verification timestamp |
| `documentUrl` | string | 500 | ❌ | - | ❌ | Original document file ID |

## Indexes

Create these indexes for better query performance:

| Index Key | Type | Attributes | Order |
|-----------|------|------------|-------|
| `idx_userId` | Key | userId | ASC |
| `idx_registerNumber` | Key | registerNumber | ASC |
| `idx_semester` | Key | semester | ASC |
| `idx_academicYear` | Key | academicYear | DESC |
| `idx_user_semester` | Key | userId, semester | ASC, ASC |
| `idx_cgpa` | Key | cgpa | DESC |

## Permissions

### Read Access
- **Role: users** - Users can read their own records
- **Role: placement_coordinator** - Full read access
- **Role: placement_rep** - Full read access

### Write Access
- **Role: users** - Users can create their own records
- **Role: placement_coordinator** - Full write access
- **Role: placement_rep** - Can verify records

### Delete Access
- **Role: placement_coordinator** - Can delete records
- **Role: users** - Can delete their own unverified records

## Subjects JSON Structure

The `subjects` field stores a JSON array with this structure:

```json
[
  {
    "subjectCode": "CS301",
    "subjectName": "Data Structures and Algorithms",
    "credits": 4.0,
    "grade": "S",
    "gradePoints": 10.0
  },
  {
    "subjectCode": "CS302",
    "subjectName": "Database Management Systems",
    "credits": 4.0,
    "grade": "A",
    "gradePoints": 9.0
  }
]
```

## Setup Instructions

### Using Appwrite Console

1. **Navigate to Database:**
   - Open Appwrite Console
   - Go to Databases → `placement-db`

2. **Create Collection:**
   - Click "Add Collection"
   - Collection ID: `academic_records`
   - Collection Name: `Academic Records`

3. **Add Attributes:**
   - Click "Add Attribute" for each field
   - Follow the schema table above
   - Set required/optional flags
   - Set default values

4. **Create Indexes:**
   - Click "Indexes" tab
   - Add each index from the table above

5. **Set Permissions:**
   - Click "Settings" tab
   - Configure read/write/delete permissions

### Using Appwrite CLI

```bash
# Create collection
appwrite databases createCollection \
  --databaseId placement-db \
  --collectionId academic_records \
  --name "Academic Records"

# Add string attributes
appwrite databases createStringAttribute \
  --databaseId placement-db \
  --collectionId academic_records \
  --key userId \
  --size 255 \
  --required true

# Add integer attributes
appwrite databases createIntegerAttribute \
  --databaseId placement-db \
  --collectionId academic_records \
  --key semester \
  --required true \
  --min 1 \
  --max 8

# Add float attributes
appwrite databases createFloatAttribute \
  --databaseId placement-db \
  --collectionId academic_records \
  --key sgpa \
  --required true \
  --min 0 \
  --max 10

# Add boolean attribute
appwrite databases createBooleanAttribute \
  --databaseId placement-db \
  --collectionId academic_records \
  --key isVerified \
  --required true \
  --default false

# Add datetime attribute
appwrite databases createDatetimeAttribute \
  --databaseId placement-db \
  --collectionId academic_records \
  --key extractionDate \
  --required true

# Create indexes
appwrite databases createIndex \
  --databaseId placement-db \
  --collectionId academic_records \
  --key idx_userId \
  --type key \
  --attributes userId \
  --orders ASC
```

### Using Setup Script

```javascript
// scripts/setup-academic-records.js
const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

async function setupAcademicRecordsCollection() {
  try {
    // Create collection
    await databases.createCollection(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      'academic_records',
      'Academic Records'
    );

    console.log('✅ Collection created');

    // Add attributes (see full script in repository)
    // ...

    console.log('✅ Attributes created');
    console.log('✅ Indexes created');
    console.log('✅ Permissions configured');
    console.log('\n🎉 Academic Records collection setup complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAcademicRecordsCollection();
```

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID=academic_records
```

## Usage Examples

### Create Record

```typescript
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

const record = await databases.createDocument(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID!,
  ID.unique(),
  {
    userId: currentUser.$id,
    studentName: 'RAJESH KUMAR M',
    registerNumber: '211519104001',
    department: 'COMPUTER SCIENCE AND ENGINEERING',
    batch: '2021-2025',
    semester: 3,
    academicYear: '2022-2023',
    creditsRegistered: 20.0,
    creditsEarned: 20.0,
    weightedGradePoints: 186.0,
    sgpa: 9.30,
    cgpa: 9.15,
    subjects: JSON.stringify([...]),
    extractionDate: new Date().toISOString(),
    confidenceScore: 95.0,
    isVerified: false
  }
);
```

### Query Records

```typescript
// Get all records for a user
const records = await databases.listDocuments(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID!,
  [
    Query.equal('userId', currentUser.$id),
    Query.orderDesc('semester')
  ]
);

// Get specific semester
const semesterRecord = await databases.listDocuments(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID!,
  [
    Query.equal('userId', currentUser.$id),
    Query.equal('semester', 3)
  ]
);
```

### Update Record

```typescript
await databases.updateDocument(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID!,
  recordId,
  {
    isVerified: true,
    verifiedBy: admin.$id,
    verifiedAt: new Date().toISOString()
  }
);
```

## Validation Rules

- `registerNumber`: Must be exactly 12 digits
- `semester`: Must be between 1-8
- `sgpa`, `cgpa`: Must be between 0-10
- `batch`: Format YYYY-YYYY (e.g., 2021-2025)
- `academicYear`: Format YYYY-YYYY (e.g., 2022-2023)
- `confidenceScore`: Between 0-100

## Notes

- Each user can have multiple records (one per semester)
- Records can be uploaded multiple times for the same semester (latest wins)
- Unverified records can be edited/deleted by the user
- Verified records can only be modified by coordinators
- The `subjects` field stores JSON as a string (Appwrite limitation)

## Troubleshooting

### Error: Attribute already exists
- Delete the collection and recreate
- Or skip existing attributes in the script

### Error: Invalid permissions
- Ensure user roles are properly configured
- Check admin_roles collection

### Error: Query limit exceeded
- Use pagination with `Query.limit()` and `Query.offset()`

## Related Collections

- `users` - User profiles (linked via userId)
- `placements` - Placement records
- `applications` - Job applications

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0
