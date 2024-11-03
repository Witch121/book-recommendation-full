import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import { uploadUserToFirestore } from "./firestore";
import { auth } from "./firebase";

// Define types for the function parameters
type SignUpData = {
  email: string;
  password: string;
  username: string;
};

// Sign Up Function
const signUp = async ({ email, password, username }: SignUpData): Promise<boolean> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await uploadUserToFirestore({
      uid: user.uid,
      email: user.email,
      username: username
    });

    return true;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      if ((error as any).code === "auth/email-already-in-use") {
        console.log('Email already in use');
        return false;
      }
    }
    throw error;
  }
};

// Sign In Function
const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully");
    return true; 
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      console.error("Error signing in:", error.message);
      return false;
    }
    return false; // Added return to handle any other cases
  }
};

// Sign Out Function
const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      console.error("Error signing out:", error.message);
    }
  }
};

export { signUp, signIn, signOutUser };
