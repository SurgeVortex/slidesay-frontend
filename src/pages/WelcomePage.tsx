import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { config } from '../config/app.config';
import { UserInfo } from '../hooks/useAuth';
import { checkHealth, getUserProfile } from '../utils/api';
import './WelcomePage.css';

interface WelcomePageProps {
  user: UserInfo;
}

interface BackendUser {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

interface HealthStatus {
  status: string;
  version: string;
  services: Record<string, string>;
}

export default function WelcomePage({ user }: WelcomePageProps) {
  const { instance } = useMsal();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(true);

  const handleLogout = () => {
    void instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + '/login',
    });
  };

  useEffect(() => {
    async function loadBackendData() {
      try {
        // Check backend health
        const healthResult = await checkHealth();
        if (healthResult.data) {
          setHealthStatus(healthResult.data);
        }

        // Get user profile from backend
        const profileResult = await getUserProfile();
        if (profileResult.data) {
          setBackendUser(profileResult.data);
        } else if (profileResult.error?.code === 'UNAUTHORIZED') {
          console.warn('Backend authentication failed - token may be invalid');
        }
      } catch (error) {
        console.error('Failed to load backend data:', error);
      } finally {
        setLoadingBackend(false);
      }
    }

    void loadBackendData();
  }, []);

  return (
    <div className="welcome-container">
      <nav className="welcome-nav">
        <h2>{config.appName}</h2>
        <div className="welcome-nav-actions">
          <span className="user-display">{user.displayName || user.email}</span>
          <button onClick={handleLogout} className="logout-button" aria-label="Sign out">
            Sign out
          </button>
        </div>
      </nav>

      <main className="welcome-content">
        <div className="welcome-hero">
          <h1>Welcome to {config.appName}!</h1>
          <p className="welcome-subtitle">
            You have successfully authenticated. This is your starting point.
          </p>
        </div>

        <div className="welcome-info" role="region" aria-label="Application information">
          <div className="info-card">
            <h3>🚀 Ready to Build</h3>
            <p>
              This template is configured with Azure Static Web Apps authentication, Grafana Faro
              monitoring, and modern development tools.
            </p>
          </div>

          <div className="info-card">
            <h3>🔐 Authenticated User</h3>
            <dl className="user-info">
              <dt>User ID:</dt>
              <dd>{user.userId}</dd>
              <dt>Provider:</dt>
              <dd>{user.identityProvider}</dd>
              <dt>Roles:</dt>
              <dd>{user.userRoles.join(', ') || 'authenticated'}</dd>
            </dl>
          </div>

          {backendUser && (
            <div className="info-card">
              <h3>📡 Backend Profile</h3>
              <dl className="user-info">
                <dt>Display Name:</dt>
                <dd>{backendUser.displayName}</dd>
                <dt>Email:</dt>
                <dd>{backendUser.email}</dd>
                <dt>Status:</dt>
                <dd>{backendUser.isActive ? '✅ Active' : '❌ Inactive'}</dd>
                <dt>Last Login:</dt>
                <dd>{new Date(backendUser.lastLoginAt).toLocaleString()}</dd>
              </dl>
            </div>
          )}

          {loadingBackend && (
            <div className="info-card">
              <h3>📡 Backend Connection</h3>
              <p>Loading backend data...</p>
            </div>
          )}

          {!loadingBackend && !backendUser && (
            <div className="info-card">
              <h3>⚠️ Backend Unavailable</h3>
              <p>
                Could not connect to backend API. You are authenticated with Azure SWA but backend
                services may be unavailable.
              </p>
            </div>
          )}

          <div className="info-card">
            <h3>📊 Monitoring Active</h3>
            <p>
              Grafana Faro is tracking user interactions, performance metrics, and errors. Check
              your Grafana Cloud dashboard for insights.
            </p>
          </div>

          <div className="info-card">
            <h3>🎯 Next Steps</h3>
            <ul>
              <li>Customize the application name in your environment variables</li>
              <li>Add your application features and routes</li>
              <li>Configure Grafana dashboards and alerts</li>
              <li>Deploy to Azure Static Web Apps via GitHub Actions</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🔧 Configuration</h3>
            <dl className="config-info">
              <dt>Environment:</dt>
              <dd>{config.environment}</dd>
              <dt>API URL:</dt>
              <dd>{config.apiUrl}</dd>
              {healthStatus && (
                <>
                  <dt>Backend Status:</dt>
                  <dd>
                    {healthStatus.status} (v{healthStatus.version})
                  </dd>
                  <dt>Database:</dt>
                  <dd>{healthStatus.services.database || 'unknown'}</dd>
                </>
              )}
              {config.isDevelopment && (
                <>
                  <dt>Development Mode:</dt>
                  <dd>Active</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
