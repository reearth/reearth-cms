import { initializeApp } from "firebase/app";

export type FirebaseParams = {
  firebaseApiKey?: string;
  firebaseAppId?: string;
  firebaseAuthDomain?: string;
  firebaseMessagingSenderId?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
};

export function configureFirebase(firebase: FirebaseParams) {
  const firebaseApiKey = firebase.firebaseApiKey;
  const firebaseAuthDomain = firebase.firebaseAuthDomain;
  const firebaseProjectId = firebase.firebaseProjectId;
  const firebaseStorageBucket = firebase.firebaseStorageBucket;
  const firebaseMessagingSenderId = firebase.firebaseMessagingSenderId;
  const firebaseAppId = firebase.firebaseAppId;

  const config = {
    apiKey: firebaseApiKey,
    appId: firebaseAppId,
    authDomain: firebaseAuthDomain,
    messagingSenderId: firebaseMessagingSenderId,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
  };

  initializeApp(config);
}
