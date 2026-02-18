# Grafana Cloud Observability for Frontend

This directory contains the Grafana Cloud observability configuration for real user monitoring (RUM), distributed tracing, and metrics using Grafana Faro and OpenTelemetry.

## Architecture Overview

All frontend telemetry is sent to **Grafana Cloud** using:

- **Grafana Faro SDK**: Automatically captures page views, navigation, errors, and web vitals
- **OpenTelemetry**: Exports distributed traces for all API calls
- **Grafana Cloud Collector**: Single endpoint for all telemetry data (URL includes embedded token)

## Folder Structure

```text
grafana/
├── README.md                      # This file - architecture and setup guide
├── dashboard-golden-signals.json  # Reference dashboard (managed by Terraform, do not edit)
├── dashboards/                    # Custom dashboards (auto-synced via CI/CD)
│   └── README.md                  # Guide for adding custom dashboards
└── alerts/                        # Custom alert rules (auto-synced via CI/CD)
    └── README.md                  # Guide for adding custom alerts
```

## What Already Exists (Managed by Terraform)

🚨 **Do not recreate or edit these resources** - they are provisioned by Terraform:

### Default Dashboard: SRE Golden Signals

Located in your Grafana Cloud folder, includes panels for:

- **Latency**: Page load times (P50, P95, P99), Core Web Vitals (LCP, FID)
- **Traffic**: Requests per minute, active users, page views
- **Errors**: Error rate percentage, JavaScript errors, failed API calls, poor Core Web Vitals (CLS)
- **Saturation**: Browser memory usage, CPU usage, resource utilization

### Default Alerts

Standard alert rules for:

- High error rate (>5% for 5+ minutes)
- Performance degradation (P95 latency >3s)
- Poor Core Web Vitals (LCP, FID, CLS exceed thresholds)
- Service availability issues

### Infrastructure

- Grafana Cloud stack and organization
- Faro collector endpoint
- Target folder (identified by `GRAFANA_CLOUD_FOLDER_UID`)
- Service account and management token

## Environment Variables and Secrets

### Build Time (Frontend Bundle)

These are **PUBLIC** variables embedded in the frontend bundle at build time:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `VITE_GRAFANA_CLOUD_URL` | Secret | Faro collector endpoint with embedded token | `https://faro-collector-prod-us-east-0.grafana.net/collect/{instanceId}` |
| `VITE_APP_NAME` | Variable | Application name for service identification | `my-saas-app` |

⚠️ **Security Note**: `VITE_GRAFANA_CLOUD_URL` contains an embedded token but is safe to expose in browser. It only grants permission to **submit** telemetry data, not read or manage Grafana resources.

### CI/CD Time (GitHub Actions Only)

These secrets are used **only** in CI/CD for managing dashboards/alerts:

| Variable | Type | Description |
|----------|------|-------------|
| `GRAFANA_CLOUD_MANAGEMENT_TOKEN` | Secret | Token for dashboard/alert API operations |
| `GRAFANA_CLOUD_FOLDER_UID` | Variable | Target folder UID for organizing resources |

## How It Works

### 1. Frontend Instrumentation

The application initializes Grafana Faro on startup:

```typescript
// src/monitoring/faro.ts
initializeFaro({
  url: config.monitoring.grafanaCloudUrl,  // From VITE_GRAFANA_CLOUD_URL
  app: {
    name: config.appName,                   // From VITE_APP_NAME
    version: '1.0.0',
    environment: 'production',
  },
  instrumentations: [
    ...getWebInstrumentations(),           // Page views, errors, web vitals
    new ReactIntegration(),                // React Router tracking
    new TracingInstrumentation(),          // Distributed tracing
  ],
});
```

### 2. Automatic Telemetry Collection

Faro automatically captures:

- ✅ Page views and navigation events
- ✅ JavaScript errors and exceptions
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ User sessions and demographics
- ✅ API call traces with timing
- ✅ Custom events and logs

### 3. CI/CD Workflow

The deployment pipeline (`.github/workflows/deploy.yml`) handles:

**Build Phase:**

```yaml
- name: Build application
  env:
    VITE_GRAFANA_CLOUD_URL: ${{ secrets.VITE_GRAFANA_CLOUD_URL }}
    VITE_APP_NAME: ${{ vars.VITE_APP_NAME }}
  run: npm run build
```

**Deploy Phase:**

```yaml
- name: Deploy to Azure Static Web Apps
  # Deploys built application with embedded Faro config
```

**Grafana Sync Phase** (only on `main` branch):

```yaml
- name: Sync Custom Dashboards to Grafana Cloud
  # Uploads JSON files from grafana/dashboards/

- name: Sync Custom Alerts to Grafana Cloud
  # Uploads JSON files from grafana/alerts/
```

## Setup Instructions

### Prerequisites (Already Done by Terraform)

✅ Grafana Cloud stack provisioned  
✅ Faro application created  
✅ Collector endpoint configured  
✅ Service account with management token created  
✅ Default dashboards and alerts provisioned

### 1. Configure GitHub Secrets

Add these to your repository settings (Settings → Secrets and variables → Actions):

**Secrets:**

- `VITE_GRAFANA_CLOUD_URL`: Faro collector endpoint (format: `https://faro-collector-prod-{region}.grafana.net/collect/{instanceId}`)
- `GRAFANA_CLOUD_MANAGEMENT_TOKEN`: Service account token for API operations

