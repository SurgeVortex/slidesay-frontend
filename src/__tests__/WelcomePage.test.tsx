import { MsalProvider } from '@azure/msal-react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { msalInstance } from '../config/msal.config';
import { type UserInfo } from '../hooks/useAuth';
import WelcomePage from '../pages/WelcomePage';

vi.mock('../config/app.config', () => ({
  config: {
    appName: 'SlideSay',
    apiUrl: 'http://localhost:7071',
    azure: { tenantId: 'test-tenant-id' },
    monitoring: { grafanaCloudUrl: '', grafanaApiKey: '' },
    isDevelopment: true,
    isProduction: false,
    environment: 'test',
  },
}));

const mockUser: UserInfo = {
  userId: 'test-user-id',
  displayName: 'Test User',
  email: 'test@example.com',
  identityProvider: 'aad',
  userRoles: ['authenticated'],
  userDetails: 'test@example.com',
};

function renderWelcome(user: UserInfo = mockUser) {
  return render(
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <WelcomePage user={user} />
      </BrowserRouter>
    </MsalProvider>,
  );
}

describe('WelcomePage', () => {
  it('renders welcome message with user name', () => {
    renderWelcome();
    expect(screen.getByText(/Hey Test/)).toBeInTheDocument();
  });

  it('shows app tagline', () => {
    renderWelcome();
    expect(screen.getByText(/say it, slide it, ship it/i)).toBeInTheDocument();
  });

  it('renders action cards with links', () => {
    renderWelcome();
    expect(screen.getByText('New Presentation')).toBeInTheDocument();
    expect(screen.getByText('My Library')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('has navigation links to correct routes', () => {
    renderWelcome();
    const recordLink = screen.getByText('New Presentation').closest('a');
    const libraryLink = screen.getByText('My Library').closest('a');
    const profileLink = screen.getByText('Profile').closest('a');
    expect(recordLink).toHaveAttribute('href', '/record');
    expect(libraryLink).toHaveAttribute('href', '/library');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('shows sign out button', () => {
    renderWelcome();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('displays user name in nav', () => {
    renderWelcome();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('handles user with no display name', () => {
    renderWelcome({ ...mockUser, displayName: '', email: 'test@example.com' });
    expect(screen.getByText(/Hey test/)).toBeInTheDocument();
  });
});
