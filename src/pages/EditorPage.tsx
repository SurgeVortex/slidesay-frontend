import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SlidePreview from '../components/SlidePreview';
import SlideEditor from '../components/SlideEditor';
import ExportButton from '../components/ExportButton';
import { getPresentation } from '../utils/api';
import './EditorPage.css';

interface Slide {
  type: string;
  title: string;
  bullets?: string[];
  subtitle?: string;
  notes?: string;
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadPresentation = async () => {
      const result = await getPresentation(id);
      if (result.data) {
        setTitle(result.data.title || 'Untitled');
        setSlides(result.data.slides || []);
      } else {
        setError(result.error?.error || 'Failed to load presentation');
      }
      setLoading(false);
    };

    void loadPresentation();
  }, [id]);

  if (!id) {
    return <div>No presentation ID provided</div>;
  }

  if (loading) {
    return (
      <div
        className="editor-page"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <p> Loading presentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="editor-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <p> {error}</p>
        <button
          onClick={() => {
            void navigate('/library');
          }}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          Back to Library
        </button>
      </div>
    );
  }

  const updateSlide = (updated: Slide) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = updated;
    setSlides(newSlides);
  };

  const addSlide = () => {
    const newSlide: Slide = { type: 'content', title: 'New Slide', bullets: [''], notes: '' };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== currentSlide);
    setSlides(newSlides);
    setCurrentSlide(Math.min(currentSlide, newSlides.length - 1));
  };

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <input
          className="editor-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Presentation title..."
        />
        <div className="editor-topbar-actions">
          <ExportButton format="pptx" presentationId={id} />
          <ExportButton format="pdf" presentationId={id} />
        </div>
      </div>
      <div className="editor-layout">
        <div className="editor-sidebar">
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#6b7280' }}>Slides</h3>
          {slides.map((s, i) => (
            <div
              key={i}
              className={`slide-thumb ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
            >
              <span className="slide-thumb-num">{i + 1}</span>
              <span className="slide-thumb-title">{s.title}</span>
            </div>
          ))}
          <div className="sidebar-actions">
            <button className="btn-add-slide" onClick={addSlide}>
              + Add Slide
            </button>
            <button
              className="btn-delete-slide"
              onClick={deleteSlide}
              disabled={slides.length <= 1}
            >
               Delete
            </button>
          </div>
        </div>
        <div className="editor-preview">
          <SlidePreview
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
          />
        </div>
        <div className="editor-panel">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>Edit Slide</h3>
          {slides[currentSlide] && (
            <SlideEditor slide={slides[currentSlide]} onChange={updateSlide} />
          )}
        </div>
      </div>
    </div>
  );
}
