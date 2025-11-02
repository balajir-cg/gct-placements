const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

async function checkCollection() {
  try {
    // Try to get the notifications collection
    const collection = await databases.getCollection(databaseId, 'notifications');
    
    console.log('✅ Collection found!');
    console.log('\nCollection ID:', collection.$id);
    console.log('Collection Name:', collection.name);
    console.log('\n📋 Attributes:');
    collection.attributes.forEach(attr => {
      console.log(`  - ${attr.key} (${attr.type}) ${attr.required ? '[required]' : '[optional]'}`);
    });
    
    console.log('\n🔧 Add this to your .env.local:');
    console.log(`NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=${collection.$id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 The collection might not exist yet. Run setup-notifications-collection.js first.');
  }
}

checkCollection();
