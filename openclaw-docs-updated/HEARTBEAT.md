# HEARTBEAT.md

> This checklist runs on every Orchestrator heartbeat. Follow it strictly.
> If nothing requires action, reply with exactly `HEARTBEAT_OK` as the first word.
> If action is required, skip `HEARTBEAT_OK` and deliver the relevant alert.

---

## Response Protocol

- **Nothing to report**: Reply `HEARTBEAT_OK` (stripped from delivery if ≤300 chars follow).
- **Action required**: Do NOT include `HEARTBEAT_OK`. Deliver the alert directly.
- **System failure**: If any data source is unreachable, send: `SYSTEM VISIBILITY FAILURE — [source] unreachable. Investigate immediately.` Silence is forbidden.

---

## Morning Command Briefing (8:05 AM CST)

When the heartbeat fires between 8:00–8:10 AM CST, trigger the full Morning Briefing protocol:

1. Spawn **The Analyst** — GHL revenue last 24h + MTD + pipeline status.
2. Spawn **The Coordinator** — ClickUp Red Flag scan (Overdue, Stuck, Needs Revision, Blocked).
3. Spawn **The Comms Manager** — GHL Conversations + Gmail unanswered messages (>2 business hours) + tone flags.
4. Spawn **The Bookkeeper** — Today's Stripe payment summary.
5. Synthesize all four reports into the Morning Briefing format defined in `DAILY_BRIEFING.md`.
6. Deliver via SMS through GHL to Thomas.
7. Archive as ClickUp note: **Daily Command Briefing — YYYY-MM-DD**.

Model tier for all four spawned agents: **Tier 3 (local heartbeat model)** — routine data retrieval only.

---

## End of Day Brief (4:45 PM CST)

When the heartbeat fires between 4:40–4:50 PM CST, trigger the End of Day protocol:

1. Spawn **The Coordinator** — Shoots completed, deliveries sent, open Red Flags.
2. Spawn **The Bookkeeper** — Money collected today vs. daily target.
3. Synthesize into End of Day format from `DAILY_BRIEFING.md`.
4. Deliver via SMS through GHL to Thomas.
5. Append to the same ClickUp daily note created in the morning.

---

## Continuous Monitoring (All Other Heartbeats)

On every heartbeat that is NOT a scheduled briefing time, run a lightweight scan:

- **Revenue pace**: If MTD revenue is >15% below weekly target pace (Canvas R.1: $14,400/week), flag it.
- **Red Flag surge**: If ClickUp Red Flag count increased since last check, flag it.
- **Unanswered messages**: If any client message has gone >4 business hours unanswered in GHL, flag it.

If none of these conditions are met, reply `HEARTBEAT_OK`.

---

## Weekly Strategy Check (Every Monday, 9:00 AM CST)

When the heartbeat fires on Monday between 8:55–9:05 AM CST, trigger the Weekly Review protocol:

1. Spawn **The Bookkeeper** — Weekly revenue report from Stripe (compare to $14,400/week target from Canvas R.1).
2. Spawn **The GHL Expert** — Audit GHL pipeline for stagnant opportunities (>7 days no activity) and automation gaps.
3. Spawn **The Strategist** — Review week performance against CANVAS.md execution phase. Provide: current revenue vs. target, Canvas sections K.1-K.6 (KPIs), R.1-R.11 (revenue plan), current execution phase from Section 10.
4. Synthesize into a weekly strategic brief: where we are, where we need to go, single top priority for the week.
5. Deliver to Thomas via the main channel.

Model tier: **Tier 2** for Bookkeeper and GHL Expert. **Tier 1** for Strategist (strategic reasoning required).

---

## Failure Handling

| Failure | Response |
|---|---|
| GHL API unreachable | Send: `GHL OFFLINE — Morning Briefing incomplete. Revenue and lead data unavailable.` |
| ClickUp API unreachable | Send: `CLICKUP OFFLINE — Production status unknown. Red Flag check skipped.` |
| Stripe API unreachable | Send: `STRIPE OFFLINE — Payment data unavailable. Manual check required.` |
| Gmail unreachable | Note in briefing: `Gmail unavailable — inbox check skipped.` (non-critical, do not abort briefing) |
| All sources unreachable | Send: `SYSTEM VISIBILITY FAILURE — All data sources offline. Investigate immediately.` |

Never send a silent heartbeat when data is missing. A degraded briefing is better than no briefing.
