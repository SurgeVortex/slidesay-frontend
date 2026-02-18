import { Link } from 'react-router-dom';
import { config } from '../config/app.config';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <nav className="landing-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-content">
          <h2 className="nav-logo">{config.appName}</h2>
          <Link to="/login" className="nav-login-btn">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="landing-main">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="hero-brand">{config.appName}</span>
            </h1>
            <p className="hero-description">
              Experience the future of productivity with our modern, secure, and intuitive platform.
              Built with cutting-edge technology to help you achieve more.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="cta-button primary">
                Get Started
              </Link>
              <button
                className="cta-button secondary"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="card-title">{config.appName}</div>
              </div>
              <div className="card-content">
                <div className="feature-item">
                  <div className="feature-icon">🚀</div>
                  <div className="feature-text">Fast & Modern</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">Secure by Design</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📊</div>
                  <div className="feature-text">Real-time Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="features-section">
          <div className="features-content">
            <h2 className="features-title">Why Choose {config.appName}?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-large">⚡</div>
                <h3>Lightning Fast</h3>
                <p>Built with React 19 and modern web technologies for optimal performance.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-large">🛡️</div>
                <h3>Enterprise Security</h3>
                <p>Microsoft Entra ID integration with enterprise-grade security features.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-large">📈</div>
                <h3>Advanced Analytics</h3>
                <p>Real-time monitoring and insights powered by Grafana and OpenTelemetry.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 {config.appName}. All rights reserved. Built with ❤️ using React 19.</p>
      </footer>
    </div>
  );
}
