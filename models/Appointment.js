// appointmentModelFirebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // Replace with your service account path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const appointmentsCollection = db.collection('appointments');

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment details
 * @param {string} appointmentData.userId - User ID who booked the appointment
 * @param {string} appointmentData.service - Service name
 * @param {Date} appointmentData.date - Appointment date (JavaScript Date object)
 * @param {string} appointmentData.time - Appointment time (string)
 * @param {string} [appointmentData.status] - Status: 'pending', 'approved', or 'rejected' (default: 'pending')
 * @param {string} [appointmentData.reason] - Reason for rejection or notes (optional)
 */
async function createAppointment(appointmentData) {
  try {
    const {
      userId,
      service,
      date,
      time,
      status = 'pending',
      reason = ''
    } = appointmentData;

    const newAppointment = {
      userId,
      service,
      date: admin.firestore.Timestamp.fromDate(date),
      time,
      status,
      reason,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await appointmentsCollection.add(newAppointment);
    return { id: docRef.id, ...newAppointment };
  } catch (err) {
    console.error('Error creating appointment:', err);
    throw err;
  }
}

/**
 * Update an appointment's status or details by ID
 * @param {string} appointmentId - Firestore document ID
 * @param {Object} updateData - Fields to update
 */
async function updateAppointment(appointmentId, updateData) {
  try {
    if (updateData.date) {
      updateData.date = admin.firestore.Timestamp.fromDate(updateData.date);
    }
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await appointmentsCollection.doc(appointmentId).update(updateData);
    const updatedDoc = await appointmentsCollection.doc(appointmentId).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (err) {
    console.error('Error updating appointment:', err);
    throw err;
  }
}

/**
 * Get appointments optionally filtered by userId or status
 * @param {Object} [filter] - Optional filters (userId, status)
 */
async function getAppointments(filter = {}) {
  try {
    let query = appointmentsCollection.orderBy('date', 'desc');

    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }

    const snapshot = await query.get();
    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({ id: doc.id, ...doc.data() });
    });

    return appointments;
  } catch (err) {
    console.error('Error fetching appointments:', err);
    throw err;
  }
}

module.exports = {
  createAppointment,
  updateAppointment,
  getAppointments,
};
