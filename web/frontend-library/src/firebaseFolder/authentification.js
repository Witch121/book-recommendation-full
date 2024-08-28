import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

// Sign Up Function
const signUp = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up successfully");
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

// Sign In Function
const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully");
  } catch (error) {
    console.error("Error signing in:", error.message);
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

export { signUp, signIn, signOutUser };
