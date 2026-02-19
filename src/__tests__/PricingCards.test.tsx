import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PricingCards from '../components/PricingCards';

describe('PricingCards', () => {
  it('renders pricing tiers', () => {
    render(<PricingCards showToggle={false} />);
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Educator')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders with toggle', () => {
    render(<PricingCards showToggle={true} />);
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
  });
});
