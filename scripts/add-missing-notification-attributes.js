const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const collectionId = 'notifications';

async function addMissingAttributes() {
  try {
    console.log('🔧 Adding missing attributes to notifications collection...\n');
    
    // Add read attribute (boolean, not required, default false)
    try {
      await databases.createBooleanAttribute(
        databaseId,
        collectionId,
        'read',
        false,  // not required
        false   // default value
      );
      console.log('✅ read attribute created');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('⚠️  read attribute might already exist:', error.message);
    }
    
    // Add createdAt attribute (string to store ISO datetime)
    try {
      await databases.createStringAttribute(
        databaseId,
        collectionId,
        'createdAt',
        100,
        false  // not required
      );
      console.log('✅ createdAt attribute created');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('⚠️  createdAt attribute might already exist:', error.message);
    }
    
    // Add readAt attribute (string to store ISO datetime, optional)
    try {
      await databases.createStringAttribute(
        databaseId,
        collectionId,
        'readAt',
        100,
        false
      );
      console.log('✅ readAt attribute created');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('⚠️  readAt attribute might already exist:', error.message);
    }
    
    console.log('\n⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create indexes
    console.log('\n📑 Creating indexes...');
    
    try {
      await databases.createIndex(
        databaseId,
        collectionId,
        'userId_idx',
        'key',
        ['userId'],
        ['ASC']
      );
      console.log('✅ userId index created');
    } catch (error) {
      console.log('⚠️  userId index might already exist');
    }
    
    try {
      await databases.createIndex(
        databaseId,
        collectionId,
        'type_idx',
        'key',
        ['type'],
        ['ASC']
      );
      console.log('✅ type index created');
    } catch (error) {
      console.log('⚠️  type index might already exist');
    }
    
    try {
      await databases.createIndex(
        databaseId,
        collectionId,
        'read_idx',
        'key',
        ['read'],
        ['ASC']
      );
      console.log('✅ read index created');
    } catch (error) {
      console.log('⚠️  read index might already exist');
    }
    
    console.log('\n✅ Missing attributes added successfully!');
    console.log('\n🔧 Add this to your .env.local if not already added:');
    console.log('NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

addMissingAttributes();
