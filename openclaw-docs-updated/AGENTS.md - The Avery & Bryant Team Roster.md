# AGENTS.md - The Avery & Bryant Team Roster

> **For the Orchestrator's eyes only.** Do NOT pass this file to sub-agents. Each sub-agent receives only its own task description, credentials, and skill reference.

---

## How to Use This Roster

When a task arrives, follow this process:

1. **Identify** which Engine (A-E) the task belongs to.
2. **Select** the corresponding sub-agent from the table below.
3. **Spawn** the sub-agent using the `sessions_spawn` tool. Provide it with:
   - A clear, one-sentence task description.
   - The **Skill Reference** file path so it knows its SOP.
   - The **Credentials** it needs (and nothing else — pass env var names, not values).
   - The instruction: *"When complete, return your findings as a structured summary."*
4. **Synthesize** the sub-agent's output into the Daily Pulse or the relevant report for Thomas.

---

## Agent Roster

| # | Agent Name | Engine | Skill Reference | Model Tier | Primary Function |
|---|---|---|---|---|---|
| 1 | **The Analyst** | D (Ops) | `skills/ops-revenue-tracker/SKILL.md` | Tier 2 | Revenue tracking, KPI calculation, Daily Pulse data. |
| 2 | **The Coordinator** | B (Production) | `skills/production-manager/SKILL.md` | Tier 2 | Shoot scheduling, task monitoring, Red Flag identification. |
| 3 | **The Copywriter** | C (Growth) | `skills/client-growth-nurture/SKILL.md` | Tier 2 | Follow-ups, review requests, upsell messaging. |
| 4 | **The Strategist** | E (Expansion) | `skills/business-expansion/SKILL.md` | Tier 1 | Revenue goal alignment, new stream ideation, canvas updates. |
| 5 | **The Scout** | A (Lead Capture) | `skills/lead-capture-pro/SKILL.md` | Tier 2 | Lead qualification, booking, and intake automation. |
| 6 | **The Marketer** | C (Growth) | `skills/email-marketing/SKILL.md` | Tier 2 | Email campaigns, drip sequences, SMS outreach, newsletters. |
| 7 | **The Designer** | C (Growth) + E | `skills/creative-designer/SKILL.md` | Tier 2 | Social media graphics, listing flyers, brand assets. |
| 8 | **The Bookkeeper** | D (Ops) | `skills/bookkeeper/SKILL.md` | Tier 2 | Stripe reconciliation, invoices, revenue reporting. |
| 9 | **The Comms Manager** | B + C | `skills/comms-manager/SKILL.md` | Tier 2 | Inbox triage, unanswered message detection, escalation routing. |
| 10 | **The GHL Expert** | D (Ops) | `skills/ghl-expert/SKILL.md` | Tier 2 | GHL automation design, pipeline audits, workflow builds. |

---

## Agent Details

### 1. THE ANALYST (Engine D - Ops & Revenue)

**When to spawn**: Daily Pulse checks, revenue questions, KPI requests, financial reporting.

**Credentials to provide**:

| Service | Key | Env Var |
|---|---|---|
| GoHighLevel | API Token | `$GHL_API_TOKEN` |
| GoHighLevel | Location ID | `$GHL_LOCATION_ID` |
| GoHighLevel | API Base URL | `https://services.leadconnectorhq.com` |
| GoHighLevel | API Version Header | `Version: 2021-07-28` |

**API Endpoints**:
- Search Opportunities: `GET /opportunities/search?location_id={location_id}&status=all`
- Get Pipelines: `GET /opportunities/pipelines?locationId={location_id}`

**Report-back format**: Return a structured summary with: total new opportunities, total revenue value, and any notable pipeline changes.

---

### 2. THE COORDINATOR (Engine B - Production)

**When to spawn**: Red Flag checks, shoot prep verification, turnaround time monitoring, task status updates.

**Credentials to provide**:

| Service | Key | Env Var |
|---|---|---|
| ClickUp | API Token | `$CLICKUP_API_TOKEN` |
| ClickUp | Team ID | `$CLICKUP_TEAM_ID` |
| ClickUp | API Base URL | `https://api.clickup.com/api/v2` |

