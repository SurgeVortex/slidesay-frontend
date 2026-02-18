import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { type BrowserRouterProps, BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

// React Router v7 future flags - types not yet updated
interface BrowserRouterPropsWithFuture extends BrowserRouterProps {
  future?: {
    v7_startTransition?: boolean;
    v7_relativeSplatPath?: boolean;
  };
}

/**
 * Integration test for App component
 *
 * This test renders the REAL App component with actual routing.
 * We only mock the MSAL authentication library (external Microsoft service),
 * but everything else (routing, components, state) is real.
 */

// Mock MSAL authentication (external Microsoft service)
vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: unknown }) => children,
  useMsal: () => ({
    instance: {},
    accounts: [],
    inProgress: 'none',
  }),
  useAccount: () => null,
}));

describe('App', () => {
  it('renders the application and shows landing page for unauthenticated users', async () => {
    // Wrap App with BrowserRouter since main.tsx does this in production
    render(
      <BrowserRouter
        {...({
          future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          },
        } as BrowserRouterPropsWithFuture)}
      >
        <App />
      </BrowserRouter>,
    );

    // Wait for the landing page to render
    // Since we mocked MSAL to return no accounts, user should see landing page
    await waitFor(() => {
      // Look for the main hero heading specifically (h1)
      const heading = screen.getByRole('heading', { level: 1, name: /welcome to default app/i });
      expect(heading).toBeInTheDocument();
    });

    // Should have a "Get Started" link (it's an anchor tag, not a button)
    const getStartedLink = screen.getByRole('link', { name: /get started/i });
    expect(getStartedLink).toBeInTheDocument();
  });
});
