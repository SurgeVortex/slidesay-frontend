import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PricingCards from '../components/PricingCards';

describe('PricingCards', () => {
  it('renders pricing tiers', () => {
    render(<PricingCards showToggle={false} />);
    expect(screen.getByText(/free/i)).toBeInTheDocument();
  });

  it('renders with toggle', () => {
    render(<PricingCards showToggle={true} />);
    // Should render without crashing with toggle enabled
    expect(screen.getByText(/free/i)).toBeInTheDocument();
  });
});
