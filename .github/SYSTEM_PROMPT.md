## INSTRUCTIONAL SYSTEM PROMPT FOR FRONTEND DEVELOPMENT

## Application Identity
- **App Name**: slidesay
- **App Display Name**: SlideSay.com – Presentation automation platform
- **Environment**: prod
- **Frontend Domain**: slidesay.isonet.casa
- **API Base URL**: https://api-slidesay.isonet.casa

## Technology Stack
**Framework**: React 19.2+
**Build Tool**: Vite 7.2+
**Hosting**: Azure Static Web Apps (Node.js 22.21.1 supported)
**Language**: TypeScript
**Authentication**: Microsoft Entra ID (Azure AD) with MSAL
**API Communication**: RESTful HTTP calls to Azure Functions backend
**Observability**: Grafana Cloud (Faro for RUM, OTLP for traces/metrics)

**Routing**: React Router v7 with `v7_startTransition` and `v7_relativeSplatPath` future flags enabled
## Architecture Overview

Build a multi-tenant SaaS frontend application hosted on Azure Static Web Apps. Communicate only with the Azure Functions backend via RESTful HTTP. Require Microsoft Entra ID authentication for all protected resources.

### Key Architectural Principles
1. Enforce zero trust: Validate all data server-side.
5. Implement accessibility to WCAG 2.1 AA standard (see Accessibility section for minimum requirements).
3. Route all data operations through backend API only.
4. Instrument all code for observability and debugging.
5. Support progressive enhancement: Ensure basic functionality without JavaScript.
6. Implement accessibility to WCAG 2.1 AA standard.

- **Tenant ID**: `4c0a147f-72de-4be4-a172-ec74c9f1cc1d`
- **Client ID (Application ID)**: `090c0aef-232c-4e75-bc24-b003bfeb9fe8` (injected as `VITE_AZURE_CLIENT_ID` environment variable)
1. **Configuration** (`src/config/msal.config.ts`):
   - Use `PublicClientApplication` with authorization code flow + PKCE
   - Configure authority: `https://login.microsoftonline.com/4c0a147f-72de-4be4-a172-ec74c9f1cc1d`
   - Set redirectUri to frontend domain
   - Enable token caching in browser storage
   - Request scopes: `api://microsaas-factory-slidesay-prod/user_impersonation`
   - Dashboard/alert deployment: Automated via CI/CD pipeline only

2. **Application Wrapper**:
   - Wrap app with `<MsalProvider>` component
   - Initialize MSAL early in app entry point
**.npmrc**: Add `legacy-peer-deps=true` for Grafana Faro compatibility
   - Use `<AuthenticatedTemplate>` and `<UnauthenticatedTemplate>` for conditional rendering

   - Return user profile from `accounts[0]`

4. **Token Management**:
   - Use `useMsalAuthentication()` hook for automatic token acquisition
   - MSAL automatically handles token refresh before expiration
   - Include access token in `Authorization: Bearer <token>` header for all API calls
   - Add token to fetch/axios interceptors

5. **Account Management**:
   - Support multiple accounts with account switching
   - Allow users to sign out and switch accounts

### Authorization Pattern
Enforce all authorization rules in backend. Show or hide UI elements based on user roles from token claims. Always validate permissions with backend.

## API Communication

### Backend API Contract
   - Add `aria-live` regions for dynamic content updates
   - Use `aria-describedby` for form validation errors
   - Use `role="status"` for loading states
   - Minimum requirement: WCAG 2.1 AA compliance for all interactive flows, forms, and navigation. Advanced ARIA patterns (modals, accordions, etc.) are optional and project-specific.
- All frontend API contracts must match the backend contracts exactly. Reference backend system prompt for request/response formats, error handling, and status codes.
- **Base URL**: `https://api-slidesay.isonet.casa`
- **Protocol**: HTTPS only
- **Authentication**: Bearer token in Authorization header (required for all protected endpoints)
- **CORS**: Already configured on backend to allow requests from `slidesay.isonet.casa`
- **Content-Type**: `application/json`
- **Error Format**: Standardized error responses with status codes

### API Call Pattern
1. Acquire access token using MSAL.
2. Make HTTP requests with `Authorization: Bearer <token>` header.
3. Implement strict handling for all HTTP status codes:
   - 200-299: Success
   - 400: Validation error
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not found
   - 429: Rate limited (use exponential backoff)
   - 500-599: Server error (log and show sanitized error)
