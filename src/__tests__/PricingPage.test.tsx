import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location

import PricingPage from '../pages/PricingPage';

vi.mock('../components/PricingCards', () => ({
  default: ({ showToggle }: { showToggle: boolean }) => (
    <div data-testid="pricing-cards">Cards (toggle={String(showToggle)})</div>
  ),
}));

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ checkout_url: 'https://checkout.stripe.com/test' }),
    });
  });

  it('renders pricing heading and subtitle', () => {
    render(<PricingPage />);
    expect(screen.getByText(/simple, transparent pricing/i)).toBeInTheDocument();
    expect(screen.getByText(/start free/i)).toBeInTheDocument();
  });

  it('renders PricingCards component', () => {
    render(<PricingPage />);
    expect(screen.getByTestId('pricing-cards')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    render(<PricingPage />);
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    expect(screen.getByText(/can i cancel anytime/i)).toBeInTheDocument();
    expect(screen.getByText(/do you offer team plans/i)).toBeInTheDocument();
    expect(screen.getByText(/student discount/i)).toBeInTheDocument();
    expect(screen.getByText(/payment methods/i)).toBeInTheDocument();
  });

  it('renders CTA section with buttons', () => {
    render(<PricingPage />);
    expect(screen.getByText(/ready to create/i)).toBeInTheDocument();
    expect(screen.getByText(/start creating/i)).toBeInTheDocument();
    // "Upgrade" and "Manage" buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('has customer ID input', () => {
    render(<PricingPage />);
    const input = screen.getByPlaceholderText(/stripe customer id/i);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'cus_123' } });
    expect(input).toHaveValue('cus_123');
  });

  it('calls checkout API on upgrade click', () => {
    render(<PricingPage />);
    // Find the upgrade button by its text content
    const upgradeBtn = screen.getByText(/upgrade.*educator/i);
    fireEvent.click(upgradeBtn);
    expect(mockFetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.objectContaining({ method: 'POST' }));
  });

  it('calls portal API on manage click', () => {
    render(<PricingPage />);
    fireEvent.change(screen.getByPlaceholderText(/stripe customer id/i), { target: { value: 'cus_x' } });
    fireEvent.click(screen.getByText(/manage subscription/i));
    expect(mockFetch).toHaveBeenCalledWith('/api/stripe/customer-portal', expect.objectContaining({ method: 'POST' }));
  });
});
