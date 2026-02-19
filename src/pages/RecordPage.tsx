import React from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import { SlideTranscript } from '../hooks/useVoiceRecorder';
import { generatePresentation } from '../utils/api';
import './RecordPage.css';

export default function RecordPage() {
  const navigate = useNavigate();
  const [slides, setSlides] = React.useState<SlideTranscript[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSlidesReady = (recordedSlides: SlideTranscript[]) => {
    setSlides(recordedSlides);
  };

  const handleDone = async () => {
    setIsGenerating(true);
    setError(null);
    
    // Combine all slide transcripts into one string
    const fullTranscript = slides.map(s => s.text).join('\n\n');
    
    try {
      const result = await generatePresentation(fullTranscript);
      if (result.data) {
        navigate(`/editor/${result.data.id}`);
      } else if (result.error) {
        setError(result.error.error || 'Failed to generate presentation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="record-page">
      <h1>Create Your Presentation</h1>
      <p className="record-subtitle">
        Talk through your presentation naturally. Say &quot;next slide&quot; to start a new slide, or use the button below.
      </p>

      <VoiceRecorder onSlidesReady={handleSlidesReady} />

      {error && (
        <div className="record-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {slides.length > 0 && (
        <div className="record-actions">
          <button 
            className="done-btn" 
            onClick={handleDone}
            disabled={isGenerating}
          >
            {isGenerating 
              ? '⏳ Generating presentation...' 
              : `Done — Create Presentation (${slides.length} slides)`
            }
          </button>
        </div>
      )}
    </div>
  );
}