4. Parse JSON response body and update UI state.

### API Design Expectations
- **RESTful conventions**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- **Resource-based URLs**: `/api/users`, `/api/users/{id}`, etc.
- **Query parameters**: For filtering, pagination, sorting
- **Request/response bodies**: JSON format
- **Idempotency**: GET, PUT, DELETE should be idempotent
- **Rate limiting**: Backend enforces per-user rate limits (429 responses)

## Data Management

### State Management Options
- Local component state (useState, useReducer)
- Context API for shared state
- React Query / TanStack Query for server state
- URL state for shareable/bookmarkable views
- Local Storage for user preferences (non-sensitive only)

### Data Flow Pattern
1. Trigger events on user actions.
2. Validate all input on frontend before sending requests.
3. Send requests to backend API only.
4. Show loading state during API calls.
5. On success, update UI state and show confirmation.
6. On error, show sanitized error message and allow retry.
7. Use optimistic UI updates with rollback on error.

### Database Clarification
Do not interact with the database directly. Access all data via backend API only. Do not reference Cosmos DB or its containers in frontend code.

## Observability & Monitoring

### Grafana Cloud Integration
Configure frontend observability using Grafana Faro and OpenTelemetry:

**Environment Variables** (injected at build time):
- Public/config variables (repo variables, not secrets):
   - `VITE_GRAFANA_CLOUD_URL`: Grafana Cloud base URL
   - `VITE_APP_NAME`: Application name for service identification
   - `VITE_AZURE_TENANT_ID`: Entra tenant id
   - `VITE_AZURE_CLIENT_ID`: Application client id
   - `VITE_API_URL`: Backend API base URL
   - `VITE_GRAFANA_CLOUD_INGESTION_TOKEN`: Ingestion token (public-safe, included in client builds)
- CI/CD-only secrets (GitHub Actions secrets):
   - `GRAFANA_CLOUD_MANAGEMENT_TOKEN`: Dashboard/alert management (CI/CD only, not in build)
   - `GRAFANA_CLOUD_FOLDER_UID`: Target folder UID for dashboards/alerts (CI/CD only)
   - `GRAFANA_CLOUD_ORG_SLUG`: Grafana Cloud organization slug (CI/CD only)
   - `GRAFANA_CLOUD_STACK_SLUG`: Grafana Cloud stack slug (CI/CD only)

**Configuration**:
- **Faro Endpoint**: Construct from `VITE_GRAFANA_CLOUD_URL` + `/collect/{stackId}/faro/v1/traces`
- **OTLP Endpoint**: `VITE_GRAFANA_CLOUD_URL` + `/otlp`
- **Service Name**: Use `VITE_APP_NAME` + `-frontend`
- **Environment**: `prod`
- **Authorization**: Use `VITE_GRAFANA_CLOUD_INGESTION_TOKEN` in request headers

### Frontend Observability Requirements

#### Real User Monitoring (Grafana Faro)
1. **Install Grafana Faro SDK**: `@grafana/faro-web-sdk`, `@grafana/faro-react`
2. **Initialize Faro early**: In app entry point (before React renders)
3. **Configuration**:
   - App name: From `VITE_APP_NAME` environment variable
   - Environment: `prod`
   - URL: Grafana Cloud Faro collector endpoint (from `VITE_GRAFANA_CLOUD_URL`)
   - Session tracking enabled
   - Console instrumentation enabled
   - Web vitals instrumentation enabled
4. **Capture automatically**:
   - Page views
   - Navigation events
   - JavaScript errors
   - Unhandled promise rejections
   - Web vitals (LCP, FID, CLS, TTFB)
   - Resource timing
   - User sessions
5. **Custom instrumentation**:
   - User interactions (button clicks, form submissions)
   - API call timing
   - Custom business events
   - User context (authenticated user ID after login)

#### OpenTelemetry Integration with Faro
1. **Install packages**:
   - `@opentelemetry/api`
   - `@opentelemetry/sdk-trace-web`
   - `@opentelemetry/exporter-trace-otlp-http`
   - `@opentelemetry/instrumentation-fetch` (auto-instrument fetch calls)
   - `@opentelemetry/instrumentation-document-load`

