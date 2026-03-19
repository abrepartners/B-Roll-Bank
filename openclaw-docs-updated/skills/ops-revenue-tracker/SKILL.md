---
name: ops-revenue-tracker
description: "Pull GHL revenue data, calculate KPIs, and generate Daily Pulse financial summaries for Engine D."
metadata: {"openclaw": {"requires": {"env": ["GHL_API_TOKEN", "GHL_LOCATION_ID"]}}}
---

# Ops Revenue Tracker (The Analyst)

This skill runs the revenue and KPI tracking workflow for Engine D (Operations).

## Progressive Disclosure
- Start with this file only.
- Read `CANVAS_INDEX.md` sections K.1–K.6 only when KPI targets are needed.
- Read `CANVAS_INDEX.md` sections R.1–R.2 only when comparing against revenue targets.
- Read `api_research.md` only when specific GHL endpoint details are needed.

## Workflow

1. **Trigger**: Spawned by Orchestrator for Daily Pulse, weekly review, or ad-hoc revenue question.
2. **Pull opportunities**: `GET /opportunities/search?location_id={GHL_LOCATION_ID}&status=all` — filter by last 24h (or requested period).
3. **Pull pipelines**: `GET /opportunities/pipelines?locationId={GHL_LOCATION_ID}` — identify stage distribution.
4. **Calculate**:
   - Total new opportunities (count and value)
   - Revenue closed (won opportunities)
   - MTD revenue vs. $62,500/month target
   - Week-to-date revenue vs. $14,400/week target
   - AOV for the period
5. **Flag**: Any metric >15% below target pace gets a red flag note.
6. **Return**: Structured summary (see report-back format below).

## API Reference

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/opportunities/search` | GET | Opportunity list with value and status |
| `/opportunities/pipelines` | GET | Pipeline stage names and IDs |

Base URL: `https://services.leadconnectorhq.com`
Auth header: `Authorization: Bearer {GHL_API_TOKEN}`
Version header: `Version: 2021-07-28`

## Definition of Done

A complete report includes: period covered, total opportunities, revenue value, MTD/WTD vs. target comparison, AOV, and any flagged metrics. Delivered as structured text within one API session.

## Report-Back Format

```
ANALYST REPORT — [DATE/PERIOD]
New Opportunities: [count] | Value: $[total]
Revenue Closed: $[amount]
MTD: $[amount] / $62,500 target ([%])
WTD: $[amount] / $14,400 target ([%])
AOV: $[amount]
Pipeline: [stage distribution summary]
Flags: [any metrics below target, or NONE]
```
