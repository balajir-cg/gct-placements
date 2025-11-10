/**
 * View Arrears Script
 * 
 * View all arrear records for a specific user
 * 
 * Usage: node scripts/view-arrears.js <userId>
 */

const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ARREARS_COLLECTION_ID = 'arrears';

async function viewUserArrears(userId) {
  try {
    console.log(`\n🔍 Fetching arrears for user: ${userId}\n`);

    const response = await databases.listDocuments(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('failedSemester')
      ]
    );

    if (response.documents.length === 0) {
      console.log('✅ No arrear records found for this user.');
      console.log('   This means the student has never failed any course (yet).');
      return;
    }

    const activeArrears = response.documents.filter(doc => !doc.isCleared);
    const clearedArrears = response.documents.filter(doc => doc.isCleared);

    console.log('📊 ARREAR SUMMARY');
    console.log('─'.repeat(70));
    console.log(`Total Arrears (History):  ${response.documents.length}`);
    console.log(`Active Arrears (Current): ${activeArrears.length}`);
    console.log(`Cleared Arrears:          ${clearedArrears.length}`);
    console.log('─'.repeat(70));

    if (activeArrears.length > 0) {
      console.log('\n🔴 ACTIVE ARREARS (Not Cleared Yet)');
      console.log('─'.repeat(70));
      activeArrears.forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.courseName} (${doc.courseCode})`);
        console.log(`   Failed in: Semester ${doc.failedSemester} (${doc.failedAcademicYear || 'N/A'})`);
        console.log(`   Grade: ${doc.failedGrade || 'N/A'}`);
        console.log(`   Credits: ${doc.credits || 'N/A'}`);
        console.log(`   Status: 🔴 PENDING`);
      });
    }

    if (clearedArrears.length > 0) {
      console.log('\n\n✅ CLEARED ARREARS');
      console.log('─'.repeat(70));
      clearedArrears.forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.courseName} (${doc.courseCode})`);
        console.log(`   Failed in: Semester ${doc.failedSemester} (${doc.failedAcademicYear || 'N/A'})`);
        console.log(`   Failed Grade: ${doc.failedGrade || 'N/A'}`);
        console.log(`   Cleared in: Semester ${doc.clearedSemester} (${doc.clearedAcademicYear || 'N/A'})`);
        console.log(`   Cleared Grade: ${doc.clearedGrade || 'N/A'}`);
        console.log(`   Status: ✅ CLEARED`);
      });
    }

    console.log('\n' + '─'.repeat(70));
    console.log('\n💡 Profile Values:');
    console.log(`   historyOfArrearsCount: ${response.documents.length}`);
    console.log(`   currentArrearsCount: ${activeArrears.length}`);
    console.log(`   historyOfArrear: ${response.documents.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   activeBacklog: ${activeArrears.length > 0 ? 'Yes' : 'No'}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error fetching arrears:', error.message);
    if (error.code === 404) {
      console.log('\n💡 Tip: Make sure you have run the setup script:');
      console.log('   node scripts/setup-arrears-collection.js');
    }
  }
}

// Get userId from command line
const userId = process.argv[2];

if (!userId) {
  console.log('❌ Usage: node scripts/view-arrears.js <userId>');
  console.log('\nExample: node scripts/view-arrears.js 688f6dd3002c50df09df');
  console.log('\n💡 Tip: You can find userId from the users collection in Appwrite console');
  process.exit(1);
}

viewUserArrears(userId)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
