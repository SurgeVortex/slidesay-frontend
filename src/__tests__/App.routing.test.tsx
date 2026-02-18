import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

// Use vi.hoisted to create mock function that is hoisted along with vi.mock
const { mockUseAuthFn } = vi.hoisted(() => ({
  mockUseAuthFn: vi.fn(),
}));

// Mock the local useAuth hook so we can control auth state per test
vi.mock('../hooks/useAuth', () => ({
  useAuth: mockUseAuthFn,
}));

// Mock MSAL provider to avoid external side effects
vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: unknown }) => children,
  useMsal: () => ({ instance: {}, accounts: [], inProgress: 'none' }),
}));

describe('App routing and auth flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows WelcomePage for authenticated users at root', async () => {
    mockUseAuthFn.mockReturnValue({
      user: {
        userId: '1',
        displayName: 'Auth User',
        email: 'a@b.com',
        identityProvider: 'azure',
        userRoles: [],
      },
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /welcome to/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated users from /welcome to landing page', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /welcome to default app/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('fallback route redirects: authenticated -> /welcome, unauthenticated -> /', async () => {
    // Authenticated
    mockUseAuthFn.mockReturnValue({
      user: {
        userId: '2',
        displayName: 'Auth Two',
        email: 'b@c.com',
        identityProvider: 'azure',
        userRoles: [],
      },
      isLoading: false,
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const welcomeHeading = screen.getByRole('heading', { level: 1, name: /welcome to/i });
      expect(welcomeHeading).toBeInTheDocument();
    });

    // Unauthenticated: rerender with same initial entry
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });

    rerender(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const landingHeading = screen.getByRole('heading', {
        level: 1,
        name: /welcome to default app/i,
      });
      expect(landingHeading).toBeInTheDocument();
    });
  });
});

describe('Auth state transitions (INT-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows LoadingPage while auth is initializing', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: true });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // Loading page should show a loading indicator
      const loadingText = screen.getByText(/loading/i);
      expect(loadingText).toBeInTheDocument();
    });
  });

  it('transitions from loading to authenticated state', async () => {
    // Start with loading state
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: true });

    const { rerender } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Should show loading initially
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    // Transition to authenticated
    mockUseAuthFn.mockReturnValue({
      user: {
        userId: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        identityProvider: 'azure',
        userRoles: [],
      },
      isLoading: false,
    });

    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Should now show welcome page
    await waitFor(() => {
      const welcomeHeading = screen.getByRole('heading', { level: 1, name: /welcome to/i });
      expect(welcomeHeading).toBeInTheDocument();
    });
  });

  it('transitions from loading to unauthenticated state', async () => {
    // Start with loading state
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: true });

    const { rerender } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Should show loading initially
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    // Transition to unauthenticated
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });

    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Should now show landing page
    await waitFor(() => {
      const landingHeading = screen.getByRole('heading', {
        level: 1,
        name: /welcome to default app/i,
      });
      expect(landingHeading).toBeInTheDocument();
    });
  });

  it('shows LoginPage for unauthenticated users at /login', async () => {
    mockUseAuthFn.mockReturnValue({ user: null, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const signInButton = screen.getByRole('button', { name: /sign in with microsoft/i });
      expect(signInButton).toBeInTheDocument();
    });
  });

  it('redirects authenticated users away from /login to /welcome', async () => {
    mockUseAuthFn.mockReturnValue({
      user: {
        userId: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        identityProvider: 'azure',
        userRoles: [],
      },
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const welcomeHeading = screen.getByRole('heading', { level: 1, name: /welcome to/i });
      expect(welcomeHeading).toBeInTheDocument();
    });
  });

  it('displays user name on WelcomePage after successful auth', async () => {
    mockUseAuthFn.mockReturnValue({
      user: {
        userId: '1',
        displayName: 'John Doe',
        email: 'john@example.com',
        identityProvider: 'azure',
        userRoles: [],
      },
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/welcome']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Welcome page should display user info
      const welcomeText = screen.getByText(/John Doe/i);
      expect(welcomeText).toBeInTheDocument();
    });
  });
});
