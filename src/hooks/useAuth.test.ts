import { describe, it, expect, vi } from 'vitest';
import * as msalReact from '@azure/msal-react';
import * as msalBrowser from '@azure/msal-browser';
import { useDevAuth, useMsalAuth } from './useAuth';
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
  it('Returns dev user for useDevAuth', () => {
    const { result } = renderHook(() => useDevAuth());
    expect(result.current.user?.userId).toBe('dev-user');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('Calls login, logout, and getToken methods in dev mode', async () => {
    const { result } = renderHook(() => useDevAuth());
    await act(async () => {
      await result.current.login();
      result.current.logout();
      const token = await result.current.getToken();
      expect(token).toBe('dev-token');
    });
  });

  it('Returns MSAL user and provides auth actions for useMsalAuth', async () => {
    const fakeAccount = {
      localAccountId: 'user-id-123',
      username: 'john@example.com',
      name: 'John Example',
    };
    vi.mocked(msalReact.useMsal).mockReturnValue({
      instance: {
        acquireTokenSilent: vi.fn().mockResolvedValue({ accessToken: 'test-token' }),
        loginRedirect: vi.fn(),
        logoutRedirect: vi.fn(),
      },
      accounts: [fakeAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(msalReact.useAccount).mockReturnValue(fakeAccount as any);
    const { result } = renderHook(() => useMsalAuth());
    expect(result.current.user?.userId).toBe('user-id-123');
    expect(result.current.isAuthenticated).toBe(true);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.getToken).toBe('function');
  });
});
