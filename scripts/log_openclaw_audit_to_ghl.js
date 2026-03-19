#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function usage() {
  console.log(
    [
      "Usage:",
      "  node scripts/log_openclaw_audit_to_ghl.js --report <audit_report.json> [--webhook <url>] [--dry-run]",
      "",
      "Env fallback:",
      "  GHL_AUDIT_WEBHOOK_URL=https://hooks.leadconnectorhq.com/...",
      "  GHL_AUDIT_WEBHOOK_AUTH=optional_token_or_Bearer_header",
      "  GHL_AGENCY_ID=optional_agency_id",
      "  GHL_LOCATION_ID=optional_subaccount_location_id",
      "  GHL_RELATIONSHIP_NUMBER=optional_relationship_number",
      "  GHL_SUBACCOUNT_API_KEY=optional_subaccount_api_key_for_auth_fallback",
      "  GHL_AGENCY_API_KEY=optional_agency_api_key_for_auth_fallback",
      "",
      "Optional routing metadata:",
      "  --contact-id <id> --opportunity-id <id> --agency-id <id> --location-id <id> --relationship-number <id>",
    ].join("\n"),
  );
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeAuditStatus(value) {
  const text = String(value || "").toLowerCase();
  if (text === "approved" || text === "pass" || text === "passed") return "Approved";
  if (text === "failed" || text === "fail") return "Failed";
  return "Pending";
}

function renderFallbackNote(report) {
  return [
    "# OpenClaw Audit Report",
    "",
    `- Status: ${report.overall && report.overall.status ? report.overall.status : "Unknown"}`,
    `- Deployment Readiness: ${
      report.overall && report.overall.deploymentReadiness
        ? report.overall.deploymentReadiness
        : "Unknown"
    }`,
    `- Timestamp: ${report.auditRun && report.auditRun.timestamp ? report.auditRun.timestamp : new Date().toISOString()}`,
  ].join("\n");
}

function collectFailedRules(report) {
  const failed = [];
  const sections = Array.isArray(report.sections) ? report.sections : [];
  for (const section of sections) {
    if (!Array.isArray(section.findings)) continue;
    for (const finding of section.findings) {
      const sev = String(finding.severity || "").toLowerCase();
      if (sev === "critical" || sev === "high" || sev === "medium") {
        failed.push({
          section: section.id || section.title || "unknown",
          severity: sev,
          rule: finding.rule || "unknown_rule",
          message: finding.message || "",
        });
      }
    }
  }
  return failed;
}

function buildPayload(report, args) {
  const auditStatus = normalizeAuditStatus(
    report.ghl && report.ghl.openclawAuditStatus
      ? report.ghl.openclawAuditStatus
      : report.overall && report.overall.status
        ? report.overall.status
        : "Pending",
  );
  const securityLevel =
    (report.ghl && report.ghl.openclawSecurityLevel) ||
    (report.overall && report.overall.deploymentReadiness === "NOT SAFE TO BUILD"
      ? "Host Exec"
      : "Unknown");
  const noteMarkdown =
    (report.ghl && report.ghl.noteMarkdown) || renderFallbackNote(report);
  const approvedTools = Array.isArray(report.ghl && report.ghl.approvedTools)
    ? report.ghl.approvedTools
    : [];
  const permissionFlags = Array.isArray(report.ghl && report.ghl.permissionFlags)
    ? report.ghl.permissionFlags
    : [];
  const failedRules = collectFailedRules(report);
  const timestamp = new Date().toISOString();
  const deploymentReadiness =
    (report.overall && report.overall.deploymentReadiness) || "REQUIRES FIXES";
  const ghlContext = {
    agencyId: args["agency-id"] || process.env.GHL_AGENCY_ID || null,
    locationId: args["location-id"] || process.env.GHL_LOCATION_ID || null,
    relationshipNumber:
      args["relationship-number"] || process.env.GHL_RELATIONSHIP_NUMBER || null,
  };

  return {
    event: "openclaw_audit_completed",
    source: "codex-openclaw-audit",
    timestamp,
    contactId: args["contact-id"] || null,
    opportunityId: args["opportunity-id"] || null,
    openclawAuditStatus: auditStatus,
    openclawSecurityLevel: securityLevel,
    deploymentReadiness,
    customFields: {
      "OpenClaw Audit Status": auditStatus,
      "OpenClaw Security Level": securityLevel,
    },
    approvedTools,
    permissionFlags,
    failedRules,
    findingCounts:
      (report.overall && report.overall.findingCounts) || {},
    guardrail: {
      notSafeToBuild: deploymentReadiness === "NOT SAFE TO BUILD",
      reason:
        deploymentReadiness === "NOT SAFE TO BUILD"
          ? "Critical security policy violation"
          : null,
    },
    ghlContext,
    noteMarkdown,
    report,
  };
}

async function postJson(url, payload, authHeader) {
  const headers = { "content-type": "application/json" };
  if (authHeader && authHeader.trim().length > 0) {
    const headerValue = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader
      : `Bearer ${authHeader}`;
    headers.authorization = headerValue;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, bodyText };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    usage();
    process.exit(0);
  }

  if (!args.report) {
    usage();
    process.exit(2);
  }
  const reportPath = path.resolve(String(args.report));
  if (!fs.existsSync(reportPath)) {
    console.error(`Report file not found: ${reportPath}`);
    process.exit(2);
  }

  const report = readJson(reportPath);
  const payload = buildPayload(report, args);
  const webhook = args.webhook || process.env.GHL_AUDIT_WEBHOOK_URL;
  const auth =
    args.auth ||
    process.env.GHL_AUDIT_WEBHOOK_AUTH ||
    args["subaccount-api-key"] ||
    process.env.GHL_SUBACCOUNT_API_KEY ||
    args["agency-api-key"] ||
    process.env.GHL_AGENCY_API_KEY ||
    "";

  if (args["dry-run"]) {
    console.log(JSON.stringify(payload, null, 2));
    console.log("Dry run complete (no request sent).");
    return;
  }

  if (!webhook) {
    console.error("Missing webhook URL. Set --webhook or GHL_AUDIT_WEBHOOK_URL.");
    process.exit(2);
  }

  const result = await postJson(webhook, payload, auth);
  if (!result.ok) {
    console.error(`GHL webhook request failed with status ${result.status}`);
    console.error(result.bodyText);
    process.exit(1);
  }

  console.log(`GHL webhook accepted audit payload (status ${result.status}).`);
  if (result.bodyText && result.bodyText.trim().length > 0) {
    console.log(result.bodyText);
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
