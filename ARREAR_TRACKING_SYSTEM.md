# Arrear Tracking System

## Overview

The arrear tracking system maintains accurate records of individual arrear papers for each student, properly handling multiple arrears across semesters and tracking when they are cleared.

## Previous System (Problems)

**Problem 1: Lost History**
- Student uploads Sem 4: 1 arrear → `historyOfArrearsCount=1`
- Student uploads Sem 5: Arrear cleared → `historyOfArrearsCount=0` ❌ (WRONG!)

**Problem 2: Multiple Arrears Not Tracked**
- Student has 2 arrears: Math (Sem 3), Physics (Sem 4)
- Sem 5: Clears Math only
- Old system shows `currentArrearsCount=0` ❌ (WRONG! Physics still pending)

## New System (Solution)

### Architecture

```
┌─────────────────────┐
│ Arrears Collection  │
├─────────────────────┤
│ • Individual paper  │
│ • Failed semester   │
│ • Cleared status    │
│ • Cleared semester  │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Arrears Service    │
│  (lib/arrears.ts)   │
├─────────────────────┤
│ • Track failures    │
│ • Detect clearance  │
│ • Calculate counts  │
└─────────────────────┘
         ↓
┌─────────────────────┐
│   Profile Update    │
├─────────────────────┤
│ historyOfArrears    │
│ currentArrears      │
└─────────────────────┘
```

### Database Schema: `arrears` Collection

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID of the student |
| `studentName` | string | Student name |
| `registerNumber` | string | Register number |
| `courseCode` | string | Course code (e.g., "CS101") |
| `courseName` | string | Course name |
| `credits` | string | Course credits |
| `failedSemester` | integer | Semester when course was failed |
| `failedAcademicYear` | string | Academic year of failure |
| `failedGrade` | string | Grade when failed (RA, U, F) |
| `isCleared` | boolean | Whether arrear is cleared (default: false) |
| `clearedSemester` | integer | Semester when cleared |
| `clearedAcademicYear` | string | Academic year when cleared |
| `clearedGrade` | string | Grade when cleared |
| `createdAt` | datetime | Record creation time |
| `updatedAt` | datetime | Last update time |

### How It Works

#### Step 1: Student Fails a Course
When uploading Sem 4 marksheet with Math course result = "FAIL":

```typescript
// Create arrear record
{
  userId: "user123",
  courseCode: "MA101",
  courseName: "Mathematics I",
  failedSemester: 4,
  isCleared: false
}
```

**Result:**
- `historyOfArrearsCount = 1` (total arrears ever)
- `currentArrearsCount = 1` (active arrears)

#### Step 2: Student Clears the Arrear
When uploading Sem 5 marksheet with Math course result = "PASS":

```typescript
// Update arrear record
{
  ...previous fields,
  isCleared: true,
  clearedSemester: 5,
  clearedGrade: "P"
}
```

**Result:**
- `historyOfArrearsCount = 1` (still 1, never decreases ✅)
- `currentArrearsCount = 0` (no active arrears ✅)

#### Step 3: Multiple Arrears Example

**Sem 3:** Fail Math and Physics
```typescript
// Two records created
[
  { courseCode: "MA101", failedSemester: 3, isCleared: false },
  { courseCode: "PH101", failedSemester: 3, isCleared: false }
]
```
- `historyOfArrearsCount = 2`
- `currentArrearsCount = 2`

**Sem 4:** Clear Math only
```typescript
// Math record updated
{ courseCode: "MA101", isCleared: true, clearedSemester: 4 }
// Physics still uncleared
{ courseCode: "PH101", isCleared: false }
```
- `historyOfArrearsCount = 2` (unchanged ✅)
- `currentArrearsCount = 1` (only Physics pending ✅)

**Sem 5:** Clear Physics
```typescript
// Physics record updated
{ courseCode: "PH101", isCleared: true, clearedSemester: 5 }
```
- `historyOfArrearsCount = 2` (unchanged ✅)
- `currentArrearsCount = 0` (all cleared ✅)

## Implementation

### 1. Setup Arrears Collection

