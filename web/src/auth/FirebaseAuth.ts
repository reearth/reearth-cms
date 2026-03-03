import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";

import { logOutFromTenant } from "@reearth-cms/config";

import AuthHook from "./AuthHook";

export const useFirebaseAuth = (): AuthHook => {
  const [user, setUser] = useState<null | User>(null);
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getAccessToken = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    throw new Error("No authenticated user");
  };

  const login = async () => {
    logOutFromTenant();
    const auth = getAuth();
    const provider = new EmailAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(JSON.stringify(err));
      }
    }
  };

  const logout = async () => {
    logOutFromTenant();
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(JSON.stringify(err));
      }
    }
  };

  return { error, getAccessToken, isAuthenticated: !!user, isLoading, login, logout, user };
};
