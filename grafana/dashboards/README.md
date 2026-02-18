# Custom Grafana Dashboards

This directory contains custom dashboard JSON files that are automatically synced to Grafana Cloud via CI/CD.

## What Already Exists

The **SRE Golden Signals** dashboard is already provisioned in your Grafana Cloud folder by Terraform. This includes:

- **Latency**: Page load times (P50, P95, P99), Core Web Vitals (LCP, FID)
- **Traffic**: Requests per minute, active users, page views
- **Errors**: Error rate percentage, JavaScript errors, failed API calls, poor Core Web Vitals (CLS)
- **Saturation**: Browser memory usage, CPU usage, resource utilization

**Do not recreate these default dashboards.** They are managed by Terraform and will be overwritten.

## Adding Custom Dashboards

To add additional dashboards beyond the SRE Golden Signals:

1. **Create your dashboard in Grafana Cloud UI**
   - Build and test your dashboard interactively
   - Use the Grafana Faro data source
   - Ensure panels have meaningful titles and descriptions

2. **Export the dashboard JSON**
   - Click the "Share" icon in Grafana
   - Go to the "Export" tab
   - Select "Export for sharing externally"
   - Save the JSON file

3. **Add to this directory**
   - Place the JSON file in `grafana/dashboards/`
   - Use descriptive filenames: `dashboard-feature-name.json`
   - Commit and push to the repository

4. **Automatic sync**
   - The CI/CD pipeline will automatically sync your dashboard to Grafana Cloud
   - Dashboards are uploaded to the folder specified by `GRAFANA_CLOUD_FOLDER_UID`
   - Changes are applied on every deployment to `main` branch

## Dashboard Naming Convention

Use clear, descriptive names:

- ✅ `dashboard-user-journey.json` - User journey funnel analysis
- ✅ `dashboard-checkout-flow.json` - Checkout process monitoring
- ✅ `dashboard-mobile-performance.json` - Mobile-specific metrics
- ❌ `dashboard1.json` - Not descriptive
- ❌ `my-dashboard.json` - Too generic

## Dashboard Best Practices

### Structure

- **Title**: Clear and specific (e.g., "User Authentication Flow")
- **Description**: Explain what the dashboard monitors and why
- **Tags**: Add relevant tags for discoverability
- **Variables**: Use template variables for dynamic filtering

### Panels

- **Meaningful titles**: Each panel should have a clear title
- **Tooltips**: Add descriptions explaining what metrics mean
- **Thresholds**: Set appropriate warning/critical thresholds
- **Units**: Always specify units (ms, %, requests/s, etc.)

### Performance

- **Limit queries**: Avoid too many panels (max ~20 per dashboard)
- **Optimize time ranges**: Use appropriate default time ranges
- **Use caching**: Enable query result caching where possible

## Example Dashboard Structure

```json
{
  "dashboard": {
    "title": "User Authentication Flow",
    "description": "Monitors the complete authentication journey from landing page to successful login",
    "tags": ["authentication", "user-flow", "security"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Login Attempts (Success vs Failure)",
        "type": "graph",
        "datasource": "Grafana Faro",
        "targets": [...]
      }
    ]
  }
}
```

## Folder Organization

All dashboards in this directory are synced to the Grafana Cloud folder specified by the `GRAFANA_CLOUD_FOLDER_UID` environment variable (configured during Terraform deployment).

This keeps your application's monitoring organized and separate from other projects.

## Troubleshooting

### Dashboard not appearing in Grafana Cloud

1. Check CI/CD logs for sync errors
2. Verify `GRAFANA_CLOUD_MANAGEMENT_TOKEN` secret is configured
3. Verify `GRAFANA_CLOUD_FOLDER_UID` variable is set correctly
4. Ensure JSON is valid (use a JSON validator)

### Dashboard shows no data

1. Verify data source is set to "Grafana Faro"
2. Check metric names match what Faro is sending
3. Verify time range includes when your app was running
4. Check browser console for Faro initialization errors

### Permissions errors

1. Ensure `GRAFANA_CLOUD_MANAGEMENT_TOKEN` has dashboard edit permissions
2. Verify the folder UID is correct and accessible
3. Check that your Grafana Cloud org hasn't reached dashboard limits

## Resources

- [Grafana Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
- [Grafana Faro Query Examples](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/query-frontend-data/)
- [SRE Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals)
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/)
