const admin = require('firebase-admin');
const path = require('path');

// ✅ Replace this path with the actual path to your Firebase Admin SDK key
const serviceAccount = require(path.resolve(__dirname, './serviceAccountKey.json'));

// ✅ Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * Create a new user document in Firestore
 * @param {string} userId - Unique ID for the user (e.g., Firebase Auth uid)
 * @param {Object} userData - User data object
 */
async function createUser(userId, userData) {
  const userRef = db.collection('users').doc(userId);

  try {
    await userRef.set({
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash, // Hashed password
      role: userData.role || 'client',
      specialization: userData.specialization || null,
      availability: userData.availability || [],
      loginHistory: userData.loginHistory || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ User (${userId}) created successfully.`);
  } catch (err) {
    console.error(`❌ Error creating user (${userId}):`, err);
    throw err;
  }
}

/**
 * Update an existing user document
 * @param {string} userId - User ID
 * @param {Object} updateData - Fields to update
 */
async function updateUser(userId, updateData) {
  const userRef = db.collection('users').doc(userId);

  try {
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await userRef.update(updateData);
    console.log(`✅ User (${userId}) updated successfully.`);
  } catch (err) {
    console.error(`❌ Error updating user (${userId}):`, err);
    throw err;
  }
}

/**
 * Add a login timestamp to the user's loginHistory array
 * @param {string} userId - User ID
 */
async function addLoginTimestamp(userId) {
  const userRef = db.collection('users').doc(userId);

  try {
    await userRef.update({
      loginHistory: admin.firestore.FieldValue.arrayUnion({
        timestamp: admin.firestore.Timestamp.now(),
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Login timestamp added for user (${userId}).`);
  } catch (err) {
    console.error(`❌ Error adding login timestamp for user (${userId}):`, err);
    throw err;
  }
}

/**
 * Get user data by ID
 * @param {string} userId - User ID
 * @returns {Object|null} - User document data or null
 */
async function getUser(userId) {
  const userRef = db.collection('users').doc(userId);

  try {
    const doc = await userRef.get();
    if (!doc.exists) {
      console.log(`⚠️ User (${userId}) not found.`);
      return null;
    }
    return doc.data();
  } catch (err) {
    console.error(`❌ Error retrieving user (${userId}):`, err);
    throw err;
  }
}

module.exports = {
  createUser,
  updateUser,
  addLoginTimestamp,
  getUser,
  db // Optionally export db if needed elsewhere
};
