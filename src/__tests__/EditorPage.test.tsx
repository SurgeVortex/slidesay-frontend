import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock api module
vi.mock('../utils/api', () => ({
  getPresentation: vi.fn(),
  exportPresentation: vi.fn(),
}));

// Mock components used by EditorPage
vi.mock('../components/SlidePreview', () => ({
  default: ({
    currentSlide,
    onSlideChange,
  }: {
    slides: unknown[];
    currentSlide: number;
    onSlideChange: (i: number) => void;
  }) => (
    <div data-testid="slide-preview" onClick={() => onSlideChange(0)}>
      Preview: slide {currentSlide}
    </div>
  ),
}));

vi.mock('../components/SlideEditor', () => ({
  default: ({ slide, onChange }: { slide: { title: string }; onChange: (s: unknown) => void }) => (
    <div data-testid="slide-editor" onClick={() => onChange({ ...slide, title: 'edited' })}>
      {slide.title}
    </div>
  ),
}));

vi.mock('../components/ExportButton', () => ({
  default: ({ format }: { format: string }) => (
    <button data-testid={`export-${format}`}>Export {format}</button>
  ),
}));

import EditorPage from '../pages/EditorPage';
import { getPresentation } from '../utils/api';

const mockGetPresentation = vi.mocked(getPresentation);

function renderWithRouter(id = 'abc123') {
  return render(
    <MemoryRouter initialEntries={[`/editor/${id}`]}>
      <Routes>
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/library" element={<div>Library</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockGetPresentation.mockReturnValue(new Promise(() => {})); // never resolves
    renderWithRouter();
    expect(screen.getByText(/loading presentation/i)).toBeInTheDocument();
  });

  it('renders slides after loading', async () => {
    mockGetPresentation.mockResolvedValue({
      data: {
        id: 'abc123',
        title: 'Test Pres',
        slides: [{ type: 'title', title: 'Slide 1', subtitle: 'sub' }],
        transcript: '',
        createdAt: '',
        updatedAt: '',
      },
      status: 200,
    });
    renderWithRouter();
    await waitFor(() => expect(screen.getByTestId('slide-preview')).toBeInTheDocument());
    expect(screen.getByTestId('slide-editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Pres')).toBeInTheDocument();
  });

  it('shows error when load fails', async () => {
    mockGetPresentation.mockResolvedValue({
      error: { error: 'Not found', code: 'NOT_FOUND' },
      status: 404,
    });
    renderWithRouter();
    await waitFor(() => expect(screen.getByText(/not found/i)).toBeInTheDocument());
    expect(screen.getByText(/back to library/i)).toBeInTheDocument();
  });

  it('can add and delete slides', async () => {
    mockGetPresentation.mockResolvedValue({
      data: {
        id: 'abc123',
        title: 'Test',
        slides: [
          { type: 'title', title: 'Slide 1' },
          { type: 'content', title: 'Slide 2', bullets: [] },
        ],
        transcript: '',
        createdAt: '',
        updatedAt: '',
      },
      status: 200,
    });
    renderWithRouter();
    await waitFor(() => expect(screen.getByText('+ Add Slide')).toBeInTheDocument());

    // Add slide
    fireEvent.click(screen.getByText('+ Add Slide'));
    expect(screen.getAllByText(/slide/i).length).toBeGreaterThan(2);

    // Delete slide (should be enabled with >1 slides)
    const deleteBtn = screen.getByText(/delete/i);
    expect(deleteBtn).not.toBeDisabled();
  });

  it('updates title input', async () => {
    mockGetPresentation.mockResolvedValue({
      data: {
        id: 'x',
        title: 'Old',
        slides: [{ type: 'title', title: 'S1' }],
        transcript: '',
        createdAt: '',
        updatedAt: '',
      },
      status: 200,
    });
    renderWithRouter();
    await waitFor(() => expect(screen.getByDisplayValue('Old')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Old'), { target: { value: 'New Title' } });
    expect(screen.getByDisplayValue('New Title')).toBeInTheDocument();
  });
});
