/**
 * OCR Service for Academic Records
 * Handles communication with Python DeepSeek-OCR backend and Appwrite storage
 */

import { databases, storage } from './appwrite';
import { ID, Query } from 'appwrite';

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:5000';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID || 'academic_records';
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

// ==================== Types ====================

export interface SubjectGrade {
  subjectCode: string;
  subjectName: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

export interface AcademicRecord {
  $id?: string;
  userId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  batch: string;
  semester: number;
  academicYear: string;
  creditsRegistered: number;
  creditsEarned: number;
  weightedGradePoints: number;
  sgpa: number;
  cgpa: number;
  subjects: SubjectGrade[];
  extractionDate: string;
  confidenceScore: number;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  documentUrl?: string;
}

export interface OCRExtractionResult {
  success: boolean;
  message: string;
  data?: AcademicRecord;
  errors: string[];
}

export interface BatchExtractionResult {
  success: boolean;
  message: string;
  results: Array<{
    file: string;
    success: boolean;
    data?: AcademicRecord;
  }>;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

// ==================== OCR Service Class ====================

export class OCRService {
  /**
   * Check if Python backend is healthy
   */
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Extract academic data from a single marksheet file
   */
  static async extractMarksheet(file: File): Promise<OCRExtractionResult> {
    try {
      console.log('📤 Uploading file to Python backend...');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${PYTHON_BACKEND_URL}/api/ocr/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extract marksheet');
      }

      const result: OCRExtractionResult = await response.json();

      console.log('✅ Extraction completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Extract academic data from multiple marksheet files
   */
  static async batchExtractMarksheets(files: File[]): Promise<BatchExtractionResult> {
    try {
      console.log(`📤 Uploading ${files.length} files to Python backend...`);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${PYTHON_BACKEND_URL}/api/ocr/batch-extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Batch extraction failed');
      }

      const result: BatchExtractionResult = await response.json();

      console.log('✅ Batch extraction completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Batch extraction failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        errors: [{ file: 'batch', error: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  }

  /**
   * Upload marksheet file to Appwrite storage
   */
  static async uploadMarksheetFile(file: File): Promise<string> {
    try {
      console.log('📤 Uploading file to Appwrite storage...');

      const uploadedFile = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      console.log('✅ File uploaded:', uploadedFile.$id);
      return uploadedFile.$id;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Save extracted academic record to Appwrite database
   */
  static async saveAcademicRecord(
    userId: string,
    record: Omit<AcademicRecord, '$id' | 'userId'>,
    fileId?: string
  ): Promise<AcademicRecord> {
    try {
      console.log('💾 Saving academic record to database...');

      // Check if record already exists for this semester
      const existing = await this.getAcademicRecord(userId, record.semester);
      
      if (existing) {
        console.log('⚠️ Record exists, updating...');
        return await this.updateAcademicRecord(existing.$id!, record);
      }

      // Prepare data for Appwrite
      const data = {
        userId,
        studentName: record.studentName,
        registerNumber: record.registerNumber,
        department: record.department,
        batch: record.batch,
        semester: record.semester,
        academicYear: record.academicYear,
        creditsRegistered: record.creditsRegistered,
        creditsEarned: record.creditsEarned,
        weightedGradePoints: record.weightedGradePoints,
        sgpa: record.sgpa,
        cgpa: record.cgpa,
        subjects: JSON.stringify(record.subjects),
        extractionDate: record.extractionDate || new Date().toISOString(),
        confidenceScore: record.confidenceScore,
        isVerified: false,
        documentUrl: fileId || undefined,
      };

      const createdRecord = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        data
      );

      console.log('✅ Academic record saved:', createdRecord.$id);

      return this.parseAcademicRecord(createdRecord);
    } catch (error) {
      console.error('❌ Failed to save academic record:', error);
      throw new Error('Failed to save academic record');
    }
  }

  /**
   * Update existing academic record
   */
  static async updateAcademicRecord(
    recordId: string,
    updates: Partial<Omit<AcademicRecord, '$id' | 'userId'>>
  ): Promise<AcademicRecord> {
    try {
      console.log('📝 Updating academic record...');

      const data: any = {};

      if (updates.studentName) data.studentName = updates.studentName;
      if (updates.registerNumber) data.registerNumber = updates.registerNumber;
      if (updates.department) data.department = updates.department;
      if (updates.batch) data.batch = updates.batch;
      if (updates.semester) data.semester = updates.semester;
      if (updates.academicYear) data.academicYear = updates.academicYear;
      if (updates.creditsRegistered !== undefined) data.creditsRegistered = updates.creditsRegistered;
      if (updates.creditsEarned !== undefined) data.creditsEarned = updates.creditsEarned;
      if (updates.weightedGradePoints !== undefined) data.weightedGradePoints = updates.weightedGradePoints;
      if (updates.sgpa !== undefined) data.sgpa = updates.sgpa;
      if (updates.cgpa !== undefined) data.cgpa = updates.cgpa;
      if (updates.subjects) data.subjects = JSON.stringify(updates.subjects);
      if (updates.confidenceScore !== undefined) data.confidenceScore = updates.confidenceScore;
      if (updates.documentUrl) data.documentUrl = updates.documentUrl;

      const updatedRecord = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        recordId,
        data
      );

      console.log('✅ Academic record updated');

      return this.parseAcademicRecord(updatedRecord);
    } catch (error) {
      console.error('❌ Failed to update academic record:', error);
      throw new Error('Failed to update academic record');
    }
  }

  /**
   * Get academic record for a specific semester
   */
  static async getAcademicRecord(userId: string, semester: number): Promise<AcademicRecord | null> {
    try {
      const records = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('semester', semester),
        ]
      );

      if (records.documents.length === 0) {
        return null;
      }

      return this.parseAcademicRecord(records.documents[0]);
    } catch (error) {
      console.error('❌ Failed to get academic record:', error);
      return null;
    }
  }

  /**
   * Get all academic records for a user
   */
  static async getAllAcademicRecords(userId: string): Promise<AcademicRecord[]> {
    try {
      const records = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderAsc('semester'),
        ]
      );

      return records.documents.map(doc => this.parseAcademicRecord(doc));
    } catch (error) {
      console.error('❌ Failed to get academic records:', error);
      return [];
    }
  }

