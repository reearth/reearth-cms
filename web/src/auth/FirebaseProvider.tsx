import styled from "@emotion/styled";
import { getAuth, onAuthStateChanged, User, EmailAuthProvider } from "firebase/auth";
import * as firebaseui from "firebaseui";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

import Loading from "@reearth-cms/components/atoms/Loading";
import "firebaseui/dist/firebaseui.css";

type Props = {
  children?: ReactNode;
};

const FirebaseProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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

  const isAuthenticated = useMemo(() => !!user, [user]);

  useEffect(() => {
    const auth = getAuth();
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    const uiConfig = {
      signInOptions: [
        {
          provider: EmailAuthProvider.PROVIDER_ID,
        },
      ],
    };

    if (!isLoading && !isAuthenticated) {
      ui.start("#firebaseui-auth-container", uiConfig);
    } else {
      ui.reset();
    }
  }, [isAuthenticated, isLoading]);

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

export default FirebaseProvider;