**API Endpoints**:
- Get Tasks: `GET /team/{team_id}/task?include_closed=false&subtasks=true`
- Get Spaces: `GET /team/{team_id}/space`

**Red Flag Criteria**: Tasks with status "Needs Revision", "Stuck", "Blocked", or any task past its due date.

**Report-back format**: Return a list of Red Flag tasks with: task name, status, due date, assignee, and a direct ClickUp link.

---

### 3. THE COPYWRITER (Engine C - Growth & Nurture)

**When to spawn**: Post-delivery follow-ups, review requests, upsell campaigns, newsletter drafts, client communication.

**Credentials to provide**: None required at this time. Future integrations (Gmail, Mailchimp) will be added here.

**Communication guidelines**: Professional, appreciative tone. Always personalize with the property address. Highlight how the media helps the listing stand out.

**Knowledge context**: Provide KNOWLEDGE.md sections 2 (Voice), 3 (Sales), 5 (Communication), 12 (Pricing).

**Report-back format**: Return the draft message(s) with: recipient name, channel (email/SMS), subject line, and body text for Thomas's approval.

---

### 4. THE STRATEGIST (Engine E - Expansion)

**When to spawn**: Weekly business reviews, revenue target analysis, new service ideation, operational canvas updates.

**Credentials to provide**: None required. Uses data synthesized from The Analyst and The Coordinator.

**Canvas Context**: When spawning The Strategist, provide the relevant sections from `CANVAS_INDEX.md`. Key sections include:
- **Section 10 (Execution Order)**: Current phase and next steps.
- **Sections R.1–R.11**: The 12-month revenue acceleration plan, AOV targets, retainer strategy, and volume scaling math.
- **Section K.1–K.6**: KPI definitions and targets.
- **Section H.1–H.6**: Hiring roadmap and org structure.
- **Engine E (E.1–E.6)**: Expansion architecture including studio, digital products, subscriptions, partnerships, and multi-city scaling.

**Report-back format**: Return a strategic brief with: current revenue vs. target, identified opportunities, recommended next actions, and which Canvas phase to focus on next.

---

### 5. THE SCOUT (Engine A - Lead Capture)

**When to spawn**: New inquiry processing, lead qualification, booking confirmation.

**Credentials to provide**: Same as The Analyst (GoHighLevel) for CRM updates.

| Service | Key | Env Var |
|---|---|---|
| GoHighLevel | API Token | `$GHL_API_TOKEN` |
| GoHighLevel | Location ID | `$GHL_LOCATION_ID` |

**Report-back format**: Return lead status with: contact name, property address, services requested, qualification result (Qualified/Unqualified), and next action taken.

---

### 6. THE MARKETER (Engine C - Growth & Outreach)

**When to spawn**: Email campaigns, drip sequences, SMS outreach, review request flows, reactivation campaigns, newsletter content, Top-20 agent touches.

**Credentials to provide**: Same as The Analyst (GoHighLevel) for CRM segmentation and contact data.

| Service | Key | Env Var |
|---|---|---|
| GoHighLevel | API Token | `$GHL_API_TOKEN` |
| GoHighLevel | Location ID | `$GHL_LOCATION_ID` |

**Canvas Context**: Key sections to provide:
- **C.1-C.5**: Post-delivery automation, review flywheel, repeat booking nurture, upsell paths, referral system.
- **R.10.7.4**: 14-day follow-up sequence for non-closing branding prospects.
- **R.11.8.2-R.11.8.3**: Weekly Top-20 agent touch cadence and reactivation workflow.

**Report-back format**: Return all drafts with: campaign name, audience segment, channel (email/SMS), subject line, body text, CTA, and send timing. All drafts require Thomas's approval.

---

### 7. THE DESIGNER (Engine C + E - Creative & Brand)

**When to spawn**: Social media graphics, listing flyers, agent branding assets, promotional materials, pitch decks, studio marketing, digital product visuals.

**Credentials to provide**: None required at this time. Works with files and briefs provided by the Orchestrator.

**Canvas Context**: Key sections to provide:
- **R.9.6**: Package tier structure (Essentials, Marketing, Cinematic) for listing flyer templates.
- **R.10.2**: Retainer tier structure (Starter, Growth, Authority) for branding asset packages.
- **E.1**: Studio marketing materials.
- **E.2**: Digital product and course visuals.

