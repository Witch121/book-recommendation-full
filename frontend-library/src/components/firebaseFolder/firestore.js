const { collection, addDoc, doc, setDoc } = require("firebase/firestore");
const { db } = require("./firebase");

// Function to upload book data to Firestore
const uploadBookToFirestore = async (bookData) => {
  const booksCollectionRef = collection(db, "books");
  try {
    await addDoc(booksCollectionRef, bookData); // Add book data as a new document
    console.log("Book added to Firestore!");
  } catch (error) {
    console.error("Error adding book:", error);
  }
};

// Function to upload user data to Firestore
const uploadUserToFirestore = async (userData) => {
  console.log(userData.uid);

  try {
    await setDoc(doc(db, "users", userData.uid), userData);
    console.log("User added to Firestore!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

module.exports = { 
  uploadBookToFirestore, 
  uploadUserToFirestore, 
};