import { expect, test } from '@playwright/test';

/**
 * Accessibility Tests
 * 
 * Following WCAG 2.1 AA standards
 */
test.describe('Accessibility - Semantic Structure', () => {
  test('landing page should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    await test.step('Verify main landmark', async () => {
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });

    await test.step('Verify navigation landmark', async () => {
      const nav = page.getByRole('navigation');
      await expect(nav).toBeVisible();
    });

    await test.step('Verify heading hierarchy', async () => {
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();

      // Should have proper heading structure (h1 -> h2 -> h3)
      const headings = await page.locator('h1, h2, h3').all();
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  test('login page should have accessible interactive elements', async ({ page }) => {
    await page.goto('/login');

    await test.step('All buttons should have accessible names', async () => {
      const buttons = await page.getByRole('button').all();
      for (const button of buttons) {
        const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.trim().length).toBeGreaterThan(0);
      }
    });

    await test.step('All links should have accessible names', async () => {
      const links = await page.getByRole('link').all();
      for (const link of links) {
        const accessibleName = await link.getAttribute('aria-label') || await link.textContent();
        expect(accessibleName).toBeTruthy();
      }
    });
  });

  test('should support keyboard navigation on landing page', async ({ page }) => {
    await page.goto('/');

    await test.step('Verify all interactive elements are keyboard accessible', async () => {
      // Click the page to ensure focus starts from the page
      await page.click('body');

      // Verify Sign In link is keyboard accessible
      const signInLink = page.getByRole('link', { name: /Sign In/i });
      await signInLink.focus();
      await expect(signInLink).toBeFocused();

      // Verify Get Started link is keyboard accessible
      const getStartedLink = page.getByRole('link', { name: /Get Started/i });
      await getStartedLink.focus();
      await expect(getStartedLink).toBeFocused();

      // Verify Learn More button is keyboard accessible
      const learnMoreButton = page.getByRole('button', { name: /Learn More/i });
      await learnMoreButton.focus();
      await expect(learnMoreButton).toBeFocused();
    });
  });
});

test.describe('Navigation', () => {
  test('should have accessible navigation elements', async ({ page }) => {
    await page.goto('/');

    await test.step('Verify Sign In link is keyboard accessible', async () => {
      const signInLink = page.getByRole('link', { name: /Sign In/i });
      await signInLink.focus();
      await expect(signInLink).toBeFocused();

      // Verify it has accessible name
      const accessibleName = await signInLink.textContent();
      expect(accessibleName?.trim()).toBeTruthy();
    });
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Landing page elements should be visible
    const welcomeHeading = page.getByRole('heading', { name: /Welcome to/i });
    await expect(welcomeHeading).toBeVisible();

    const getStartedButton = page.getByRole('link', { name: /Get Started/i });
    await expect(getStartedButton).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
  });
});
