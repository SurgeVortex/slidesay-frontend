import { beforeEach, describe, expect, it, vi } from 'vitest';

// Small helper to allow pending microtasks to flush
const flushPromises = () => new Promise((r) => setTimeout(r, 0));

// Use vi.hoisted to create mock functions that are hoisted along with vi.mock
const {
  initializeMsalMock,
  initializeMonitoringMock,
  initializeOpenTelemetryMock,
  renderSpy,
  createRootMock,
} = vi.hoisted(() => {
  const renderSpyFn = vi.fn();
  return {
    initializeMsalMock: vi.fn(),
    initializeMonitoringMock: vi.fn(),
    initializeOpenTelemetryMock: vi.fn(),
    renderSpy: renderSpyFn,
    createRootMock: vi.fn(() => ({ render: renderSpyFn })),
  };
});

// Mock all dependencies at module level (hoisted)
vi.mock('../config/msal.config', () => ({
  initializeMsal: initializeMsalMock,
  msalInstance: {},
}));

vi.mock('../monitoring/faro', () => ({
  initializeMonitoring: initializeMonitoringMock,
}));

vi.mock('../monitoring/opentelemetry', () => ({
  initializeOpenTelemetry: initializeOpenTelemetryMock,
}));

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

// Mock App and other React components to avoid their side effects
vi.mock('../App', () => ({
  default: () => null,
}));

vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: unknown }) => children,
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: unknown }) => children,
}));

describe('main.tsx bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset all mock call histories
    initializeMsalMock.mockReset();
    initializeMonitoringMock.mockReset();
    initializeOpenTelemetryMock.mockReset();
    renderSpy.mockReset();
    createRootMock.mockReset().mockReturnValue({ render: renderSpy });
    // reset DOM
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes monitoring, MSAL and calls createRoot().render when initializeMsal resolves', async () => {
    // Prepare DOM root
    document.body.innerHTML = '<div id="root"></div>';

    // Configure mock behavior
    initializeMsalMock.mockResolvedValue(undefined);

    // Import the module (runs bootstrap)
    await import('../main');

    // wait for promise handlers
    await flushPromises();

    expect(initializeMonitoringMock).toHaveBeenCalledTimes(1);
    expect(initializeOpenTelemetryMock).toHaveBeenCalledTimes(1);
    expect(initializeMsalMock).toHaveBeenCalledTimes(1);
    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('writes an authentication error to the root and logs when initializeMsal rejects', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    initializeMsalMock.mockRejectedValue(new Error('MSAL failure'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../main');
    await flushPromises();

    expect(initializeMonitoringMock).toHaveBeenCalledTimes(1);
    expect(initializeOpenTelemetryMock).toHaveBeenCalledTimes(1);
    expect(initializeMsalMock).toHaveBeenCalledTimes(1);

    // render should not be called when MSAL initialization fails
    expect(renderSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    const root = document.getElementById('root');
    expect(root).not.toBeNull();
    expect(root!.innerHTML).toContain('Authentication Error');

    consoleErrorSpy.mockRestore();
  });

  it('throws synchronously when #root element is missing', async () => {
    // No root element set in DOM
    initializeMsalMock.mockResolvedValue(undefined);

    await expect(import('../main')).rejects.toThrow('Failed to find the root element');
  });
});
