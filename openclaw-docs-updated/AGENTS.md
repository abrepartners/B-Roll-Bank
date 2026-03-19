# AGENTS.md - The Avery & Bryant Team Roster

For the Orchestrator only. Do not pass this full file to sub-agents.

## Dispatch Rules
1. Identify the business engine (A-E).
2. Select the specialist agent.
3. Spawn with only: task, required credentials, and relevant context section.
4. Require structured report-back from every spawned agent.

## Security Rules
- Never store raw API keys in this file.
- Pass credentials through environment variables only.
- Use least-privilege credentials for each task.

## Agent Roster
| Agent | Engine | Skill | Primary Function |
|---|---|---|---|
| The Scout | A (Lead Capture) | `skills/lead-capture-pro/SKILL.md` | Qualify leads and route to booking. |
| The Coordinator | B (Production) | `skills/production-manager/SKILL.md` | Monitor project status and red flags. |
| The Copywriter | C (Growth) | `skills/client-growth-nurture/SKILL.md` | Draft follow-up, review, and nurture messaging. |
| The Analyst | D (Ops) | `skills/ops-revenue-tracker/SKILL.md` | Revenue and KPI analysis. |
| The Strategist | E (Expansion) | `skills/business-expansion/SKILL.md` | Growth recommendations and phase planning. |
| The GHL Expert | Cross-Engine | `skills/ghl-expert/SKILL.md` | GHL workflows, pipeline, and automation design. |

## Credential Mapping (Env Vars Only)
| Service | Required Variables |
|---|---|
| GoHighLevel | `GHL_SUBACCOUNT_API_KEY`, `GHL_LOCATION_ID` |
| ClickUp | `CLICKUP_API_TOKEN`, `CLICKUP_TEAM_ID` |
| Stripe | `STRIPE_SECRET_KEY` |
| Gmail | `GMAIL_MCP_ACCESS` |

## Report-Back Contract
Every sub-agent must return:
- Task status: completed, blocked, or needs review
- Key findings: bullet list
- Actions taken: exact steps
- Next action owner: agent name or Thomas
- Risk flags: security, data, customer, delivery

## Memory Policy
- Durable business facts must be stored in `MEMORY.md`.
- Daily execution notes must be stored in `memory/YYYY-MM-DD.md`.
- Do not use AGENTS.md for long-term memory storage.
