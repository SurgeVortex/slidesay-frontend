import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import LibraryPage from '../pages/LibraryPage';

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders presentation list', () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    expect(screen.getByText(/your presentations/i)).toBeInTheDocument();
    expect(screen.getByText('Welcome to SlideSay')).toBeInTheDocument();
    expect(screen.getByText('AI for Educators')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Report')).toBeInTheDocument();
  });

  it('shows slide counts', () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    expect(screen.getByText('8 slides')).toBeInTheDocument();
    expect(screen.getByText('12 slides')).toBeInTheDocument();
  });

  it('shows create new button', () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });

  it('deletes presentation on confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    const deleteBtns = screen.getAllByText('Delete');
    fireEvent.click(deleteBtns[0]!);
    expect(screen.queryByText('Welcome to SlideSay')).not.toBeInTheDocument();
  });

  it('does not delete on cancel', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    const deleteBtns = screen.getAllByText('Delete');
    fireEvent.click(deleteBtns[0]!);
    expect(screen.getByText('Welcome to SlideSay')).toBeInTheDocument();
  });

  it('shows empty state when all deleted', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    const deleteBtns = screen.getAllByText('Delete');
    deleteBtns.forEach((btn) => fireEvent.click(btn));
    expect(screen.getByText(/your library is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first/i)).toBeInTheDocument();
  });
});
