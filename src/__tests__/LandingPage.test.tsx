import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LandingPage from '../pages/LandingPage';

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe('LandingPage - Learn More button', () => {
  it('scrolls to features section when Learn More is clicked', async () => {
    const scrollIntoViewMock = vi.fn();
    const originalGetElementById = document.getElementById.bind(document);

    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      const element = originalGetElementById(id);
      if (id === 'features' && element) {
        // assign mock implementation to the element's scrollIntoView
        element.scrollIntoView = scrollIntoViewMock;
      }
      return element;
    });

    renderWithRouter(<LandingPage />);

    const user = userEvent.setup();
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i });
    await user.click(learnMoreButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    vi.restoreAllMocks();
  });

  it('handles missing features element gracefully', async () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    renderWithRouter(<LandingPage />);

    const user = userEvent.setup();
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i });

    // Should not throw when features element is missing
    await expect(user.click(learnMoreButton)).resolves.not.toThrow();

    vi.restoreAllMocks();
  });
});

describe('LandingPage - accessibility', () => {
  it('has accessible navigation landmark', () => {
    renderWithRouter(<LandingPage />);

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('has accessible main content landmark', () => {
    renderWithRouter(<LandingPage />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('displays the app logo in navigation', () => {
    renderWithRouter(<LandingPage />);

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    const logo = within(nav).getByRole('heading', { level: 2 });
    expect(logo).toHaveClass('nav-logo');
  });
});

describe('LandingPage - hero visual card', () => {
  it('displays hero card with feature highlights', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/Fast & Modern|Fast & Modern/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure by Design/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time Analytics/i)).toBeInTheDocument();
  });

  it('displays decorative dots in card header', () => {
    renderWithRouter(<LandingPage />);

    const container = document.querySelector('.card-dots');
    expect(container).toBeInTheDocument();
    expect(container?.querySelectorAll('.dot')).toHaveLength(3);
  });

  it('displays app name in card title', () => {
    renderWithRouter(<LandingPage />);

    const cardTitle = document.querySelector('.card-title');
    expect(cardTitle).toBeInTheDocument();
  });
});

describe('LandingPage - feature cards content', () => {
  it('displays feature card descriptions', () => {
    renderWithRouter(<LandingPage />);

    expect(
      screen.getByText(/Built with React 19 and modern web technologies for optimal performance/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Microsoft Entra ID integration with enterprise-grade security features/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Real-time monitoring and insights powered by Grafana and OpenTelemetry/i),
    ).toBeInTheDocument();
  });

  it('displays feature icons', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🛡️')).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
  });
});
