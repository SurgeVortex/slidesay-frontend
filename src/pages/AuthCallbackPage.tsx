import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingPage from './LoadingPage';

/**
 * AuthCallbackPage
 * Handles the MSAL auth redirect callback: displays a loading spinner/UX while auth is in progress,
 * then redirects user to the correct destination post-auth.
 * On auth failure, fallback message is displayed.
 */
export default function AuthCallbackPage() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        void navigate('/welcome', { replace: true });
      } else {
        void navigate('/login', { replace: true });
      }
    }
  }, [isLoading, user, navigate]);

  return <LoadingPage />;
}
