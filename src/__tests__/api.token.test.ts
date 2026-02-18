import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Create mockable MSAL instance
const mockMsalInstance = {
  getActiveAccount: vi.fn(),
  acquireTokenSilent: vi.fn(),
  acquireTokenPopup: vi.fn(),
};

vi.mock('../config/msal.config', () => ({
  msalInstance: mockMsalInstance,
  loginRequest: { scopes: ['User.Read'] },
}));

vi.mock('../config/app.config', () => ({
  config: {
    apiUrl: 'https://api.example.com',
  },
}));

// Must import after mocks are set up
const { apiRequest } = await import('../utils/api');

describe('API Token Acquisition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global.fetch for the module under test
    const mockedFetch = vi.fn() as unknown as typeof global.fetch;
    global.fetch = mockedFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAccessToken behavior', () => {
    it('should return UNAUTHORIZED when no active account', async () => {
      mockMsalInstance.getActiveAccount.mockReturnValue(null);

      const result = await apiRequest('/test');

      expect(result.status).toBe(401);
      expect(result.error?.code).toBe('UNAUTHORIZED');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should use silent token acquisition successfully', async () => {
      mockMsalInstance.getActiveAccount.mockReturnValue({ username: 'test@example.com' });
      mockMsalInstance.acquireTokenSilent.mockResolvedValue({ accessToken: 'silent-token' });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'success' }),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer silent-token',
          }) as Record<string, string>,
        }),
      );
    });

    it('should fall back to popup when silent acquisition fails with InteractionRequiredAuthError', async () => {
      mockMsalInstance.getActiveAccount.mockReturnValue({ username: 'test@example.com' });
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(
        new InteractionRequiredAuthError('interaction_required'),
      );
      mockMsalInstance.acquireTokenPopup.mockResolvedValue({ accessToken: 'popup-token' });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'success' }),
      });

      const result = await apiRequest('/test');

      expect(mockMsalInstance.acquireTokenPopup).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer popup-token',
          }) as Record<string, string>,
        }),
      );
    });

    it('should return UNAUTHORIZED when popup acquisition also fails', async () => {
      mockMsalInstance.getActiveAccount.mockReturnValue({ username: 'test@example.com' });
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(
        new InteractionRequiredAuthError('interaction_required'),
      );
      mockMsalInstance.acquireTokenPopup.mockRejectedValue(new Error('Popup blocked'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await apiRequest('/test');

      expect(result.status).toBe(401);
      expect(result.error?.code).toBe('UNAUTHORIZED');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to acquire token via popup:',
        expect.any(Error),
      );
      expect(global.fetch).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return UNAUTHORIZED when silent fails with non-interaction error', async () => {
      mockMsalInstance.getActiveAccount.mockReturnValue({ username: 'test@example.com' });
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(new Error('Token cache error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await apiRequest('/test');

      expect(result.status).toBe(401);
      expect(result.error?.code).toBe('UNAUTHORIZED');
      expect(mockMsalInstance.acquireTokenPopup).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to acquire token:', expect.any(Error));
      expect(global.fetch).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
