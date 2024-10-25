const admin = require('firebase-admin');
const serviceAccount = require("C:/Users/Asus/Desktop/khai/diplomaPY/key/bookworm-271c9-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };