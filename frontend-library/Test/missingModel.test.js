const { db } = require("../src/components/firebaseFolder/firebaseAdmin");  // Import Firestore connection

describe("Test for responce to missing model", () => {
    test("should handle missing model gracefully", async () => {
        const userId = "nonExistentUser";
        const modelRef = db.collection("userModels").doc(userId);
        const modelDoc = await modelRef.get();
      
        expect(modelDoc.exists).toBe(false);
      });
});
//const userId = "J8LMgSLHyvYDgjwdC3pgECv94fE3";
//npx jest missingModel.test.js