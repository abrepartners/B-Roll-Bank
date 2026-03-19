---
name: ghl-expert
description: "Audit GHL pipelines for stagnant opportunities, identify automation gaps, and design GHL-native workflow solutions for Engine D."
metadata: {"openclaw": {"requires": {"env": ["GHL_API_TOKEN", "GHL_LOCATION_ID"]}}}
---

# GHL Expert (The GHL Expert)

This skill handles GoHighLevel pipeline audits and automation design for Engine D (Operations).

## Progressive Disclosure
- Start with this file only.
- Read `ghl_capabilities_master.md` before recommending any automation — always check if a feature is GHL-native first.
- Read `CANVAS_INDEX.md` sections A.1–A.5 (Engine A) when auditing lead capture workflows.
- Read `CANVAS_INDEX.md` sections D.1–D.5 (Engine D) when auditing operational automation.
- Read `KNOWLEDGE.md` sections 5 (Communication), 9 (Strategy), 11 (Threats) for strategic context.

## Core Principle

Always prefer GHL-native features over custom-built solutions. GHL has extensive built-in capabilities for workflows, triggers, automations, pipelines, and messaging. The goal is zero manual operations — everything that can be automated, should be.

## Workflow

1. **Trigger**: Spawned for weekly GHL pipeline audit or specific automation design request.
2. **Pull opportunities**: `GET /opportunities/search?location_id={GHL_LOCATION_ID}&status=all`
3. **Identify stagnant opportunities**: Any opportunity with no activity in >7 days.
4. **Audit pipeline stages**: Check for opportunities stuck between stages without a trigger/action.
5. **Identify automation gaps**: Tasks Thomas or the team currently do manually that GHL could handle.
6. **Design solutions**: For each gap, propose a specific GHL workflow with trigger-action pairs.
7. **Return**: Audit report with actionable recommendations.

## API Reference

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/opportunities/search` | GET | Full opportunity list with last activity |
| `/opportunities/pipelines` | GET | Pipeline stages and IDs |
| `/workflows` | GET | Existing active workflows |
| `/contacts/search` | GET | Contact segments for automation targeting |

Base URL: `https://services.leadconnectorhq.com`
Auth header: `Authorization: Bearer {GHL_API_TOKEN}`
Version header: `Version: 2021-07-28`

## Stagnant Opportunity Criteria

| Condition | Flag Level |
| :--- | :--- |
| No activity for 7–14 days | Medium — recommend follow-up trigger |
| No activity for >14 days | High — recommend automated re-engagement |
| Opportunity in same stage >30 days | High — recommend pipeline review |

## Automation Gap Checklist

Review whether these GHL-native automations are active:

- [ ] New lead → SMS/email response within 5 minutes
- [ ] Booking confirmation → pre-shoot prep instructions
- [ ] Shoot complete tag → post-delivery follow-up trigger
- [ ] Delivery complete → review request (24h delay)
- [ ] 60-day no rebook → re-engagement sequence
- [ ] 90-day dormant → reactivation campaign trigger
- [ ] New retainer → onboarding sequence

## Definition of Done

A complete audit includes: stagnant opportunity list with days inactive, automation gaps identified with specific GHL workflow recommendations (trigger → action → goal), and priority ranking (implement first = highest impact / lowest effort).

## Report-Back Format

```
GHL EXPERT AUDIT — [DATE]

Stagnant Opportunities ([count]):
- [Client/Opp Name] | Stage: [stage] | Last Activity: [days] ago
- (or NONE)

Automation Gaps ([count]):
1. [Gap description] | Recommended: [GHL trigger] → [GHL action] | Priority: High/Medium/Low
2. (continue list...)

Active Workflows Verified: [count] working as expected
Missing Workflows: [list or NONE]
```
