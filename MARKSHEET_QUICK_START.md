# Marksheet Upload - Quick Start Guide

## What's New?

✅ Marksheet upload moved to Profile page → Files & Links tab  
✅ Intelligent arrear tracking (History vs Current)  
✅ Auto-fill profile from marksheet data  
✅ CGPA calculated up to uploaded semester  

## How to Use

### For Students:

1. **Navigate**: Go to Profile → Files & Links tab
2. **Upload**: Click "Upload Marksheet for Auto-Fill" section
3. **Select**: Choose your semester marksheet image (JPEG/PNG/WebP)
4. **Extract**: Click "Extract Marksheet Data" button
5. **Review**: Check all extracted information
6. **Apply**: Click "Use This Data to Fill Profile"
7. **Save**: Review changes, then click "Save Changes"

### What Gets Auto-Filled:

- Roll Number
- Batch/Regulation
- Department
- Date of Birth
- Current CGPA (up to uploaded semester)
- Semester-wise CGPA for that semester
- **History of Arrears Count** (total ever had)
- **Current Arrears Count** (currently active)

## Understanding Arrear Counts

### History of Arrears (Never Decreases)
- **What**: Total number of courses you've ever failed
- **Example**: Failed 5 courses throughout college → History = 5
- **Use**: Shows complete academic struggle history

### Current Arrears (Decreases When Cleared)
- **What**: Active arrears you currently need to clear
- **Example**: Failed 5, cleared 3 → Current = 2
- **Use**: Shows what you need to clear now

## Real Example

**Situation**: Student in Semester 6

| Semester | Failed Courses | Cleared Later? |
|----------|---------------|----------------|
| Sem 1 | Math (RA) | ✅ Cleared in Sem 2 |
| Sem 2 | Physics (F) | ✅ Cleared in Sem 3 |
| Sem 3 | Chemistry (U) | ❌ Not cleared yet |
| Sem 4 | None | - |
| Sem 5 | Programming (RA) | ❌ Not cleared yet |
| Sem 6 | Database (F) | ❌ Just failed |

**Result After Uploading Sem 6 Marksheet:**
- ✅ History of Arrears Count: **5** (Math, Physics, Chemistry, Programming, Database)
- ⚠️ Current Arrears Count: **3** (Chemistry, Programming, Database)
- History of Arrear: **Yes**
- Active Backlog: **Yes**
- Number of Backlogs: **3**

## Files Changed

### New Files:
- `/components/MarksheetUploadSection.tsx` - Upload component
- `/app/api/files/upload/route.ts` - File upload API
- `MARKSHEET_PROFILE_INTEGRATION.md` - Full documentation

### Modified Files:
- `/lib/appwrite.ts` - Added historyOfArrearsCount, currentArrearsCount fields
- `/app/profile/page.tsx` - Integrated marksheet upload, added academic details section

### Existing APIs Used:
- `/api/extract-marksheet` - AI extraction endpoint
- `/api/save-academic-data` - Not used (profile uses standard update)

## Key Features

### 1. Multi-Semester Support
- Upload any semester (1-8)
- CGPA calculated up to that semester
- Can upload different semesters to update data

### 2. Intelligent Detection
- **Fail Grades**: RA, F, U, W, AB
- **Pass Grades**: O, A+, A, B+, B, C, D, E, P
- **Results**: Checks both grade and result fields

### 3. Automatic Calculations
- CGPA: Weighted average using credits_registered
- Arrears: Groups by course code, tracks attempts
- Status: Auto-sets historyOfArrear and activeBacklog

## Tips

1. **Upload Latest Semester**: Most accurate arrear tracking
2. **Review Before Saving**: AI might misread, verify data
3. **Clear Image**: Better quality = better extraction
4. **Complete Marksheet**: Ensure all pages visible
5. **Edit if Needed**: Can manually adjust after auto-fill

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Extraction failed | Check image quality, try re-uploading |
| Wrong CGPA | Verify credits_registered values in marksheet |
| Incorrect arrears | Check if failed courses show clear RA/F grades |
| Data not filling | Click "Use This Data to Fill Profile" button |
| Can't save | Enable edit mode and review required fields |

## Next Steps After Upload

1. ✅ Check Basic Info (Roll No, Batch, Department)
2. ✅ Verify CGPA values
3. ✅ Review arrear counts
4. ✅ Fill remaining fields (10th, 12th marks, etc.)
5. ✅ Upload Resume (if not done)
6. ✅ Click "Save Changes"
7. ✅ Verify profile page shows updated info

## Benefits

✨ **Time Saving**: No manual entry of complex academic data  
✨ **Accuracy**: AI extracts data directly from marksheet  
✨ **Transparency**: Clear distinction between history and current arrears  
✨ **Placement Ready**: Companies can filter by accurate arrear data  
✨ **Progress Tracking**: See CGPA growth semester by semester  

---

**Ready to use!** Navigate to Profile → Files & Links → Upload Marksheet
