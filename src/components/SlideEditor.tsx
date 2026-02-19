interface Slide {
  type: string;
  title: string;
  bullets?: string[];
  subtitle?: string;
  notes?: string;
}

interface SlideEditorProps {
  slide: Slide;
  onChange: (updated: Slide) => void;
}

export default function SlideEditor({ slide, onChange }: SlideEditorProps) {
  return (
    <div className="slide-editor" style={{ padding: '1rem' }}>
      <label
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.9rem' }}
      >
        Slide Type
      </label>
      <select
        value={slide.type}
        onChange={(e) => onChange({ ...slide, type: e.target.value })}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
        }}
      >
        <option value="title">Title Slide</option>
        <option value="content">Content</option>
        <option value="section">Section Break</option>
      </select>

      <label
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.9rem' }}
      >
        Title
      </label>
      <input
        value={slide.title}
        onChange={(e) => onChange({ ...slide, title: e.target.value })}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          boxSizing: 'border-box',
        }}
      />

      {slide.type === 'title' && (
        <>
          <label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Subtitle
          </label>
          <input
            value={slide.subtitle || ''}
            onChange={(e) => onChange({ ...slide, subtitle: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
        </>
      )}

      {slide.type === 'content' && (
        <>
          <label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Bullets
          </label>
          {(slide.bullets || []).map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={b}
                onChange={(e) => {
                  const updated = [...(slide.bullets || [])];
                  updated[i] = e.target.value;
                  onChange({ ...slide, bullets: updated });
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                }}
              />
              <button
                onClick={() =>
                  onChange({
                    ...slide,
                    bullets: (slide.bullets || []).filter((_, idx) => idx !== i),
                  })
                }
                style={{
                  background: '#fee2e2',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0 0.75rem',
                  cursor: 'pointer',
                  color: '#dc2626',
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...slide, bullets: [...(slide.bullets || []), ''] })}
            style={{
              background: '#ede9fe',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              color: '#6366f1',
              marginBottom: '1rem',
            }}
          >
            + Add Bullet
          </button>
        </>
      )}

      <label
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.9rem' }}
      >
        Speaker Notes
      </label>
      <textarea
        value={slide.notes || ''}
        onChange={(e) => onChange({ ...slide, notes: e.target.value })}
        rows={3}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          boxSizing: 'border-box',
          resize: 'vertical',
        }}
      />
    </div>
  );
}
