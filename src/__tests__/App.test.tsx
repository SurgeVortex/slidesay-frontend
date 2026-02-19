import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: unknown }) => children,
  useMsal: () => ({ instance: {}, accounts: [], inProgress: 'none' }),
  useAccount: () => null,
}));

describe('App', () => {
  it('renders the application and shows landing page for unauthenticated users', async () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/say it\. slide it\. ship it\./i)).toBeInTheDocument();
    });
  });
});
