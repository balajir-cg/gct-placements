# 🚀 Quick Start: DeepSeek-OCR Marksheet Upload

Get the marksheet OCR feature running in **5 minutes**.

## ⚡ Prerequisites

- ✅ Node.js & pnpm installed
- ✅ Python 3.9+ installed
- ✅ Appwrite project configured
- ✅ Next.js app running

---

## 📋 Step-by-Step Setup

### Step 1: Setup Database Collection (1 min)

```bash
# Run the setup script
node scripts/setup-academic-records.js
```

**Expected Output:**
```
✅ Collection created
✅ Attributes created
✅ Indexes created
✅ Academic Records collection setup complete!
```

---

### Step 2: Update Environment Variables (1 min)

Add these lines to `.env.local`:

```env
# Academic Records Collection
NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID=academic_records

# Python Backend URL
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:5000
```

---

### Step 3: Install Python Backend (2 min)

```bash
# Navigate to python backend
cd python-backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

**Expected Output:**
```
Successfully installed flask-3.0.0 flask-cors-4.0.0 ...
```

---

### Step 4: Start Python Backend (30 sec)

```bash
# Make sure you're in python-backend/ with venv activated
python app.py
```

**Expected Output:**
```
🚀 Starting DeepSeek-OCR Backend Server on 0.0.0.0:5000
✅ DeepSeek-OCR model loaded successfully
 * Running on http://0.0.0.0:5000
```

**Keep this terminal open!**

---

### Step 5: Start Next.js (30 sec)

Open a **new terminal** (don't close Python backend):

```bash
# In project root
pnpm dev
```

**Expected Output:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## 🎯 Test the Feature

1. **Open browser:** `http://localhost:3000/upload-marksheet`

2. **Check backend status:** You should see a green alert:
   ```
   ✅ Backend is running and ready to process marksheets
   ```

3. **Upload a marksheet:**
   - Drag and drop OR click to browse
   - Select a PDF or image file
   - Click "Extract Data"
   - Wait 2-3 seconds

4. **Review extracted data:**
   - Check confidence score
   - Verify student info
   - Edit if needed
   - Click "Save Academic Record"

5. **Success!** 🎉

---

## 🐛 Quick Troubleshooting

### Backend Not Starting?

**Error:** `Port 5000 already in use`

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Try again
python app.py
```

---

**Error:** `ModuleNotFoundError: No module named 'flask'`

```bash
# Make sure venv is activated (should see (venv) in prompt)
source venv/bin/activate

# Reinstall
pip install -r requirements.txt
```

---

### Frontend Shows "Backend Not Running"?

1. Check Python backend is running (see terminal)
2. Verify URL in `.env.local`: `NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:5000`
3. Test backend directly:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return:
   ```json
   {"status": "healthy", ...}
   ```

---

### Collection Not Found?

```bash
# Run setup script again
node scripts/setup-academic-records.js

# Or check Appwrite console:
# Database → placement-db → Collections → academic_records
```

---

## ✅ Verification Checklist

- [ ] Python backend running on port 5000
- [ ] Next.js running on port 3000
- [ ] Green "Backend is running" message on upload page
- [ ] Can drag-drop files
- [ ] Can click "Extract Data"
- [ ] Can see extracted information
- [ ] Can save to database

---

## 📱 What to Test

1. **Upload PNG file** - Should work
2. **Upload JPG file** - Should work
3. **Upload PDF file** - Should work
4. **Upload > 16MB** - Should show error
5. **Upload .txt file** - Should show error
6. **Extract data** - Should show mock student data
7. **Edit fields** - Should be editable
8. **Save record** - Should save successfully
9. **Upload same semester again** - Should update existing

---

## 🎉 You're Done!

The marksheet OCR feature is now fully functional.

**What You Can Do:**
- ✅ Upload marksheets (PDF/Images)
- ✅ Extract academic data with AI
- ✅ Review and edit extracted information
- ✅ Save to database
- ✅ View saved records

**Next Steps:**
- 📚 Read full documentation: `docs/marksheet-ocr-setup.md`
- 🔧 Customize extraction logic in `python-backend/app.py`
- 🎨 Customize UI in `app/upload-marksheet/page.tsx`
- 🚀 Deploy to production

---

## 📞 Need Help?

- **Setup issues:** Check `docs/marksheet-ocr-setup.md`
- **API errors:** Check `python-backend/README.md`
- **Collection issues:** Check `docs/academic-records-collection.md`

---

**Setup Time:** ~5 minutes  
**Status:** ✅ Ready to Use  
**Last Updated:** October 27, 2025
