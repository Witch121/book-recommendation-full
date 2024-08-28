// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5wi21T3Beglj2_lIaANzH-UAokChPczQ",
  authDomain: "bookworm-271c9.firebaseapp.com",
  projectId: "bookworm-271c9",
  storageBucket: "bookworm-271c9.appspot.com",
  messagingSenderId: "174162133528",
  appId: "1:174162133528:web:87ace66435f8d4136cf96d",
  measurementId: "G-ZRT53DTD6Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth };