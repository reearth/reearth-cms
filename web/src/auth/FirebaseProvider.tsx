import styled from "@emotion/styled";
import { getAuth, onAuthStateChanged, User, EmailAuthProvider } from "firebase/auth";
import * as firebaseui from "firebaseui";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

import Loading from "@reearth-cms/components/atoms/Loading";

import "firebaseui/dist/firebaseui.css";

interface Props {
  redirectURL?: string;
  children?: ReactNode;
}

const AuthComponent: React.FC<Props> = ({ children, redirectURL }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  useEffect(() => {
    const auth = getAuth();
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    const uiConfig = {
      signInSuccessUrl: redirectURL || "/",
      signInOptions: [
        {
          provider: EmailAuthProvider.PROVIDER_ID,
        },
      ],
    };

    if (!isLoading && !isAuthenticated) {
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  }, [isAuthenticated, isLoading, redirectURL]);

  return isLoading ? (
    <Container>
      <Loading />
    </Container>
  ) : isAuthenticated ? (
    <>{children}</>
  ) : (
    <Container>
      <div id="firebaseui-auth-container" />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export default AuthComponent;
