// messageModelFirebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // Replace with your path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const messagesCollection = db.collection('messages');

/**
 * Create a new message
 * @param {string} userId - ID of the user sending the message
 * @param {string} content - Message content
 */
async function createMessage(userId, content) {
  try {
    const messageData = {
      userId: userId,
      content: content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await messagesCollection.add(messageData);
    return { id: docRef.id, ...messageData };
  } catch (err) {
    console.error('Error creating message:', err);
    throw err;
  }
}

/**
 * Get messages optionally filtered by userId
 * @param {string} [userId] - optional userId to filter messages
 */
async function getMessages(userId) {
  try {
    let query = messagesCollection.orderBy('createdAt', 'desc');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.get();
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  } catch (err) {
    console.error('Error fetching messages:', err);
    throw err;
  }
}

module.exports = {
  createMessage,
  getMessages,
};
