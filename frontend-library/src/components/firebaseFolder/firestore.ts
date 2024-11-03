import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Function to upload book data to Firestore
export const uploadBookToFirestore = async (bookData: any) => {
  const booksCollectionRef = collection(db, "books");
  try {
    await addDoc(booksCollectionRef, bookData); // Add book data as a new document
    console.log("Book added to Firestore!");
  } catch (error) {
    console.error("Error adding book:", error);
  }
};

// Function to upload user data to Firestore
export const uploadUserToFirestore = async (userData: { uid: any; email?: string | null; username?: any; }) => {
  console.log(userData.uid);

  try {
    await setDoc(doc(db, "users", userData.uid), userData);
    console.log("User added to Firestore!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};
