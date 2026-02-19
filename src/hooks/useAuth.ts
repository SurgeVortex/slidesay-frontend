import { type AccountInfo, type IPublicClientApplication } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { config } from '../config/app.config';

export interface UserInfo {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
  claims?: Array<{ typ: string; val: string }>;
  displayName?: string;
  email?: string;
}

interface BackendUserResponse {
  success: boolean;
  user: {
    id: string;
    userId: string;
    email: string;
    displayName: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string;
  };
  isNewUser: boolean;
}

/**
 * Get access token from MSAL
 */
async function getAccessToken(
  instance: IPublicClientApplication,
  account: AccountInfo,
): Promise<string | null> {
  try {
    const response = await instance.acquireTokenSilent({
      scopes: ['User.Read'],
      account: account,
    });
    return response.accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Authenticate with backend using JWT token
 */
async function authenticateWithBackend(token: string): Promise<BackendUserResponse | null> {
  try {
    const response = await fetch(`${config.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      }),
    });

    if (response.status === 401) {
      console.error('Backend authentication failed: Invalid or expired token');
      return null;
    }

    if (response.status === 429) {
      console.warn('Rate limit exceeded, will retry later');
      return null;
    }

    if (!response.ok) {
      const error: unknown = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend authentication failed:', error);
      return null;
    }

    const data: unknown = await response.json();
    return data as BackendUserResponse;
  } catch (error) {
    console.error('Failed to authenticate with backend:', error);
    return null;
  }
}

/**
 * useAuth hook - Uses MSAL for authentication
 *
 * This hook integrates with Microsoft Authentication Library (MSAL)
 * to provide authentication state and user information.
 */
function useMsalAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || undefined);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function processUser() {
      // Wait for MSAL to finish initializing
      if (inProgress !== 'none') {
        setIsLoading(true);
        return;
      }

      // No authenticated user
      if (!account) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Convert MSAL account to UserInfo format
      const userInfo: UserInfo = {
        userId: account.localAccountId,
        userDetails: account.username,
        identityProvider: 'aad',
        userRoles: [],
        displayName: account.name || account.username,
        email: account.username,
      };

      setUser(userInfo);
      setIsLoading(false);

      // Authenticate with backend using access token
      const token = await getAccessToken(instance, account);
      if (token) {
        const backendResponse = await authenticateWithBackend(token);
        if (backendResponse?.success) {
          console.log(
            backendResponse.isNewUser
              ? 'New user registered in backend'
              : 'User authenticated with backend',
          );
        } else {
          console.warn('Backend authentication failed, but user is authenticated with MSAL');
        }
      } else {
        console.warn('Could not obtain access token for backend authentication');
      }
    }

    void processUser();
  }, [account, inProgress, instance]);

  const isAuthenticated = !!user;

  const login = () => {
    void instance.loginRedirect({ scopes: ['User.Read'] });
  };

  const logout = () => {
    void instance.logoutRedirect();
  };

  const getToken = async (): Promise<string | null> => {
    if (!account) return null;
    return await getAccessToken(instance, account);
  };

  return { user, isAuthenticated, isLoading, login, logout, getToken };
}

function useDevAuth() {
  return {
    user: {
      userId: 'dev-user',
      userDetails: 'dev@test.com',
      identityProvider: 'dev',
      userRoles: ['user'],
      displayName: 'Dev User',
      email: 'dev@test.com',
    } as UserInfo,
    isAuthenticated: true,
    isLoading: false,
    login: () => {},
    logout: () => {},
    getToken: async () => 'dev-token',
  };
}

// Use module-scope env check to satisfy Rules of Hooks
export const useAuth = import.meta.env.VITE_DEV_MODE === 'true' ? useDevAuth : useMsalAuth;

// Export both for tests
export { useMsalAuth, useDevAuth };
