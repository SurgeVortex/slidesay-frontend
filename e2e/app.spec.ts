import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display complete landing page with all sections', async ({ page }) => {
    await test.step('Navigate to landing page', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Frontend Template/i);
    });

    await test.step('Verify hero section', async () => {
      const heroHeading = page.getByRole('heading', { level: 1, name: /Welcome to/i });
      await expect(heroHeading).toBeVisible();

      const subtitle = page.getByText(/Experience the future of productivity/i);
      await expect(subtitle).toBeVisible();
    });

    await test.step('Verify navigation buttons', async () => {
      await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Learn More/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    });

    await test.step('Verify features section', async () => {
      await expect(page.getByText(/Why Choose/i)).toBeVisible();
      await expect(page.getByText(/Lightning Fast/i)).toBeVisible();
      await expect(page.getByText(/Enterprise Security/i)).toBeVisible();
      await expect(page.getByText(/Advanced Analytics/i)).toBeVisible();
    });

    await test.step('Verify footer', async () => {
      const footer = page.locator('.landing-footer');
      await expect(footer.getByText(/© 2024.*All rights reserved/i)).toBeVisible();
      await expect(footer.getByText(/Built with.*React 19/i)).toBeVisible();
    });
  });

  test('should navigate to login page via Get Started button', async ({ page }) => {
    await test.step('Click Get Started', async () => {
      await page.goto('/');
      await page.getByRole('link', { name: /Get Started/i }).click();
    });

    await test.step('Verify login page loaded', async () => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page.getByRole('button', { name: /sign in with microsoft/i })).toBeVisible();
    });
  });

  test('should navigate to login page via Sign In link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should scroll to features when Learn More clicked', async ({ page }) => {
    await page.goto('/');

    await test.step('Click Learn More button', async () => {
      await page.getByRole('button', { name: /Learn More/i }).click();
    });

    await test.step('Verify features section is visible', async () => {
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeInViewport();
    });
  });
});

test.describe('Login Page', () => {
  test('should display login page with all elements', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
    });

    await test.step('Verify app branding', async () => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText(/Sign in to continue/i)).toBeVisible();
    });

    await test.step('Verify login button', async () => {
      const loginButton = page.getByRole('button', { name: /sign in with microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();
    });

    await test.step('Verify footer text', async () => {
      await expect(page.getByText(/By signing in, you agree to our terms/i)).toBeVisible();
      await expect(page.getByText(/Microsoft Entra ID/i)).toBeVisible();
    });
  });

  test('should have accessible and keyboard-navigable login button', async ({ page }) => {
    await page.goto('/login');

    await test.step('Verify login button is keyboard accessible', async () => {
      const loginButton = page.getByRole('button', { name: /sign in with microsoft/i });
      await loginButton.focus();
      await expect(loginButton).toBeFocused();
    });

    await test.step('Verify button has aria-label', async () => {
      const loginButton = page.getByRole('button', { name: /sign in with microsoft/i });
      const ariaLabel = await loginButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Microsoft');
    });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from /welcome to landing page', async ({ page }) => {
    await page.goto('/welcome');
    await expect(page).toHaveURL('/');
  });

  test('should redirect unknown routes to landing page when not authenticated', async ({ page }) => {
    await page.goto('/unknown-route-12345');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Accessibility', () => {
  test('landing page should have proper document structure', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // Check for navigation
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Check for heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login');

    // Check that interactive elements have accessible names
    const buttons = await page.getByRole('button').all();
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
      expect(accessibleName).toBeTruthy();
    }
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();

    // Check charset
    const charset = await page.locator('meta[charset]').count();
    expect(charset).toBeGreaterThan(0);
  });
});
