const { prepareModel } = require("./TensorFlowModel/models/model");
const { getRecommendations } = require("./TensorFlowModel/services/recommendations");

// context = interface CallableContext {
//     /**
//      * The result of decoding and verifying a Firebase AppCheck token.
//      */
//     app?: AppCheckData;
//     /**
//      * The result of decoding and verifying a Firebase Auth ID token.
//      */
//     auth?: AuthData;
//     /**
//      * An unverified token for a Firebase Instance ID.
//      */
//     instanceIdToken?: string;
//     /**
//      * The raw request handled by the callable.
//      */
//     rawRequest: Request;
// }

// export interface AuthData {
//     uid: string;
//     token: DecodedIdToken;
// }


const { HttpsError } = require("firebase-functions/v1/https");
const logger = require("firebase-functions/logger");

exports.recommendation = async (data, context) => {
    if (!context.auth) {
        logger.error("The function must be called while authenticated.");
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    logger.info(JSON.stringify(data ?? {}), { structuredData: true });

    const { bookName, userPreferences } = data;

    try {
      const { books, model } = await prepareModel(bookName, userPreferences);
      const recommendations = await getRecommendations(bookName, books, model, userPreferences);
      return recommendations;
    } catch (error) {
      throw new HttpsError("internal", "Error generating recommendations.");
    }
};
