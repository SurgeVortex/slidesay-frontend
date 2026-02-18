import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './LandingPage.css';

const APP_URL = 'https://slidesay.com';

const pricingTiers = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      '5 presentations/month',
      '8 slides max per presentation',
      'Browser preview',
      'SlideSay branding'
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'educator',
    name: 'Educator',
    priceMonthly: 5,
    priceAnnual: 36,
    features: [
      'Unlimited presentations',
      'Download PPTX & PDF',
      'No SlideSay branding',
      'Up to 20 slides',
      'Education templates'
    ],
    cta: 'Start Educator',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 9,
    priceAnnual: 60,
    features: [
      'Everything in Educator',
      'Custom branding',
      'Advanced templates',
      'AI image generation'
    ],
    cta: 'Go Pro',
    highlighted: false,
  },
];

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();

  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'SlideSay',
    'operatingSystem': 'All',
    'applicationCategory': 'BusinessApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'url': APP_URL
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '100'
    },
    'url': APP_URL,
    'description':'Create professional PowerPoint presentations by talking. SlideSay uses AI to structure your speech into beautiful slides. Free to start.'
  };

  return (
    <div className="slide-landing">
      <Helmet>
        <title>SlideSay — Turn Your Voice Into Presentations | Free AI Slide Maker</title>
        <meta name="description" content="Create professional PowerPoint presentations by talking. SlideSay uses AI to structure your speech into beautiful slides. Free to start." />
        <meta property="og:title" content="SlideSay — Turn Your Voice Into Presentations | Free AI Slide Maker" />
        <meta property="og:description" content="Create professional PowerPoint presentations by talking. SlideSay uses AI to structure your speech into beautiful slides. Free to start." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://slidesay.com" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <header className="ss-nav" role="navigation" aria-label="Main navigation">
        <div className="ss-nav-content">
          <div className="ss-nav-logo" aria-label="SlideSay logo" tabIndex={0}>
            <span>SlideSay</span>
          </div>
          <div className="ss-nav-actions">
            <Link to="/login" className="ss-nav-login-btn">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="ss-main" role="main">
        {/* HERO SECTION */}
        <section className="ss-hero" style={{background:"linear-gradient(110deg,#6366f1 0%,#3b82f6 52%,#06b6d4 100%)"}}>
          <div className="ss-hero-content">
            <h1 className="ss-hero-title gradient-text">Say it. Slide it. Ship it.</h1>
            <p className="ss-hero-desc">Turn your voice into professional presentations in seconds.<br />Just talk — AI does the rest.</p>
            <div className="ss-hero-ctas">
              <button className="ss-cta ss-cta-primary" onClick={() => navigate('/record')}>
                Start Creating — Free
              </button>
              <button className="ss-cta ss-cta-secondary" onClick={handleScrollToPricing}>
                See Pricing
              </button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="ss-howitworks">
          <h2 className="ss-step-title">How it works</h2>
          <div className="ss-steps">
            <div className="ss-step-card">
              <span className="ss-step-icon" role="img" aria-label="Record">🎤</span>
              <h3>Record</h3>
              <p>Talk through your presentation naturally</p>
            </div>
            <div className="ss-step-card">
              <span className="ss-step-icon" role="img" aria-label="AI Structures">🤖</span>
              <h3>AI Structures</h3>
              <p>Our AI organizes your speech into professional slides</p>
            </div>
            <div className="ss-step-card">
              <span className="ss-step-icon" role="img" aria-label="Download">📥</span>
              <h3>Download</h3>
              <p>Export as PowerPoint or PDF instantly</p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="ss-features">
          <h2 className="ss-features-title gradient-text">Built for teachers, loved by everyone</h2>
          <div className="ss-features-grid">
            <div className="ss-feature-card">
              <span className="ss-feature-icon">🎙️</span>
              <h3>Voice-First</h3>
              <p>Speak your ideas. SlideSay turns your voice into content in seconds.</p>
            </div>
            <div className="ss-feature-card">
              <span className="ss-feature-icon">🧠</span>
              <h3>Smart Structuring</h3>
              <p>AI builds bullet points, organizes topics, and keeps your flow natural.</p>
            </div>
            <div className="ss-feature-card">
              <span className="ss-feature-icon">🗂️</span>
              <h3>Multiple Formats</h3>
              <p>Export professional slides as PowerPoint or PDF. Preview instantly online.</p>
            </div>
            <div className="ss-feature-card">
              <span className="ss-feature-icon">🎨</span>
              <h3>Professional Templates</h3>
              <p>Choose from gorgeous designs tailored for teaching, business, and beyond.</p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="ss-pricing-section" id="pricing">
          <h2 className="ss-pricing-title">Pricing</h2>
          <div className="ss-pricing-toggle" role="group" aria-label="Pricing toggle">
            <button
              className={`ss-toggle-btn${!annual ? ' active' : ''}`}
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              className={`ss-toggle-btn${annual ? ' active' : ''}`}
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
            >
              Annual <span className="ss-annual-save">Save {annual ? '33%' : ''}</span>
            </button>
          </div>
          <div className="ss-pricing-grid">
            {pricingTiers.map((tier, idx) => {
              const isAnnual = annual && tier.priceAnnual > 0;
              const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
              const per = isAnnual ? '/yr' : '/mo';
              return (
                <div
                  key={tier.id}
                  className={`ss-pricing-card${tier.highlighted ? ' recommended' : ''}`}
                  aria-label={`${tier.name} plan${tier.highlighted ? ' (Recommended)' : ''}`}
                >
                  <h3 className="ss-card-title">{tier.name}</h3>
                  <div className="ss-card-price">
                    {price === 0 ? (
                      <span className="ss-price-free">Free</span>
                    ) : (
                      <>
                        <span className="ss-price">${price}</span>
                        <span className="ss-per">{per}</span>
                        {isAnnual && (
                          <span className="ss-save">({((tier.priceMonthly * 12 - price) / (tier.priceMonthly * 12) * 100).toFixed(0)}% off)</span>
                        )}
                      </>
                    )}
                  </div>
                  <ul className="ss-card-features">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`ss-card-cta${tier.highlighted ? ' main' : ''}`}
                    onClick={() => navigate('/login')}
                  >
                    {tier.cta}
                  </button>
                  {tier.highlighted && (
                    <div className="ss-rec-badge" aria-label="Recommended">Recommended</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="ss-footer">
        <div className="ss-footer-links">
          <a href="/privacy" target="_self" rel="noopener">Privacy</a>
          <a href="/terms" target="_self" rel="noopener">Terms</a>
          <a href="mailto:hello@slidesay.com">Contact</a>
        </div>
        <div className="ss-footer-made">Made with ⚡ by SlideSay</div>
      </footer>
    </div>
  );
}
