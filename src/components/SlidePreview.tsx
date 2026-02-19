

interface Slide {
  type: string;
  title: string;
  bullets?: string[];
  subtitle?: string;
  notes?: string;
}

interface SlidePreviewProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export default function SlidePreview({ slides, currentSlide, onSlideChange }: SlidePreviewProps) {
  const slide = slides[currentSlide];
  if (!slide) return <div className="slide-preview empty">No slides</div>;

  const isCentered = slide.type === 'title' || slide.type === 'section';

  return (
    <div className="slide-preview">
      <div
        className="slide-canvas"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          color: 'white',
          aspectRatio: '16/9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isCentered ? 'center' : 'flex-start',
          alignItems: isCentered ? 'center' : 'flex-start',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: isCentered ? 'center' : 'left',
          overflow: 'hidden',
        }}
      >
        <h2 style={{ fontSize: slide.type === 'title' ? '2rem' : '1.5rem', margin: '0 0 1rem' }}>
          {slide.title}
        </h2>
        {slide.subtitle && <p style={{ opacity: 0.8, margin: 0 }}>{slide.subtitle}</p>}
        {slide.bullets && slide.bullets.length > 0 && (
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
            {slide.bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '0.75rem',
        }}
      >
        <button onClick={() => onSlideChange(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
          ← Prev
        </button>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <button
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
