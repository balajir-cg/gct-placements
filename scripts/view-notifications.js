const sdk = require('node-appwrite');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const notificationsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID;
const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

async function viewNotifications() {
  try {
    console.log('📬 Viewing Recent Notifications\n');
    
    // Get a student user
    const students = await databases.listDocuments(
      databaseId,
      usersCollectionId,
      [
        sdk.Query.equal('role', 'student'),
        sdk.Query.limit(1)
      ]
    );
    
    if (students.documents.length === 0) {
      console.log('❌ No students found');
      return;
    }
    
    const student = students.documents[0];
    console.log(`👤 Student: ${student.name || student.email}`);
    console.log(`   Email: ${student.email}\n`);
    
    // Get their notifications
    const notifications = await databases.listDocuments(
      databaseId,
      notificationsCollectionId,
      [
        sdk.Query.equal('userId', student.$id),
        sdk.Query.orderDesc('createdAt'),
        sdk.Query.limit(5)
      ]
    );
    
    console.log(`📋 Recent Notifications (${notifications.documents.length}):\n`);
    
    notifications.documents.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.read ? '✓' : '🔔'} ${notif.title}`);
      console.log(`   ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      if (notif.jobId) {
        console.log(`   Job ID: ${notif.jobId}`);
      }
      console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
      console.log(`   Read: ${notif.read ? 'Yes' : 'No'}`);
      console.log();
    });
    
    // Count unread
    const unread = await databases.listDocuments(
      databaseId,
      notificationsCollectionId,
      [
        sdk.Query.equal('userId', student.$id),
        sdk.Query.equal('read', false)
      ]
    );
    
    console.log(`📊 Summary:`);
    console.log(`   Total notifications: ${notifications.total}`);
    console.log(`   Unread: ${unread.total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewNotifications();
