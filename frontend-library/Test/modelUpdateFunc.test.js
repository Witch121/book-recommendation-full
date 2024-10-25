const { db } = require("../src/components/firebaseFolder/firebaseAdmin");  // Import Firestore connection
const { createUserModel } = require("../service_side/recommendationModel");  // Import the model creation function
const tf = require("@tensorflow/tfjs");

describe("Update model infos in the DB", () => {
    test("should update an existing model in Firestore", async () => {
        const userId = "J8LMgSLHyvYDgjwdC3pgECv94fE3";
        await createUserModel(userId);
      
        // Modify and save an updated model
        const updatedModel = tf.sequential();
        updatedModel.add(tf.layers.dense({ units: 100, activation: "relu", inputShape: [40] }));
        updatedModel.add(tf.layers.dense({ units: 1, activation: "linear" }));
        const updatedModelJSON = updatedModel.toJSON();
      

        const modelRef = db.collection("models").doc(userId);
        await modelRef.set({ model: updatedModelJSON });

        // Retrieve and verify update
        const modelDoc = await modelRef.get();
        let modelData = modelDoc.data().model;

        // Parse modelData if it’s a string
        if (typeof modelData === "string") {
            modelData = JSON.parse(modelData);
        }

        // Check that modelData now has the expected properties
        expect(modelData.config.layers[0].config.units).toBe(100);

    });
});

//const userId = "J8LMgSLHyvYDgjwdC3pgECv94fE3"
//npx jest modelUpdateFunc.test.js