  /**
   * Delete academic record
   */
  static async deleteAcademicRecord(recordId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, recordId);
      console.log('✅ Academic record deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete academic record:', error);
      return false;
    }
  }

  /**
   * Verify academic record (admin only)
   */
  static async verifyAcademicRecord(recordId: string, adminId: string): Promise<boolean> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        recordId,
        {
          isVerified: true,
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
        }
      );

      console.log('✅ Academic record verified');
      return true;
    } catch (error) {
      console.error('❌ Failed to verify academic record:', error);
      return false;
    }
  }

  /**
   * Parse Appwrite document to AcademicRecord
   */
  private static parseAcademicRecord(doc: any): AcademicRecord {
    return {
      $id: doc.$id,
      userId: doc.userId,
      studentName: doc.studentName,
      registerNumber: doc.registerNumber,
      department: doc.department,
      batch: doc.batch,
      semester: doc.semester,
      academicYear: doc.academicYear,
      creditsRegistered: doc.creditsRegistered,
      creditsEarned: doc.creditsEarned,
      weightedGradePoints: doc.weightedGradePoints,
      sgpa: doc.sgpa,
      cgpa: doc.cgpa,
      subjects: doc.subjects ? JSON.parse(doc.subjects) : [],
      extractionDate: doc.extractionDate,
      confidenceScore: doc.confidenceScore,
      isVerified: doc.isVerified,
      verifiedBy: doc.verifiedBy,
      verifiedAt: doc.verifiedAt,
      documentUrl: doc.documentUrl,
    };
  }
}
