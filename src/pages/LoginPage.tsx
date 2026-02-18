import { useMsal } from '@azure/msal-react';
import { config } from '../config/app.config';
import { loginRequest } from '../config/msal.config';
import './LoginPage.css';

export default function LoginPage() {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{config.appName}</h1>
        <p className="login-subtitle">Sign in to continue</p>

        <div className="login-providers">
          <button
            onClick={() => void handleLogin()}
            className="login-button"
            aria-label="Sign in with Microsoft"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Sign in with Microsoft
          </button>
        </div>

        <div className="login-footer">
          <p>
            By signing in, you agree to our terms of service and privacy policy. This application
            uses Microsoft Entra ID for secure authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
