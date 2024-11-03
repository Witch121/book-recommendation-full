import admin from "firebase-admin";
import serviceAccount from "C:/Users/Asus/Desktop/khai/diplomaPY/key/bookworm-271c9-firebase-adminsdk.json";
import { ServiceAccount } from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const db = admin.firestore();

export { admin, db };