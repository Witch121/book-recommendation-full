const { db } = require("../src/components/firebaseFolder/firebaseAdmin");  // Import Firestore connection
const { createUserModel } = require("../service_side/recommendationModel");  // Import the model creation function
const tf = require("@tensorflow/tfjs");

describe("Test for Consistency Across Different User IDs:", () => {
    test("should maintain separate models for different users", async () => {
        const userId1 = "J8LMgSLHyvYDgjwdC3pgECv94fE3"; //Coffee
        const userId2 = "3VMPa0BLVEclP50yVccMWHPU4DA2"; //Mika
      
        // Create and save models for two users
        await createUserModel(userId1);
        const model2 = tf.sequential();
        model2.add(tf.layers.dense({ units: 20, activation: "relu", inputShape: [40] }));
        model2.add(tf.layers.dense({ units: 1, activation: "linear" }));
        const model2JSON = model2.toJSON();
      
        await db.collection("models").doc(userId2).set({ model: model2JSON });
      
        // Retrieve models and verify they differ
        const modelDoc1 = await db.collection("models").doc(userId1).get();
        const modelDoc2 = await db.collection("models").doc(userId2).get();
        let modelData1 = modelDoc1.data().model;
        let modelData2 = modelDoc2.data().model;
        if (typeof modelData1 === "string") {
            modelData1 = JSON.parse(modelData1);
        }
        if (typeof modelData2 === "string") {
            modelData2 = JSON.parse(modelData2);
        }

        expect(modelData1.config.layers[0].config.units).not.toBe(
            modelData2.config.layers[0].config.units
        );
      });
});

//const userId = "J8LMgSLHyvYDgjwdC3pgECv94fE3";
//npx jest consistencyOfID.test.js
