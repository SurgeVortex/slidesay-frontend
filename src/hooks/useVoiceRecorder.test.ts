import '@testing-library/jest-dom/vitest';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let latestRecognition: any;

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  constructor() {
    latestRecognition = this;
  }
}

Object.defineProperty(window, 'SpeechRecognition', { value: MockSpeechRecognition, writable: true, configurable: true });
Object.defineProperty(window, 'webkitSpeechRecognition', { value: MockSpeechRecognition, writable: true, configurable: true });

import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

function makeSpeechEvent(text: string, isFinal = true) {
  return {
    resultIndex: 0,
    results: [Object.assign([{ transcript: text }], { isFinal })],
  };
}

describe('useVoiceRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports isSupported', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isRecording).toBe(false);
  });

  it('starts and stops recording', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    expect(result.current.isRecording).toBe(true);
    act(() => result.current.stopRecording());
    expect(result.current.isRecording).toBe(false);
  });

  it('captures final transcript', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onresult(makeSpeechEvent('Hello world')));
    expect(result.current.transcript).toContain('Hello world');
  });

  it('saves transcript as slide on stop', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onresult(makeSpeechEvent('Slide content')));
    act(() => result.current.stopRecording());
    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0]!.text).toContain('Slide content');
  });

  it('creates new slide via newSlide()', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onresult(makeSpeechEvent('First slide')));
    act(() => result.current.newSlide());
    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0]!.text).toBe('First slide');
    expect(result.current.transcript).toBe('');
  });

  it('handles "next slide" voice command', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onresult(makeSpeechEvent('Some content')));
    act(() => latestRecognition.onresult(makeSpeechEvent('next slide')));
    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0]!.text).toContain('Some content');
  });

  it('handles not-allowed error', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onerror({ error: 'not-allowed' }));
    expect(result.current.error).toContain('Microphone');
    expect(result.current.isRecording).toBe(false);
  });

  it('handles no-speech error', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onerror({ error: 'no-speech' }));
    expect(result.current.error).toContain('No speech');
  });

  it('handles generic error', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onerror({ error: 'network' }));
    expect(result.current.error).toContain('network');
  });

  it('resets state', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onresult(makeSpeechEvent('test')));
    act(() => result.current.stopRecording());
    expect(result.current.slides).toHaveLength(1);
    act(() => result.current.reset());
    expect(result.current.slides).toHaveLength(0);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('handles interim results', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onresult(makeSpeechEvent('typing...', false)));
    expect(result.current.interimTranscript).toBe('typing...');
  });

  it('handles onend event', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.startRecording());
    act(() => latestRecognition.onend());
    expect(result.current.isRecording).toBe(false);
  });
});
