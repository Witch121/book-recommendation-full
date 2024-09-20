import { collection, addDoc, doc, setDoc } from 'firebase/firestore'; // Firestore functions
import { db } from './firebase'; // Your Firestore instance

const uploadBookToFirestore = async (bookData) => {

  const booksCollectionRef = collection(db, 'books');

  try {
    await addDoc(booksCollectionRef, bookData); // Add book data as a new document
    console.log('Book added to Firestore!');
  } catch (error) {
    console.error('Error adding book:', error);
  }
};

const uploadUserToFirestore = async (userData) => {
  console.log(userData.uid)

  try {
    await setDoc(doc(db, 'users', userData.uid), userData);
    console.log('User added to Firestore!');
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

export { uploadBookToFirestore, uploadUserToFirestore };
