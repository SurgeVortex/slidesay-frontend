/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/require-await */
import { type AuthenticationResult } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { msalInstance } from '../config/msal.config';
import { useAuth } from '../hooks/useAuth';

vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn(),
  useAccount: vi.fn(),
}));

const mockAccount = {
  homeAccountId: 'test-account-id',
  environment: 'login.windows.net',
  tenantId: 'test-tenant-id',
  username: 'test@example.com',
  localAccountId: 'test-local-id',
  name: 'Test User',
  idTokenClaims: {},
};

const mockAuthResult: AuthenticationResult = {
  authority: 'https://login.microsoftonline.com/test-tenant-id',
  uniqueId: 'test-unique-id',
  tenantId: 'test-tenant-id',
  scopes: ['User.Read'],
  account: mockAccount,
  idToken: 'test-id-token',
  idTokenClaims: {},
  accessToken: 'test-access-token',
  fromCache: false,
  expiresOn: new Date(Date.now() + 3600000),
  tokenType: 'Bearer',
  correlationId: 'test-correlation-id',
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('returns authenticated user when logged in', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(mockAccount);
    vi.spyOn(msalInstance, 'acquireTokenSilent').mockResolvedValue(mockAuthResult);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, user: {}, isNewUser: false }),
    } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.userId).toBe('test-local-id');
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('returns null user when not logged in', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(undefined as any);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('shows loading state while MSAL is initializing', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [],
      inProgress: 'login',
    } as any);
    vi.mocked(useAccount).mockReturnValue(undefined as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('does not call backend when acquireTokenSilent throws', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(mockAccount);

    vi.spyOn(msalInstance, 'acquireTokenSilent').mockRejectedValue(new Error('silent failure'));
    (global.fetch as unknown as ReturnType<typeof vi.fn>) = vi.fn();

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Could not obtain access token for backend authentication',
    );

    consoleWarnSpy.mockRestore();
  });

  it('handles 401 backend response gracefully', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(mockAccount);

    vi.spyOn(msalInstance, 'acquireTokenSilent').mockResolvedValue(mockAuthResult as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'unauthorized' }),
    } as unknown as Response);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Backend authentication failed: Invalid or expired token',
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Backend authentication failed, but user is authenticated with MSAL',
    );

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('handles 429 backend response gracefully', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(mockAccount);

    vi.spyOn(msalInstance, 'acquireTokenSilent').mockResolvedValue(mockAuthResult as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'rate limited' }),
    } as unknown as Response);

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('handles non-ok response with broken json by using fallback error object', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(mockAccount);

    vi.spyOn(msalInstance, 'acquireTokenSilent').mockResolvedValue(mockAuthResult as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('broken json');
      },
    } as unknown as Response);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Backend authentication failed, but user is authenticated with MSAL',
    );

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('handles network error when calling backend', async () => {
    vi.mocked(useMsal).mockReturnValue({
      instance: msalInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    } as any);
    vi.mocked(useAccount).mockReturnValue(mockAccount);

    vi.spyOn(msalInstance, 'acquireTokenSilent').mockResolvedValue(mockAuthResult as any);

    vi.mocked(global.fetch).mockRejectedValue(new Error('network failure'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to authenticate with backend:',
      expect.anything(),
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Backend authentication failed, but user is authenticated with MSAL',
    );

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
