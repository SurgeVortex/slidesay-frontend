import { type AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type BrowserRouterProps, BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { msalInstance } from '../config/msal.config';
import { type UserInfo } from '../hooks/useAuth';
import WelcomePage from '../pages/WelcomePage';
import * as api from '../utils/api';

// React Router v7 future flags - types not yet updated
interface BrowserRouterPropsWithFuture extends BrowserRouterProps {
  future?: {
    v7_startTransition?: boolean;
    v7_relativeSplatPath?: boolean;
  };
}

// Mock the config
vi.mock('../config/app.config', () => ({
  config: {
    appName: 'Test App',
    apiUrl: 'http://localhost:7071',
    azure: {
      tenantId: 'test-tenant-id',
    },
    monitoring: {
      grafanaCloudUrl: 'https://test.grafana.com',
      grafanaApiKey: 'test-key',
    },
    isDevelopment: true,
    isProduction: false,
    environment: 'test',
  },
}));

// Mock API functions
vi.mock('../utils/api');

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

const mockUser: UserInfo = {
  userId: 'test-local-id',
  userDetails: 'test@example.com',
  identityProvider: 'aad',
  userRoles: ['authenticated'],
  displayName: 'Test User',
  email: 'test@example.com',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderWithProviders(component: any) {
  return render(
    <MsalProvider instance={msalInstance}>
      <BrowserRouter
        {...({
          future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          },
        } as BrowserRouterPropsWithFuture)}
      >
        {component}
      </BrowserRouter>
    </MsalProvider>,
  );
}

describe('WelcomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(msalInstance, 'getAllAccounts').mockReturnValue([mockAccount]);
    vi.spyOn(msalInstance, 'acquireTokenSilent').mockResolvedValue(mockAuthResult);
  });

  it('renders welcome message', async () => {
    vi.mocked(api.checkHealth).mockResolvedValue({
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {},
      },
      status: 200,
    });
    vi.mocked(api.getUserProfile).mockResolvedValue({ status: 200 });

    renderWithProviders(<WelcomePage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Welcome to Test App/i })).toBeInTheDocument();
    });
  });

  it('displays user information', async () => {
    vi.mocked(api.checkHealth).mockResolvedValue({ status: 200 });
    vi.mocked(api.getUserProfile).mockResolvedValue({ status: 200 });

    renderWithProviders(<WelcomePage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/User ID:/i)).toBeInTheDocument();
      expect(screen.getByText(/test-local-id/i)).toBeInTheDocument();
      expect(screen.getByText(/aad/i)).toBeInTheDocument();
    });
  });

  it('displays sign out button', async () => {
    vi.mocked(api.checkHealth).mockResolvedValue({ status: 200 });
    vi.mocked(api.getUserProfile).mockResolvedValue({ status: 200 });

    renderWithProviders(<WelcomePage user={mockUser} />);

    await waitFor(() => {
      const signOutButton = screen.getByRole('button', { name: /Sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });
  });

  it('calls logoutRedirect when sign out is clicked', async () => {
    const user = userEvent.setup();
    const logoutRedirectSpy = vi.spyOn(msalInstance, 'logoutRedirect').mockResolvedValue();

    vi.mocked(api.checkHealth).mockResolvedValue({ status: 200 });
    vi.mocked(api.getUserProfile).mockResolvedValue({ status: 200 });

    renderWithProviders(<WelcomePage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign out/i })).toBeInTheDocument();
    });

    const signOutButton = screen.getByRole('button', { name: /Sign out/i });
    await user.click(signOutButton);

    expect(logoutRedirectSpy).toHaveBeenCalledTimes(1);

    logoutRedirectSpy.mockRestore();
  });

  it('fetches and displays backend health status', async () => {
    vi.mocked(api.checkHealth).mockResolvedValue({
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: { database: 'connected' },
      },
      status: 200,
    });
    vi.mocked(api.getUserProfile).mockResolvedValue({ status: 200 });

    renderWithProviders(<WelcomePage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Backend Status:/i)).toBeInTheDocument();
      expect(screen.getByText(/ok \(v1\.0\.0\)/i)).toBeInTheDocument();
    });

    expect(api.checkHealth).toHaveBeenCalledTimes(1);
  });

  it('displays monitoring active status', async () => {
    vi.mocked(api.checkHealth).mockResolvedValue({ status: 200 });
    vi.mocked(api.getUserProfile).mockResolvedValue({ status: 200 });

    renderWithProviders(<WelcomePage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Monitoring Active/i)).toBeInTheDocument();
    });
  });
});