**Variables:**

- `VITE_APP_NAME`: Your application name (e.g., `my-saas-app`)
- `GRAFANA_CLOUD_FOLDER_UID`: Target folder UID from Terraform output

### 2. Local Development Setup

Create `.env.local` (never commit this file):

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit .env.local with your values
VITE_APP_NAME=My Local App
VITE_API_URL=http://localhost:7071
VITE_AZURE_CLIENT_ID=your-dev-client-id
VITE_AZURE_TENANT_ID=your-dev-tenant-id

# Optional: Enable Faro in development (usually disabled to reduce noise)
# VITE_GRAFANA_CLOUD_URL=https://faro-collector-prod-us-east-0.grafana.net/collect/your-instance-id
```

**Note**: Faro is automatically disabled in development mode to avoid polluting production metrics. To enable, set `VITE_GRAFANA_CLOUD_URL` in `.env.local`.

### 3. Verify Telemetry Flow

After deployment:

1. **Open your application** in a browser
2. **Check browser console** for Faro initialization:

   ```text
   Grafana Faro monitoring initialized successfully
   ```

3. **Open browser DevTools** → Network tab → Filter for "collect"
4. **Verify requests** are being sent to Grafana Cloud collector
5. **Wait 1-2 minutes** for data to appear in Grafana Cloud
6. **Open Grafana Cloud** → Dashboards → Your folder → SRE Golden Signals

## Adding Custom Dashboards and Alerts

### Custom Dashboards

1. Navigate to `grafana/dashboards/`
2. Read `dashboards/README.md` for detailed instructions
3. Add your dashboard JSON file
4. Commit and push to `main` branch
5. CI/CD automatically syncs to Grafana Cloud

### Custom Alerts

1. Navigate to `grafana/alerts/`
2. Read `alerts/README.md` for detailed instructions
3. Add your alert rule JSON file
4. Commit and push to `main` branch
5. CI/CD automatically syncs to Grafana Cloud

## Troubleshooting

### No data appearing in Grafana Cloud

1. ✅ Check browser console for Faro initialization errors
2. ✅ Verify `VITE_GRAFANA_CLOUD_URL` is set correctly in GitHub Secrets
3. ✅ Open Network tab and confirm "collect" requests are being sent
4. ✅ Check that Faro collector endpoint is accessible (no CORS errors)
5. ✅ Wait 1-2 minutes for initial data ingestion
6. ✅ Verify you're looking at the correct time range in Grafana

### Dashboard/Alert sync failing in CI/CD

1. ✅ Check GitHub Actions logs for error messages
2. ✅ Verify `GRAFANA_CLOUD_MANAGEMENT_TOKEN` secret is configured
3. ✅ Verify `GRAFANA_CLOUD_FOLDER_UID` variable is set correctly
4. ✅ Ensure JSON files are valid (use a JSON validator)
5. ✅ Check that management token has appropriate permissions

### Faro not initializing

1. ✅ Ensure you're running in production mode or have explicitly enabled Faro in development
2. ✅ Check that `VITE_GRAFANA_CLOUD_URL` is defined in environment
3. ✅ Verify no JavaScript errors prevent monitoring initialization
4. ✅ Check browser console for specific error messages

### High data volume costs

1. ✅ Review sampling configuration in `faro.ts`
2. ✅ Consider disabling Faro in preview deployments
3. ✅ Implement session-based sampling for high-traffic applications
4. ✅ Monitor your Grafana Cloud usage dashboard

## Best Practices

### Monitoring

1. **Review dashboards daily** - Check SRE Golden Signals for trends
2. **Investigate alerts promptly** - Alerts indicate real user impact
3. **Correlate metrics** - When one signal degrades, check others
4. **Track deployments** - Annotate dashboards with deployment markers
5. **Set SLOs** - Define Service Level Objectives based on these metrics

### Development

1. **Keep Faro disabled in development** - Avoid polluting production data
2. **Test in staging** - Verify telemetry works before production deployment
3. **Use custom events** - Add application-specific tracking with `faro.api.pushEvent()`
4. **Respect privacy** - Don't log PII or sensitive user data

### Operations

1. **Tune alert thresholds** - Reduce false positives based on historical data
2. **Document runbooks** - Link alerts to troubleshooting documentation
3. **Rotate tokens** - Periodically update `GRAFANA_CLOUD_MANAGEMENT_TOKEN`
4. **Audit dashboards** - Remove unused dashboards quarterly

## Core Web Vitals Reference

Google's Core Web Vitals thresholds:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

All metrics measured at the **75th percentile** of page loads.

## Resources

### Grafana Documentation

- [Grafana Faro Web SDK](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/)
- [Grafana Cloud Frontend Observability](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/browser/)
- [Query Frontend Data](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/query-frontend-data/)

### SRE and Monitoring

- [Google SRE Book - Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [The Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals)

### Web Performance

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)

### OpenTelemetry

- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/instrumentation/js/)
- [Distributed Tracing](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)

## Support

For issues specific to this template:

- Check the troubleshooting section above
- Review GitHub Actions logs for CI/CD errors
- Verify all environment variables are configured correctly

For Grafana Cloud issues:

- [Grafana Cloud Support](https://grafana.com/support/)
- [Grafana Community Forums](https://community.grafana.com/)
- [Grafana Slack](https://slack.grafana.com/)
