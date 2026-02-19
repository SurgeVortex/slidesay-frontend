import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock useVoiceRecorder hook
const mockHook = {
  isRecording: false,
  isSupported: true,
  transcript: '',
  interimTranscript: '',
  slides: [] as Array<{ index: number; text: string }>,
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  newSlide: vi.fn(),
  reset: vi.fn(),
  error: null as string | null,
};

vi.mock('../hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: () => mockHook,
}));

import VoiceRecorder from '../components/VoiceRecorder';

describe('VoiceRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHook.isRecording = false;
    mockHook.isSupported = true;
    mockHook.transcript = '';
    mockHook.interimTranscript = '';
    mockHook.slides = [];
    mockHook.error = null;
  });

  it('renders record button when supported', () => {
    render(<VoiceRecorder />);
    expect(screen.getByLabelText(/start recording/i)).toBeInTheDocument();
    expect(screen.getByText(/tap to start/i)).toBeInTheDocument();
  });

  it('shows unsupported message when not available', () => {
    mockHook.isSupported = false;
    render(<VoiceRecorder />);
    expect(screen.getByText(/not supported/i)).toBeInTheDocument();
  });

  it('starts recording on click', () => {
    render(<VoiceRecorder />);
    fireEvent.click(screen.getByLabelText(/start recording/i));
    expect(mockHook.startRecording).toHaveBeenCalled();
  });

  it('stops recording and calls onSlidesReady', () => {
    mockHook.isRecording = true;
    mockHook.slides = [{ index: 1, text: 'Hello world' }];
    const onSlidesReady = vi.fn();
    render(<VoiceRecorder onSlidesReady={onSlidesReady} />);
    fireEvent.click(screen.getByLabelText(/stop recording/i));
    expect(mockHook.stopRecording).toHaveBeenCalled();
    expect(onSlidesReady).toHaveBeenCalledWith([{ index: 1, text: 'Hello world' }]);
  });

  it('shows transcript during recording', () => {
    mockHook.transcript = 'Hello';
    mockHook.interimTranscript = ' world';
    render(<VoiceRecorder />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText(/world/)).toBeInTheDocument();
  });

  it('shows new slide button during recording', () => {
    mockHook.isRecording = true;
    render(<VoiceRecorder />);
    expect(screen.getByText(/new slide/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/new slide/i));
    expect(mockHook.newSlide).toHaveBeenCalled();
  });

  it('shows error message', () => {
    mockHook.error = 'Microphone denied';
    render(<VoiceRecorder />);
    expect(screen.getByText('Microphone denied')).toBeInTheDocument();
  });

  it('displays recorded slides', () => {
    mockHook.slides = [
      { index: 1, text: 'First slide' },
      { index: 2, text: 'Second slide' },
    ];
    render(<VoiceRecorder />);
    expect(screen.getByText(/recorded slides \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('First slide')).toBeInTheDocument();
    expect(screen.getByText('Second slide')).toBeInTheDocument();
  });
});
