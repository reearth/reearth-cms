import { initializeApp } from "firebase/app";

export interface FirebaseParams {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
}

export function configureFirebase(firebase: FirebaseParams) {
  const firebaseConfig = {
    apiKey: firebase.firebaseApiKey,
    authDomain: firebase.firebaseAuthDomain,
    projectId: firebase.firebaseProjectId,
    storageBucket: firebase.firebaseStorageBucket,
    messagingSenderId: firebase.firebaseMessagingSenderId,
    appId: firebase.firebaseAppId,
  };

  initializeApp(firebaseConfig);
}
