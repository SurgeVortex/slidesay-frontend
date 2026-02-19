import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock SpeechRecognition
const mockSpeechRecognition = vi.fn();
Object.defineProperty(window, 'SpeechRecognition', { value: mockSpeechRecognition, writable: true });
Object.defineProperty(window, 'webkitSpeechRecognition', { value: mockSpeechRecognition, writable: true });

// Mock VoiceRecorder component
vi.mock('../components/VoiceRecorder', () => ({
  default: ({ onSlidesReady }: { onSlidesReady?: (s: unknown[]) => void }) => (
    <div data-testid="voice-recorder">
      <button onClick={() => onSlidesReady?.([{ index: 1, text: 'Hello' }])}>Mock Record</button>
    </div>
  ),
}));

import RecordPage from '../pages/RecordPage';

describe('RecordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and voice recorder', () => {
    render(<MemoryRouter><RecordPage /></MemoryRouter>);
    expect(screen.getByText(/create your presentation/i)).toBeInTheDocument();
    expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
  });

  it('shows slides panel with done button disabled initially', () => {
    render(<MemoryRouter><RecordPage /></MemoryRouter>);
    const doneBtn = screen.getByText(/done/i);
    expect(doneBtn).toBeDisabled();
  });

  it('enables done button after slides are recorded', async () => {
    render(<MemoryRouter><RecordPage /></MemoryRouter>);
    const mockBtn = screen.getByText('Mock Record');
    mockBtn.click();
    // After callback, slides state updates, done button should enable
    await waitFor(() => {
      const doneBtn = screen.getByText(/done/i);
      expect(doneBtn).not.toBeDisabled();
    });
  });

  it('renders slide list when slides exist', async () => {
    render(<MemoryRouter><RecordPage /></MemoryRouter>);
    screen.getByText('Mock Record').click();
    await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
  });

  it('shows speech unsupported warning when no SpeechRecognition', () => {
    Object.defineProperty(window, 'SpeechRecognition', { value: undefined, writable: true });
    Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined, writable: true });

    render(<MemoryRouter><RecordPage /></MemoryRouter>);
    expect(screen.getByText(/does not support speech recognition/i)).toBeInTheDocument();

    // Restore
    Object.defineProperty(window, 'SpeechRecognition', { value: mockSpeechRecognition, writable: true });
    Object.defineProperty(window, 'webkitSpeechRecognition', { value: mockSpeechRecognition, writable: true });
  });
});
