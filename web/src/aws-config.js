import { Amplify } from "aws-amplify";

const authProvider = window.REEARTH_CONFIG?.authProvider;

const config = {
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_n8XjlY5Uh",
    userPoolWebClientId: "6hjs66pcd8gt6cbot4086ualtf",
  },
};

if (authProvider === "cognito") {
  Amplify.configure(config);
}
