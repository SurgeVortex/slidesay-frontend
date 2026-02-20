import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../utils/api', () => ({
  exportPresentation: vi.fn(),
}));

import ExportButton from '../components/ExportButton';
import { exportPresentation } from '../utils/api';

const mockExport = vi.mocked(exportPresentation);

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders PPTX button', () => {
    render(<ExportButton format="pptx" presentationId="abc" />);
    expect(screen.getByText(/export pptx/i)).toBeInTheDocument();
  });

  it('renders PDF button', () => {
    render(<ExportButton format="pdf" presentationId="abc" />);
    expect(screen.getByText(/export pdf/i)).toBeInTheDocument();
  });

  it('is disabled without presentationId', () => {
    render(<ExportButton format="pptx" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<ExportButton format="pptx" presentationId="abc" disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state during export', () => {
    mockExport.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ExportButton format="pptx" presentationId="abc" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('triggers download on successful export', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
    mockExport.mockResolvedValue(mockBlob);

    render(<ExportButton format="pptx" presentationId="abc" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockExport).toHaveBeenCalledWith('abc', 'pptx'));
    // After resolving, button should return to normal state
    await waitFor(() => expect(screen.getByText(/export pptx/i)).toBeInTheDocument());
  });

  it('shows error on failed export', async () => {
    mockExport.mockRejectedValue(new Error('fail'));
    render(<ExportButton format="pdf" presentationId="abc" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Export failed')).toBeInTheDocument());
  });
});
