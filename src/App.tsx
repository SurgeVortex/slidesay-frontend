import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import RecordPage from './pages/RecordPage';
import EditorPage from './pages/EditorPage';
import LibraryPage from './pages/LibraryPage';
import PricingPage from './pages/PricingPage';

function App() {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={user ? <Navigate to="/welcome" /> : <LoginPage />} />

      {/* Auth required routes */}
      <Route
        path="/welcome"
        element={user ? <WelcomePage user={user} /> : <Navigate to="/login" />} 
      />
      <Route path="/record" element={user ? <RecordPage /> : <Navigate to="/login" />} />
      <Route path="/editor/:id" element={user ? <EditorPage /> : <Navigate to="/login" />} />
      <Route path="/library" element={user ? <LibraryPage /> : <Navigate to="/login" />} />

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<Navigate to={user ? '/welcome' : '/login'} />} />
    </Routes>
  );
}

export default App;
