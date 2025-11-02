const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

async function setupNotificationsCollection() {
  try {
    console.log('🔔 Setting up notifications collection...');
    
    // Create collection
    const collection = await databases.createCollection(
      databaseId,
      'notifications',
      'Notifications',
      [
        sdk.Permission.read(sdk.Role.users()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users())
      ]
    );
    
    console.log('✅ Collection created:', collection.$id);
    
    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create attributes
    console.log('Creating attributes...');
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'userId',
      255,
      true
    );
    console.log('✅ userId attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'title',
      500,
      true
    );
    console.log('✅ title attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'message',
      5000,
      true
    );
    console.log('✅ message attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'type',
      100,
      true
    );
    console.log('✅ type attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'jobId',
      255,
      false
    );
    console.log('✅ jobId attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createBooleanAttribute(
      databaseId,
      collection.$id,
      'read',
      false,  // not required so we can set default
      false   // default value
    );
    console.log('✅ read attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'createdAt',
      100,
      true
    );
    console.log('✅ createdAt attribute created');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await databases.createStringAttribute(
      databaseId,
      collection.$id,
      'readAt',
      100,
      false
    );
    console.log('✅ readAt attribute created');
    
    // Wait for attributes to be available
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create indexes
    console.log('Creating indexes...');
    
    await databases.createIndex(
      databaseId,
      collection.$id,
      'userId_index',
      'key',
      ['userId'],
      ['asc']
    );
    console.log('✅ userId index created');
    
    await databases.createIndex(
      databaseId,
      collection.$id,
      'type_index',
      'key',
      ['type'],
      ['asc']
    );
    console.log('✅ type index created');
    
    await databases.createIndex(
      databaseId,
      collection.$id,
      'read_index',
      'key',
      ['read'],
      ['asc']
    );
    console.log('✅ read index created');
    
    console.log('\n🎉 Notifications collection setup complete!');
    console.log(`\n📝 Collection ID: ${collection.$id}`);
    console.log('\n✅ Add this to your .env.local:');
    console.log(`NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=${collection.$id}`);
    
  } catch (error) {
    console.error('❌ Error setting up notifications collection:', error.message);
    if (error.code === 409) {
      console.log('\n⚠️  Collection might already exist. Check your Appwrite console.');
    }
  }
}

setupNotificationsCollection();
