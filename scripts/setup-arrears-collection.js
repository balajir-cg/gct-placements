/**
 * Setup script for Arrears Collection
 * 
 * This collection tracks individual arrear papers for each student,
 * allowing proper tracking of which arrears are cleared vs still active.
 * 
 * Run: node scripts/setup-arrears-collection.js
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ARREARS_COLLECTION_ID = 'arrears';

async function setupArrearsCollection() {
  try {
    console.log('🚀 Setting up Arrears Collection...\n');

    // Try to delete existing collection if it exists
    try {
      await databases.deleteCollection(DATABASE_ID, ARREARS_COLLECTION_ID);
      console.log('✅ Deleted existing arrears collection\n');
    } catch (error) {
      console.log('ℹ️  No existing collection to delete\n');
    }

    // Create Arrears Collection
    console.log('📦 Creating arrears collection...');
    const collection = await databases.createCollection(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      'Arrears',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    console.log('✅ Arrears collection created\n');

    // Create attributes
    const attributes = [
      // Student identification
      { name: 'userId', type: 'string', size: 255, required: true },
      { name: 'studentName', type: 'string', size: 255, required: false },
      { name: 'registerNumber', type: 'string', size: 100, required: true },
      
      // Course details
      { name: 'courseCode', type: 'string', size: 100, required: true },
      { name: 'courseName', type: 'string', size: 500, required: true },
      { name: 'credits', type: 'string', size: 10, required: false },
      
      // Arrear tracking
      { name: 'failedSemester', type: 'integer', required: true }, // Semester when course was failed
      { name: 'failedAcademicYear', type: 'string', size: 100, required: false },
      { name: 'failedGrade', type: 'string', size: 10, required: false }, // Grade when failed (RA, U, F, etc.)
      
      // Clearance tracking
      { name: 'isCleared', type: 'boolean', required: false, xdefault: false },
      { name: 'clearedSemester', type: 'integer', required: false }, // Semester when arrear was cleared
      { name: 'clearedAcademicYear', type: 'string', size: 100, required: false },
      { name: 'clearedGrade', type: 'string', size: 10, required: false }, // Grade when cleared
      
      // Metadata
      { name: 'createdAt', type: 'datetime', required: true },
      { name: 'updatedAt', type: 'datetime', required: true }
    ];

    console.log('📝 Creating attributes...');
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            ARREARS_COLLECTION_ID,
            attr.name,
            attr.size,
            attr.required,
            attr.default || null
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            ARREARS_COLLECTION_ID,
            attr.name,
            attr.required,
            attr.min || null,
            attr.max || null,
            attr.default || null
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            ARREARS_COLLECTION_ID,
            attr.name,
            attr.required,
            attr.xdefault !== undefined ? attr.xdefault : null
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            ARREARS_COLLECTION_ID,
            attr.name,
            attr.required
          );
        }
        console.log(`  ✅ Created attribute: ${attr.name}`);
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Error creating attribute ${attr.name}:`, error.message);
      }
    }

    console.log('\n📊 Creating indexes...');
    
    // Index for finding arrears by user
    await databases.createIndex(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      'userId_index',
      'key',
      ['userId'],
      ['ASC']
    );
    console.log('  ✅ Created index: userId_index');

    // Index for finding arrears by register number
    await databases.createIndex(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      'registerNumber_index',
      'key',
      ['registerNumber'],
      ['ASC']
    );
    console.log('  ✅ Created index: registerNumber_index');

    // Index for finding active arrears (not cleared)
    await databases.createIndex(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      'isCleared_index',
      'key',
      ['isCleared'],
      ['ASC']
    );
    console.log('  ✅ Created index: isCleared_index');

    // Compound index for user + course tracking
    await databases.createIndex(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      'user_course_index',
      'key',
      ['userId', 'courseCode'],
      ['ASC', 'ASC']
    );
    console.log('  ✅ Created index: user_course_index');

    console.log('\n✅ ✅ ✅ Arrears Collection setup completed successfully! ✅ ✅ ✅');
    console.log('\n📋 Collection Details:');
    console.log(`   Database ID: ${DATABASE_ID}`);
    console.log(`   Collection ID: ${ARREARS_COLLECTION_ID}`);
    console.log(`   Collection Name: Arrears`);
    console.log('\n💡 How it works:');
    console.log('   1. When a student fails a course, create an arrear record with isCleared=false');
    console.log('   2. When they clear it in a later semester, update isCleared=true and set clearedSemester');
    console.log('   3. historyOfArrearsCount = total count of all arrear records');
    console.log('   4. currentArrearsCount = count of arrears where isCleared=false');
    
  } catch (error) {
    console.error('\n❌ Error setting up arrears collection:', error);
    process.exit(1);
  }
}

// Run the setup
setupArrearsCollection()
  .then(() => {
    console.log('\n✅ Setup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup script failed:', error);
    process.exit(1);
  });
