import styled from "@emotion/styled";
import React from "react";

import { useAuth } from "@reearth-cms/auth";
import { useT, Trans } from "@reearth-cms/i18n";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const t = useT();

  return (
    <Container>
      <div style={{ padding: "1rem" }}>
        <img src="/reearth.svg" alt="Re:Earth Logo" style={{ height: 48, width: 147 }} />
      </div>
      <Inner>
        <Card>
          <Logo>
            <img src="/logo.svg" alt="Re:Earth CMS" />
          </Logo>
          <Title>Re: Earth CMS</Title>
          <Description>
            <Trans
              i18nKey="loginDescription"
              components={{
                l1: (
                  <a href="https://reearth.io" target="_blank" rel="noreferrer">
                    Re:Earth
                  </a>
                ),
                br: <br />,
              }}
            />
          </Description>
          <Button onClick={login}>{t("Log In")}</Button>
          <SignupPrompt>
            <span>{t("Don't have an account?")}</span>
            <a href="https://reearth.io/">👉 {t("Sign up on Re:Earth")}</a>
          </SignupPrompt>
        </Card>
      </Inner>
    </Container>
  );
};

export default LoginPage;

const Container = styled.div`
  height: 100vh;
  background: #f8f6ef;
  display: flex;
  flex-direction: column;
`;

const Inner = styled.div`
  flex: 1;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  text-align: center;
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  img {
    width: 100px;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;

  a {
    color: #2563eb;
    text-decoration: none;
  }
`;

const Button = styled.button`
  background-color: #fbbc04;
  color: white;
  font-weight: bold;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SignupPrompt = styled.p`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.95rem;

  a {
    color: #2563eb;
    text-decoration: none;
    margin-left: 0.4rem;
  }
`;
