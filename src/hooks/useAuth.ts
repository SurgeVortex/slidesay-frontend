import { type AccountInfo, type IPublicClientApplication } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { useCallback, useEffect, useState } from 'react';
import { config } from '../config/app.config';
import { loginRequest } from '../config/msal.config';

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

async function getAccessToken(instance: IPublicClientApplication, account: AccountInfo): Promise<string | null> {
  try {
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account
    });
    return response.accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

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

function useMsalAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || undefined);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Login wrapper
  const login = useCallback(async () => {
    await instance.loginRedirect(loginRequest);
  }, [instance]);

  // Logout wrapper
  const logout = useCallback(() => {
    instance.logoutRedirect();
  }, [instance]);

  const getToken = useCallback(async () => {
    if (account) {
      return await getAccessToken(instance, account);
    }
    return null;
  }, [account, instance]);

  useEffect(() => {
    async function processUser() {
      if (inProgress !== 'none') {
        setIsLoading(true);
        return;
      }
      if (!account) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      const userInfo: UserInfo = {
        userId: account.localAccountId,
        userDetails: account.username,
        identityProvider: 'aad',
        userRoles: [],
        displayName: account.name || account.username,
        email: account.username,
      };
      setUser(userInfo);
      setIsAuthenticated(true);
      setIsLoading(false);
      // Backend authentication (optional)
      const token = await getAccessToken(instance, account);
      if (token) {
        const backendResponse = await authenticateWithBackend(token);
        if (backendResponse?.success) {
          // Backend sync logged
        } else {
          // Backend sync failed, but don't force logout for now
        }
      }
    }
    void processUser();
  }, [account, inProgress, instance]);

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
    login: async () => {},
    logout: () => {},
    getToken: async () => 'dev-token',
  };
}

export const useAuth = import.meta.env.VITE_DEV_MODE === 'true' ? useDevAuth : useMsalAuth;
