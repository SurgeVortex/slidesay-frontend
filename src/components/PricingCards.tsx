import { useState } from 'react';

const tiers = [
  { id: 'free', name: 'Free', priceMonthly: 0, priceAnnual: 0, features: ['5 presentations/month', '8 slides max', 'Browser preview', 'SlideSay branding'], cta: 'Get Started Free', href: '/record', highlight: false },
  { id: 'educator', name: 'Educator', priceMonthly: 5, priceAnnual: 36, features: ['Unlimited presentations', 'PPTX/PDF export', 'No branding', '20 slides max', 'Education templates'], cta: 'Start Educator', href: '/pricing', highlight: true },
  { id: 'pro', name: 'Pro', priceMonthly: 9, priceAnnual: 60, features: ['Everything in Educator', 'Custom branding', 'Advanced templates', 'Image generation', 'Priority processing'], cta: 'Go Pro', href: '/pricing', highlight: false },
];

interface PricingCardsProps {
  showToggle?: boolean;
}

export default function PricingCards({ showToggle = true }: PricingCardsProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {showToggle && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
              background: !annual ? '#6366f1' : '#e5e7eb',
              color: !annual ? 'white' : '#374151',
              borderRadius: '8px 0 0 8px',
            }}
          >Monthly</button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
              background: annual ? '#6366f1' : '#e5e7eb',
              color: annual ? 'white' : '#374151',
              borderRadius: '0 8px 8px 0',
            }}
          >Annual (Save 40%)</button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {tiers.map((t) => (
          <div
            key={t.id}
            style={{
              border: t.highlight ? '2px solid #6366f1' : '1px solid #e5e7eb',
              borderRadius: '12px', padding: '2rem', textAlign: 'center', position: 'relative',
              background: 'white',
            }}
          >
            {t.highlight && (
              <span style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#6366f1', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '0.8rem',
              }}>Recommended</span>
            )}
            <h3 style={{ margin: '0 0 0.5rem' }}>{t.name}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              {t.priceMonthly === 0 ? 'Free' : `$${annual ? Math.round(t.priceAnnual / 12) : t.priceMonthly}/mo`}
            </div>
            {annual && t.priceAnnual > 0 && (
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>${t.priceAnnual}/year</p>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left' }}>
              {t.features.map((f, i) => (
                <li key={i} style={{ padding: '0.3rem 0', fontSize: '0.9rem' }}>✓ {f}</li>
              ))}
            </ul>
            <a
              href={t.href}
              style={{
                display: 'inline-block', padding: '0.75rem 2rem',
                background: t.highlight ? '#6366f1' : '#e5e7eb',
                color: t.highlight ? 'white' : '#374151',
                borderRadius: '8px', textDecoration: 'none', fontWeight: 600,
              }}
            >{t.cta}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
