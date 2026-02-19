import React, { useState } from 'react';
import SlidePreview from '../components/SlidePreview';
import SlideEditor from '../components/SlideEditor';
import ExportButton from '../components/ExportButton';
import './EditorPage.css';

interface Slide {
  type: string;
  title: string;
  bullets?: string[];
  subtitle?: string;
  notes?: string;
}

const sampleSlides: Slide[] = [
  { type: 'title', title: 'My Presentation', subtitle: 'Created with SlideSay', notes: '' },
  { type: 'content', title: 'Introduction', bullets: ['Point one', 'Point two', 'Point three'], notes: 'Introduce the topic' },
  { type: 'content', title: 'Details', bullets: ['Detail A', 'Detail B'], notes: '' },
  { type: 'section', title: 'Questions?', notes: '' },
];

export default function EditorPage() {
  const [slides, setSlides] = useState<Slide[]>(sampleSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [title, setTitle] = useState('My Presentation');

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
          <ExportButton format="pptx" />
          <ExportButton format="pdf" />
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
            <button className="btn-add-slide" onClick={addSlide}>+ Add Slide</button>
            <button className="btn-delete-slide" onClick={deleteSlide} disabled={slides.length <= 1}>
              🗑 Delete
            </button>
          </div>
        </div>

        <div className="editor-preview">
          <SlidePreview slides={slides} currentSlide={currentSlide} onSlideChange={setCurrentSlide} />
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
