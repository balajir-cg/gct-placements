/**
 * Script to set up Forum collections in Appwrite
 * Run this once to create the necessary database collections
 * 
 * Usage: node scripts/setup-forum-collections.js
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Helper function to wait for attributes to be available
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupForumCollections() {
  console.log('🚀 Setting up Forum collections...\n');

  try {
    // Create Posts Collection
    console.log('📝 Checking/Creating "forum_posts" collection...');
    let postsCollectionExists = false;
    try {
      await databases.getCollection(databaseId, 'forum_posts');
      console.log('ℹ️  Posts collection already exists, skipping creation...');
      postsCollectionExists = true;
    } catch (error) {
      // Collection doesn't exist, create it
      const postsCollection = await databases.createCollection(
        databaseId,
        'forum_posts',
        'forum_posts',
        [
          sdk.Permission.read(sdk.Role.any()),
          sdk.Permission.create(sdk.Role.users()),
          sdk.Permission.update(sdk.Role.users()),
          sdk.Permission.delete(sdk.Role.users()),
        ]
      );
      console.log('✅ Posts collection created:', postsCollection.$id);
    }

    // Add attributes to Posts collection
    if (!postsCollectionExists) {
      console.log('📊 Adding attributes to posts collection...');
      
      await databases.createStringAttribute(databaseId, 'forum_posts', 'title', 255, true);
      await databases.createStringAttribute(databaseId, 'forum_posts', 'content', 10000, true);
      await databases.createStringAttribute(databaseId, 'forum_posts', 'authorId', 255, true);
      await databases.createStringAttribute(databaseId, 'forum_posts', 'authorName', 255, true);
      await databases.createStringAttribute(databaseId, 'forum_posts', 'tags', 100, false, undefined, true); // array
      await databases.createStringAttribute(databaseId, 'forum_posts', 'category', 100, false, 'General');
      await databases.createIntegerAttribute(databaseId, 'forum_posts', 'viewCount', false, 0);
      await databases.createIntegerAttribute(databaseId, 'forum_posts', 'commentCount', false, 0);
      await databases.createBooleanAttribute(databaseId, 'forum_posts', 'isPinned', false, false);
      await databases.createBooleanAttribute(databaseId, 'forum_posts', 'isClosed', false, false);

      console.log('✅ Posts attributes created\n');
    }

    // Create Comments Collection
    console.log('💬 Checking/Creating "forum_comments" collection...');
    let commentsCollectionExists = false;
    try {
      await databases.getCollection(databaseId, 'forum_comments');
      console.log('ℹ️  Comments collection already exists, skipping creation...');
      commentsCollectionExists = true;
    } catch (error) {
      // Collection doesn't exist, create it
      const commentsCollection = await databases.createCollection(
        databaseId,
        'forum_comments',
        'forum_comments',
        [
          sdk.Permission.read(sdk.Role.any()),
          sdk.Permission.create(sdk.Role.users()),
          sdk.Permission.update(sdk.Role.users()),
          sdk.Permission.delete(sdk.Role.users()),
        ]
      );
      console.log('✅ Comments collection created:', commentsCollection.$id);
    }

    // Add attributes to Comments collection
    if (!commentsCollectionExists) {
      console.log('📊 Adding attributes to comments collection...');
      
      await databases.createStringAttribute(databaseId, 'forum_comments', 'postId', 255, true);
      await databases.createStringAttribute(databaseId, 'forum_comments', 'content', 5000, true);
      await databases.createStringAttribute(databaseId, 'forum_comments', 'authorId', 255, true);
      await databases.createStringAttribute(databaseId, 'forum_comments', 'authorName', 255, true);
      await databases.createStringAttribute(databaseId, 'forum_comments', 'parentCommentId', 255, false); // for nested replies
      
      console.log('✅ Comments attributes created\n');
    }

    // Wait for attributes to become available (Appwrite needs time to process)
    if (!postsCollectionExists || !commentsCollectionExists) {
      console.log('⏳ Waiting for attributes to become available (5 seconds)...');
      await wait(5000);
      console.log('✅ Attributes should be ready\n');
    }

    // Create indexes for better query performance
    console.log('🔍 Creating/Checking indexes...');
    
    // Helper function to create index if it doesn't exist
    const createIndexIfNotExists = async (collectionId, key, type, attributes) => {
      try {
        await databases.createIndex(databaseId, collectionId, key, type, attributes);
        console.log(`  ✅ Created index: ${key} on ${collectionId}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  Index ${key} already exists on ${collectionId}`);
        } else {
          throw error;
        }
      }
    };

    await createIndexIfNotExists('forum_posts', 'authorId_idx', 'key', ['authorId']);
    await createIndexIfNotExists('forum_posts', 'category_idx', 'key', ['category']);
    await createIndexIfNotExists('forum_comments', 'postId_idx', 'key', ['postId']);
    await createIndexIfNotExists('forum_comments', 'authorId_idx', 'key', ['authorId']);
    
    console.log('✅ All indexes ready\n');

    console.log('🎉 Forum collections setup completed successfully!\n');
    console.log('📝 Collections created:');
    console.log('   - forum_posts');
    console.log('   - forum_comments');
    console.log('\n✅ You can now use the forum feature in your app!');

  } catch (error) {
    console.error('❌ Error setting up forum collections:', error.message);
    process.exit(1);
  }
}

setupForumCollections();
