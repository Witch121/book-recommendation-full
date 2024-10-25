const { db } = require("../src/components/firebaseFolder/firebaseAdmin");
const { createUserModel } = require("../service_side/recommendationModel");
const tf = require("@tensorflow/tfjs");

describe("Model Retrieval and Prediction", () => {
    test("should retrieve and use the model for predictions", async () => {
        const userId = "J8LMgSLHyvYDgjwdC3pgECv94fE3";
        await createUserModel(userId);

        // Retrieve the model JSON from Firestore
        const modelRef = db.collection("models").doc(userId);
        const modelDoc = await modelRef.get();
        const modelData = modelDoc.data().model;

        // Reconstruct the model from JSON with modelTopology
        const model = await tf.models.modelFromJSON({
          modelTopology: modelData.modelTopology,
          weightsManifest: modelData.weightsManifest
        });

        // Mock prediction input and check output dimensions
        const input = tf.zeros([1, 40]);
        const prediction = model.predict(input);
        
        expect(prediction.shape).toEqual([1, 1]);

        // Dispose tensors
        input.dispose();
        prediction.dispose();
    });
});

//npx jest modelRetrieval_Prediction.test.js