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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: Record<string, any> = {
    Auth: {
      region: cognitoRegion,
      userPoolId: cognitoUserPoolId,
      userPoolWebClientId: cognitoUserPoolWebClientId,
      oauth: {
        scope: cognitoOauthScope,
        domain: cognitoOauthDomain,
        redirectSignIn: cognitoOauthRedirectSignIn,
        redirectSignOut: cognitoOauthRedirectSignOut,
        responseType: cognitoOauthResponseType,
      },
    },
  };

  Amplify.configure(config);
}
