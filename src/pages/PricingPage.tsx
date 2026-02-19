import { useState } from 'react';
import PricingCards from '../components/PricingCards';
import './PricingPage.css';

interface CheckoutResponse {
  checkout_url?: string;
  error?: string;
}

interface PortalResponse {
  portal_url?: string;
  error?: string;
}

function openStripeCheckout(email?: string): void {
  void fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      success_url: window.location.origin + '/success',
      cancel_url: window.location.origin + '/pricing',
    }),
  })
    .then((res) => res.json() as Promise<CheckoutResponse>)
    .then((data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error ?? 'Failed to open Stripe Checkout');
      }
    })
    .catch((err: unknown) => {
      console.error('Checkout error:', err);
    });
}

function openCustomerPortal(customerId: string): void {
  void fetch('/api/stripe/customer-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      return_url: window.location.origin + '/pricing',
    }),
  })
    .then((res) => res.json() as Promise<PortalResponse>)
    .then((data) => {
      if (data.portal_url) {
        window.location.href = data.portal_url;
      } else {
        alert(data.error ?? 'Failed to open Stripe Customer Portal');
      }
    })
    .catch((err: unknown) => {
      console.error('Portal error:', err);
    });
}

export default function PricingPage() {
  const [customerId, setCustomerId] = useState('');

  return (
    <div className="pricing-page">
      <h1>Simple, Transparent Pricing</h1>
      <p className="pricing-subtitle">Start free, upgrade when you need more.</p>

      <PricingCards showToggle={true} />

      <section className="pricing-faq">
        <h2>Frequently Asked Questions</h2>

        <details>
          <summary>Can I cancel anytime?</summary>
          <p>
            Yes! You can cancel your subscription at any time. Your account will remain active until
            the end of your billing period.
          </p>
        </details>

        <details>
          <summary>What happens to my presentations if I downgrade?</summary>
          <p>
            Your presentations are always safe. If you downgrade, you can still view and edit them in
            the browser. Export to PPTX/PDF requires an Educator or Pro plan.
          </p>
        </details>

        <details>
          <summary>Do you offer team plans?</summary>
          <p>
            Team plans are coming soon! For now, each user needs their own account. Contact us if you
            have specific team needs.
          </p>
        </details>

        <details>
          <summary>Is there a student discount?</summary>
          <p>
            Our Educator plan at $5/month is designed to be affordable for teachers and students
            alike. It includes everything you need for education use.
          </p>
        </details>

        <details>
          <summary>What payment methods do you accept?</summary>
          <p>
            We accept all major credit cards, debit cards, and PayPal through our payment processor
            Stripe.
          </p>
        </details>
      </section>

      <div className="pricing-cta">
        <h2>Ready to create?</h2>
        <p>Start making presentations with your voice — it&apos;s free.</p>
        <a href="/record" className="pricing-cta-btn">
          Start Creating — Free
        </a>
        <br />
        <button className="pricing-cta-btn" onClick={() => openStripeCheckout()}>
          Upgrade — Educator/Pro
        </button>
        <br />
        <input
          placeholder="Your Stripe Customer ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
        <button className="pricing-cta-btn" onClick={() => openCustomerPortal(customerId)}>
          Manage Subscription
        </button>
      </div>
    </div>
  );
}
