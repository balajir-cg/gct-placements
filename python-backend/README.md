# 🐍 DeepSeek-OCR Backend Server

Python Flask backend for extracting academic data from marksheets using DeepSeek-OCR.

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip or conda
- Virtual environment (recommended)

### Installation

```bash
# Navigate to python-backend directory
cd python-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Running the Server

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the server
python app.py

# Server will start on http://localhost:5000
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/health

Response:
{
  "status": "healthy",
  "service": "DeepSeek-OCR Backend",
  "version": "1.0.0",
  "model_loaded": true
}
```

### Single File Extraction
```bash
POST /api/ocr/extract

Headers:
Content-Type: multipart/form-data

Body:
file: <image/pdf file>

Response:
{
  "success": true,
  "message": "Marksheet extracted successfully",
  "data": {
    "student_name": "RAJESH KUMAR M",
    "register_number": "211519104001",
    "department": "COMPUTER SCIENCE AND ENGINEERING",
    "batch": "2021-2025",
    "semester": 3,
    "credits_registered": 20.0,
    "credits_earned": 20.0,
    "weighted_grade_points": 186.0,
    "sgpa": 9.30,
    "cgpa": 9.15,
    "subjects": [...],
    "academic_year": "2022-2023",
    "extraction_date": "2025-10-27T10:30:00",
    "confidence_score": 95.0
  },
  "errors": []
}
```

### Batch File Extraction
```bash
POST /api/ocr/batch-extract

Headers:
Content-Type: multipart/form-data

Body:
files: <multiple image/pdf files>

Response:
{
  "success": true,
  "message": "Processed 5/5 files successfully",
  "results": [
    {
      "file": "semester3.jpg",
      "success": true,
      "data": {...}
    },
    ...
  ],
  "errors": []
}
```

## 🧪 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:5000/api/health

# Single file extraction
curl -X POST http://localhost:5000/api/ocr/extract \
  -F "file=@/path/to/marksheet.jpg"

# Batch extraction
curl -X POST http://localhost:5000/api/ocr/batch-extract \
  -F "files=@/path/to/marksheet1.jpg" \
  -F "files=@/path/to/marksheet2.jpg"
```

### Using Python requests

```python
import requests

# Single file
with open('marksheet.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/ocr/extract',
        files={'file': f}
    )
    print(response.json())
```

## 📦 Project Structure

```
python-backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── .env                  # Local config (create this)
├── README.md             # This file
├── uploads/              # Temporary file storage
└── models/               # DeepSeek-OCR model files
```

## 🔧 Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_PORT` | 5000 | Server port |
| `FLASK_HOST` | 0.0.0.0 | Server host |
| `FLASK_DEBUG` | True | Debug mode |
| `UPLOAD_FOLDER` | ./uploads | Upload directory |
| `MAX_FILE_SIZE` | 16777216 | Max file size (16MB) |
| `ALLOWED_EXTENSIONS` | pdf,png,jpg,jpeg | Allowed file types |
| `MODEL_PATH` | ./models/deepseek-ocr | Model path |

## 🐛 Troubleshooting

### Port already in use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
export FLASK_PORT=5001
python app.py
```

### Module not found
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS errors
- Make sure Next.js frontend is running on `http://localhost:3000`
- Check CORS configuration in `app.py`

## 📚 Data Models

### AcademicRecord
```python
{
  "student_name": str,              # Student full name
  "register_number": str,           # 12-digit register number
  "department": str,                # Department name
  "batch": str,                     # Format: 2021-2025
  "semester": int,                  # 1-8
  "credits_registered": float,      # Total credits
  "credits_earned": float,          # Credits earned
  "weighted_grade_points": float,   # Total grade points
  "sgpa": float,                    # Semester GPA (0-10)
  "cgpa": float,                    # Cumulative GPA (0-10)
  "subjects": [                     # List of subjects
    {
      "subject_code": str,          # e.g., CS301
      "subject_name": str,          # Subject name
      "credits": float,             # Subject credits
      "grade": str,                 # S/A/B/C/D/E/F
      "grade_points": float         # Grade points
    }
  ],
  "academic_year": str,             # e.g., 2022-2023
  "extraction_date": str,           # ISO timestamp
  "confidence_score": float         # 0-100
}
```

## 🔒 Security Notes

- File size validation (16MB max)
- File type validation (images, PDFs only)
- Input sanitization
- Error handling
- CORS restrictions

## 📈 Performance

- Single file: ~2-3 seconds
- Batch processing: ~2-3 seconds per file
- Concurrent requests: Supported
- Max file size: 16MB

## 🚀 Production Deployment

### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

```bash
# Build image
docker build -t gct-ocr-backend .

# Run container
docker run -p 5000:5000 gct-ocr-backend
```

## 📝 License

Part of GCT Placement Portal project.
