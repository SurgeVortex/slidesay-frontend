import { useState } from 'react';
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

// Lucide SVG Icons
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/>
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </svg>
);

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();

  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  // JSON-LD structured data - SoftwareApplication
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'SlideSay',
    'operatingSystem': 'Web',
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
      'reviewCount': '150'
    },
    'url': APP_URL,
    'description': 'Create professional PowerPoint presentations by talking. SlideSay uses AI to structure your speech into beautiful slides. Free to start.'
  };

  // JSON-LD structured data - Organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'SlideSay',
    'url': APP_URL,
    'logo': `${APP_URL}/logo.png`,
    'description': 'Voice-to-presentation SaaS tool for educators and professionals',
    'sameAs': []
  };

  // JSON-LD structured data - FAQ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does SlideSay work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Simply record your voice explaining your presentation topic. Our AI analyzes your speech, structures it into logical sections, and generates professional slides with titles and bullet points. You can preview instantly and export as PowerPoint or PDF.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Do I need to write anything?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No! That\'s the beauty of SlideSay. Just talk naturally about your topic as if you\'re explaining it to someone. Our AI handles all the structuring, formatting, and slide creation automatically.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What formats can I export to?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'On the Educator and Pro plans, you can download your presentations as PowerPoint (.pptx) files or PDF documents. Free users can preview presentations in the browser.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is there a limit to how long I can record?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Free users can create presentations with up to 8 slides. Educator plan supports up to 20 slides. Pro plan includes advanced features and unlimited slides with custom branding options.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I edit the slides after they\'re generated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes! Once generated, you can download the PowerPoint file and edit it in Microsoft PowerPoint, Google Slides, or any compatible presentation software. The AI creates a great starting point that you can customize.'
        }
      }
    ]
  };

  return (
    <div className="slide-landing">
      <Helmet>
        <title>SlideSay — Turn Your Voice Into Presentations | Free AI Slide Maker</title>
        <meta name="description" content="Create professional PowerPoint presentations by talking. SlideSay uses AI to structure your speech into beautiful slides. Free to start." />
        <link rel="canonical" href="https://slidesay.com/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="SlideSay — Turn Your Voice Into Presentations | Free AI Slide Maker" />
        <meta property="og:description" content="Create professional PowerPoint presentations by talking. SlideSay uses AI to structure your speech into beautiful slides. Free to start." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://slidesay.com/" />
        <meta property="og:image" content="https://slidesay.com/og-image.png" />
        <meta property="og:site_name" content="SlideSay" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SlideSay — Turn Your Voice Into Presentations" />
        <meta name="twitter:description" content="Create professional PowerPoint presentations by talking. AI-powered slide generation in seconds." />
        <meta name="twitter:image" content="https://slidesay.com/og-image.png" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
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
        <section className="ss-hero">
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

            {/* Enhanced Product mockup */}
            <div className="ss-hero-mockup">
              <div className="ss-mockup-bar">
                <span className="ss-mockup-dot" />
                <span className="ss-mockup-dot" />
                <span className="ss-mockup-dot" />
              </div>
              <div className="ss-mockup-body">
                <div className="ss-mockup-content">
                  <div className="ss-mockup-wave">
                    {[...Array(10)].map((_, i) => (
                      <span key={i} className="ss-mockup-wave-bar" />
                    ))}
                  </div>
                  <span className="ss-mockup-label">
                    <MicIcon />
                    Recording...
                  </span>
                </div>
                <div className="ss-mockup-slides">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="ss-mockup-slide">
                      <div className="ss-mockup-slide-title" />
                      <div className="ss-mockup-slide-line" />
                      <div className="ss-mockup-slide-line" />
                      <div className="ss-mockup-slide-line" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="ss-social-proof">
          <p className="ss-social-proof-label">Trusted by educators worldwide</p>
          <div className="ss-social-proof-stat">150+</div>
          <p className="ss-social-proof-desc">
            presentations created monthly by our top teachers — from lesson plans to parent nights
          </p>
          <div className="ss-stats-grid">
            <div className="ss-stat-item">
              <span className="ss-stat-number">2min</span>
              <span className="ss-stat-label">Avg. Creation Time</span>
            </div>
            <div className="ss-stat-item">
              <span className="ss-stat-number">10k+</span>
              <span className="ss-stat-label">Slides Generated</span>
            </div>
            <div className="ss-stat-item">
              <span className="ss-stat-number">95%</span>
              <span className="ss-stat-label">Time Saved</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="ss-howitworks">
          <h2 className="ss-step-title gradient-text">How it works</h2>
          <div className="ss-steps">
            <div className="ss-step-card">
              <span className="ss-step-icon" role="img" aria-label="Record">
                <MicIcon />
              </span>
              <h3>Record</h3>
              <p>Talk through your presentation naturally</p>
            </div>
            <div className="ss-step-card">
              <span className="ss-step-icon" role="img" aria-label="AI Structures">
                <SparklesIcon />
              </span>
              <h3>AI Structures</h3>
              <p>Our AI organizes your speech into professional slides</p>
            </div>
            <div className="ss-step-card">
              <span className="ss-step-icon" role="img" aria-label="Download">
                <DownloadIcon />
              </span>
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
              <span className="ss-feature-icon">
                <MicIcon />
              </span>
              <h3>Voice-First</h3>
              <p>Speak your ideas. SlideSay turns your voice into content in seconds.</p>
            </div>
            <div className="ss-feature-card">
              <span className="ss-feature-icon">
                <BrainIcon />
              </span>
              <h3>Smart Structuring</h3>
              <p>AI builds bullet points, organizes topics, and keeps your flow natural.</p>
            </div>
            <div className="ss-feature-card">
              <span className="ss-feature-icon">
                <LayersIcon />
              </span>
              <h3>Multiple Formats</h3>
              <p>Export professional slides as PowerPoint or PDF. Preview instantly online.</p>
            </div>
            <div className="ss-feature-card">
              <span className="ss-feature-icon">
                <PaletteIcon />
              </span>
              <h3>Professional Templates</h3>
              <p>Choose from gorgeous designs tailored for teaching, business, and beyond.</p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="ss-pricing-section" id="pricing">
          <h2 className="ss-pricing-title gradient-text">Pricing</h2>
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
            {pricingTiers.map((tier) => {
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

        {/* FAQ SECTION */}
        <section className="ss-faq">
          <h2 className="ss-faq-title gradient-text">Frequently Asked Questions</h2>
          <div className="ss-faq-list">
            <div className="ss-faq-item">
              <h3 className="ss-faq-question">How does SlideSay work?</h3>
              <p className="ss-faq-answer">
                Simply record your voice explaining your presentation topic. Our AI analyzes your speech, 
                structures it into logical sections, and generates professional slides with titles and bullet points. 
                You can preview instantly and export as PowerPoint or PDF.
              </p>
            </div>
            <div className="ss-faq-item">
              <h3 className="ss-faq-question">Do I need to write anything?</h3>
              <p className="ss-faq-answer">
                No! That's the beauty of SlideSay. Just talk naturally about your topic as if you're explaining 
                it to someone. Our AI handles all the structuring, formatting, and slide creation automatically.
              </p>
            </div>
            <div className="ss-faq-item">
              <h3 className="ss-faq-question">What formats can I export to?</h3>
              <p className="ss-faq-answer">
                On the Educator and Pro plans, you can download your presentations as PowerPoint (.pptx) files 
                or PDF documents. Free users can preview presentations in the browser.
              </p>
            </div>
            <div className="ss-faq-item">
              <h3 className="ss-faq-question">Is there a limit to how long I can record?</h3>
              <p className="ss-faq-answer">
                Free users can create presentations with up to 8 slides. Educator plan supports up to 20 slides. 
                Pro plan includes advanced features and unlimited slides with custom branding options.
              </p>
            </div>
            <div className="ss-faq-item">
              <h3 className="ss-faq-question">Can I edit the slides after they're generated?</h3>
              <p className="ss-faq-answer">
                Yes! Once generated, you can download the PowerPoint file and edit it in Microsoft PowerPoint, 
                Google Slides, or any compatible presentation software. The AI creates a great starting point 
                that you can customize.
              </p>
            </div>
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
