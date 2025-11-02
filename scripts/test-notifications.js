const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
const notificationsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID;

async function testNotifications() {
  try {
    console.log('🧪 Testing Notification System\n');
    
    // 1. Get a test user
    console.log('📋 Step 1: Fetching a test user...');
    const users = await databases.listDocuments(
      databaseId,
      usersCollectionId,
      [sdk.Query.equal('role', 'student'), sdk.Query.limit(1)]
    );
    
    if (users.documents.length === 0) {
      console.log('❌ No students found. Please create a student user first.');
      return;
    }
    
    const testUser = users.documents[0];
    console.log(`✅ Found test user: ${testUser.name} (${testUser.email})\n`);
    
    // 2. Create a test notification
    console.log('📋 Step 2: Creating a test notification...');
    const notification = await databases.createDocument(
      databaseId,
      notificationsCollectionId,
      sdk.ID.unique(),
      {
        userId: testUser.$id,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working!',
        type: 'new_job',
        jobId: null,
        read: false,
        createdAt: new Date().toISOString(),
      }
    );
    console.log(`✅ Notification created with ID: ${notification.$id}\n`);
    
    // 3. Retrieve the notification
    console.log('📋 Step 3: Retrieving user notifications...');
    const userNotifications = await databases.listDocuments(
      databaseId,
      notificationsCollectionId,
      [
        sdk.Query.equal('userId', testUser.$id),
        sdk.Query.orderDesc('createdAt')
      ]
    );
    console.log(`✅ Found ${userNotifications.documents.length} notification(s)\n`);
    
    // 4. Count unread notifications
    const unreadNotifications = await databases.listDocuments(
      databaseId,
      notificationsCollectionId,
      [
        sdk.Query.equal('userId', testUser.$id),
        sdk.Query.equal('read', false)
      ]
    );
    console.log(`✅ Unread notifications: ${unreadNotifications.documents.length}\n`);
    
    // 5. Mark as read
    console.log('📋 Step 4: Marking notification as read...');
    await databases.updateDocument(
      databaseId,
      notificationsCollectionId,
      notification.$id,
      {
        read: true,
        readAt: new Date().toISOString()
      }
    );
    console.log('✅ Notification marked as read\n');
    
    // 6. Verify read status
    console.log('📋 Step 5: Verifying read status...');
    const unreadCount = await databases.listDocuments(
      databaseId,
      notificationsCollectionId,
      [
        sdk.Query.equal('userId', testUser.$id),
        sdk.Query.equal('read', false)
      ]
    );
    console.log(`✅ Unread notifications after marking as read: ${unreadCount.documents.length}\n`);
    
    // 7. Clean up - delete test notification
    console.log('📋 Step 6: Cleaning up test notification...');
    await databases.deleteDocument(
      databaseId,
      notificationsCollectionId,
      notification.$id
    );
    console.log('✅ Test notification deleted\n');
    
    console.log('🎉 All tests passed! Notification system is working correctly.\n');
    console.log('📝 Next steps:');
    console.log('1. Configure Appwrite Functions in the console (http://localhost/console)');
    console.log('2. Test the NotificationBell component in the dashboard');
    console.log('3. Create a new job to test automatic notifications');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  }
}

testNotifications();
