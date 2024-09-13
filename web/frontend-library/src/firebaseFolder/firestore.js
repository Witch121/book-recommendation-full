import { collection, addDoc } from 'firebase/firestore'; // Firestore functions
import { db } from './firebase'; // Your Firestore instance

const uploadBookToFirestore = async (bookData) => {
  const booksCollectionRef = collection(db, 'books'); // Reference to 'books' collection in Firestore

  try {
    await addDoc(booksCollectionRef, bookData); // Add book data as a new document
    console.log('Book added to Firestore!');
  } catch (error) {
    console.error('Error adding book:', error);
  }
};

export { uploadBookToFirestore };
