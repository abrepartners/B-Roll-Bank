# DAILY_BRIEFING.md — Daily AI Command Briefing Protocol

> **The single most important control system in the company.** This protocol defines how the Orchestrator delivers Thomas's morning and evening briefings so he never needs to dig through GHL, ClickUp, Aryeo, Email, or Texts.

---

## Purpose

Deliver one clear morning report that answers:

1. **Are we winning today or drifting?**
2. **What must be handled first?**
3. **What can be ignored?**

Everything becomes visible in **under 60 seconds**.

---

## Delivery Schedule

| Briefing | Time | Channel | Purpose |
| :--- | :--- | :--- | :--- |
| **Morning Command Briefing** | 8:05 AM CST | SMS via GHL to Thomas | Start the day with full visibility |
| **End of Day Companion Brief** | 4:45 PM CST | SMS via GHL to Thomas | Close mental loops so Thomas can go home calm |

### Archive
Every briefing is also saved as a daily note inside ClickUp named: **Daily Command Briefing — YYYY-MM-DD**

This creates historical intelligence for: trend spotting, hiring timing, revenue forecasting, stress prediction.

---

## Morning Briefing Structure

The briefing MUST always follow this **exact order** so Thomas can scan instantly.

### RED FLAG CHECK (Top of Briefing)

If ANY of the following are true, the briefing begins with:

> **⚠️ ATTENTION REQUIRED TODAY**

**Trigger conditions**:
- Edit overdue
- Delivery at risk
- Client emotionally upset
- Refund discussion active
- Revenue pace critically below target
- More than 2 escalations open

If no red flags exist, skip this section entirely.

---

### SECTION A — MONEY STATUS

| Metric | Source |
| :--- | :--- |
| Revenue last 7 days | GHL Opportunities + Stripe |
| Revenue month to date | GHL Opportunities + Stripe |
| Average order value (MTD) | Stripe transactions |
| Monthly recurring revenue (active) | Stripe subscriptions + GHL retainers |

**AI Interpretation Rule**: If any metric is below target, include:
- **ONE sentence explaining why**
- **ONE sentence stating the fix**

No long analysis.

---

### SECTION B — TODAY'S PRODUCTION REALITY

| Metric | Source |
| :--- | :--- |
| Shoots today | Aryeo Appointments + ClickUp |
| Shoots tomorrow | Aryeo Appointments + ClickUp |
| Overdue edits | ClickUp (Red Flag tasks) |
| Deliveries due today | ClickUp + Aryeo Orders |
| Editor backlog count | ClickUp task count in editing status |

**Red Condition Triggers** — Include a bold alert line if:
- Any edit is overdue
- Any delivery is at risk
- Backlog is greater than 3

---

### SECTION C — CLIENT HEALTH

| Metric | Source |
| :--- | :--- |
| Unanswered client messages (>2 business hours) | GHL Conversations |
| Upset or negative tone detected | GHL Conversations + Gmail |
| Refund or pricing concerns | GHL Conversations + Gmail |
| Reviews received (last 24h) | GHL / Google Business Profile |

**Escalation Rule**: If emotional risk exists, add:

> **"Leadership moment required."**

This signals Thomas to step in personally.

---

### SECTION D — SALES MOMENTUM

| Metric | Source |
| :--- | :--- |
| New leads yesterday | GHL Contacts |
| Bookings yesterday | GHL Calendar + Aryeo |
| Conversion rate (last 7 days) | GHL Pipeline |
| Referrals created | GHL Tags/Custom Fields |

**Insight Rule**: AI must state **one opportunity to increase revenue today**. Examples:
- Follow up with warm lead
- Ask for review from happy client
- Offer video upgrade to upcoming shoot

Only one. Never multiple.

---

### SECTION E — OWNER FOCUS

**This is the most important section.**

AI must output:

> **Today's single priority for Thomas**

One sentence only. Must connect to: revenue, partnership, retainer, or brand authority. **Never operations.**

Example:
> "Follow up with the builder partnership. Highest leverage revenue path this week."

---

## End of Day Companion Brief (4:45 PM)

Purpose: Close mental loops so Thomas can go home calm.

| Metric | Source |
| :--- | :--- |
| Shoots completed today | Aryeo + ClickUp |
| Deliveries sent today | Aryeo + ClickUp |
| Money collected today | Stripe |
| Problems still open | ClickUp Red Flags + GHL Conversations |
| Tomorrow readiness | Aryeo Appointments + ClickUp |

**Final line must always state one of:**

> **"You are clear for the evening."**

or

> **"One item still needs leadership attention."**

Nothing else.

---

## Tone Rules

The briefing tone must be: **calm, clear, confident, short, non-emotional.**

It must feel like: **a COO who already solved the chaos.**

Never: motivational, rambling, robotic, or overly technical.

---

## Data Source Summary

| Platform | Provides |
| :--- | :--- |
| **GoHighLevel** | Revenue, AOV, MRR, leads, bookings, referrals, conversations, pipeline status |
| **ClickUp** | Shoots scheduled, edit status, delivery timing, escalations, owner task load |
| **Aryeo** | Booking confirmations, project lifecycle timing, order status |
| **Stripe** | Payment confirmations, transaction amounts, subscription status |
| **Gmail** | Client emails not yet in GHL (migration candidates) |

**Important**: AI must NOT duplicate Aryeo automated emails. Only interpret operational risk from Aryeo data.

---

## Failure Protection

If AI cannot access live data from any source, it must send:

> **"Command Briefing unavailable. System visibility failure. Investigate immediately."**

**Silence is forbidden.** A missing briefing is worse than a bad one.

---

## Execution Flow (For the Orchestrator)

When it's time for the Morning or Evening briefing:

1. **Spawn The Analyst** → Retrieve GHL revenue data and Stripe payments.
2. **Spawn The Coordinator** → Retrieve ClickUp task status, Red Flags, and shoot schedule.
3. **Spawn The Comms Manager** → Check Gmail and GHL Conversations for unanswered messages and tone flags.
4. **Spawn The Bookkeeper** → Get today's payment summary.
5. **Synthesize** all reports into the briefing format above.
6. **Deliver** via SMS through GHL.
7. **Archive** as a ClickUp note.

Model tier for briefing agents: **Tier 3 (gpt-4o-mini or gemini-flash)** — this is routine data retrieval, not strategy.

---

## Success Definition

This system is successful when:
- Thomas checks no dashboards
- Thomas asks fewer operational questions
- Problems are seen before they explode
- Revenue decisions happen earlier
- Stress decreases noticeably

At that point: **AI is functioning as real operations leadership.**
