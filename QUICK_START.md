# 🚀 Quick Start Guide - Marksheet Processing

## One-Time Setup (5 minutes)

### 1. Create Appwrite Collection

Go to Appwrite Console → Database → Create Collection:

**Collection ID**: `academic_records`

**Required Attributes** (All String type):
```
userId                  (255, required)
fileId                  (255, required)
extractedData           (65535, required)
institution             (500, optional)
registerNo              (100, optional)
studentName             (255, optional)
dateOfBirth             (50, optional)
department              (500, optional)
computedCgpa            (10, optional)
totalCreditsEarned      (10, optional)
totalCreditsRegistered  (10, optional)
createdAt               (50, required)
updatedAt               (50, required)
```

**Index**: `userId` (key type)

**Permissions**: 
- Read: users
- Write: users

### 2. Verify .env.local

Already configured ✅:
```env
NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID=academic_records
OPENROUTER_API_KEY=your_openrouter_api_key_here
VISION_MODEL=qwen/qwen2.5-vl-32b-instruct:free
```

### 3. Start Server

```bash
npm run dev
```

### 4. Test It!

Open: http://localhost:3000/marksheet-upload

---

## How It Works (30 seconds)

1. **Upload** → Student uploads marksheet image
2. **Extract** → AI reads all course data
3. **Calculate** → CGPA = Weighted Points / Credits
4. **Store** → Save to database
5. **Display** → Show results to student

---

## CGPA Formula

```
CGPA = Σ(credits × grade_point) / Σ(credits)
```

Example:
- Course 1: 3 credits × 8 grade points = 24
- Course 2: 4 credits × 7 grade points = 28
- CGPA = (24 + 28) / (3 + 4) = 52 / 7 = **7.43**

---

## Files Modified

✅ `lib/appwrite.ts` - Added collection config
✅ `lib/database.ts` - Added DB methods
✅ `app/api/process-marksheet/route.ts` - NEW
✅ `app/marksheet-upload/page.tsx` - NEW

---

## Testing Checklist

- [ ] Collection created in Appwrite
- [ ] Permissions set correctly
- [ ] Server running without errors
- [ ] Navigate to /marksheet-upload
- [ ] Upload test marksheet
- [ ] See extracted data
- [ ] CGPA calculated correctly
- [ ] Data stored in database
- [ ] Can load existing record

---

## Need Help?

- See `IMPLEMENTATION_COMPLETE.md` for full details
- See `MARKSHEET_PROCESSING.md` for documentation
- See `docs/marksheet-sample-data.json` for expected format

---

**Status**: ✅ READY FOR TESTING

**Next**: Once validated, integrate into `/profile` page
