const { db } = require("../src/components/firebaseFolder/firebaseAdmin");  // Import Firestore connection
const { createUserModel } = require("../service_side/recommendationModel");  // Import the model creation function
const tf = require("@tensorflow/tfjs");  // Import TensorFlow.js for node

describe("Model Saving to Firestore", () => {
    test("should save the model to Firestore under the correct user ID", async () => {
      // Arrange: Mock user ID for testing
      const userId = "J8LMgSLHyvYDgjwdC3pgECv94fE3";
  
      // Act: Create and save the model for this user
      const model = await createUserModel(userId);

      // Assert: Check that the model document exists in Firestore
      const modelRef = db.collection("models").doc(userId);
      const modelDoc = await modelRef.get();
      expect(modelDoc.exists).toBe(true);

      // Assert: Check that modelTopology has layers and configuration
      const modelData = modelDoc.data();  // Access the whole document data
      const modelTopology = modelData.modelTopology;  // Model topology is inside 'modelTopology'
      expect(modelTopology.class_name).toBe("Sequential");
      expect(modelTopology.config.layers[0].class_name).toBe("Dense");
      expect(modelTopology.config.layers[0].config.units).toBe(50);
    });
});


//npx jest createUserModel.test.js