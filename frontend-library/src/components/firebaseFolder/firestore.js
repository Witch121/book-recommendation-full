const { collection, addDoc, doc, setDoc, getDoc } = require('firebase/firestore'); // Firestore functions
const { db } = require('./firebase'); // Your Firestore instance
const tf = require('@tensorflow/tfjs');

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
  console.log(userData.uid);

  try {
    await setDoc(doc(db, 'users', userData.uid), userData);
    console.log('User added to Firestore!');
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

// Function to save the model to Firestore
const saveModelToFirestore = async (uid, model) => {
  console.log(`Saving model to Firestore for user: ${uid}`);
  const modelJSON = await model.toJSON();  // Convert model to JSON format

  try {
    await setDoc(doc(db, 'users', uid), {
      modelTopology: modelJSON.modelTopology,
      weightSpecs: modelJSON.weightSpecs,
      weights: modelJSON.weights
    }, { merge: true });
    console.log('Model saved to Firestore successfully for user:', uid);
  } catch (error) {
    console.error('Error saving model to Firestore:', error);
    throw error;
  }
};

// Function to load the model from Firestore
const loadModelFromFirestore = async (uid) => {
  console.log(`Loading model for user: ${uid}`);

  if (!uid) {
    throw new Error('Invalid userId provided for loading model from Firestore');
  }

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.log('No model found for this user.');
    return null;  // No model exists yet
  }

  const modelData = docSnap.data();
  if (!modelData.modelTopology || !modelData.weights || !modelData.weightSpecs) {
    console.log('No model fields found, starting new model.');
    return null;  // Model fields do not exist yet
  }

  console.log('Model fields found. Loading model from memory...');
  const model = await tf.loadLayersModel(tf.io.fromMemory(
    modelData.modelTopology,
    modelData.weights,
    modelData.weightSpecs
  ));

  console.log('Model loaded from Firestore for user:', uid);
  return model;
};

module.exports = { uploadBookToFirestore, uploadUserToFirestore, loadModelFromFirestore, saveModelToFirestore };