2. **Configuration** (`src/monitoring/opentelemetry.ts`):
   - Initialize `WebTracerProvider` with batch span processor
   - Configure OTLP HTTP exporter to Grafana Cloud endpoint
   - Set service name from `VITE_APP_NAME`
   - Add resource attributes: environment, version, app name
   - Register instrumentations: fetch, document load, user interaction
   - Integrate with Grafana Faro for unified observability

3. **Distributed Tracing**:
   - OpenTelemetry automatically adds `traceparent` header to all fetch requests
   - Backend receives trace context and continues the span
   - View complete trace: frontend → backend → database in Grafana
   - Custom spans for business logic using `tracer.startActiveSpan()`

4. **Trace Context Propagation**:
   - Use W3C Trace Context format (traceparent, tracestate headers)
   - Correlate frontend errors with backend operations
   - Link user actions to API calls to database queries

5. **Integration with Faro**:
   - Faro's built-in tracing works alongside OpenTelemetry
   - Both send to same Grafana Cloud instance
   - Faro captures RUM data, OpenTelemetry captures distributed traces
   - Unified view in Grafana for complete observability

#### Custom Metrics
- Track business metrics: user actions, feature usage, conversion funnels
- Performance metrics: component render times, bundle load times
- Error metrics: error rates by type, affected users

### Dashboard & Alert Requirements (CI/CD managed)
Deploy dashboards and alerts to Grafana Cloud using `GRAFANA_CLOUD_MANAGEMENT_TOKEN` via CI/CD pipeline to the Grafana Cloud folder (`GRAFANA_CLOUD_FOLDER_UID`)

## Build & Deployment

### Build Configuration
- **Vite config**: Optimized production build, code splitting, tree shaking
- **Environment variables**: Injected at build time via `VITE_*` prefix
- **Output**: Static files (HTML, CSS, JS, assets)
- **Target**: Modern browsers (ES2020+)

### Required Environment Variables (GitHub Secrets)
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Deployment token for Azure SWA
- `AZURE_CLIENT_ID`: Entra ID application ID
- `VITE_API_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name
- `VITE_AZURE_TENANT_ID`: Entra ID tenant ID
- `VITE_GRAFANA_CLOUD_URL`: Grafana Cloud base URL
- `VITE_GRAFANA_CLOUD_INGESTION_TOKEN`: Grafana ingestion token (public-safe, write-only)
- `GRAFANA_CLOUD_MANAGEMENT_TOKEN`: Dashboard/alert management token (CI/CD only, not in build)
- `GRAFANA_CLOUD_FOLDER_UID`: Target folder UID for dashboards (CI/CD only)
- `GRAFANA_CLOUD_ORG_SLUG`: Grafana Cloud organization slug (CI/CD only)
- `GRAFANA_CLOUD_STACK_SLUG`: Grafana Cloud stack slug (CI/CD only)

### Deployment Process
1. **Build**: `npm run build` (or `vite build`)
2. **Test**: Run unit tests, integration tests, E2E tests
3. **Deploy**: Azure Static Web Apps GitHub Action
4. **Post-deploy**: Update Grafana dashboards/alerts using management token
5. **Verify**: Smoke test deployed application
6. **Monitor**: Check Grafana for deployment impact

### CI/CD Pipeline Requirements
- Trigger on push to main branch and pull requests
- Run linting, type checking, tests
- Build production bundle
- Deploy to Azure Static Web Apps
- Create/update Grafana dashboards and alerts using `GRAFANA_CLOUD_MANAGEMENT_TOKEN`
- Report deployment status

## Security Best Practices

### Client-Side Security
1. **Secrets management**: Store only public-safe values in source code and `VITE_*` variables
2. **Environment variables**: Use `VITE_*` prefix for public variables only (client IDs, URLs, etc.)
3. **XSS Prevention**: Sanitize user input, use React's built-in escaping
4. **CSRF**: Not applicable (stateless API with bearer tokens)
5. **Content Security Policy**: Configure CSP headers in `staticwebapp.config.json`
6. **HTTPS Only**: Use HTTPS for all requests
7. **Token storage**: Let MSAL handle token storage and caching securely
8. **Dependencies**: Regularly update dependencies, scan for vulnerabilities

### Data Handling
1. **Validate input**: Client-side validation for UX, backend validates for security
2. **Sanitize output**: Escape user-generated content before rendering
3. **Sensitive data**: Use POST for sensitive data, not GET with query params
4. **Logout**: Let MSAL handle token cleanup on logout
5. **Error messages**: Sanitize error messages (exclude sensitive information)

## Development Guidelines

### Code Quality
- **TypeScript**: Use strict mode, avoid `any`, define interfaces
- **React best practices**: Functional components, hooks, proper dependency arrays
- **Performance**: Lazy loading, code splitting, memoization where needed
- **Accessibility**: 
  - Use semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>`)
  - Add ARIA labels to interactive elements (`aria-label`, `aria-describedby`)
  - Add ARIA roles where semantic HTML isn't sufficient (`role="main"`, `role="region"`)
  - Implement keyboard navigation (Tab, Enter, Escape)
  - Add visible focus indicators for keyboard users
  - Set `lang="en"` on HTML element
  - Use sufficient color contrast (WCAG AA minimum)
  - Provide alt text for images
  - Complex ARIA patterns (modals, accordions, etc.) are project-specific - add when needed