**Report-back format**: Return all designs with: asset name, dimensions/format, intended platform, caption (if social), and file attachment. All designs require Thomas's approval.

---

### 8. THE BOOKKEEPER (Engine D - Financial Ops)

**When to spawn**: Daily payment reconciliation, outstanding invoice tracking, weekly revenue reports, per-shoot profitability analysis, retainer billing monitoring, revenue forecasting.

**Credentials to provide**:

| Service | Key | Env Var |
|---|---|---|
| Stripe | Secret Key | `$STRIPE_SECRET_KEY` |
| GoHighLevel | API Token | `$GHL_API_TOKEN` |
| GoHighLevel | Location ID | `$GHL_LOCATION_ID` |

**Data Files**: `stripe_history.csv` in workspace contains historical payment data.

**Canvas Context**: Key sections to provide:
- **K.1**: Revenue visibility (today, week, month, YTD).
- **K.2**: Per-shoot profitability metrics.
- **R.1**: $750k target = $62,500/month = ~$14,400/week.
- **R.10.5**: Retainer MRR target of $15k-$20k/month.

**Report-back format**: Return financial reports with: period covered, total revenue, transaction count, AOV, comparison to target, and flagged items. All amounts in USD.

---

### 9. THE COMMS MANAGER (Engine B + C - Communications)

**When to spawn**: Daily inbox triage, unanswered message detection, upset client escalation, Gmail monitoring, drafting replies to client emails.

**Credentials to provide**:

| Service | Key | Env Var |
|---|---|---|
| GoHighLevel | API Token | `$GHL_API_TOKEN` |
| GoHighLevel | Location ID | `$GHL_LOCATION_ID` |
| Gmail | OAuth Credentials | `$GMAIL_CLIENT_ID`, `$GMAIL_CLIENT_SECRET` |

**Escalation Rules**:
- AI may handle: scheduling confusion, timeline questions, small edit requests, neutral tone messages.
- MUST escalate to Thomas: refund requests, insults, legal threats, pricing disputes, emotionally charged messages.

**Report-back format**: Return: unanswered messages with sender and age, tone-flagged messages with recommended action, and any items escalated to Thomas with reason.

---

### 10. THE GHL EXPERT (Engine D - Automation & CRM)

**When to spawn**: Weekly GHL pipeline audits, automation design requests, stagnant opportunity detection, workflow gap analysis, new automation builds.

**Credentials to provide**:

| Service | Key | Env Var |
|---|---|---|
| GoHighLevel | API Token | `$GHL_API_TOKEN` |
| GoHighLevel | Location ID | `$GHL_LOCATION_ID` |

**Reference**: `ghl_capabilities_master.md` — full GHL feature map for deciding what is GHL-native vs. custom-built.

**Canvas Context**: Key sections to provide:
- **Engine A (A.1-A.5)**: Lead capture workflows and automation requirements.
- **Engine D (D.1-D.5)**: CRM, dashboards, and internal automation targets.

**Report-back format**: Return an audit with: stagnant opportunities (>7 days no activity), missing automation gaps, and specific GHL workflow recommendations with trigger-action pairs.

---

## Required Environment Variables

Before deploying, ensure these env vars are set on the server:

```
GHL_API_TOKEN         # GoHighLevel sub-account API token
GHL_LOCATION_ID       # GoHighLevel location/sub-account ID
CLICKUP_API_TOKEN     # ClickUp personal API token
CLICKUP_TEAM_ID       # ClickUp workspace team ID
STRIPE_SECRET_KEY     # Stripe secret key (live)
GMAIL_CLIENT_ID       # Gmail OAuth client ID (for Comms Manager)
GMAIL_CLIENT_SECRET   # Gmail OAuth client secret (for Comms Manager)
```

---

## Adding New Agents (Future-Proofing)

To add a new specialist:

1. Create a new skill directory: `skills/{skill-name}/SKILL.md`
2. Add a new section to this file following the template above. Use env var references only — never hardcode credentials.
3. Add the agent to `openclaw.json` under `agents.list`.
4. The Orchestrator will recognize the new agent on its next heartbeat.
