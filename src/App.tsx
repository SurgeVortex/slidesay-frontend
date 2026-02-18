import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/welcome" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/welcome" /> : <LoginPage />} />
      <Route path="/welcome" element={user ? <WelcomePage user={user} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to={user ? '/welcome' : '/'} />} />
    </Routes>
  );
}

export default App;
