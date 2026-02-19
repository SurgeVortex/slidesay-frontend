import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SlidePreview from '../components/SlidePreview';

const baseSlides = [
  { type: 'title', title: 'First Slide', subtitle: 'Introduction' },
  { type: 'content', title: 'Second Slide', bullets: ['Point A', 'Point B'] },
  { type: 'section', title: 'Section Break' },
];

describe('SlidePreview', () => {
  it('renders current slide title', () => {
    render(<SlidePreview slides={baseSlides} currentSlide={0} onSlideChange={vi.fn()} />);
    expect(screen.getByText('First Slide')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('shows slide counter', () => {
    render(<SlidePreview slides={baseSlides} currentSlide={0} onSlideChange={vi.fn()} />);
    expect(screen.getByText('Slide 1 of 3')).toBeInTheDocument();
  });

  it('disables prev on first slide', () => {
    render(<SlidePreview slides={baseSlides} currentSlide={0} onSlideChange={vi.fn()} />);
    expect(screen.getByText('← Prev')).toBeDisabled();
    expect(screen.getByText('Next →')).not.toBeDisabled();
  });

  it('disables next on last slide', () => {
    render(<SlidePreview slides={baseSlides} currentSlide={2} onSlideChange={vi.fn()} />);
    expect(screen.getByText('Next →')).toBeDisabled();
    expect(screen.getByText('← Prev')).not.toBeDisabled();
  });

  it('calls onSlideChange on nav', () => {
    const onChange = vi.fn();
    render(<SlidePreview slides={baseSlides} currentSlide={1} onSlideChange={onChange} />);
    fireEvent.click(screen.getByText('← Prev'));
    expect(onChange).toHaveBeenCalledWith(0);
    fireEvent.click(screen.getByText('Next →'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('renders bullets for content slide', () => {
    render(<SlidePreview slides={baseSlides} currentSlide={1} onSlideChange={vi.fn()} />);
    expect(screen.getByText('Point A')).toBeInTheDocument();
    expect(screen.getByText('Point B')).toBeInTheDocument();
  });

  it('shows empty state when no slides', () => {
    render(<SlidePreview slides={[]} currentSlide={0} onSlideChange={vi.fn()} />);
    expect(screen.getByText('No slides')).toBeInTheDocument();
  });
});
