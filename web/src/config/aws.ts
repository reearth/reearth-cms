import { Amplify } from "aws-amplify";

export type CognitoParams = {
  cognitoRegion?: string;
  cognitoUserPoolId?: string;
  cognitoUserPoolWebClientId?: string;
  cognitoOauthScope?: string;
  cognitoOauthDomain?: string;
  cognitoOauthRedirectSignIn?: string;
  cognitoOauthRedirectSignOut?: string;
  cognitoOauthResponseType?: string;
};

export function configureCognito(cognito: CognitoParams) {
  const cognitoUserPoolId = cognito.cognitoUserPoolId;
  const cognitoUserPoolWebClientId = cognito.cognitoUserPoolWebClientId;
  const cognitoOauthScope = cognito.cognitoOauthScope?.split(", ");
  const cognitoOauthDomain = cognito.cognitoOauthDomain;
  const cognitoOauthRedirectSignIn = cognito.cognitoOauthRedirectSignIn;
  const cognitoOauthRedirectSignOut = cognito.cognitoOauthRedirectSignOut;
  const cognitoOauthResponseType = cognito.cognitoOauthResponseType;

  // v6 infers the region from the user pool ID prefix; there is no top-level `region` field anymore.
  const config = {
    Auth: {
      Cognito: {
        userPoolId: cognitoUserPoolId ?? "",
        userPoolClientId: cognitoUserPoolWebClientId ?? "",
        loginWith: {
          oauth: {
            scopes: cognitoOauthScope ?? [],
            domain: cognitoOauthDomain ?? "",
            redirectSignIn: cognitoOauthRedirectSignIn ? [cognitoOauthRedirectSignIn] : [],
            redirectSignOut: cognitoOauthRedirectSignOut ? [cognitoOauthRedirectSignOut] : [],
            responseType: (cognitoOauthResponseType === "token" ? "token" : "code") as
              "code" | "token",
          },
        },
      },
    },
  };

  Amplify.configure(config);
}
