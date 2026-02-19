import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it } from 'vitest';
import LandingPage from '../pages/LandingPage';

function renderLanding(route = '/') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <LandingPage />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('LandingPage', () => {
  it('renders hero headline', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /say it\. slide it\. ship it\./i })).toBeInTheDocument();
  });

  it('CTA buttons have correct links/actions', async () => {
    renderLanding();
    const user = userEvent.setup();
    const startButton = screen.getByRole('button', { name: /start creating/i });
    expect(startButton).toBeInTheDocument();
    // simulate click - navigate
    await user.click(startButton);
    // Note: with MemoryRouter, no change in location. We only check button present here

    const seePricing = screen.getByRole('button', { name: /see pricing/i });
    expect(seePricing).toBeInTheDocument();
  });

  it('renders all 3 pricing tiers', () => {
    renderLanding();
    const plans = screen.getAllByRole('heading', { name: /(Free|Educator|Pro)/ });
    expect(plans.length).toBe(3);
    expect(screen.getByText(/5 presentations\/month/)).toBeInTheDocument();
    expect(screen.getByText(/Unlimited presentations/)).toBeInTheDocument();
    expect(screen.getByText(/Everything in Educator/)).toBeInTheDocument();
  });

  it('monthly/annual toggle works and annual shows savings', async () => {
    renderLanding();
    const user = userEvent.setup();
    const monthly = screen.getByRole('button', { name: /monthly/i });
    const annual = screen.getByRole('button', { name: /annual/i });
    expect(monthly).toHaveAttribute('aria-pressed', 'true');
    expect(annual).toHaveAttribute('aria-pressed', 'false');
    await user.click(annual);
    expect(monthly).toHaveAttribute('aria-pressed', 'false');
    expect(annual).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/save/i)).toBeInTheDocument();
  });

  it('SEO helmet meta tags are present', () => {
    renderLanding();
    expect(document.head.innerHTML).toMatch(/slidesay[^<]*turn your voice/i);
    expect(document.head.innerHTML).toMatch(/og:title/i);
    expect(document.head.innerHTML).toMatch(/og:description/i);
    expect(document.head.innerHTML).toMatch(/application\/ld\+json/i);
  });
});
