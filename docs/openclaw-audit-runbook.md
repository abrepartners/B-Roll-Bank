# OpenClaw Audit + GHL Logging Runbook

## 1) Generate Audit Report JSON

```bash
node /Users/camillebrown/.codex/workspaces/default/scripts/openclaw_audit.js \
  --root "/Users/camillebrown/Downloads/Clarifying Access and Automation for GoHighLevel and ClickUp" \
  --out /tmp/openclaw_audit_report.json
```

If the audit fails, the script exits non-zero and still writes the report.

## 2) (Optional) Run Prompt-Based Codex Audit

Use `/Users/camillebrown/.codex/workspaces/default/docs/openclaw-master-audit-prompt.md` in Codex and save the JSON block to `/tmp/openclaw_audit_report.json`.

## 3) Push Results to GoHighLevel

Set environment variables:

```bash
export GHL_AUDIT_WEBHOOK_URL="https://hooks.leadconnectorhq.com/your-workflow-webhook"
export GHL_AUDIT_WEBHOOK_AUTH="optional-token"
export GHL_AGENCY_ID="your_agency_id"
export GHL_LOCATION_ID="your_location_id"
export GHL_RELATIONSHIP_NUMBER="your_relationship_number"
# Optional fallback auth:
export GHL_SUBACCOUNT_API_KEY="your_subaccount_api_key"
export GHL_AGENCY_API_KEY="your_agency_api_key"
```

Send the report:

```bash
node /Users/camillebrown/.codex/workspaces/default/scripts/log_openclaw_audit_to_ghl.js \
  --report /tmp/openclaw_audit_report.json
```

Dry run:

```bash
node /Users/camillebrown/.codex/workspaces/default/scripts/log_openclaw_audit_to_ghl.js \
  --report /tmp/openclaw_audit_report.json \
  --agency-id "$GHL_AGENCY_ID" \
  --location-id "$GHL_LOCATION_ID" \
  --relationship-number "$GHL_RELATIONSHIP_NUMBER" \
  --dry-run
```

## 4) GHL Workflow Mapping

In your GHL workflow webhook trigger, map payload fields:

- `customFields["OpenClaw Audit Status"]` -> Custom Field `OpenClaw Audit Status`
- `customFields["OpenClaw Security Level"]` -> Custom Field `OpenClaw Security Level`
- `noteMarkdown` -> Append to a note on contact/opportunity

Recommended branch rule:

- If `deploymentReadiness == "NOT SAFE TO BUILD"` then set an internal alert/tag and block deployment.
