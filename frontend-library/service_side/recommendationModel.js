const tf = require("@tensorflow/tfjs");
const { db } = require("../src/components/firebaseFolder/firebaseAdmin");
const { getRecommendations: getTensorflowRecommendations } = require("./recommendations");

// Fetch user's TensorFlow model or create a new one if it doesn't exist
async function getUserModel(userId) {
  const modelRef = db.collection('models').doc(userId);
  const modelDoc = await modelRef.get();

  // Check if model exists, otherwise create a new one
  if (!modelDoc.exists) {
    console.log("No existing model found. Creating a new model...");

    await createUserModel(userId);

    // Re-fetch model data after creation
    const newModelDoc = await modelRef.get();
    if (!newModelDoc.exists) {
      throw new Error("Model creation failed. Unable to fetch new model.");
    }
    return await loadModelFromData(newModelDoc.data());
  }

  // Load existing model data and validate its structure
  return await loadModelFromData(modelDoc.data());
}

// Helper function to load and validate model data
async function loadModelFromData(modelData) {
  if (!modelData.modelTopology) {
    throw new Error("Model data is missing 'modelTopology'");
  }
  if (!modelData.weightsManifest || modelData.weightsManifest.length === 0) {
    throw new Error("Model data is missing 'weightsManifest'");
  }
  if (!modelData.weightData) {
    throw new Error("Model data is missing 'weightData'");
  }

  const modelArtifacts = {
    modelTopology: modelData.modelTopology,
    weightSpecs: modelData.weightsManifest[0].weights,
    weightData: new Uint8Array(modelData.weightData).buffer,
  };

  // Load the model from artifacts
  return await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
}

// Create a new TensorFlow model for a user and save it in Firebase
async function createUserModel(userId) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 50, activation: "relu", inputShape: [40] }));
  model.add(tf.layers.dense({ units: 10, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));

  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  const modelArtifacts = await model.save(tf.io.withSaveHandler(async (artifacts) => artifacts));

  // If weightsManifest is undefined, create a basic structure
  const weightsManifest = modelArtifacts.weightsManifest || [
    {
      paths: ["path/to/weights.bin"],
      weights: [
        { name: "dense_Dense1/kernel", shape: [40, 50], dtype: "float32" },
        { name: "dense_Dense1/bias", shape: [50], dtype: "float32" },
        { name: "dense_Dense2/kernel", shape: [50, 10], dtype: "float32" },
        { name: "dense_Dense2/bias", shape: [10], dtype: "float32" },
        { name: "dense_Dense3/kernel", shape: [10, 1], dtype: "float32" },
        { name: "dense_Dense3/bias", shape: [1], dtype: "float32" }
      ]
    }
  ];

  console.log("Saving model topology:", modelArtifacts.modelTopology);
  console.log("Saving weights manifest:", weightsManifest);
  console.log("Saving weight data:", modelArtifacts.weightData);

  const modelRef = db.collection("models").doc(userId);
  await modelRef.set({
    modelTopology: modelArtifacts.modelTopology,
    weightsManifest: weightsManifest,
    weightData: Array.from(new Uint8Array(modelArtifacts.weightData)),
  });

  return model;
}

// Train the model with book data
async function trainModel(model, books) {
  const keywordVectors = books.map(() => new Array(40).fill(0));  // Example data
  const ratings = books.map(book => book.averageRating || 0);

  const inputTensor = tf.tensor2d(keywordVectors, [books.length, 40]);
  const outputTensor = tf.tensor2d(ratings, [books.length, 1]);

  await model.fit(inputTensor, outputTensor, { epochs: 10 });
}

// Handle the recommendation process
async function generateRecommendations(bookName, books, userId) {
  let model = await getUserModel(userId);
  
  if (!model) {
      model = await createUserModel(userId);
      await trainModel(model, books);
  }

  // Use the TensorFlow-based recommendation logic from recommendations.js
  return await getTensorflowRecommendations(bookName, books, model);
}

module.exports = { generateRecommendations, createUserModel };