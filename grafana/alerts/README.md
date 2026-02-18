# Custom Grafana Alerts

This directory contains custom alert rule JSON files that are automatically synced to Grafana Cloud via CI/CD.

## What Already Exists

**Default alert rules** are already provisioned in your Grafana Cloud by Terraform. These include:

- **High Error Rate**: Triggers when error rate exceeds 5% for 5 minutes
- **Slow Page Load**: Triggers when P95 page load time exceeds 3 seconds
- **Poor Core Web Vitals**: Triggers when LCP, FID, or CLS exceed "Poor" thresholds
- **High Memory Usage**: Triggers when browser memory usage is abnormally high
- **Service Availability**: Triggers when the application becomes unreachable

**Do not recreate these default alerts.** They are managed by Terraform and will be overwritten.

## Adding Custom Alert Rules

To add additional alert rules beyond the defaults:

1. **Create your alert rule in Grafana Cloud UI**
   - Navigate to Alerting → Alert rules
   - Click "New alert rule"
   - Configure your query, thresholds, and evaluation interval
   - Test the alert to ensure it triggers correctly

2. **Export the alert rule JSON**
   - Click the "Edit" icon on your alert rule
   - Click the "Export" button
   - Save the JSON file

3. **Add to this directory**
   - Place the JSON file in `grafana/alerts/`
   - Use descriptive filenames: `alert-feature-name.json`
   - Commit and push to the repository

4. **Automatic sync**
   - The CI/CD pipeline will automatically sync your alert to Grafana Cloud
   - Alerts are created in the folder specified by `GRAFANA_CLOUD_FOLDER_UID`
   - Changes are applied on every deployment to `main` branch

## Alert Naming Convention

Use clear, actionable names:

- ✅ `alert-checkout-abandonment-spike.json` - High cart abandonment rate
- ✅ `alert-auth-failure-rate.json` - Authentication failures exceed threshold
- ✅ `alert-api-timeout-critical.json` - Backend API timeouts
- ❌ `alert1.json` - Not descriptive
- ❌ `my-alert.json` - Too generic

## Alert Best Practices

### Actionability

Every alert should be actionable:

- **Clear title**: "High Login Failure Rate" not "Alert 1"
- **Descriptive message**: Explain what's wrong and potential impact
- **Severity levels**: Use Warning/Critical appropriately
- **Runbook links**: Include links to troubleshooting documentation

### Thresholds

Set appropriate thresholds to avoid alert fatigue:

- **Warning**: Early indicator, should be investigated during business hours
- **Critical**: Immediate action required, pages on-call engineer
- **Evaluation period**: Use appropriate time windows (typically 5-15 minutes)
- **Grace period**: Allow brief spikes without alerting

### Query Design

- **Use aggregations**: Avoid alerting on single data points
- **Rate of change**: Consider alerts based on deltas, not absolute values
- **Multiple conditions**: Combine metrics for more reliable alerts

## Example Alert Structure

```json
{
  "alert": {
    "title": "High Authentication Failure Rate",
    "message": "Login failure rate exceeded 10% over the last 10 minutes. This may indicate:\n- Credential stuffing attack\n- Authentication service degradation\n- Recent deployment issues\n\nRunbook: https://wiki.example.com/runbooks/auth-failures",
    "severity": "warning",
    "evaluateEvery": "1m",
    "for": "10m",
    "conditions": [
      {
        "query": "sum(rate(auth_failures[5m])) / sum(rate(auth_attempts[5m]))",
        "reducer": "avg",
        "threshold": 0.1,
        "operator": "gt"
      }
    ],
    "notifications": [
      {
        "uid": "team-slack"
      }
    ]
  }
}
```

## Severity Guidelines

### Critical (Page)

- Service completely down
- Data loss occurring
- Security breach detected
- Payment processing failing
- >10% error rate sustained for 15+ minutes

### Warning (Slack/Email)

- Degraded performance (P95 latency high)
- Elevated error rate (2-5%)
- Resource usage trending toward limits
- Non-critical feature degradation
- Anomaly detection triggers

### Info (Dashboard only)

- Deployment notifications
- Capacity planning metrics
- Usage pattern changes
- Performance trends

## Notification Channels

Configure notification channels in Grafana Cloud UI:

1. Navigate to Alerting → Contact points
2. Add your notification channels:
   - **Critical**: PagerDuty, OpsGenie, or phone
   - **Warning**: Slack team channel
   - **Info**: Email or dashboard annotations

3. Use contact point UIDs in your alert JSON files

## Alert States

- **Normal**: Metric is within acceptable range
- **Pending**: Threshold exceeded, waiting for evaluation period
- **Alerting**: Threshold exceeded for full evaluation period, notifications sent
- **No Data**: Query returned no data (might indicate collection issue)

## Testing Alerts

Before deploying:

1. **Test in Grafana Cloud UI**: Use "Test rule" to verify query and thresholds
2. **Check notification routing**: Ensure alerts go to correct channels
3. **Verify runbooks**: Ensure linked documentation is accessible
4. **Trigger intentionally**: If possible, cause the condition to verify end-to-end flow

## Folder Organization

All alerts in this directory are synced to the Grafana Cloud folder specified by the `GRAFANA_CLOUD_FOLDER_UID` environment variable (configured during Terraform deployment).

This keeps your application's alerts organized and separate from other projects.

## Troubleshooting

### Alert not appearing in Grafana Cloud

1. Check CI/CD logs for sync errors
2. Verify `GRAFANA_CLOUD_MANAGEMENT_TOKEN` secret is configured
3. Verify `GRAFANA_CLOUD_FOLDER_UID` variable is set correctly
4. Ensure JSON is valid (use a JSON validator)
5. Check that alert rule query is valid

### Alert not triggering

1. Verify query returns data in Grafana Explore
2. Check evaluation interval and "for" duration
3. Review threshold values and operators
4. Ensure notification channels are configured
5. Check alert state history in Grafana UI

### Too many false positives

1. Increase evaluation period ("for" duration)
2. Adjust thresholds based on historical data
3. Use percentile aggregations instead of averages
4. Add multiple conditions to reduce noise
5. Consider time-based silences for maintenance windows

### Alerts not routing correctly

1. Verify contact point UIDs are correct
2. Check notification policy routing rules
3. Ensure contact points are not muted
4. Review notification delivery logs in Grafana

## Alert Maintenance

Regularly review and update alerts:

- **Monthly**: Review alert frequency and adjust thresholds
- **After incidents**: Create new alerts for detected gaps
- **After deployments**: Verify alerts still work with new metrics
- **Quarterly**: Audit and remove obsolete alerts

## Resources

- [Grafana Alerting Documentation](https://grafana.com/docs/grafana/latest/alerting/)
- [Alert Rule JSON Model](https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/)
- [SRE Best Practices for Alerting](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Avoiding Alert Fatigue](https://docs.datadoghq.com/monitors/guide/reduce-alert-fatigue/)
