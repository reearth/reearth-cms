import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  NextOrObserver,
  User,
  connectAuthEmulator,
} from "firebase/auth";
import { useState, useEffect } from "react";

import { logOutFromTenant } from "@reearth-cms/config";

import AuthHook from "./AuthHook";

const app = initializeApp({
  apiKey: "AIzaSyAZ6VoGOSk36amY3vU7D9es7bKG20Fb5Kg",
  authDomain: "links-veda-dev.firebaseapp.com",
});
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099");

export const useFirebaseAuth = (): AuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    const login = async () => {
      const user = await signInWithEmailAndPassword(auth, "test1@test.com", "password");
      console.log(user);
    };
    login();
  }, []);

  const getAccessToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    console.log(token);
    return token;
  };

  const login = async () => {
    logOutFromTenant();
    const user = await signInWithEmailAndPassword(auth, "test1@test.com", "password");
    console.log(user);
  };

  const logout = async () => {
    // logOutFromTenant();
    // try {
    //   await Auth.signOut();
    //   setUser(null);
    // } catch (err) {
    //   if (err instanceof Error) {
    //     setError(err.message);
    //   } else {
    //     setError(JSON.stringify(err));
    //   }
  };

  return { user, isAuthenticated: !!user, isLoading, error, getAccessToken, login, logout };
};
