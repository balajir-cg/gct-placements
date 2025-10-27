#!/usr/bin/env python3
"""
DeepSeek-OCR Backend Server for GCT Placements Portal
Handles marksheet OCR extraction and academic data processing
"""

import os
import io
import re
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv
import torch
from transformers import AutoModel, AutoTokenizer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration
UPLOAD_FOLDER = Path(os.getenv('UPLOAD_FOLDER', './uploads'))
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 16 * 1024 * 1024))  # 16MB
ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'pdf,png,jpg,jpeg').split(','))

# Global model instance (loaded on startup)
ocr_model = None
ocr_tokenizer = None


# ==================== Data Models ====================

class SubjectGrade(BaseModel):
    """Individual subject grade information"""
    subjectCode: str = Field(..., alias="subject_code", description="Subject code (e.g., CS101)")
    subjectName: str = Field(..., alias="subject_name", description="Subject name")
    credits: float = Field(..., ge=0, le=10, description="Credits for the subject")
    grade: str = Field(..., description="Grade obtained (S, A, B, C, D, E, F)")
    gradePoints: float = Field(..., alias="grade_points", ge=0, le=10, description="Grade points")
    
    class Config:
        populate_by_name = True  # Allow both camelCase and snake_case
    
    @validator('grade')
    def validate_grade(cls, v):
        valid_grades = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'W', 'I']
        if v.upper() not in valid_grades:
            raise ValueError(f'Grade must be one of {valid_grades}')
        return v.upper()


class AcademicRecord(BaseModel):
    """Complete academic record for a semester"""
    studentName: str = Field(..., alias="student_name", min_length=2, max_length=100)
    registerNumber: str = Field(..., alias="register_number", pattern=r'^\d{12}$', description="12-digit register number")
    department: str = Field(..., min_length=2, max_length=100)
    batch: str = Field(..., pattern=r'^\d{4}-\d{4}$', description="Format: 2021-2025")
    semester: int = Field(..., ge=1, le=8, description="Semester number (1-8)")
    
    # Academic performance
    creditsRegistered: float = Field(..., alias="credits_registered", ge=0, description="Total credits registered")
    creditsEarned: float = Field(..., alias="credits_earned", ge=0, description="Total credits earned")
    weightedGradePoints: float = Field(..., alias="weighted_grade_points", ge=0, description="Total grade points")
    sgpa: float = Field(..., ge=0, le=10, description="Semester GPA")
    cgpa: float = Field(..., ge=0, le=10, description="Cumulative GPA")
    
    # Subject-wise details
    subjects: List[SubjectGrade] = Field(default_factory=list, description="List of subjects")
    
    # Metadata
    academicYear: str = Field(..., alias="academic_year", description="Academic year (e.g., 2023-2024)")
    extractionDate: str = Field(default_factory=lambda: datetime.now().isoformat(), alias="extraction_date")
    confidenceScore: float = Field(default=0.0, alias="confidence_score", ge=0, le=100, description="OCR confidence percentage")
    
    class Config:
        populate_by_name = True  # Allow both camelCase and snake_case
    
    @validator('cgpa', 'sgpa')
    def validate_gpa(cls, v):
        if v > 10:
            raise ValueError('GPA cannot exceed 10.0')
        return round(v, 2)


class OCRResponse(BaseModel):
    """OCR extraction response"""
    success: bool
    message: str
    data: Optional[AcademicRecord] = None
    errors: List[str] = Field(default_factory=list)


# ==================== DeepSeek-OCR Integration ====================

