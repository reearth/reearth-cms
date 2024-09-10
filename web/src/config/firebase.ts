import { initializeApp } from "firebase/app";

export type FirebaseParams = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
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
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
  };

  initializeApp(config);
}
