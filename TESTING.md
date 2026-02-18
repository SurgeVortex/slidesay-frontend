# Testing Guide

This project uses a **multi-layer testing strategy** that prioritizes **integration testing** over excessive mocking.

## Testing Philosophy

### Why Minimal Mocking?

**Mocking creates artificial test environments** that can give false confidence. Our approach:

1. **Integration Tests (Primary)** - Test real components working together
   - Use actual routing, state management, and component interactions
   - Only mock external services (APIs, authentication providers)
   - **This gives the highest ROI** - catches real bugs while staying fast

2. **E2E Tests (Verification)** - Test the complete user experience
   - No mocking at all
   - Real browser interactions with Playwright
   - Slower but provides ultimate confidence

3. **Unit Tests (Selective)** - Only for complex utility functions
   - Pure functions, calculations, data transformations
   - These benefit from isolated testing

### What We Mock (and Why)

✅ **DO Mock:**

- External API calls (network is unreliable in tests)
- Authentication providers (MSAL, OAuth - require real credentials)
- Third-party services (monitoring, analytics)

❌ **DON'T Mock:**

- React Router (use real routing in tests)
- React components (test them together)
- Application state (test real state flow)
- Browser APIs (use jsdom which provides real-ish implementations)

---

This project includes comprehensive testing setup with both unit tests (Vitest) and end-to-end tests (Playwright).

## Unit Tests with Vitest

### Running Unit Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Unit Tests

Unit tests are located in `src/__tests__/` directory. Example:

```typescript
import { describe, expect, it, vi } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Your test here
    expect(true).toBe(true);
  });
});
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory. Thresholds are set to 80% for:

- Lines
- Functions
- Branches
- Statements

## E2E Tests with Playwright

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run a single test file
npx playwright test e2e/app.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"

# Run tests in a specific project (browser)
npx playwright test --project=chromium
```

### Writing E2E Tests

E2E tests are located in the `e2e/` directory. Example:

```typescript
import { expect, test } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});
```

### Test Configuration

Playwright is configured to test against multiple browsers:

- Chromium
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

Configuration can be found in `playwright.config.ts`.

## CI/CD Integration

### GitHub Actions

Tests are automatically run on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

#### Quality Workflow

- Runs linting, formatting, type checking
- Runs unit tests with coverage
- Runs E2E tests (Chromium only)
- Uploads coverage to Codecov

#### E2E Workflow

- Runs E2E tests across all browsers in parallel
- Uploads test reports and artifacts
- Can be triggered manually via workflow_dispatch

### Local Pre-commit Hooks

Husky is configured to run tests before commits:

```bash
# This runs automatically before commit
npm run lint
npm run type-check
npm test
```

## Test Best Practices

### Unit Tests

1. **Test user behavior, not implementation details**
2. **Use Testing Library queries by priority**: role > label > placeholder > text
3. **Mock external dependencies** (API calls, authentication)
4. **Keep tests isolated** - no shared state between tests
5. **Write descriptive test names** that explain what is being tested

### E2E Tests

1. **Test critical user journeys** - authentication, navigation, core features
2. **Use data-testid sparingly** - prefer accessible selectors (role, label)
3. **Wait for elements properly** - use Playwright's auto-waiting
4. **Test across different viewports** - mobile, tablet, desktop
5. **Keep tests independent** - each test should be runnable in isolation

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm test -- src/__tests__/api.test.ts

# Run tests matching pattern
npm test -- --grep "should fetch"
```

### Playwright

```bash
# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Run with browser visible
npm run test:e2e:headed

# View trace viewer for failed tests
npx playwright show-trace test-results/*/trace.zip
```

## Test Reports

- **Unit test coverage**: `coverage/index.html`
- **Playwright HTML report**: `playwright-report/index.html`
- **Playwright JSON results**: `playwright-report/results.json`

Open HTML reports in your browser for detailed insights.

## Troubleshooting

### Playwright Installation Issues

If Playwright browsers fail to install:

```bash
# Install all browsers
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium
```

### Test Timeout Issues

If tests are timing out, adjust timeouts in:

- `playwright.config.ts` - for E2E test timeouts
- `vitest.config.ts` - for unit test timeouts

### Port Already in Use

If the dev server fails to start (port 3000 in use):

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
