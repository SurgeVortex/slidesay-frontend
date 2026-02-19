import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { config } from '../config/app.config';
import { loginRequest, msalInstance } from '../config/msal.config';

/**
 * Get access token from MSAL
 */
async function getAccessToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  try {
    // Try to acquire token silently
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Fall back to interactive method
      try {
        const response = await msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error('Failed to acquire token via popup:', popupError);
        return null;
      }
    }
    console.error('Failed to acquire token:', error);
    return null;
  }
}

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Make authenticated API request to backend
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: ApiError; status: number }> {
  const token = await getAccessToken();

  if (!token) {
    return {
      error: { error: 'Authentication required', code: 'UNAUTHORIZED' },
      status: 401,
    };
  }

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle rate limiting with exponential backoff
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.warn(`Rate limited. Retry after: ${retryAfter || 'unknown'}`);
      return {
        error: { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
        status: 429,
      };
    }

    // Handle authentication errors
    if (response.status === 401) {
      return {
        error: { error: 'Authentication required', code: 'UNAUTHORIZED' },
        status: 401,
      };
    }

    // Handle validation errors
    if (response.status === 400) {
      const errorData: unknown = await response.json().catch(() => ({ error: 'Bad request' }));
      return {
        error: errorData as ApiError,
        status: 400,
      };
    }

    // Handle server errors
    if (response.status >= 500) {
      return {
        error: { error: 'Server error', code: 'SERVER_ERROR' },
        status: response.status,
      };
    }

    // Success response
    if (response.ok) {
      const data: unknown = await response.json().catch(() => null);
      return { data: data as T, status: response.status };
    }

    // Unknown error
    const errorData: unknown = await response.json().catch(() => ({ error: 'Unknown error' }));
    return {
      error: errorData as ApiError,
      status: response.status,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: {
        error: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
      status: 0,
    };
  }
}

/**
 * Get user profile from backend
 */
export async function getUserProfile() {
  return apiRequest<{
    id: string;
    userId: string;
    email: string;
    displayName: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string;
  }>('/api/user/profile');
}

/**
 * Check backend health
 */
export async function checkHealth() {
  return apiRequest<{
    status: string;
    timestamp: string;
    version: string;
    services: Record<string, string>;
  }>('/api/health');
}

/**
 * Generate a presentation from voice transcript
 */
export async function generatePresentation(transcript: string, title?: string) {
  return apiRequest<{
    id: string;
    title: string;
    slides: Array<{ title: string; content: string[] }>;
    transcript: string;
    createdAt: string;
  }>('/api/presentations', {
    method: 'POST',
    body: JSON.stringify({ transcript, title: title || '', slides: null }),
  });
}

