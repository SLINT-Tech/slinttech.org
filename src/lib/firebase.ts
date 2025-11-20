import admin from 'firebase-admin';

let firebaseApp: admin.app.App;

export const initializeFirebase = () => {
  if (!firebaseApp) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  return firebaseApp;
};

export const getStorage = () => {
  const app = initializeFirebase();
  return admin.storage(app);
};