```bash
node scripts/setup-arrears-collection.js
```

This creates the `arrears` collection with proper attributes and indexes.

### 2. Arrears Service (`lib/arrears.ts`)

Key functions:

```typescript
// Process marksheet and update arrear records
processMarksheetArrears(
  userId: string,
  studentName: string,
  registerNumber: string,
  semester: number,
  academicYear: string,
  courses: CourseResult[]
): Promise<{ historyCount: number; currentCount: number }>

// Get all arrears for a user
getUserArrears(userId: string): Promise<ArrearRecord[]>

// Get only active (uncleared) arrears
getActiveArrears(userId: string): Promise<ArrearRecord[]>

// Get arrear summary
getArrearSummary(userId: string): Promise<{
  totalArrears: number
  activeArrears: number
  clearedArrears: number
  arrearsList: ArrearRecord[]
}>
```

### 3. Marksheet Upload Flow

In `components/MarksheetUploadSection.tsx`:

```typescript
// After extracting marksheet data
const arrears = await processMarksheetArrears(
  userId,
  studentName,
  registerNumber,
  semester,
  academicYear,
  courses
)

// Update marksheet data with accurate counts
data.historyOfArrearsCount = arrears.historyCount
data.currentArrearsCount = arrears.currentCount
```

### 4. Profile Update

In `app/profile/page.tsx`:

```typescript
// Arrear counts come directly from the arrears tracking system
// No need for Math.max() logic - database maintains accuracy
historyOfArrearsCount: marksheetData.historyOfArrearsCount.toString()
currentArrearsCount: marksheetData.currentArrearsCount.toString()
```

## Failure Detection Logic

A course is considered a **failure** if:
- `result` includes "fail"
- `result` is "ra" (Re-Appear)
- `letter_grade` is "RA", "F", "U", "W", or "AB"

A course is considered **passed** if:
- `result` includes "pass"
- `result` is "p"
- `letter_grade` is a passing grade: "O", "A+", "A", "B+", "B", "C", "P", "S"

## Benefits

### ✅ Accurate History Tracking
- `historyOfArrearsCount` **never decreases**
- Reflects the maximum number of arrears ever had
- Important for placement eligibility

### ✅ Precise Current Status
- `currentArrearsCount` shows **exact number** of active arrears
- Handles multiple arrears correctly
- Updates automatically when arrears are cleared

### ✅ Individual Paper Tracking
- Each arrear paper is tracked separately
- Can see which specific courses need to be cleared
- Maintains full history (when failed, when cleared, grades)

### ✅ Clearance Detection
- Automatically detects when a previously failed course is passed
- Marks the arrear as cleared with semester and grade information
- No manual intervention needed

### ✅ Database Integrity
- All arrear data persists in database
- Can query and analyze arrear patterns
- Audit trail for each arrear paper

## Example Scenarios

### Scenario 1: Simple Arrear → Clear
| Semester | Action | historyCount | currentCount |
|----------|--------|--------------|--------------|
| Sem 4 | Fail Math | 1 | 1 |
| Sem 5 | Clear Math | 1 ✅ | 0 ✅ |

### Scenario 2: Multiple Arrears, Partial Clear
| Semester | Action | historyCount | currentCount |
|----------|--------|--------------|--------------|
| Sem 3 | Fail Math, Physics | 2 | 2 |
| Sem 4 | Clear Math | 2 ✅ | 1 ✅ |
| Sem 5 | Clear Physics | 2 ✅ | 0 ✅ |

### Scenario 3: New Arrears After Clearing
| Semester | Action | historyCount | currentCount |
|----------|--------|--------------|--------------|
| Sem 3 | Fail Math | 1 | 1 |
| Sem 4 | Clear Math | 1 ✅ | 0 ✅ |
| Sem 5 | Fail Chemistry | 2 ✅ | 1 ✅ |
| Sem 6 | Clear Chemistry | 2 ✅ | 0 ✅ |

