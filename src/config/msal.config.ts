/**
 * MSAL Authentication Configuration
 *
 * This configures Microsoft Authentication Library (MSAL) for Azure Entra External ID.
 * MSAL handles the OAuth2/OIDC flow, token management, and account switching.
 */

import { Configuration, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { config } from './app.config';

/**
 * MSAL Configuration
 *
 * - clientId: Your Azure AD application (client) ID
 * - authority: Your Entra External ID tenant authority URL
 * - redirectUri: Where Azure AD redirects after authentication
 * - postLogoutRedirectUri: Where to redirect after logout
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: config.azure.clientId || '',
    // CIAM (External ID) tenants use {subdomain}.ciamlogin.com
    // The subdomain is the tenant name (isonetcasa), NOT the custom domain (isonet.casa)
    authority: `https://${config.azure.ciamDomain || 'isonetcasa'}.ciamlogin.com/`,
    redirectUri: window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin + '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security
    storeAuthStateInCookie: false, // Set to true if you have issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;

        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
        }
      },
      logLevel: config.isDevelopment ? LogLevel.Verbose : LogLevel.Warning,
    },
  },
};

/**
 * Scopes for authentication requests
 *
 * Includes backend API scope for accessing protected endpoints.
 * The API scope is configured via VITE_AZURE_API_SCOPE environment variable.
 */
export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    'offline_access',
    ...(config.azure.apiScope ? [config.azure.apiScope] : []),
  ],
};

/**
 * Create and export the MSAL instance
 * This is a singleton that should be reused across your app
 */
export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Initialize MSAL
 * This handles redirect responses and must be called before rendering your app
 */
export async function initializeMsal(): Promise<void> {
  try {
    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();

    // Check if there are any accounts in the cache
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0 && accounts[0]) {
      // Set the first account as active
      msalInstance.setActiveAccount(accounts[0]);
    }
  } catch (error) {
    console.error('MSAL initialization error:', error);
    throw error;
  }
}