- **Testing**: Unit tests (Vitest), component tests (React Testing Library), E2E tests (Playwright)
- **Linting**: ESLint with React/TypeScript rules
- **Formatting**: Prettier for consistent code style

### File Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Route components
├── hooks/          # Custom React hooks (useAuth, useApi, etc.)
├── services/       # API client, auth service
├── utils/          # Helper functions
├── context/        # React context providers
├── types/          # TypeScript type definitions
├── config/         # App configuration
│   ├── msal.config.ts      # MSAL configuration
│   └── opentelemetry.ts    # OpenTelemetry configuration
├── assets/         # Static assets (images, fonts)
└── App.tsx         # Root component
```

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`User`, `ApiResponse`)

## Configuration File

Create `staticwebapp.config.json` in repository root:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/*.{png,jpg,gif,css,js,json}"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

**Note**: MSAL handles authentication client-side. Azure Static Web Apps built-in auth (`/.auth/*` routes) is not used.

## Success Criteria

MANDATORY REQUIREMENTS:
1. Authenticate users via Microsoft Entra ID (MSAL).
2. Make authenticated API calls to backend.
3. Handle all HTTP error codes strictly.
4. Display sanitized, user-friendly error messages.
5. Implement loading states for all async operations.
6. Implement accessibility to WCAG 2.1 AA standard.
7. Ensure responsive design for mobile, tablet, desktop.
8. Instrument frontend with Grafana Faro for RUM.
9. Export traces to Grafana Cloud via OpenTelemetry.
10. Use CI/CD pipeline to deploy dashboards and alerts to Grafana Cloud.
11. Optimize for good Web Vitals scores.
12. Eliminate all console errors and warnings in production.
13. Use TypeScript strict mode.
14. Achieve high test coverage.
15. Follow React and Vite best practices.

## Critical Implementation Guidelines

1. Store only public-safe values in `VITE_*` environment variables (no secrets)
2. Include authentication token in all API calls to protected endpoints
3. Handle token expiration with automatic silent refresh via MSAL
4. Show user-friendly error messages (sanitize technical details)
5. Validate user input on frontend for UX (backend validates for security)
6. Use backend-configured CORS (do not proxy through external services)
7. Use TypeScript strict mode and avoid `any` type
8. Implement error boundaries for graceful error handling
9. Instrument all user flows with Faro and OpenTelemetry
10. Test on multiple browsers and screen sizes
11. Use environment variables for all configuration (API URLs, client IDs, etc.)
12. Implement proper loading and error states for all async operations
13. Initialize MSAL and OpenTelemetry early in app lifecycle
14. Use `acquireTokenSilent()` before making API calls
15. Add `traceparent` header to API calls for distributed tracing
16. Use semantic HTML and ARIA labels for accessibility
17. Implement keyboard navigation for all interactive elements

## Resources & Documentation

- React: https://react.dev/
- Vite: https://vitejs.dev/
- TypeScript: https://www.typescriptlang.org/
- MSAL React: https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react
- Azure Static Web Apps: https://learn.microsoft.com/en-us/azure/static-web-apps/
- Grafana Faro: https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/
- OpenTelemetry JS: https://opentelemetry.io/docs/languages/js/

## Final Notes

INSTRUCTION: Build features incrementally. Test all features thoroughly. Monitor production usage continuously. Enforce tenant isolation in all frontend interactions by scoping all requests and UI to the authenticated user. Do not allow access to any data outside the authenticated user's scope.
