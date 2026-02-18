# Frontend Template for Azure Static Web Apps

Production-ready React + TypeScript template for Azure Static Web Apps with MSAL authentication, distributed tracing, and real user monitoring.

## Tech Stack

- **React 19.2** + **TypeScript 5.9** + **Vite 7.2**
- **MSAL React** - Microsoft Authentication Library for Entra External ID
- **Grafana Faro** - Real user monitoring (RUM), web vitals, error tracking
- **OpenTelemetry** - Distributed tracing (integrated with Faro)
- **Node.js 22** (Azure SWA supported)
- **GitHub Actions** CI/CD with security scanning

## Features

### Authentication & Authorization

- ✅ **MSAL React** for full OAuth2/OIDC control
- ✅ **Entra External ID** integration
- ✅ Automatic token refresh and management
- ✅ Backend JWT authentication
- ✅ Account switching support

### Observability & Monitoring

- ✅ **Grafana Faro** for frontend monitoring:
  - Real user monitoring (RUM)
  - Web Vitals (LCP, FID, CLS)
  - JavaScript error tracking
  - Session recording
  - User flow analysis
- ✅ **OpenTelemetry** for distributed tracing:
  - End-to-end trace correlation with backend
  - Automatic fetch/XHR instrumentation
  - Context propagation (traceparent headers)
  - Integration with backend Azure Functions

### Code Quality & Security

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Pre-commit hooks (Husky + lint-staged)
- ✅ Secret scanning (detect-secrets, TruffleHog)
- ✅ Dependency scanning (Dependabot, npm audit)
- ✅ CodeQL security analysis
- ✅ Accessibility improvements (WCAG basics)

## Quick Start

```bash
# Install dependencies (Node.js 22 required)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run all quality checks
npm run lint && npm run type-check && npm run test:coverage
```

## Testing

This project includes comprehensive testing:

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright (Chromium, Firefox, WebKit)
- **Coverage**: V8 coverage with 80% thresholds

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Environment Variables

All environment variables are configured as GitHub Secrets or local `.env.local` file:

**Application:**

- `VITE_APP_NAME` - Application name
- `VITE_API_URL` - Backend API URL

**Azure Authentication:**

- `VITE_AZURE_CLIENT_ID` - Azure AD Application (Client) ID (PUBLIC - used in browser)
- `VITE_AZURE_TENANT_ID` - Azure AD Tenant ID (PUBLIC - used in browser)
- `VITE_AZURE_API_SCOPE` - API scope for token acquisition (e.g., `api://<client-id>/access_as_user`)

**Monitoring:**

- `VITE_GRAFANA_CLOUD_URL` - Grafana Faro collector endpoint (includes embedded token)

### Local Development

Create `.env.local` (gitignored):

```bash
VITE_APP_NAME=My Local App
VITE_API_URL=http://localhost:7071
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
VITE_AZURE_API_SCOPE=api://your-azure-client-id/access_as_user
VITE_GRAFANA_CLOUD_URL=https://faro-collector-prod-us-east-0.grafana.net/collect/your-instance-id
```

## Authentication Setup

### 1. Create Entra External ID Application

1. Go to [Azure Portal](https://portal.azure.com/) → Entra External ID
2. Create a new application registration
3. Set redirect URI: `http://localhost:3000/welcome` (dev) and `https://your-app.azurestaticapps.net/welcome` (prod)
4. Note the **Application (client) ID** and **Tenant ID**

### 2. Configure GitHub Secrets/Variables

**Variables:**

- `VITE_APP_NAME`, `VITE_API_URL`, `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`, `VITE_AZURE_API_SCOPE`, `VITE_GRAFANA_CLOUD_URL`

**Secrets:**

- `AZURE_STATIC_WEB_APPS_API_TOKEN`, `GRAFANA_CLOUD_MANAGEMENT_TOKEN` (for dashboard/alert sync)

## Project Structure

```plaintext
src/
├── config/          # App and MSAL configuration
├── hooks/           # React hooks (useAuth with MSAL)
├── monitoring/      # Grafana Faro + OpenTelemetry
├── pages/           # Page components
├── utils/           # API client with token management
└── test/            # Test utilities
```

## Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions to Azure Static Web Apps.

## Why MSAL Instead of SWA Built-in Auth?

This template uses **MSAL React** for authentication:

**Benefits:**

- ✅ Full control over auth flow
- ✅ Better token management
- ✅ Account switching support
- ✅ Easier local development

**Trade-offs:**

- ❌ No `/.auth/me` endpoint
- ⚠️ Must configure CORS on backend

## License

MIT
