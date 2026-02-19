import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LibraryPage.css';

interface Presentation {
  id: string;
  title: string;
  slides: number;
  created: string;
}

const initialPresentations: Presentation[] = [
  { id: 'abc123', title: 'Welcome to SlideSay', slides: 8, created: '2026-02-01' },
  { id: 'def456', title: 'AI for Educators', slides: 12, created: '2026-01-28' },
  { id: 'ghi789', title: 'Quarterly Report', slides: 10, created: '2026-02-15' }
];

export default function LibraryPage() {
  const [presentations, setPresentations] = useState<Presentation[]>(initialPresentations);
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this presentation?')) {
      setPresentations(prev => prev.filter(p => p.id !== id));
    }
  };

  if (presentations.length === 0) {
    return (
      <div className="library-empty">
        <h2>Your library is empty</h2>
        <p>Create your first presentation:</p>
        <Link className="library-create-btn" to="/record">Create New</Link>
      </div>
    );
  }

  return (
    <div className="library-wrapper">
      <div className="library-header">
        <h2>Your Presentations</h2>
        <Link className="library-create-btn" to="/record">Create New</Link>
      </div>
      <div className="library-grid">
        {presentations.map(p => (
          <div key={p.id} className="library-card" onClick={() => { void navigate(`/editor/${p.id}`); }}>
            <div className="library-card-content">
              <h3>{p.title}</h3>
              <p>{p.slides} slides</p>
              <p className="library-date">Created: {p.created}</p>
            </div>
            <button className="library-delete-btn" onClick={e => { e.stopPropagation(); handleDelete(p.id); }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
