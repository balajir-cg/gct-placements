/**
 * Setup Academic Records Collection for OCR Data
 * 
 * This script creates the academic_records collection with all necessary
 * attributes, indexes, and permissions for storing marksheet OCR data.
 * 
 * Usage: node scripts/setup-academic-records.js
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Initialize Appwrite client
const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'academic_records';

/**
 * Create the academic_records collection
 */
async function createCollection() {
  try {
    console.log('📦 Creating academic_records collection...\n');

    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Academic Records',
      [
        sdk.Permission.read(sdk.Role.users()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()),
      ]
    );

    console.log('✅ Collection created:', collection.$id);
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Collection already exists, continuing...\n');
      return { $id: COLLECTION_ID };
    }
    throw error;
  }
}

/**
 * Create all attributes
 */
async function createAttributes() {
  console.log('\n📝 Creating attributes...\n');

  const attributes = [
    // String attributes
    { 
      type: 'string', 
      key: 'userId', 
      size: 255, 
      required: true,
      array: false
    },
    { 
      type: 'string', 
      key: 'studentName', 
      size: 100, 
      required: true,
      array: false
    },
    { 
      type: 'string', 
      key: 'registerNumber', 
      size: 12, 
      required: true,
      array: false
    },
    { 
      type: 'string', 
      key: 'department', 
      size: 100, 
      required: true,
      array: false
    },
    { 
      type: 'string', 
      key: 'batch', 
      size: 9, 
      required: true,
      array: false
    },
    { 
      type: 'string', 
      key: 'academicYear', 
      size: 9, 
      required: true,
      array: false
    },
    { 
      type: 'string', 
      key: 'subjects', 
      size: 10000, 
      required: false,
      array: false,
      default: '[]'
    },
    { 
      type: 'string', 
      key: 'verifiedBy', 
      size: 255, 
      required: false,
      array: false
    },
    { 
      type: 'string', 
      key: 'documentUrl', 
      size: 500, 
      required: false,
      array: false
    },
    
    // Integer attributes
    { 
      type: 'integer', 
      key: 'semester', 
      required: true,
      min: 1,
      max: 8
    },
    
    // Float attributes
    { 
      type: 'float', 
      key: 'creditsRegistered', 
      required: true,
      min: 0,
      max: 50
    },
    { 
      type: 'float', 
      key: 'creditsEarned', 
      required: true,
      min: 0,
      max: 50
    },
    { 
      type: 'float', 
      key: 'weightedGradePoints', 
      required: true,
      min: 0,
      max: 500
    },
    { 
      type: 'float', 
      key: 'sgpa', 
      required: true,
      min: 0,
      max: 10
    },
    { 
      type: 'float', 
      key: 'cgpa', 
      required: true,
      min: 0,
      max: 10
    },
    { 
      type: 'float', 
      key: 'confidenceScore', 
      required: false,
      min: 0,
      max: 100,
      default: 0
    },
    
    // Boolean attributes
    { 
      type: 'boolean', 
      key: 'isVerified', 
      required: true,
      default: false
    },
    
    // Datetime attributes
    { 
      type: 'datetime', 
      key: 'extractionDate', 
      required: true
    },
    { 
      type: 'datetime', 
      key: 'verifiedAt', 
      required: false
    },
  ];

  for (const attr of attributes) {
    try {
      let result;
      
      switch (attr.type) {
        case 'string':
          result = await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array
          );
          break;
          
        case 'integer':
          result = await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default,
            attr.array
          );
          break;
          
        case 'float':
          result = await databases.createFloatAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default,
            attr.array
          );
          break;
          
        case 'boolean':
          result = await databases.createBooleanAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
          break;
          
        case 'datetime':
          result = await databases.createDatetimeAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
          break;
      }
      
      console.log(`✅ Created attribute: ${attr.key} (${attr.type})`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️  Attribute already exists: ${attr.key}`);
      } else {
        console.error(`❌ Failed to create ${attr.key}:`, error.message);
      }
    }
  }

  // Wait for attributes to be available
  console.log('\n⏳ Waiting for attributes to be available...');
  await new Promise(resolve => setTimeout(resolve, 5000));
}

/**
 * Create indexes for better query performance
 */
async function createIndexes() {
  console.log('\n🔍 Creating indexes...\n');

  const indexes = [
    {
      key: 'idx_userId',
      type: 'key',
      attributes: ['userId'],
      orders: ['ASC']
    },
    {
      key: 'idx_registerNumber',
      type: 'key',
      attributes: ['registerNumber'],
      orders: ['ASC']
    },
    {
      key: 'idx_semester',
      type: 'key',
      attributes: ['semester'],
      orders: ['ASC']
    },
    {
      key: 'idx_academicYear',
      type: 'key',
      attributes: ['academicYear'],
      orders: ['DESC']
    },
    {
      key: 'idx_cgpa',
      type: 'key',
      attributes: ['cgpa'],
      orders: ['DESC']
    },
    {
      key: 'idx_user_semester',
      type: 'key',
      attributes: ['userId', 'semester'],
      orders: ['ASC', 'ASC']
    }
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        index.key,
        index.type,
        index.attributes,
        index.orders
      );
      console.log(`✅ Created index: ${index.key}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️  Index already exists: ${index.key}`);
      } else {
        console.error(`❌ Failed to create index ${index.key}:`, error.message);
      }
    }
  }
}

/**
 * Main setup function
 */
async function setup() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('  Academic Records Collection Setup');
    console.log('═══════════════════════════════════════════════\n');

    // Create collection
    await createCollection();

    // Create attributes
    await createAttributes();

    // Create indexes
    await createIndexes();

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ Academic Records collection setup complete!');
    console.log('═══════════════════════════════════════════════\n');

    console.log('📝 Next steps:');
    console.log('1. Add NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID=academic_records to .env.local');
    console.log('2. Start the Python backend: cd python-backend && python app.py');
    console.log('3. Start Next.js: pnpm dev');
    console.log('4. Navigate to /upload-marksheet to test OCR upload\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setup();
