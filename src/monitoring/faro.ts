import {
  createReactRouterV6Options,
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration,
} from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { config } from '../config/app.config';

// Initialize Grafana Faro monitoring with React Router v6 instrumentation
export function initializeMonitoring() {
  // Only initialize when Grafana Cloud URL is configured
  // Skip in development to avoid noise, but allow override via env var
  if (!config.monitoring.grafanaCloudUrl) {
    console.log('Grafana Faro monitoring disabled: VITE_GRAFANA_CLOUD_URL not configured');
    return;
  }

  if (config.isDevelopment) {
    console.log(
      'Grafana Faro monitoring disabled in development mode (set VITE_GRAFANA_CLOUD_URL to enable)',
    );
    return;
  }

  try {
    initializeFaro({
      url: config.monitoring.grafanaCloudUrl,
      app: {
        name: config.appName,
        version: '1.0.0',
        environment: config.environment,
      },
      instrumentations: [
        // Load the default Web instrumentations
        ...getWebInstrumentations(),

        // React integration with Router v6 support
        new ReactIntegration({
          router: createReactRouterV6Options({
            createRoutesFromChildren,
            matchRoutes,
            Routes,
            useLocation,
            useNavigationType,
          }),
        }),

        // Load the tracing instrumentation
        new TracingInstrumentation(),
      ],
    });

    console.log('Grafana Faro monitoring initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Grafana Faro monitoring:', error);
  }
}
