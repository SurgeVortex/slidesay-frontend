import { MsalProvider } from '@azure/msal-react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type BrowserRouterProps, BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { msalInstance } from '../config/msal.config';
import LoginPage from '../pages/LoginPage';

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

describe('LoginPage', () => {
  it('renders the login page with app name', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /Test App/i })).toBeInTheDocument();
    expect(screen.getByText(/Sign in to continue/i)).toBeInTheDocument();
  });

  it('displays Microsoft sign in button', () => {
    renderWithProviders(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Sign in with Microsoft/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('aria-label', 'Sign in with Microsoft');
  });

  it('displays footer information', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/By signing in, you agree to our terms/i)).toBeInTheDocument();
    expect(screen.getByText(/Microsoft Entra ID/i)).toBeInTheDocument();
  });

  it('calls loginRedirect when button is clicked', async () => {
    const user = userEvent.setup();
    const loginRedirectSpy = vi.spyOn(msalInstance, 'loginRedirect').mockResolvedValue();

    renderWithProviders(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Sign in with Microsoft/i });
    await user.click(loginButton);

    expect(loginRedirectSpy).toHaveBeenCalledTimes(1);
    expect(loginRedirectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        scopes: expect.arrayContaining(['openid', 'profile', 'email', 'offline_access']),
      }),
    );

    loginRedirectSpy.mockRestore();
  });

  it('handles login errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const loginRedirectSpy = vi.spyOn(msalInstance, 'loginRedirect');
    loginRedirectSpy.mockRejectedValue(new Error('Login failed'));

    renderWithProviders(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Sign in with Microsoft/i });
    await user.click(loginButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));

    loginRedirectSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
