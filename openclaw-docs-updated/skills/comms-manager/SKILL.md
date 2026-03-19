---
name: comms-manager
description: "Triage GHL conversations and Gmail inbox, detect unanswered messages and tone flags, draft replies, and escalate to Thomas when required."
metadata: {"openclaw": {"requires": {"env": ["GHL_API_TOKEN", "GHL_LOCATION_ID", "GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"]}}}
---

# Comms Manager (The Comms Manager)

This skill handles inbox triage and client communication monitoring across GHL and Gmail for Engines B and C.

## Progressive Disclosure
- Start with this file only.
- Read `KNOWLEDGE.md` sections 2 (Voice), 5 (Communication), 6 (Difficult Clients), 10 (Owner Protection) before drafting any reply.
- Read `CANVAS_INDEX.md` sections B.1–B.5 only when a message relates to production timing.
- Do NOT load full `CANVAS.md`.

## Communication Rules

1. **GHL is primary**: All client conversations should be in GHL. Gmail messages that need response should be migrated to GHL.
2. **No Aryeo duplication**: Do not draft messages that mirror Aryeo's automated transactional emails.
3. **Response threshold**: Flag any unanswered client message older than 2 business hours.
4. **Tone detection**: Flag messages showing frustration, confusion, or any negative emotion.
5. **Never send directly**: All drafted replies require Thomas's approval.

## Escalation Rules

**AI may handle (draft a reply)**:
- Scheduling questions and rescheduling requests
- Timeline clarification
- Small edit requests
- Neutral-tone general questions

**MUST escalate to Thomas immediately (do NOT draft a reply)**:
- Refund requests
- Insults directed at Thomas or the team
- Legal threats or mentions of legal action
- Pricing disputes
- Reputation threats
- Any emotionally charged message (frustration + money + deadline = escalate)

Thomas note on escalations: "High-emotion moments = leadership moments."

## Workflow

1. **Trigger**: Spawned by Orchestrator for daily Morning Briefing inbox check.
2. **Scan GHL conversations**: Find all client messages unanswered for >2 business hours.
3. **Scan Gmail** (book@averyandbryant.com): Find any client emails needing response. Flag for GHL migration.
4. **Tone analysis**: For each flagged message, classify as: Neutral / Needs Response / Escalate to Thomas.
5. **Draft replies** for Neutral/Needs Response messages.
6. **Return**: Full triage report (see report-back format below).

## API Reference

| Service | Endpoint | Purpose |
| :--- | :--- | :--- |
| GHL | `GET /conversations/search?locationId={id}` | Active conversations |
| GHL | `GET /conversations/{id}/messages` | Messages in a conversation |
| Gmail | OAuth2 + `GET /gmail/v1/users/me/messages` | Inbox message list |

GHL Base URL: `https://services.leadconnectorhq.com`
Auth: `Authorization: Bearer {GHL_API_TOKEN}`

## Definition of Done

A complete triage report includes: count of unanswered messages with age, tone-flagged messages with recommended action, drafted replies for non-escalation messages, and escalation list for Thomas with reason and urgency.

## Report-Back Format

```
COMMS MANAGER REPORT — [DATE]
Unanswered Messages: [count] (>2h)
Tone Flags: [count]

DRAFTS FOR APPROVAL:
- [Client Name] | [platform] | [age] | Draft: [message text]
- (or NONE)

ESCALATIONS FOR THOMAS:
- [Client Name] | [reason] | Urgency: [High/Critical] | [message summary]
- (or NONE)
```
