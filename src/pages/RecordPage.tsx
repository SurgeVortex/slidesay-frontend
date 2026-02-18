import React from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import { SlideTranscript } from '../hooks/useVoiceRecorder';
import './RecordPage.css';

export default function RecordPage() {
  const navigate = useNavigate();
  const [slides, setSlides] = React.useState<SlideTranscript[]>([]);

  const handleSlidesReady = (recordedSlides: SlideTranscript[]) => {
    setSlides(recordedSlides);
  };

  const handleDone = () => {
    // TODO: Call API to create presentation, then navigate to editor
    // For now, navigate to library
    navigate('/library');
  };

  return (
    <div className="record-page">
      <h1>Create Your Presentation</h1>
      <p className="record-subtitle">
        Talk through your presentation naturally. Say &quot;next slide&quot; to start a new slide, or use the button below.
      </p>

      <VoiceRecorder onSlidesReady={handleSlidesReady} />

      {slides.length > 0 && (
        <div className="record-actions">
          <button className="done-btn" onClick={handleDone}>
            Done — Create Presentation ({slides.length} slides)
          </button>
        </div>
      )}
    </div>
  );
}
