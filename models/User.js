// userModelFirebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // replace with your path

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Create a new user document in Firestore
 * @param {string} userId - Unique ID for the user (e.g. Firebase Auth uid)
 * @param {Object} userData - User data object matching schema
 */
async function createUser(userId, userData) {
  const userRef = db.collection('users').doc(userId);

  try {
    await userRef.set({
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash, // hashed password
      role: userData.role || 'client',
      specialization: userData.specialization || null,
      availability: userData.availability || [],
      loginHistory: userData.loginHistory || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('User created successfully.');
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
}

/**
 * Update existing user document
 * @param {string} userId 
 * @param {Object} updateData 
 */
async function updateUser(userId, updateData) {
  const userRef = db.collection('users').doc(userId);

  try {
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await userRef.update(updateData);
    console.log('User updated successfully.');
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
}

/**
 * Add a login timestamp to user's loginHistory
 * @param {string} userId 
 */
async function addLoginTimestamp(userId) {
  const userRef = db.collection('users').doc(userId);

  try {
    await userRef.update({
      loginHistory: admin.firestore.FieldValue.arrayUnion({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Login timestamp added.');
  } catch (err) {
    console.error('Error adding login timestamp:', err);
    throw err;
  }
}

/**
 * Get user data by userId
 * @param {string} userId 
 * @returns user data or null
 */
async function getUser(userId) {
  const userRef = db.collection('users').doc(userId);

  try {
    const doc = await userRef.get();
    if (!doc.exists) {
      console.log('User not found');
      return null;
    }
    return doc.data();
  } catch (err) {
    console.error('Error getting user:', err);
    throw err;
  }
}

module.exports = {
  createUser,
  updateUser,
  addLoginTimestamp,
  getUser,
};
