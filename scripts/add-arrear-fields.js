/**
 * Script to add new arrear tracking fields to the users collection
 * Run this script to add historyOfArrearsCount and currentArrearsCount attributes
 * 
 * Usage: node scripts/add-arrear-fields.js
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'placement-db';
const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users';

async function addArrearFields() {
  try {
    console.log('🚀 Adding arrear tracking fields to users collection...\n');

    // Add historyOfArrearsCount attribute
    console.log('Adding historyOfArrearsCount attribute...');
    try {
      await databases.createStringAttribute(
        databaseId,
        usersCollectionId,
        'historyOfArrearsCount',
        10,
        false, // not required
        '0'    // default value
      );
      console.log('✅ historyOfArrearsCount attribute created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  historyOfArrearsCount attribute already exists');
      } else {
        throw error;
      }
    }

    // Add currentArrearsCount attribute
    console.log('Adding currentArrearsCount attribute...');
    try {
      await databases.createStringAttribute(
        databaseId,
        usersCollectionId,
        'currentArrearsCount',
        10,
        false, // not required
        '0'    // default value
      );
      console.log('✅ currentArrearsCount attribute created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  currentArrearsCount attribute already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✨ Arrear tracking fields setup complete!');
    console.log('\nNew attributes added:');
    console.log('  - historyOfArrearsCount (string, max 10 chars, default: "0")');
    console.log('  - currentArrearsCount (string, max 10 chars, default: "0")');
    console.log('\n📝 Note: These fields will be automatically populated when students upload their marksheets.');

  } catch (error) {
    console.error('❌ Error adding arrear fields:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. Your Appwrite server is running');
    console.error('2. APPWRITE_API_KEY is set in .env.local');
    console.error('3. The users collection exists');
    process.exit(1);
  }
}

// Run the script
addArrearFields();
