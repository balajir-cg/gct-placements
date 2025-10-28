# Marksheet Processing System

This feature allows students to upload their academic marksheets, and the system will automatically extract data using AI vision model and calculate CGPA.

## Features

- 📤 Upload marksheet images (JPEG, PNG, WebP)
- 🤖 AI-powered data extraction using OpenRouter's Qwen 2.5 32B Vision model
- 📊 Automatic CGPA calculation using weighted grade points
- 💾 Data persistence in Appwrite database
- 🔄 Load existing academic records
- 📱 Responsive UI with real-time progress tracking

## Setup

### 1. Appwrite Collection Setup

Create a collection named `academic_records` in your Appwrite database with these attributes:

**Collection ID**: `academic_records`

**Attributes**:
- `userId` - String, 255, Required
- `fileId` - String, 255, Required
- `extractedData` - String, 65535, Required (stores JSON)
- `institution` - String, 500, Optional
- `registerNo` - String, 100, Optional
- `studentName` - String, 255, Optional
- `dateOfBirth` - String, 50, Optional
- `department` - String, 500, Optional
- `computedCgpa` - String, 10, Optional
- `totalCreditsEarned` - String, 10, Optional
- `totalCreditsRegistered` - String, 10, Optional
- `createdAt` - String, 50, Required
- `updatedAt` - String, 50, Required

**Indexes**:
- Key: `userId`, Type: `key`, Attribute: `userId`

**Permissions**:
- Read: `users`
- Write: `users`

### 2. Environment Variables

Already configured in `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID=academic_records
OPENROUTER_API_KEY=your_openrouter_api_key
VISION_MODEL=qwen/qwen2.5-vl-32b-instruct:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Access the Feature

Navigate to: `http://localhost:3000/marksheet-upload`

## How It Works

### 1. Upload Process
- Student selects and uploads a marksheet image
- File is uploaded to Appwrite Storage
- File ID is sent to the processing API

### 2. AI Processing
- API route (`/api/process-marksheet`) receives file ID and user ID
- Generates a public URL for the uploaded image
- Sends the image URL to OpenRouter's Qwen vision model
- Model extracts structured JSON data including:
  - Institution details
  - Student information
  - All course details with credits and grade points
  - Summary information

### 3. CGPA Calculation

The system calculates CGPA using weighted grade points:

**Formula**: `CGPA = Σ(credits × grade_point) / Σ(credits)`

**Priority**:
1. Uses `cumulative_grade_point_average` from summary if available
2. Calculates from `weighted_grade_points_earned / credits_earned` if available
3. Falls back to calculating from individual courses

### 4. Data Storage
- All extracted data is stored as JSON in `extractedData` field
- Key fields are extracted for quick access
- Record can be retrieved anytime using `DatabaseService.getAcademicRecord(userId)`

## API Endpoints

### POST `/api/process-marksheet`

**Request Body**:
```json
{
  "fileId": "file_id_from_appwrite_storage",
  "userId": "user_id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Marksheet processed successfully",
  "data": {
    "computedCgpa": "8.45",
    "institution": "GOVERNMENT COLLEGE OF TECHNOLOGY",
    "studentName": "STUDENT NAME",
    "registerNo": "12345678901",
    "totalCreditsEarned": 15.5,
    "totalCreditsRegistered": 19.5,
    "extractedData": { ... },
    "recordId": "record_id"
  }
}
```

## Database Methods

### Create/Update Academic Record
```typescript
await DatabaseService.upsertAcademicRecord(userId, {
  fileId: 'file_id',
  extractedData: JSON.stringify(data),
  institution: 'Institution Name',
  registerNo: '12345678901',
  studentName: 'Student Name',
  dateOfBirth: '01/01/2000',
  department: 'Computer Science',
  computedCgpa: '8.45',
  totalCreditsEarned: '15.5',
  totalCreditsRegistered: '19.5'
})
```

### Get Academic Record
```typescript
const result = await DatabaseService.getAcademicRecord(userId)
if (result.success) {
  const record = result.data
  const extractedData = JSON.parse(record.extractedData)
  console.log('CGPA:', record.computedCgpa)
}
```

## File Structure

```
app/
├── marksheet-upload/
│   └── page.tsx              # Upload UI page
└── api/
    └── process-marksheet/
        └── route.ts           # Processing API endpoint

lib/
├── appwrite.ts                # Added academicRecords collection & AcademicRecord interface
└── database.ts                # Added upsertAcademicRecord & getAcademicRecord methods
```

## Error Handling

The system handles various error scenarios:
- Invalid file types
- File size too large (max 5MB)
- API failures
- JSON parsing errors
- Database errors

All errors are displayed to the user with appropriate messages.

## Future Enhancements

1. **Profile Integration**: Move this feature to the profile section
2. **Batch Processing**: Upload multiple marksheets at once
3. **OCR Verification**: Allow manual correction of extracted data
4. **Export**: Download extracted data as PDF/CSV
5. **Analytics**: Dashboard showing CGPA trends across semesters
6. **Notifications**: Alert students when CGPA calculation is complete

## Testing

1. Navigate to `/marksheet-upload`
2. Upload a test marksheet image
3. Wait for processing (usually 10-30 seconds)
4. Verify extracted data and CGPA calculation
5. Click "Load Existing" to retrieve the stored record

## Troubleshooting

### Image not processing
- Ensure image URL is publicly accessible
- Check OpenRouter API key is valid
- Verify storage bucket permissions allow public read

### CGPA showing as 0.00
- Check if marksheet has valid grade points
- Verify courses array has credit and grade_point fields
- Check summary data structure

### Database errors
- Verify collection exists with correct ID
- Check user has write permissions
- Ensure all required attributes exist
