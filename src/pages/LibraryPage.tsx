import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LibraryPage.css';

interface Presentation {
  id: string;
  title: string;
  slideCount: number;
  createdAt: string;
}

const mockPresentations: Presentation[] = [
  { id: '1', title: 'English Grammar — Past Tense', slideCount: 8, createdAt: '2026-02-18T10:00:00Z' },
  { id: '2', title: 'Team Standup Template', slideCount: 5, createdAt: '2026-02-17T14:30:00Z' },
  { id: '3', title: 'Product Launch Pitch', slideCount: 12, createdAt: '2026-02-16T09:00:00Z' },
];

export default function LibraryPage() {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState<Presentation[]>(mockPresentations);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this presentation? This cannot be undone.')) {
      setPresentations((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>My Presentations</h1>
        <Link to="/record" className="btn-create">+ Create New</Link>
      </div>

      {presentations.length === 0 ? (
        <div className="library-empty">
          <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>📝</p>
          <h2>No presentations yet</h2>
          <p>Create your first one by recording your voice.</p>
          <Link to="/record" className="btn-create">Create Presentation</Link>
        </div>
      ) : (
        <div className="library-grid">
          {presentations.map((p) => (
            <div key={p.id} className="library-card" onClick={() => navigate(`/editor/${p.id}`)}>
              <div className="card-thumb">
                <span style={{ fontSize: '2rem' }}>📊</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{p.title}</h3>
                <p className="card-meta">{p.slideCount} slides · {formatDate(p.createdAt)}</p>
              </div>
              <button
                className="card-delete"
                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
