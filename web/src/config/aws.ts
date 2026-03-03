import { Amplify } from "aws-amplify";

export type CognitoParams = {
  cognitoOauthDomain?: string;
  cognitoOauthRedirectSignIn?: string;
  cognitoOauthRedirectSignOut?: string;
  cognitoOauthResponseType?: string;
  cognitoOauthScope?: string;
  cognitoRegion?: string;
  cognitoUserPoolId?: string;
  cognitoUserPoolWebClientId?: string;
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

  const config = {
    Auth: {
      oauth: {
        domain: cognitoOauthDomain,
        redirectSignIn: cognitoOauthRedirectSignIn,
        redirectSignOut: cognitoOauthRedirectSignOut,
        responseType: cognitoOauthResponseType,
        scope: cognitoOauthScope,
      },
      region: cognitoRegion,
      userPoolId: cognitoUserPoolId,
      userPoolWebClientId: cognitoUserPoolWebClientId,
    },
  };

  Amplify.configure(config);
}
