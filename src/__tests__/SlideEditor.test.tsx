import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlideEditor from '../components/SlideEditor';
import { describe, expect, it, vi } from 'vitest';

const baseSlide = {
  type: 'title' as const,
  title: 'My Title',
  subtitle: 'My Subtitle',
  notes: 'My speaking notes',
};

// Helper: labels aren't linked via htmlFor, so query by text then grab sibling input
function getFieldByLabel(label: RegExp) {
  const labelEl = screen.getByText(label);
  const next = labelEl.nextElementSibling;
  if (!next) throw new Error(`No input found after label "${label}"`);
  return next as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}

describe('SlideEditor', () => {
  it('renders fields for title slide', () => {
    render(<SlideEditor slide={baseSlide} onChange={vi.fn()} />);
    expect(screen.getByText(/Slide Type/i)).toBeInTheDocument();
    expect(screen.getByText(/^Title$/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtitle/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaker Notes/i)).toBeInTheDocument();
    expect(screen.queryByText(/Bullets/i)).not.toBeInTheDocument();
  });

  it('switches to content slide and shows bullets', () => {
    render(<SlideEditor slide={{ ...baseSlide, type: 'content', bullets: ['abc', 'def'] }} onChange={vi.fn()} />);
    expect(screen.getByText(/Bullets/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('abc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('def')).toBeInTheDocument();
  });

  it('calls onChange when updating title', () => {
    const handleChange = vi.fn();
    render(<SlideEditor slide={baseSlide} onChange={handleChange} />);
    const titleInput = getFieldByLabel(/^Title$/i);
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' }));
  });

  it('calls onChange when changing slide type', () => {
    const handleChange = vi.fn();
    render(<SlideEditor slide={baseSlide} onChange={handleChange} />);
    const typeSelect = getFieldByLabel(/Slide Type/i);
    fireEvent.change(typeSelect, { target: { value: 'content' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'content' }));
  });

  it('lets user add a bullet point and fire onChange', async () => {
    const handleChange = vi.fn();
    render(<SlideEditor slide={{ ...baseSlide, type: 'content', bullets: [] }} onChange={handleChange} />);
    const addBullet = screen.getByRole('button', { name: /add bullet/i });
    await userEvent.setup().click(addBullet);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ bullets: [''] })
    );
  });

  it('lets user update and remove a bullet', () => {
    const slide = { ...baseSlide, type: 'content', bullets: ['foo'] };
    const handleChange = vi.fn();
    render(<SlideEditor slide={slide} onChange={handleChange} />);
    fireEvent.change(screen.getByDisplayValue('foo'), { target: { value: 'bar' } });
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ bullets: ['bar'] })
    );
    fireEvent.click(screen.getByRole('button', { name: /✕/i }));
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ bullets: [] })
    );
  });

  it('renders section break without subtitle or bullets', () => {
    render(<SlideEditor slide={{ ...baseSlide, type: 'section' }} onChange={vi.fn()} />);
    expect(screen.getByText(/Slide Type/i)).toBeInTheDocument();
    expect(screen.getByText(/^Title$/i)).toBeInTheDocument();
    expect(screen.queryByText(/Subtitle/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bullets/i)).not.toBeInTheDocument();
  });

  it('calls onChange for speaker notes', () => {
    const handleChange = vi.fn();
    render(<SlideEditor slide={baseSlide} onChange={handleChange} />);
    const notesField = getFieldByLabel(/Speaker Notes/i);
    fireEvent.change(notesField, { target: { value: 'new notes' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ notes: 'new notes' }));
  });

  it('handles empty optional fields safely', () => {
    render(<SlideEditor slide={{ type: 'title', title: '', subtitle: undefined, notes: undefined }} onChange={vi.fn()} />);
    const titleInput = getFieldByLabel(/^Title$/i) as HTMLInputElement;
    expect(titleInput.value).toBe('');
    const subtitleInput = getFieldByLabel(/Subtitle/i) as HTMLInputElement;
    expect(subtitleInput.value).toBe('');
  });
});
