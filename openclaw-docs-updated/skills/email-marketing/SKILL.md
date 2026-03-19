---
name: email-marketing
description: "Design and draft email campaigns, SMS outreach, drip sequences, and Top-20 agent touch programs for Engine C."
metadata: {"openclaw": {"requires": {"env": ["GHL_API_TOKEN", "GHL_LOCATION_ID"]}}}
---

# Email Marketing (The Marketer)

This skill handles all outbound marketing campaign design and drafting for Engine C (Client Growth & Outreach).

## Progressive Disclosure
- Start with this file only.
- Read `KNOWLEDGE.md` sections 2 (Voice), 4 (Education), 5 (Communication), 13 (Key Relationships) before drafting any campaign.
- Read `CANVAS_INDEX.md` sections C.1–C.5 when designing post-delivery or nurture sequences.
- Read `CANVAS_INDEX.md` sections R.11.8.2–R.11.8.3 when working on the Top-20 agent program.
- Read `ghl_capabilities_master.md` when deciding if a campaign step should be GHL-native or custom.

## Communication Rules

1. **Brand Voice**: Confident, direct, professional. Educator-minded. Never desperate, never cheap.
2. **Education leads**: Every message should deliver one quick insight, then connect to a service or deeper engagement.
3. **Never send directly**: All campaigns require Thomas's approval before execution.
4. **No Aryeo duplication**: Do not create messages that mirror Aryeo's automated booking/delivery emails.
5. **GHL is primary**: All campaigns should be designed to run through GHL workflows and contact tags.

## Campaign Types

| Type | Trigger | Audience | Channel |
| :--- | :--- | :--- | :--- |
| New Lead Welcome | New contact tagged `#new-lead` | New inquiries | SMS |
| Post-Delivery Follow-Up | Project delivered in Aryeo | Completed clients | Email |
| Review Request | 24h after delivery | Completed clients | SMS |
| Upsell Sequence | 2nd booking confirmed | Repeat clients | Email |
| Re-engagement | 60+ days no activity | Dormant clients | Email + SMS |
| Top-20 Weekly Touch | Every Monday | Top 20 agents | Email |
| Reactivation | 90+ days no booking | Past clients | Email + SMS |
| Retainer Introduction | 3+ listing bookings | Volume agents | Email |

## Workflow

1. **Trigger**: Spawned with campaign goal and audience segment.
2. **Load voice rules**: From `KNOWLEDGE.md` sections 2 and 4.
3. **Segment audience**: Pull contact list from GHL using appropriate tags.
4. **Draft campaign**: Write all messages in sequence with subject lines, body text, CTAs, and timing.
5. **Return**: All drafts for Thomas's approval.

## Definition of Done

A complete campaign draft includes: campaign name, audience segment + GHL tag, channel, message sequence with timing, subject lines (email), body text, and CTA. All drafts require Thomas's approval before scheduling in GHL.

## Report-Back Format

```
MARKETER DRAFT — [CAMPAIGN NAME] — [DATE]
Audience: [segment description] | GHL Tag: [tag]
Channel: [Email / SMS / Both]
---
MESSAGE 1 — Send: [timing]
Subject: [subject, if email]
[Body text]
CTA: [action]
---
MESSAGE 2 — Send: [timing, e.g., +3 days]
[Continue sequence...]
---
Status: AWAITING THOMAS APPROVAL
```
