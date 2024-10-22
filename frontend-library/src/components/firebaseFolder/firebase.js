const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
// const { getFunctions, httpsCallable } = require('firebase/functions');

const firebaseConfig = {
  apiKey: "AIzaSyC5wi21T3Beglj2_lIaANzH-UAokChPczQ",
  authDomain: "bookworm-271c9.firebaseapp.com",
  projectId: "bookworm-271c9",
  storageBucket: "bookworm-271c9.appspot.com",
  messagingSenderId: "174162133528",
  appId: "1:174162133528:web:87ace66435f8d4136cf96d",
  measurementId: "G-ZRT53DTD6Y"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
// const functions = getFunctions(app);

module.exports = { auth, db };
