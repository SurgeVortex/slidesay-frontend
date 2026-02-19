import { useVoiceRecorder, SlideTranscript } from '../hooks/useVoiceRecorder';

interface VoiceRecorderProps {
  onSlidesReady?: (slides: SlideTranscript[]) => void;
}

export default function VoiceRecorder({ onSlidesReady }: VoiceRecorderProps) {
  const {
    isRecording,
    isSupported,
    transcript,
    interimTranscript,
    slides,
    startRecording,
    stopRecording,
    newSlide,
    error,
  } = useVoiceRecorder();

  if (!isSupported) {
    return (
      <div className="voice-unsupported">
        <p>⚠️ Speech recognition is not supported in this browser.</p>
        <p>
          Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for voice
          recording.
        </p>
      </div>
    );
  }

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
      if (onSlidesReady && slides.length > 0) {
        onSlidesReady(slides);
      }
    } else {
      startRecording();
    }
  };

  return (
    <div className="voice-recorder">
      <button
        className={`record-btn ${isRecording ? 'recording' : ''}`}
        onClick={handleToggle}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        🎤
      </button>
      <p className="record-status">
        {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
      </p>

      {error && <p className="record-error">{error}</p>}

      {(transcript || interimTranscript) && (
        <div className="transcript-display">
          {transcript && <span className="transcript-final">{transcript}</span>}
          {interimTranscript && <span className="transcript-interim"> {interimTranscript}</span>}
        </div>
      )}

      {isRecording && (
        <button className="new-slide-btn" onClick={newSlide}>
          + New Slide
        </button>
      )}

      {slides.length > 0 && (
        <div className="slides-list">
          <h3>Recorded Slides ({slides.length})</h3>
          {slides.map((s) => (
            <div key={s.index} className="slide-card">
              <strong>Slide {s.index}</strong>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
