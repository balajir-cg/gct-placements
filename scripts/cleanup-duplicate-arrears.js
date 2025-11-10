/**
 * Cleanup Duplicate Arrears Script
 * 
 * Finds and removes duplicate arrear records for all users
 * Duplicates are identified by normalized course codes
 * 
 * Run: node scripts/cleanup-duplicate-arrears.js
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
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';

/**
 * Normalize course code for consistent matching
 */
function normalizeCourseCode(courseCode) {
  if (!courseCode) return '';
  return courseCode
    .trim()
    .toUpperCase()
    .replace(/[\s\-_\.]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Clean up duplicates for a single user
 */
async function cleanupUserDuplicates(userId, userEmail) {
  try {
    // Get all arrears for this user
    const response = await databases.listDocuments(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt')
      ]
    );

    if (response.documents.length === 0) {
      return { duplicatesFound: 0, duplicatesRemoved: 0 };
    }

    console.log(`\n👤 User: ${userEmail} (${userId})`);
    console.log(`   Total arrear records: ${response.documents.length}`);

    // Group by normalized course code
    const arrearsMap = new Map();
    
    for (const arrear of response.documents) {
      const normalizedCode = normalizeCourseCode(arrear.courseCode);
      if (!arrearsMap.has(normalizedCode)) {
        arrearsMap.set(normalizedCode, []);
      }
      arrearsMap.get(normalizedCode).push(arrear);
    }

    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    // Find and remove duplicates
    for (const [normalizedCode, records] of arrearsMap.entries()) {
      if (records.length > 1) {
        duplicatesFound += records.length - 1;
        
        console.log(`   📝 Course ${normalizedCode}: ${records.length} duplicate records`);
        
        // Sort by creation date (keep oldest)
        records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const keepRecord = records[0];
        const duplicates = records.slice(1);
        
        console.log(`      ✅ Keeping: ${keepRecord.courseCode} (${keepRecord.$id})`);
        
        // Delete duplicates
        for (const duplicate of duplicates) {
          try {
            await databases.deleteDocument(
              DATABASE_ID,
              ARREARS_COLLECTION_ID,
              duplicate.$id
            );
            console.log(`      ❌ Deleted: ${duplicate.courseCode} (${duplicate.$id})`);
            duplicatesRemoved++;
          } catch (error) {
            console.error(`      ⚠️  Failed to delete ${duplicate.$id}:`, error.message);
          }
        }
      }
    }

    if (duplicatesRemoved > 0) {
      console.log(`   ✅ Removed ${duplicatesRemoved}/${duplicatesFound} duplicates`);
    } else {
      console.log(`   ✨ No duplicates found`);
    }

    return { duplicatesFound, duplicatesRemoved };
    
  } catch (error) {
    console.error(`   ❌ Error processing user ${userId}:`, error.message);
    return { duplicatesFound: 0, duplicatesRemoved: 0 };
  }
}

/**
 * Main cleanup function
 */
async function cleanupAllDuplicates() {
  try {
    console.log('🧹 Starting duplicate arrears cleanup...\n');
    console.log('─'.repeat(70));

    // Get all users
    let allUsers = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allUsers = allUsers.concat(response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    console.log(`Found ${allUsers.length} users to process`);
    console.log('─'.repeat(70));

    let totalDuplicatesFound = 0;
    let totalDuplicatesRemoved = 0;
    let usersWithDuplicates = 0;

    // Process each user
    for (const user of allUsers) {
      const result = await cleanupUserDuplicates(user.$id, user.collegeEmail || user.email);
      
      if (result.duplicatesFound > 0) {
        usersWithDuplicates++;
      }
      
      totalDuplicatesFound += result.duplicatesFound;
      totalDuplicatesRemoved += result.duplicatesRemoved;
    }

    console.log('\n' + '─'.repeat(70));
    console.log('📊 CLEANUP SUMMARY');
    console.log('─'.repeat(70));
    console.log(`Total users processed:      ${allUsers.length}`);
    console.log(`Users with duplicates:      ${usersWithDuplicates}`);
    console.log(`Total duplicates found:     ${totalDuplicatesFound}`);
    console.log(`Total duplicates removed:   ${totalDuplicatesRemoved}`);
    console.log('─'.repeat(70));

    if (totalDuplicatesRemoved > 0) {
      console.log('\n✅ ✅ ✅ Cleanup completed successfully! ✅ ✅ ✅');
    } else {
      console.log('\n✨ No duplicates found. Database is clean!');
    }
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupAllDuplicates()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
