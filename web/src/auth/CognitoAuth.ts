import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from "aws-amplify/auth";
import { useState, useEffect } from "react";

import { logOutFromTenant } from "@reearth-cms/config";

import AuthHook from "./AuthHook";

export const useCognitoAuth = (): AuthHook => {
  const [user, setUser] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { username, signInDetails } = await getCurrentUser();
        const { tokens: session } = await fetchAuthSession();
        const cognitoUser = {
          username,
          session,
          authenticationFlowType: signInDetails?.authFlowType,
        };
        setUser(cognitoUser);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(JSON.stringify(err));
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);
  const getAccessToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? "";
  };
  const login = () => {
    logOutFromTenant();
    signInWithRedirect();
  };
  const logout = async () => {
    logOutFromTenant();
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(JSON.stringify(err));
      }
    }
  };
  return { user, isAuthenticated: !!user, isLoading, error, getAccessToken, login, logout };
};
