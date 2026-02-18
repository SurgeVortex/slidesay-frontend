import { MsalProvider } from '@azure/msal-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { type BrowserRouterProps, BrowserRouter } from 'react-router-dom';
import App from './App';
import { initializeMsal, msalInstance } from './config/msal.config';
import './index.css';
import { initializeMonitoring } from './monitoring/faro';
import { initializeOpenTelemetry } from './monitoring/opentelemetry';

// React Router v7 future flags - types not yet updated
interface BrowserRouterPropsWithFuture extends BrowserRouterProps {
  future?: {
    v7_startTransition?: boolean;
    v7_relativeSplatPath?: boolean;
  };
}

// Initialize monitoring
initializeMonitoring();
initializeOpenTelemetry();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Initialize MSAL and render app
initializeMsal()
  .then(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <BrowserRouter
            {...({
              future: {
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              },
            } as BrowserRouterPropsWithFuture)}
          >
            <App />
          </BrowserRouter>
        </MsalProvider>
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error('Failed to initialize MSAL:', error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
        <div style="text-align: center;">
          <h1>Authentication Error</h1>
          <p>Failed to initialize authentication. Please refresh the page.</p>
        </div>
      </div>
    `;
  });
