import { describe, it, expect, vi } from 'vitest';
import * as msalReact from '@azure/msal-react';
import * as msalBrowser from '@azure/msal-browser';
import { useAuth, UserInfo } from './useAuth';
import { renderHook, act } from '@testing-library/react';

vi.mock('@azure/msal-react', async () => {
  const actual = await vi.importActual<typeof msalReact>('@azure/msal-react');
  return {
    ...actual,
    useMsal: vi.fn(),
    useAccount: vi.fn(),
  };
});

vi.mock('@azure/msal-browser', async () => {
  const actual = await vi.importActual<typeof msalBrowser>('@azure/msal-browser');
  return {
    ...actual,
    PublicClientApplication: vi.fn().mockImplementation(() => ({
      acquireTokenSilent: vi.fn(async () => ({ accessToken: 'fake-access-token' })),
      loginRedirect: vi.fn(),
      logoutRedirect: vi.fn(),
      getAllAccounts: vi.fn(() => []),
      setActiveAccount: vi.fn(),
    })),
  };
});

describe('useAuth hook', () => {
  it('Returns dev user when VITE_DEV_MODE is true', async () => {
    const oldEnv = import.meta.env.VITE_DEV_MODE;
    import.meta.env.VITE_DEV_MODE = 'true';
    const { result } = renderHook(() => useAuth());
    expect(result.current.user?.userId).toBe('dev-user');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    import.meta.env.VITE_DEV_MODE = oldEnv;
  });

  it('Calls login, logout, and getToken methods in dev mode', async () => {
    import.meta.env.VITE_DEV_MODE = 'true';
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login();
      result.current.logout();
      const token = await result.current.getToken();
      expect(token).toBe('dev-token');
    });
  });

  it('Returns MSAL user and provides auth actions when not in dev mode', async () => {
    import.meta.env.VITE_DEV_MODE = 'false';
    const fakeAccount = {
      localAccountId: 'user-id-123',
      username: 'john@example.com',
      name: 'John Example',
    };
    // Mock hooks
    (msalReact.useMsal as any).mockReturnValue({
      instance: {
        acquireTokenSilent: async () => ({ accessToken: 'test-token' }),
        loginRedirect: vi.fn(),
        logoutRedirect: vi.fn(),
      },
      accounts: [fakeAccount],
      inProgress: 'none',
    });
    (msalReact.useAccount as any).mockReturnValue(fakeAccount);
    const { result } = renderHook(() => useAuth());
    expect(result.current.user?.userId).toBe('user-id-123');
    expect(result.current.isAuthenticated).toBe(true);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.getToken).toBe('function');
  });
});