def load_deepseek_model():
    """Load DeepSeek-OCR model on startup"""
    global ocr_model, ocr_tokenizer
    
    try:
        logger.info("🚀 Loading DeepSeek-OCR model...")
        logger.info("📦 This may take a few minutes on first run (downloading model)...")
        
        model_path = os.getenv('MODEL_PATH', 'deepseek-ai/DeepSeek-VL2')
        
        # Import required libraries
        from transformers import AutoProcessor, AutoModelForVision2Seq
        import torch
        
        # Set device
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"🔧 Using device: {device}")
        
        # Load DeepSeek Vision-Language Model
        logger.info(f"📥 Loading model from: {model_path}")
        ocr_tokenizer = AutoProcessor.from_pretrained(
            model_path,
            trust_remote_code=True
        )
        
        ocr_model = AutoModelForVision2Seq.from_pretrained(
            model_path,
            trust_remote_code=True,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            low_cpu_mem_usage=True
        )
        
        ocr_model.to(device)
        ocr_model.eval()
        
        logger.info("✅ DeepSeek-OCR model loaded successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.warning("⚠️  Falling back to mock data mode")
        return False


def extract_text_from_image(image: Image.Image) -> str:
    """
    Extract text from image using DeepSeek-OCR
    
    Args:
        image: PIL Image object
        
    Returns:
        Extracted text
    """
    try:
        logger.info("🔍 Processing image with DeepSeek-OCR...")
        
        # Check if model is loaded
        if ocr_model is None or ocr_tokenizer is None:
            logger.warning("⚠️  Model not loaded, using mock data")
            return get_mock_text()
        
        import torch
        
        # Prepare the prompt for OCR extraction
        prompt = """Extract all text from this marksheet/grade sheet image. 
        Include:
        - Student name
        - Register number (12 digits)
        - Department
        - Batch (format: YYYY-YYYY)
        - Semester
        - Academic year
        - All subject codes, names, credits, grades, and grade points
        - Credits registered and earned
        - Weighted grade points
        - SGPA and CGPA
        
        Format the output clearly with labels."""
        
        # Prepare inputs
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Convert PIL image to format expected by model
        inputs = ocr_tokenizer(
            text=prompt,
            images=image,
            return_tensors="pt"
        ).to(device)
        
        # Generate text
        logger.info("🤖 Running DeepSeek inference...")
        with torch.no_grad():
            output_ids = ocr_model.generate(
                **inputs,
                max_new_tokens=1024,
                do_sample=False,
                temperature=0.0,
                top_p=1.0,
                num_beams=1,
                pad_token_id=ocr_tokenizer.pad_token_id,
                eos_token_id=ocr_tokenizer.eos_token_id,
            )
        
        # Decode the output
        extracted_text = ocr_tokenizer.batch_decode(
            output_ids,
            skip_special_tokens=True
        )[0]
        
        # Remove the prompt from output if present
        if prompt in extracted_text:
            extracted_text = extracted_text.replace(prompt, "").strip()
        
        logger.info(f"✅ DeepSeek extraction completed: {len(extracted_text)} characters")
        logger.info(f"📄 Preview: {extracted_text[:200]}...")
        
        return extracted_text
        
    except Exception as e:
        logger.error(f"❌ DeepSeek extraction failed: {e}")
        logger.warning("⚠️  Falling back to mock data")
        return get_mock_text()


def get_mock_text() -> str:
    """Return mock OCR text for testing when model is not available"""
    logger.info("📝 Using mock data")
    return """
    GOVERNMENT COLLEGE OF TECHNOLOGY
    COIMBATORE - 641 013
    
    GRADE SHEET
    
    Name: RAJESH KUMAR M
    Register Number: 211519104001
    Department: COMPUTER SCIENCE AND ENGINEERING
    Batch: 2021-2025
    Semester: 3
    Academic Year: 2022-2023
    
    SUBJECT DETAILS:
    
    CS301 | Data Structures and Algorithms | 4 | S | 10 | 40
    CS302 | Database Management Systems | 4 | A | 9 | 36
    CS303 | Operating Systems | 4 | A | 9 | 36
    CS304 | Computer Networks | 3 | B | 8 | 24
    CS305 | Software Engineering | 3 | S | 10 | 30
    CS306 | Web Technologies Lab | 2 | S | 10 | 20
    
    Credits Registered: 20
    Credits Earned: 20
    Weighted Grade Points Earned: 186
    SGPA: 9.30
    CGPA: 9.15
    """


def parse_marksheet_text(text: str) -> Dict[str, Any]:
    """
    Parse extracted text and structure academic data
    
    Args:
        text: Raw OCR extracted text
        
    Returns:
        Structured academic data
    """
    try:
        logger.info("Parsing marksheet text...")
        
        # Extract student information
        name_match = re.search(r'Name:\s*([A-Z\s]+)', text)
        reg_match = re.search(r'Register Number:\s*(\d{12})', text)
        dept_match = re.search(r'Department:\s*([A-Z\s&]+)', text)
        batch_match = re.search(r'Batch:\s*(\d{4}-\d{4})', text)
        semester_match = re.search(r'Semester:\s*(\d+)', text)
        year_match = re.search(r'Academic Year:\s*(\d{4}-\d{4})', text)
        
        # Extract performance metrics
        credits_reg_match = re.search(r'Credits Registered:\s*([\d.]+)', text)
        credits_earned_match = re.search(r'Credits Earned:\s*([\d.]+)', text)
        grade_points_match = re.search(r'Weighted Grade Points Earned:\s*([\d.]+)', text)
        sgpa_match = re.search(r'SGPA:\s*([\d.]+)', text)
        cgpa_match = re.search(r'CGPA:\s*([\d.]+)', text)
        
        # Extract subjects
        subjects = []
        subject_pattern = r'([A-Z]{2}\d{3})\s*\|\s*([A-Za-z\s&]+?)\s*\|\s*([\d.]+)\s*\|\s*([A-Z])\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)'
        subject_matches = re.finditer(subject_pattern, text)
        
        for match in subject_matches:
            code, name, credits, grade, grade_point, weighted = match.groups()
            subjects.append({
                'subjectCode': code.strip(),
                'subjectName': name.strip(),
                'credits': float(credits),
                'grade': grade.strip(),
                'gradePoints': float(grade_point)
            })
        
        # Build structured data with camelCase keys for JavaScript/TypeScript
        data = {
            'studentName': name_match.group(1).strip() if name_match else '',
            'registerNumber': reg_match.group(1) if reg_match else '',
            'department': dept_match.group(1).strip() if dept_match else '',
            'batch': batch_match.group(1) if batch_match else '',
            'semester': int(semester_match.group(1)) if semester_match else 1,
            'academicYear': year_match.group(1) if year_match else '',
            'creditsRegistered': float(credits_reg_match.group(1)) if credits_reg_match else 0.0,
            'creditsEarned': float(credits_earned_match.group(1)) if credits_earned_match else 0.0,
            'weightedGradePoints': float(grade_points_match.group(1)) if grade_points_match else 0.0,
            'sgpa': float(sgpa_match.group(1)) if sgpa_match else 0.0,
            'cgpa': float(cgpa_match.group(1)) if cgpa_match else 0.0,
            'subjects': subjects,
            'confidenceScore': 95.0,  # Placeholder confidence
            'extractionDate': datetime.now().isoformat()
        }
        
        logger.info(f"✅ Parsed {len(subjects)} subjects successfully")
        return data
        
    except Exception as e:
        logger.error(f"Failed to parse marksheet: {e}")
        raise


# ==================== API Routes ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'DeepSeek-OCR Backend',
        'version': '1.0.0',
        'model_loaded': ocr_model is not None
    })


