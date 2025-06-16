// settingsModelFirebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // replace with your path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const settingsDocRef = db.collection('settings').doc('appSettings');

/**
 * Get the current settings document
 */
async function getSettings() {
  try {
    const doc = await settingsDocRef.get();
    if (!doc.exists) {
      console.log('No settings found.');
      return null;
    }
    return doc.data();
  } catch (err) {
    console.error('Error fetching settings:', err);
    throw err;
  }
}

/**
 * Create or update settings
 * @param {Object} newSettings - settings data to save
 */
async function setSettings(newSettings) {
  try {
    await settingsDocRef.set({
      siteName: newSettings.siteName || '',
      contactEmail: newSettings.contactEmail || '',
      contactPhone: newSettings.contactPhone || '',
      address: newSettings.address || '',
      theme: newSettings.theme || 'light',
      maintenanceMode: newSettings.maintenanceMode || false,
      enable2FA: newSettings.enable2FA || false,
      sessionTimeout: newSettings.sessionTimeout || 30,
      passwordPolicy: newSettings.passwordPolicy || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }); // merge true to update without overwriting whole doc
    console.log('Settings saved/updated.');
  } catch (err) {
    console.error('Error saving settings:', err);
    throw err;
  }
}

module.exports = {
  getSettings,
  setSettings,
};
