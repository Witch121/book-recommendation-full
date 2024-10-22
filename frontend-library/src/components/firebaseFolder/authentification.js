const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { uploadUserToFirestore } = require('./firestore');
const { auth } = require("./firebase");

// Sign Up Function
const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await uploadUserToFirestore({
      uid: user.uid,
      email: user.email,
      username: username
    });

    return true;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log('Email already in use');
      return false;
    }
    throw error;
  }
};

// Sign In Function
const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully");
    return true; 
  } catch (error) {
    console.error("Error signing in:", error.message);
    return false; 
  }
};

// Sign Out Function
const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};

module.exports = { signUp, signIn, signOutUser };
