import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN],
            redirectSignOut: [import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT],
            responseType: 'code',
          },
        },
      },
    },
  });
};