### Scenario 4: Complex Mixed Arrears
| Semester | Action | historyCount | currentCount |
|----------|--------|--------------|--------------|
| Sem 3 | Fail Math, Physics, Chemistry | 3 | 3 |
| Sem 4 | Clear Math, Fail Biology | 4 ✅ | 3 ✅ |
| Sem 5 | Clear Physics, Chemistry | 4 ✅ | 1 ✅ |
| Sem 6 | Clear Biology | 4 ✅ | 0 ✅ |

## API Reference

### `processMarksheetArrears()`
Processes a marksheet and updates arrear records.

**Parameters:**
- `userId`: Student's user ID
- `studentName`: Student's name
- `registerNumber`: Student's register number
- `semester`: Current semester number (1-8)
- `academicYear`: Academic year (e.g., "2023-2024")
- `courses`: Array of course results from marksheet

**Returns:**
```typescript
{
  historyCount: number,  // Total arrears ever
  currentCount: number   // Active arrears now
}
```

**Logic:**
1. For each course in the marksheet:
   - Check if it's a failure → Create arrear record if new
   - Check if it's a pass → Mark existing arrear as cleared
2. Query all arrear records for the user
3. Count total records = `historyCount`
4. Count records where `isCleared=false` = `currentCount`
5. Return counts

### `getUserArrears(userId)`
Get all arrear records for a user (cleared + active).

### `getActiveArrears(userId)`
Get only active (uncleared) arrear records.

### `getArrearSummary(userId)`
Get comprehensive arrear statistics:
- Total arrears (history)
- Active arrears (current)
- Cleared arrears
- Full list of arrear records

## Testing

### Manual Test Cases

**Test 1: Basic Arrear Tracking**
1. Upload Sem 4 with 1 failed course
2. Verify: history=1, current=1
3. Upload Sem 5 with that course passed
4. Verify: history=1, current=0 ✅

**Test 2: Multiple Arrears**
1. Upload Sem 3 with 2 failed courses (Math, Physics)
2. Verify: history=2, current=2
3. Upload Sem 4 with Math passed, Physics still failed
4. Verify: history=2, current=1 ✅
5. Upload Sem 5 with Physics passed
6. Verify: history=2, current=0 ✅

**Test 3: New Arrears After Clearing**
1. Upload Sem 3 with 1 failed course
2. Verify: history=1, current=1
3. Upload Sem 4 with that course passed
4. Verify: history=1, current=0
5. Upload Sem 5 with 2 new failed courses
6. Verify: history=3, current=2 ✅

### Database Verification

Check arrears collection directly:
```bash
node scripts/view-arrears.js <userId>
```

## Troubleshooting

### Issue: Arrear counts showing 0 after upload

**Solution:**
1. Check if arrears collection exists in Appwrite
2. Verify API endpoints are using `processMarksheetArrears()`
3. Check browser console for errors
4. Verify userId is correct

### Issue: Arrear not marked as cleared

**Solution:**
1. Verify course codes match exactly (case-sensitive)
2. Check if passing grade is detected correctly
3. Review course result field format
4. Check `isCoursePass()` logic in `lib/arrears.ts`

### Issue: Duplicate arrear records

**Solution:**
- The system uses `findArrearByCourse()` to prevent duplicates
- If duplicates exist, check if courseCode changed between semesters
- Clean up using Appwrite console or custom script

## Migration from Old System

If you have existing users with arrear data in their profile:

1. **Option A:** Fresh start (recommended)
   - New uploads will build the arrears collection naturally
   - Old `historyOfArrearsCount` values remain in profile for reference

2. **Option B:** Migrate existing data
   - Create a migration script to populate arrears collection
   - Parse historical marksheets if available
   - Manually create arrear records for known cases

## Future Enhancements

- [ ] Arrear analytics dashboard for admins
- [ ] Export arrear reports in CSV/PDF
- [ ] Notification when arrear is cleared
- [ ] Arrear clearance certificate generation
- [ ] Integration with academic calendar for arrear exam dates
- [ ] Bulk arrear data import for existing students

## Support

For issues or questions about the arrear tracking system:
1. Check this documentation
2. Review code comments in `lib/arrears.ts`
3. Test with the provided scenarios
4. Check Appwrite console for data verification
