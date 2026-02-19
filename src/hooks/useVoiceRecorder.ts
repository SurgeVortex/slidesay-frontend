import { useState, useRef, useCallback } from 'react';

export interface SlideTranscript {
  index: number;
  text: string;
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  slides: SlideTranscript[];
  startRecording: () => void;
  stopRecording: () => void;
  newSlide: () => void;
  reset: () => void;
  error: string | null;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognitionAPI;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [slides, setSlides] = useState<SlideTranscript[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const currentTranscriptRef = useRef('');

  const newSlide = useCallback(() => {
    const pendingText = currentTranscriptRef.current.trim();
    if (pendingText) {
      setSlides((prev) => [
        ...prev,
        { index: prev.length + 1, text: pendingText },
      ]);
      currentTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported || !SpeechRecognitionAPI) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      const recognition: SpeechRecognitionInstance = new (SpeechRecognitionAPI as any)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          if (result.isFinal) {
            final += result[0]?.transcript ?? '';
          } else {
            interim += result[0]?.transcript ?? '';
          }
        }
        if (final) {
          const lower = final.toLowerCase();
          if (lower.includes('next slide') || lower.includes('new slide')) {
            const cleaned = final.replace(/next slide|new slide/gi, '').trim();
            if (cleaned) currentTranscriptRef.current += ' ' + cleaned;
            const pendingText = currentTranscriptRef.current.trim();
            if (pendingText) {
              setSlides((prev) => [
                ...prev,
                { index: prev.length + 1, text: pendingText },
              ]);
              currentTranscriptRef.current = '';
            }
            setTranscript('');
          } else {
            currentTranscriptRef.current += ' ' + final;
            setTranscript(currentTranscriptRef.current.trim());
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed')
          setError(
            'Microphone access denied. Please allow microphone access in your browser settings.',
          );
        else if (event.error === 'no-speech') setError('No speech detected. Please try again.');
        else setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setError(null);
    } catch {
      setError('Failed to start recording.');
    }
  }, [isSupported, SpeechRecognitionAPI]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    const pendingText = currentTranscriptRef.current.trim();
    if (pendingText) {
      setSlides((prev) => [
        ...prev,
        { index: prev.length + 1, text: pendingText },
      ]);
      currentTranscriptRef.current = '';
      setTranscript('');
    }
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setSlides([]);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    currentTranscriptRef.current = '';
  }, [stopRecording]);

  return {
    isRecording,
    isSupported,
    transcript,
    interimTranscript,
    slides,
    startRecording,
    stopRecording,
    newSlide,
    reset,
    error,
  };
}
