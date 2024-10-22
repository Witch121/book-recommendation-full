import * as tf from '@tensorflow/tfjs';
const { uploadUserToFirestore } = require ('../firebaseFolder/firestore');
const { db } = require('../firebaseFolder/firebase');
const { getDoc, doc } = require('firebase/firestore');

// Function to save the model to Firestore
export const saveModelToFirestore = async (user, model) => {
  if (!user || !user.uid) {
    console.error("User object is invalid. Unable to save model.");
    return;
  }

  const modelJSON = await model.toJSON();  // Convert model to JSON format

  // Save model architecture and weights to Firestore under the user's document
  await uploadUserToFirestore(user.uid, {
    architecture: modelJSON.modelTopology,
    weights: modelJSON.weights,
    weightSpecs: modelJSON.weightSpecs,
  });

  console.log(`Model for user ${user.uid} saved to Firestore.`);
};

// Function to load the model from Firestore
export const loadModelFromFirestore = async (user) => {
  if (!user || !user.uid) {
    console.error("User object is invalid. Unable to load model.");
    return null;
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid));  // Fetch the document

  if (!userDoc.exists()) {
    console.log('No pre-trained model found for user.');
    return null;
  }

  const modelData = userDoc.data().model;

  if (!modelData) {
    console.log('No model data found.');
    return null;
  }

  // Load model from the saved JSON in Firestore
  const model = await tf.loadLayersModel(tf.io.fromMemory(
    modelData.architecture,
    modelData.weights,
    modelData.weightSpecs,
  ));

  console.log('Loaded model from Firestore.');
  return model;
};

// Function to create and train a new model with real data from userPreferences
export const prepareModel = async (userPreferences) => {
  const numKeywords = 5;  // Assuming you are limiting keywords to 5
  const numGenres = 1;    // Assume a single genre
  const numFeatures = numKeywords + numGenres + 1;  // keywords + genre + rating

  // Extract real data from userPreferences
  const keywordValues = userPreferences.keywords.slice(0, numKeywords);  // Limit to 5 keywords
  const rating = userPreferences.ratings || 0;  // Ensure there's a rating, default to 0
  const genre = userPreferences.genre || 0;  // Ensure there's a genre, default to 0

  // Combine the features into one array (pad if necessary)
  let inputArray = [...keywordValues, genre, rating];
  while (inputArray.length < numFeatures) {
    inputArray.push(0);  // Pad with 0s if fewer than numFeatures
  }

  // Define the model architecture
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, inputShape: [numFeatures], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));  // Output layer (can be a predicted rating)

  // Compile the model
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  // Convert user preferences into a tensor
  const inputTensor = tf.tensor2d([inputArray], [1, numFeatures]);
  const labelTensor = tf.tensor2d([[rating]], [1, 1]);  // Labels based on ratings

  // Train the model
  await model.fit(inputTensor, labelTensor, { epochs: 10 });

  console.log('New model trained');
  
  // Return the trained model
  return model;
};

// Function to retrain the existing model with new data
export const retrainModel = async (model, userPreferences) => {
  const numKeywords = 5;
  const numGenres = 1;
  const numFeatures = numKeywords + numGenres + 1;  // keywords + genre + rating

  // Prepare real data from userPreferences
  const keywordValues = userPreferences.keywords.slice(0, numKeywords);
  const rating = userPreferences.ratings || 0;
  const genre = userPreferences.genre || 0;

  let inputArray = [...keywordValues, genre, rating];
  while (inputArray.length < numFeatures) {
    inputArray.push(0);  // Pad with 0s if fewer than numFeatures
  }

  // Create the input tensor
  const inputTensor = tf.tensor2d([inputArray], [1, numFeatures]);
  const labelTensor = tf.tensor2d([[rating]], [1, 1]);

  // Retrain the model
  await model.fit(inputTensor, labelTensor, { epochs: 5 });

  console.log("Model retrained successfully");
};
