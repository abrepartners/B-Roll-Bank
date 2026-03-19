---
name: production-manager
description: "Monitor ClickUp for shoot schedules, Red Flag tasks, and turnaround time compliance for Engine B."
metadata: {"openclaw": {"requires": {"env": ["CLICKUP_API_TOKEN", "CLICKUP_TEAM_ID"]}}}
---

# Production Manager (The Coordinator)

This skill runs the production monitoring workflow for Engine B (Production to Delivery).

## Progressive Disclosure
- Start with this file only.
- Read `CANVAS_INDEX.md` sections B.1–B.5 only when reviewing production SOPs.
- Read `KNOWLEDGE.md` section 7 (Production Intelligence) when assessing urgency of delays.
- Read `api_research.md` only when ClickUp endpoint details are needed.

## Workflow

1. **Trigger**: Spawned by Orchestrator for Daily Pulse, shoot status check, or Red Flag scan.
2. **Pull tasks**: `GET /team/{CLICKUP_TEAM_ID}/task?include_closed=false&subtasks=true`
3. **Pull spaces**: `GET /team/{CLICKUP_TEAM_ID}/space` — identify active production spaces.
4. **Red Flag scan**: Flag any task matching:
   - Status: "Needs Revision", "Stuck", "Blocked"
   - Due date: past due (any status)
   - Edit type: Photos past 24h from shoot, Video past 72h from shoot
5. **Count**: Active shoots today, shoots tomorrow, editor backlog (tasks in editing status).
6. **Return**: Structured Red Flag list + production summary (see report-back format below).

## API Reference

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/team/{team_id}/task` | GET | All active tasks with status and due date |
| `/team/{team_id}/space` | GET | Workspace spaces and lists |

Base URL: `https://api.clickup.com/api/v2`
Auth header: `Authorization: {CLICKUP_API_TOKEN}`

## Red Flag Criteria

| Condition | Severity |
| :--- | :--- |
| Task status "Blocked" or "Stuck" | High |
| Task status "Needs Revision" | Medium |
| Any task past due date | High |
| Photo edit > 24h post-shoot | High |
| Video edit > 72h post-shoot | Medium |
| Editor backlog > 3 tasks | Medium |

## Definition of Done

A complete report includes: Red Flag task list with direct ClickUp links, today's shoot count, tomorrow's shoot count, editor backlog count, and any delivery-at-risk items. Delivered as structured text within one API session.

## Report-Back Format

```
COORDINATOR REPORT — [DATE]
Shoots Today: [count] | Tomorrow: [count]
Editor Backlog: [count] tasks
Deliveries Due Today: [count]

RED FLAGS ([count]):
- [Task Name] | Status: [status] | Due: [date] | Assignee: [name] | Link: [url]
- (or NONE)
```
