import { useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { config } from '../config/app.config';
import { UserInfo } from '../hooks/useAuth';
import './WelcomePage.css';

interface WelcomePageProps {
  user: UserInfo;
}

export default function WelcomePage({ user }: WelcomePageProps) {
  const { instance } = useMsal();

  const handleLogout = () => {
    void instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + '/login',
    });
  };

  const displayName = user.displayName || user.email || 'there';

  return (
    <div className="welcome-container">
      <nav className="welcome-nav">
        <h2>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            {config.appName}
          </Link>
        </h2>
        <div className="welcome-nav-actions">
          <span className="user-display">{displayName}</span>
          <button onClick={handleLogout} className="logout-button" aria-label="Sign out">
            Sign out
          </button>
        </div>
      </nav>

      <main className="welcome-content">
        <div className="welcome-hero">
          <h1>Hey {displayName.split(' ')[0]} 👋</h1>
          <p className="welcome-subtitle">
            Welcome to {config.appName} — say it, slide it, ship it.
          </p>
        </div>

        <div className="welcome-actions" role="region" aria-label="Quick actions">
          <Link to="/record" className="action-card primary-action">
            <span className="action-icon">🎙️</span>
            <h3>New Presentation</h3>
            <p>Record your voice and let AI create slides for you.</p>
          </Link>

          <Link to="/library" className="action-card">
            <span className="action-icon">📚</span>
            <h3>My Library</h3>
            <p>View and manage your saved presentations.</p>
          </Link>

          <Link to="/profile" className="action-card">
            <span className="action-icon">⚙️</span>
            <h3>Profile</h3>
            <p>Manage your account and preferences.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