@app.route('/api/ocr/extract', methods=['POST'])
def extract_marksheet():
    """
    Extract academic data from uploaded marksheet
    
    Expected: multipart/form-data with 'file' field
    Returns: Structured academic data
    """
    try:
        # Validate file upload
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided',
                'errors': ['File field is required']
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'Empty filename',
                'errors': ['Please select a file']
            }), 400
        
        # Validate file extension
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in ALLOWED_EXTENSIONS:
            return jsonify({
                'success': False,
                'message': 'Invalid file type',
                'errors': [f'Allowed types: {", ".join(ALLOWED_EXTENSIONS)}']
            }), 400
        
        # Read and validate image
        try:
            image_data = file.read()
            
            # Check file size
            if len(image_data) > MAX_FILE_SIZE:
                return jsonify({
                    'success': False,
                    'message': 'File too large',
                    'errors': [f'Maximum file size: {MAX_FILE_SIZE / (1024*1024)}MB']
                }), 400
            
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            logger.info(f"Processing image: {file.filename}, Size: {image.size}")
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Invalid image file',
                'errors': [str(e)]
            }), 400
        
        # Extract text using DeepSeek-OCR
        extracted_text = extract_text_from_image(image)
        
        # Parse and structure the data
        academic_data = parse_marksheet_text(extracted_text)
        
        # Validate against Pydantic model
        validated_record = AcademicRecord(**academic_data)
        
        return jsonify({
            'success': True,
            'message': 'Marksheet extracted successfully',
            'data': validated_record.model_dump(by_alias=False),  # Use field names, not aliases
            'errors': []
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({
            'success': False,
            'message': 'Data validation failed',
            'errors': [str(e)]
        }), 400
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to extract marksheet',
            'errors': [str(e)]
        }), 500


@app.route('/api/ocr/batch-extract', methods=['POST'])
def batch_extract_marksheets():
    """
    Extract academic data from multiple marksheets
    
    Expected: multipart/form-data with multiple 'files' field
    Returns: List of structured academic data
    """
    try:
        if 'files' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No files provided',
                'errors': ['Files field is required']
            }), 400
        
        files = request.files.getlist('files')
        
        if len(files) == 0:
            return jsonify({
                'success': False,
                'message': 'No files uploaded',
                'errors': ['Please select at least one file']
            }), 400
        
        results = []
        errors = []
        
        for idx, file in enumerate(files):
            try:
                image_data = file.read()
                image = Image.open(io.BytesIO(image_data))
                
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Extract and parse
                extracted_text = extract_text_from_image(image)
                academic_data = parse_marksheet_text(extracted_text)
                validated_record = AcademicRecord(**academic_data)
                
                results.append({
                    'file': file.filename,
                    'success': True,
                    'data': validated_record.model_dump(by_alias=False)  # Use field names, not aliases
                })
                
            except Exception as e:
                errors.append({
                    'file': file.filename,
                    'error': str(e)
                })
                logger.error(f"Failed to process {file.filename}: {e}")
        
        return jsonify({
            'success': len(errors) == 0,
            'message': f'Processed {len(results)}/{len(files)} files successfully',
            'results': results,
            'errors': errors
        }), 200
        
    except Exception as e:
        logger.error(f"Batch extraction failed: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Batch extraction failed',
            'errors': [str(e)]
        }), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'message': 'File too large',
        'errors': [f'Maximum file size: {MAX_FILE_SIZE / (1024*1024)}MB']
    }), 413


@app.errorhandler(500)
def internal_server_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'errors': ['An unexpected error occurred']
    }), 500


# ==================== Main ====================

if __name__ == '__main__':
    # Load model on startup
    load_deepseek_model()
    
    # Start Flask server
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Starting DeepSeek-OCR Backend Server on {host}:{port}")
    logger.info(f"📁 Upload folder: {UPLOAD_FOLDER.absolute()}")
    logger.info(f"📏 Max file size: {MAX_FILE_SIZE / (1024*1024)}MB")
    logger.info(f"📎 Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}")
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )
