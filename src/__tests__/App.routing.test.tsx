import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const { mockUseAuthFn } = vi.hoisted(() => ({
  mockUseAuthFn: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: mockUseAuthFn,
}));

vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: unknown }) => children,
  useMsal: () => ({ instance: {}, accounts: [], inProgress: 'none' }),
}));

function renderApp(route?: string) {
  const Router = route ? MemoryRouter : BrowserRouter;
  const routerProps = route ? { initialEntries: [route] } : {};
  return render(
    <HelmetProvider>
      <Router {...routerProps}>
        <App />
      </Router>
    </HelmetProvider>,
  );
}

describe('App routing and auth flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows landing page for unauthenticated users at root', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByText(/say it\. slide it\. ship it\./i)).toBeInTheDocument();
    });
  });

  it('shows WelcomePage for authenticated users navigating to /welcome', async () => {
    mockUseAuthFn.mockReturnValue({
      user: { userId: '1', displayName: 'Auth User', email: 'a@b.com', identityProvider: 'azure', userRoles: [] },
      isLoading: false,
    });
    renderApp('/welcome');
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /welcome to/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated users from /welcome to login page', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });
    renderApp('/welcome');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
    });
  });

  it('fallback route redirects: authenticated -> /welcome, unauthenticated -> /', async () => {
    mockUseAuthFn.mockReturnValue({
      user: { userId: '2', displayName: 'Auth Two', email: 'b@c.com', identityProvider: 'azure', userRoles: [] },
      isLoading: false,
    });
    const { rerender } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /welcome to/i })).toBeInTheDocument();
    });

    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });
    rerender(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
    });
  });
});

describe('Auth state transitions (INT-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows LoadingPage while auth is initializing', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: true });
    renderApp();
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('transitions from loading to authenticated state', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: true });
    const { rerender } = render(
      <HelmetProvider><BrowserRouter><App /></BrowserRouter></HelmetProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    mockUseAuthFn.mockReturnValue({
      user: { userId: '1', displayName: 'Test User', email: 'test@example.com', identityProvider: 'azure', userRoles: [] },
      isLoading: false,
    });
    rerender(
      <HelmetProvider><BrowserRouter><App /></BrowserRouter></HelmetProvider>,
    );
    // Unauthenticated at root shows landing page (auth users need to navigate to /welcome)
    await waitFor(() => {
      expect(screen.getByText(/say it\. slide it\. ship it\./i)).toBeInTheDocument();
    });
  });

  it('transitions from loading to unauthenticated state', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: true });
    const { rerender } = render(
      <HelmetProvider><BrowserRouter><App /></BrowserRouter></HelmetProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });
    rerender(
      <HelmetProvider><BrowserRouter><App /></BrowserRouter></HelmetProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/say it\. slide it\. ship it\./i)).toBeInTheDocument();
    });
  });

  it('shows LoginPage for unauthenticated users at /login', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });
    renderApp('/login');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
    });
  });

  it('redirects authenticated users away from /login to /welcome', async () => {
    mockUseAuthFn.mockReturnValue({
      user: { userId: '1', displayName: 'Test User', email: 'test@example.com', identityProvider: 'azure', userRoles: [] },
      isLoading: false,
    });
    renderApp('/login');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /welcome to/i })).toBeInTheDocument();
    });
  });

  it('displays user name on WelcomePage after successful auth', async () => {
    mockUseAuthFn.mockReturnValue({
      user: { userId: '1', displayName: 'John Doe', email: 'john@example.com', identityProvider: 'azure', userRoles: [] },
      isLoading: false,
    });
    renderApp('/welcome');
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });
});
