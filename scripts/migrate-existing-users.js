#!/usr/bin/env node

/**
 * Database Migration Script
 * Adds username field to existing users who don't have one
 * Run this ONCE after deploying the username authentication changes
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema (simplified for migration)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  firebaseUid: String,
  googleId: String,
}, { strict: false }); // Allow other fields

const User = mongoose.model('User', userSchema);

async function generateUniqueUsername(baseUsername) {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  // Ensure minimum length
  if (username.length < 3) {
    username = `user_${username}`;
  }
  
  // Ensure maximum length
  if (username.length > 30) {
    username = username.substring(0, 30);
  }
  
  // Check if exists
  let existingUser = await User.findOne({ username });
  let counter = 1;
  let finalUsername = username;
  
  while (existingUser) {
    finalUsername = `${username}${counter}`;
    if (finalUsername.length > 30) {
      // Trim base username to make room for counter
      const trimLength = 30 - counter.toString().length;
      finalUsername = `${username.substring(0, trimLength)}${counter}`;
    }
    existingUser = await User.findOne({ username: finalUsername });
    counter++;
  }
  
  return finalUsername;
}

async function migrateUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find users without username
    const usersWithoutUsername = await User.find({ 
      username: { $exists: false } 
    });

    console.log(`📊 Found ${usersWithoutUsername.length} users without username\n`);

    if (usersWithoutUsername.length === 0) {
      console.log('✨ All users already have usernames. Nothing to migrate.');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutUsername) {
      try {
        let baseUsername;

        // Generate base username from available data
        if (user.email) {
          baseUsername = user.email.split('@')[0];
        } else if (user.name) {
          baseUsername = user.name.toLowerCase().replace(/\s+/g, '_');
        } else if (user.firebaseUid) {
          baseUsername = `user_${user.firebaseUid.substring(0, 10)}`;
        } else if (user.googleId) {
          baseUsername = `user_${user.googleId.substring(0, 10)}`;
        } else {
          baseUsername = `user_${user._id.toString().slice(-8)}`;
        }

        const username = await generateUniqueUsername(baseUsername);

        // Update user with new username
        await User.updateOne(
          { _id: user._id },
          { $set: { username } }
        );

        console.log(`✅ Migrated: ${user.email || user._id} → ${username}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating user ${user._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
    console.log(`\n✨ Migration complete!`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run migration
console.log('🚀 Starting user migration...\n');
migrateUsers();
