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
  const cognitoRegion = cognito.cognitoRegion;
  const cognitoUserPoolId = cognito.cognitoUserPoolId;
  const cognitoUserPoolWebClientId = cognito.cognitoUserPoolWebClientId;
  const cognitoOauthScope = cognito.cognitoOauthScope?.split(", ");
  const cognitoOauthDomain = cognito.cognitoOauthDomain;
  const cognitoOauthRedirectSignIn = cognito.cognitoOauthRedirectSignIn;
  const cognitoOauthRedirectSignOut = cognito.cognitoOauthRedirectSignOut;
  const cognitoOauthResponseType = cognito.cognitoOauthResponseType;

  if (!cognitoRegion || !cognitoUserPoolId || !cognitoUserPoolWebClientId) {
    return;
  }

  const config = {
    Auth: {
      Cognito: {
        userPoolId: cognitoUserPoolId,
        userPoolClientId: cognitoUserPoolWebClientId,
        ...(cognitoOauthDomain && {
          loginWith: {
            oauth: {
              domain: cognitoOauthDomain,
              scopes: cognitoOauthScope || [],
              redirectSignIn: [cognitoOauthRedirectSignIn || ""],
              redirectSignOut: [cognitoOauthRedirectSignOut || ""],
              responseType: (cognitoOauthResponseType as "code" | "token") || "code",
            },
          },
        }),
      },
    },
  };

  Amplify.configure(config);
}
