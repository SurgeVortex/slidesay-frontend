import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, checkHealth, getUserProfile } from '../utils/api';

// Mock MSAL and config
vi.mock('../config/msal.config', () => ({
  msalInstance: {
    getActiveAccount: vi.fn(() => ({ username: 'test@example.com' })),
    acquireTokenSilent: vi.fn(() => Promise.resolve({ accessToken: 'test-token' })),
  },
  loginRequest: { scopes: ['openid'] },
}));

vi.mock('../config/app.config', () => ({
  config: {
    apiUrl: 'https://api.example.com',
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('API Utilities', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('apiRequest', () => {
    it('should make successful API request', async () => {
      const mockData = { id: '1', name: 'Test' };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }) as Record<string, string>,
        }),
      );
    });

    it('should handle 401 unauthorized', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await apiRequest('/protected');

      expect(result.status).toBe(401);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle rate limiting', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Retry-After', '60');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: mockHeaders,
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(429);
      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should handle 400 bad request with validation errors', async () => {
      const validationError = {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { email: 'Invalid email format' },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(validationError),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(400);
      expect(result.error).toEqual(validationError);
    });

    it('should handle 400 bad request with broken JSON fallback', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error('JSON parse error')),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(400);
      expect(result.error?.error).toBe('Bad request');
    });

    it('should handle 500 server error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(500);
      expect(result.error?.code).toBe('SERVER_ERROR');
    });

    it('should handle 503 service unavailable', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(503);
      expect(result.error?.code).toBe('SERVER_ERROR');
    });

    it('should handle network error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network failure'),
      );

      const result = await apiRequest('/test');

      expect(result.status).toBe(0);
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.error).toBe('Network failure');
    });

    it('should handle non-Error network failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce('Unknown error');

      const result = await apiRequest('/test');

      expect(result.status).toBe(0);
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.error).toBe('Network error');
    });

    it('should handle successful response with broken JSON', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('JSON parse error')),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(200);
      expect(result.data).toBeNull();
    });

    it('should handle unknown error status with parseable JSON', async () => {
      const errorResponse = { error: 'Forbidden', code: 'FORBIDDEN' };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(403);
      expect(result.error).toEqual(errorResponse);
    });

    it('should handle unknown error status with broken JSON', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.reject(new Error('JSON parse error')),
      });

      const result = await apiRequest('/test');

      expect(result.status).toBe(403);
      expect(result.error?.error).toBe('Unknown error');
    });

    it('should pass custom headers', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await apiRequest('/test', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }) as Record<string, string>,
        }),
      );
    });

    it('should pass request body for POST', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'new-item' }),
      });

      const result = await apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Item' }),
      });

      expect(result.status).toBe(201);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Item' }),
        }),
      );
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {
        id: '123',
        userId: 'user-456',
        email: 'test@example.com',
        displayName: 'Test User',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-02T00:00:00Z',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProfile),
      });

      const result = await getUserProfile();

      expect(result.data).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/user/profile',
        expect.any(Object),
      );
    });
  });

  describe('checkHealth', () => {
    it('should check backend health', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        services: { database: 'up' },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockHealth),
      });

      const result = await checkHealth();

      expect(result.data).toEqual(mockHealth);
    });

    it('should handle health check failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      const result = await checkHealth();

      expect(result.status).toBe(503);
      expect(result.error?.code).toBe('SERVER_ERROR');
    });

    it('should call correct endpoint', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'healthy' }),
      });

      await checkHealth();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/health',
        expect.any(Object),
      );
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: '123',
        userId: 'user-456',
        email: 'test@example.com',
        displayName: 'Test User',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-02T00:00:00Z',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProfile),
      });

      const result = await getUserProfile();

      expect(result.data).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/user/profile',
        expect.any(Object),
      );
    });

    it('should handle profile fetch unauthorized', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await getUserProfile();

      expect(result.status).toBe(401);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle profile fetch network error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const result = await getUserProfile();

      expect(result.status).toBe(0);
      expect(result.error?.code).toBe('NETWORK_ERROR');
    });
  });
});
