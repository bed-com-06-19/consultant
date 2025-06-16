// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./services.json'); // download from Firebase settings

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { admin, db };
