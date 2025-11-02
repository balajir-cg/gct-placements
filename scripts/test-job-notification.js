const sdk = require('node-appwrite');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const jobsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID;

// Validate environment variables
if (!databaseId || !jobsCollectionId) {
  console.error('❌ Missing environment variables!');
  console.error('   DATABASE_ID:', databaseId || 'MISSING');
  console.error('   JOBS_COLLECTION_ID:', jobsCollectionId || 'MISSING');
  process.exit(1);
}

async function getLatestJob() {
  try {
    console.log('🔍 Fetching latest job...\n');
    
    const jobs = await databases.listDocuments(
      databaseId,
      jobsCollectionId,
      [
        sdk.Query.orderDesc('$createdAt'),
        sdk.Query.limit(1)
      ]
    );
    
    if (jobs.documents.length === 0) {
      console.log('❌ No jobs found in database');
      return;
    }
    
    const job = jobs.documents[0];
    console.log('✅ Latest Job:');
    console.log(`   Title: ${job.title}`);
    console.log(`   Company: ${job.company}`);
    console.log(`   Job ID: ${job.$id}`);
    console.log(`   Created: ${new Date(job.$createdAt).toLocaleString()}`);
    
    // Test sending notification for this job
    console.log('\n📨 Testing notification send...');
    
    const response = await fetch('http://localhost:3000/api/notifications/send-job-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: job.$id,
        jobTitle: job.title,
        companyName: job.company,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Notifications sent successfully!');
      console.log(`   Total students: ${result.stats.total}`);
      console.log(`   Successful: ${result.stats.success}`);
      console.log(`   Failed: ${result.stats.errors}`);
    } else {
      console.log('❌ Failed to send notifications:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getLatestJob();
