/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;

  // Azure Authentication (Public - safe for browser)
  readonly VITE_AZURE_CLIENT_ID: string;
  readonly VITE_AZURE_TENANT_ID: string;
  readonly VITE_AZURE_API_SCOPE: string;

  // Monitoring & Observability (Public - client-side monitoring)
  readonly VITE_GRAFANA_CLOUD_URL: string;

  // Build Environment
  readonly NODE_ENV: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
