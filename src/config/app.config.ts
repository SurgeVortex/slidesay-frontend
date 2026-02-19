/**
 * Application Configuration
 *
 * All environment variables are configured as GitHub Secrets
 * and injected during build via CI/CD.
 *
 * Usage:
 * - VITE_* variables are embedded in the frontend bundle at build time
 * - All VITE_* variables are PUBLIC and safe to expose to browsers
 * - Never hardcode application names, URLs, or credentials
 */

export const config = {
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Default App',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:7071',

  // Azure Authentication (Public - safe for browser)
  azure: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    apiScope: import.meta.env.VITE_AZURE_API_SCOPE,
    ciamDomain: import.meta.env.VITE_AZURE_CIAM_DOMAIN || 'isonet.casa',
  },

  // Monitoring & Observability (Public - client-side monitoring)
  monitoring: {
    grafanaCloudUrl: import.meta.env.VITE_GRAFANA_CLOUD_URL as string | undefined,
  },

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  environment: import.meta.env.MODE || 'development',
} as const; /**
 * Type-safe configuration access
 *
 * @example
 * ```typescript
 * import { config } from '@/config/app.config';
 *
 * // ✅ Correct usage
 * const appName = config.appName;
 * const apiUrl = config.apiUrl;
 * const tenantId = config.azure.tenantId;
 * ```
 */
export type AppConfig = typeof config;

export default config;
