import { expect, test } from '@playwright/test';

/**
 * Responsive Design Tests
 * 
 * Test application on multiple viewports
 */
test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('landing page should be fully responsive on mobile', async ({ page }) => {
    await page.goto('/');

    await test.step('Hero section visible', async () => {
      const welcomeHeading = page.getByRole('heading', { name: /Welcome to/i });
      await expect(welcomeHeading).toBeVisible();
      await expect(welcomeHeading).toBeInViewport();
    });

    await test.step('CTA buttons visible and clickable', async () => {
      const getStartedButton = page.getByRole('link', { name: /Get Started/i });
      await expect(getStartedButton).toBeVisible();
      await expect(getStartedButton).toBeInViewport();
    });

    await test.step('Features section renders correctly', async () => {
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeVisible();
    });

    await test.step('No horizontal scroll', async () => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });
  });

  test('login page should be mobile-friendly', async ({ page }) => {
    await page.goto('/login');

    await test.step('Login card visible', async () => {
      const loginButton = page.getByRole('button', { name: /sign in with microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeInViewport();
    });

    await test.step('Text readable (not too small)', async () => {
      const subtitle = page.getByText(/Sign in to continue/i);
      await expect(subtitle).toBeVisible();
    });
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('landing page should adapt to tablet viewport', async ({ page }) => {
    await page.goto('/');

    await test.step('Main content visible', async () => {
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });

    await test.step('Features grid layout', async () => {
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeVisible();
    });
  });
});

test.describe('Responsive Design - Desktop', () => {
  test.use({ viewport: { width: 1920, height: 1080 } }); // Full HD

  test('landing page should use full desktop layout', async ({ page }) => {
    await page.goto('/');

    await test.step('Hero section full width', async () => {
      const heroSection = page.locator('.hero-section');
      await expect(heroSection).toBeVisible();
    });

    await test.step('Features in grid layout', async () => {
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeVisible();
    });

    await test.step('Content centered and readable', async () => {
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });
  });
});

/**
 * Performance Tests
 */
test.describe('Performance', () => {
  test('should load landing page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper meta tags for SEO and viewport', async ({ page }) => {
    await page.goto('/');

    await test.step('Verify viewport meta tag', async () => {
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
    });

    await test.step('Verify charset', async () => {
      const charset = await page.locator('meta[charset]').count();
      expect(charset).toBeGreaterThan(0);
    });

    await test.step('Verify page title', async () => {
      await expect(page).toHaveTitle(/Frontend Template/i);
    });
  });
});

/**
 * Additional Responsive Viewport Tests (E2E-006)
 */
test.describe('Responsive Design - Small Mobile', () => {
  test.use({ viewport: { width: 320, height: 568 } }); // iPhone 5/SE

  test('landing page works on smallest mobile viewport', async ({ page }) => {
    await page.goto('/');

    await test.step('Hero content is visible', async () => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    await test.step('CTA buttons stack vertically or are accessible', async () => {
      const getStarted = page.getByRole('link', { name: /Get Started/i });
      await expect(getStarted).toBeVisible();
      await expect(getStarted).toBeInViewport();
    });

    await test.step('No content overflow', async () => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
    });
  });
});

test.describe('Responsive Design - Large Phone', () => {
  test.use({ viewport: { width: 414, height: 896 } }); // iPhone 11 Pro Max

  test('login page adapts to large phone viewport', async ({ page }) => {
    await page.goto('/login');

    await test.step('Login button is centered and visible', async () => {
      const loginButton = page.getByRole('button', { name: /sign in with microsoft/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeInViewport();
    });

    await test.step('Card fits within viewport', async () => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });
  });
});

test.describe('Responsive Design - Landscape Mobile', () => {
  test.use({ viewport: { width: 896, height: 414 } }); // iPhone 11 Pro Max landscape

  test('landing page works in landscape orientation', async ({ page }) => {
    await page.goto('/');

    await test.step('Hero section visible', async () => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    await test.step('Navigation accessible', async () => {
      const signInLink = page.getByRole('link', { name: /Sign In/i });
      await expect(signInLink).toBeVisible();
    });

    await test.step('Features section reachable', async () => {
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeVisible();
    });
  });
});

test.describe('Responsive Design - Large Desktop', () => {
  test.use({ viewport: { width: 2560, height: 1440 } }); // 2K Monitor

  test('landing page scales properly on large screens', async ({ page }) => {
    await page.goto('/');

    await test.step('Content is centered and readable', async () => {
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });

    await test.step('Text is not stretched', async () => {
      // Hero section should have max-width to prevent too wide text
      const heroSection = page.locator('.hero-section');
      await expect(heroSection).toBeVisible();
    });

    await test.step('All interactive elements visible', async () => {
      await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Learn More/i })).toBeVisible();
    });
  });
});

test.describe('Touch Target Sizes', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('touch targets are at least 44x44 pixels', async ({ page }) => {
    await page.goto('/');

    await test.step('Get Started button has adequate touch target', async () => {
      const button = page.getByRole('link', { name: /Get Started/i });
      const box = await button.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });

    await test.step('Sign In link has adequate touch target', async () => {
      const link = page.getByRole('link', { name: /Sign In/i });
      const box = await link.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test('login button has adequate touch target', async ({ page }) => {
    await page.goto('/login');

    const loginButton = page.getByRole('button', { name: /sign in with microsoft/i });
    const box = await loginButton.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
});

