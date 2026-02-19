import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import { SlideTranscript } from '../hooks/useVoiceRecorder';
import './RecordPage.css';

const RecordPage: React.FC = () => {
  const [slides, setSlides] = useState<SlideTranscript[]>([]);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const navigate = useNavigate();

  // VoiceRecorder is responsible for speech API check
  const handleSlidesReady = (rSlides: SlideTranscript[]) => {
    setSlides(rSlides);
  };

  // Detect speech support on mount
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const handleNewSlide = () => {
    // Manual new slide action: handled via ref in hook, so just reload slides
    // For MVP, refresh by toggling VoiceRecorder or extend with a controller prop
    void window.location.reload(); // Add void for ESLint floating promise
  };

  const handleDone = () => {
    void navigate('/library');
  };

  return (
    <div className="record-page-container">
      <h1 className="page-title">Create Your Presentation</h1>
      <VoiceRecorder onSlidesReady={handleSlidesReady} />
      <div className="slides-panel">
        <div className="slides-header">Slides</div>
        <ol className="slides-list">
          {slides.map(slide => (
            <li className="slide-card" key={slide.index}>
              <span className="slide-index">Slide {slide.index}:</span> <span className="slide-text">{slide.text}</span>
            </li>
          ))}
        </ol>
        <div className="slides-actions">
          <button className="new-slide-btn" onClick={() => { void handleNewSlide(); }}>New Slide</button>
          <button className="done-btn" onClick={handleDone} disabled={slides.length === 0}>Done  Create Presentation</button>
        </div>
        {!speechSupported && (
          <div className="speech-support-warning">
            Your browser does not support speech recognition. Please use Chrome or Edge for voice recording.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordPage;
