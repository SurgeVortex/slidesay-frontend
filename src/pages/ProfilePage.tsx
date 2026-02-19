import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile, getUserUsage } from '../utils/api';
import './WelcomePage.css';

interface Profile {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  tier?: string;
}

interface Usage {
  presentationsThisMonth: number;
  monthlyPresentationLimit: number;
  slidesThisMonth: number;
  monthlySlideLimit: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'saving'|'error'|'saved'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      const res = await getUserProfile();
      if (res.data) {
        setProfile(res.data);
        setDisplayName(res.data.displayName);
        setEmail(res.data.email);
      } else if (res.error) {
        setProfile(null);
      }
      const usageRes = await getUserUsage?.();
      if (usageRes?.data) {
        setUsage(usageRes.data);
      }
    }
    void fetchData();
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    setError('');
    const res = await updateUserProfile({ displayName, email });
    if (res.data) {
      setProfile(res.data);
      setEditMode(false);
      setStatus('saved');
    } else {
      setStatus('error');
      setError(res.error?.error || 'Failed to update profile');
    }
  };

  if (!profile) {
    return <div className="info-card"><h3>Profile</h3><p>Loading or unavailable.</p></div>;
  }

  return (
    <div className="welcome-info" style={{ maxWidth: 480, margin: '2rem auto' }}>
      <div className="info-card">
        <h3>👤 Profile</h3>
        <dl className="user-info">
          <dt>Name:</dt>
          <dd>
            {editMode ? (
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
            ) : profile.displayName}
          </dd>
          <dt>Email:</dt>
          <dd>
            {editMode ? (
              <input value={email} onChange={e => setEmail(e.target.value)} />
            ) : profile.email}
          </dd>
          <dt>Status:</dt>
          <dd>{profile.isActive ? '✅ Active' : '❌ Inactive'}</dd>
          <dt>Tier:</dt>
          <dd>{profile.tier || '-'}</dd>
          <dt>Last Login:</dt>
          <dd>{new Date(profile.lastLoginAt).toLocaleString()}</dd>
        </dl>
        {editMode ? (
          <>
            <button className="primary" onClick={() => void handleSave()} disabled={status === 'saving'}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
            {status === 'error' && <div style={{ color: 'red' }}>{error}</div>}
          </>
        ) : (
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        )}
        {status === 'saved' && <div style={{ color: 'green' }}>Saved!</div>}
      </div>
      <div className="info-card">
        <h3>📊 Usage</h3>
        {usage ? (
          <dl className="user-info">
            <dt>Presentations this month:</dt><dd>{usage.presentationsThisMonth} / {usage.monthlyPresentationLimit}</dd>
            <dt>Slides this month:</dt><dd>{usage.slidesThisMonth} / {usage.monthlySlideLimit}</dd>
          </dl>
        ) : <p>Loading usage...</p>}
      </div>
    </div>
  );
}
