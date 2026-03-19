# SETUP.md — Verified Setup Checklist & Progress Path

> Work through these phases in order. Do not skip ahead — each phase depends on the previous one being solid.

---

## PHASE 1 — Credentials (Do This First)

**What this means**: You need to stop hardcoding API keys in files and instead store them as environment variables. On your Mac, this means adding a few lines to your shell config file (`~/.zshrc`). That's it — no server, no special setup.

### 1.1 Add Credentials to ~/.zshrc

Open `~/.zshrc` in any text editor and add these lines at the bottom:

```bash
# Avery & Bryant — AI Agent Credentials
export GHL_API_TOKEN="pit-..."          # Your GHL sub-account API token
export GHL_LOCATION_ID="iXhH..."        # Your GHL location/sub-account ID
export CLICKUP_API_TOKEN="pk_..."       # Your ClickUp personal API token
export CLICKUP_TEAM_ID="31553962"       # Your ClickUp workspace team ID
export STRIPE_SECRET_KEY="sk_live_..."  # Your Stripe live secret key
export GMAIL_CLIENT_ID="..."            # Gmail OAuth client ID (for Comms Manager)
export GMAIL_CLIENT_SECRET="..."        # Gmail OAuth client secret
```

Then reload your shell:

```bash
source ~/.zshrc
```

Verify they're set:

```bash
echo $GHL_API_TOKEN    # Should print your token, not blank
```

### 1.2 Verify OpenClaw Is Running

OpenClaw is already installed via NVM. Start the gateway:

```bash
openclaw gateway --port 18789
```

Access the Control UI at `http://127.0.0.1:18789/` — you should see your agents listed.

**Phase 1 Complete When**: `echo $GHL_API_TOKEN` prints your real token, and the OpenClaw Control UI loads.

---

## PHASE 2 — Deploy Updated Docs to Your Workspace

Your actual OpenClaw workspace is `~/.openclaw/workspace/`. The docs in this folder (`openclaw-docs-updated/`) describe the target state — they need to be copied into your live workspace.

Your `workspace_analysis.md` file defines exactly what to do. Summary:

### 2.1 Files to REPLACE in `~/.openclaw/workspace/`

These existing files need to be overwritten with the updated versions from this docs folder:

```bash
cp SOUL.md\ -\ The\ Orchestrator\ \(Director\).md ~/.openclaw/workspace/SOUL.md
cp "AGENTS.md - The Avery & Bryant Team Roster.md" ~/.openclaw/workspace/AGENTS.md
cp "USER.md - Thomas (The Owner).md" ~/.openclaw/workspace/USER.md
cp HEARTBEAT.md ~/.openclaw/workspace/HEARTBEAT.md
cp IDENTITY.md ~/.openclaw/workspace/IDENTITY.md
cp KNOWLEDGE.md ~/.openclaw/workspace/KNOWLEDGE.md
```

### 2.2 Files to ADD to `~/.openclaw/workspace/`

These are new files that don't exist in the live workspace yet:

```bash
cp CANVAS.md ~/.openclaw/workspace/CANVAS.md
cp CANVAS_INDEX.md ~/.openclaw/workspace/CANVAS_INDEX.md
cp "MODELS.md - Cost-Optimized Routing Guide.md" ~/.openclaw/workspace/MODELS.md
cp MEMORY.md ~/.openclaw/workspace/MEMORY.md
cp "DAILY_BRIEFING.md — Daily AI Command Briefing Protocol.md" ~/.openclaw/workspace/DAILY_BRIEFING.md
cp -r skills/ ~/.openclaw/workspace/skills/
```

### 2.3 Files to LEAVE ALONE

Do NOT touch these in `~/.openclaw/workspace/`:
- `TOOLS.md` — contains your actual tool config
- `memory/` directory — agent memory logs
- `.git/` — version history
- Any CSV data files (`stripe_history.csv`, etc.)

### 2.4 Add New Agents to openclaw.json

The live `~/.openclaw/openclaw.json` currently has 5 agents. The updated docs add 5 more. Add these entries to the `agents.list` array in your live config:

```json
{
  "id": "the-scout",
  "name": "the-scout",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-scout/agent"
},
{
  "id": "the-copywriter",
  "name": "the-copywriter",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-copywriter/agent"
},
{
  "id": "the-marketer",
  "name": "the-marketer",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-marketer/agent"
},
{
  "id": "the-strategist",
  "name": "the-strategist",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-strategist/agent"
},
{
  "id": "the-designer",
  "name": "the-designer",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-designer/agent"
},
{
  "id": "the-bookkeeper",
  "name": "the-bookkeeper",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-bookkeeper/agent"
},
{
  "id": "the-comms-manager",
  "name": "the-comms-manager",
  "workspace": "/Users/camillebrown/.openclaw/workspace",
  "agentDir": "/Users/camillebrown/.openclaw/agents/the-comms-manager/agent"
}
```

After editing, restart the gateway:

```bash
openclaw gateway --restart
```

**Phase 2 Complete When**: The Control UI shows all 10+ agents listed.

---

## PHASE 3 — Test Core Agents With Live Data

### 3.1 Test The Analyst

```
Analyst, what's our revenue for the last 7 days?
```
Expected: Revenue summary with transaction count, total, AOV, vs. target.
If blank: Run `echo $GHL_API_TOKEN` in Terminal — if it's empty, env vars didn't load. Restart your terminal after running `source ~/.zshrc`.

### 3.2 Test The Coordinator

```
Coordinator, run a Red Flag scan.
```
Expected: List of flagged ClickUp tasks, or "No Red Flags found."
If blank: Check `$CLICKUP_API_TOKEN` is set.

### 3.3 Test The Daily Pulse

```
Run the Daily Pulse.
```
Expected: Orchestrator spawns Analyst + Coordinator + Comms Manager in parallel and delivers a synthesized briefing.

**Phase 3 Complete When**: Daily Pulse returns a real briefing from live GHL and ClickUp data.

---

## PHASE 4 — Test Remaining Agents

### Draft-Only Agents (No API Required)

```
Copywriter, draft a post-delivery follow-up for 123 Main St.
Marketer, draft a re-engagement campaign for clients we haven't heard from in 90 days.
Designer, create an Instagram post brief for our latest cinematic video.
Strategist, what's the top priority this week?
```

### API-Connected Agents

```
Scout, new lead: Sarah Johnson, 456 Oak Drive, 3BR, needs photos + drone, shoot date next Tuesday.
Bookkeeper, give me this week's payment summary.
GHL Expert, audit the pipeline for stagnant opportunities.
Comms Manager, check the inbox for unanswered messages.
```

**Phase 4 Complete When**: All 10 agents respond correctly to test commands.

---

## PHASE 5 — Enable Automated Heartbeat

The heartbeat is already set to fire every 30 minutes in your live config. Once agents are validated, the Orchestrator will start running `HEARTBEAT.md` automatically.

### Verify the First Automated Morning Briefing

At 8:05 AM CST, the Orchestrator should:
1. Spawn Analyst, Coordinator, Comms Manager, Bookkeeper in parallel
2. Deliver a Morning Command Briefing via SMS through GHL
3. Archive as a ClickUp note: `Daily Command Briefing — YYYY-MM-DD`

On normal heartbeat fires where nothing is wrong, you'll see `HEARTBEAT_OK` in the agent transcript (not delivered to you — intentionally silent).

**Phase 5 Complete When**: You receive a real Morning Briefing via SMS without manually triggering it.

---

## PHASE 6 — Fill Out the Knowledge Base Questionnaire

The `Knowledge Base Questionnaire.md` has 28 questions about your brand voice, sales scripts, email templates, pricing approach, and client handling. Answering these makes every agent Avery & Bryant-specific instead of generic.

When done, paste your answers and run:

```
Update the knowledge base with these answers.
```

The Orchestrator distributes the relevant info to each agent.

---

## PHASE 7 — Ongoing Maintenance

### Weekly
- Review the ClickUp daily briefing archive for trends.
- Update `CANVAS_INDEX.md` "Current State" section if your execution phase has changed.
- Run `"Strategist, weekly review."` every Monday.

### Monthly
- Update `KNOWLEDGE.md` with any new pricing, services, or policies.
- Check `MODELS.md` — are cheaper or better models available?

### When Adding a New Agent
1. Create `~/.openclaw/workspace/skills/{agent-name}/SKILL.md`
2. Add the agent entry to `~/.openclaw/openclaw.json` under `agents.list`
3. Add the agent to `AGENTS.md` with credentials (env var names only) and report-back format
4. Test manually before it runs in automated flows

---

## File Locations Reference (Mac / Local Install)

| File | Actual Path |
| :--- | :--- |
| OpenClaw config | `~/.openclaw/openclaw.json` |
| Shared workspace | `~/.openclaw/workspace/` |
| Agent dirs | `~/.openclaw/agents/{agent-name}/agent/` |
| Skills | `~/.openclaw/workspace/skills/` |
| Agent memory | `~/.openclaw/workspace/memory/` |
| Stripe history | `~/.openclaw/workspace/stripe_history.csv` |

---

## Troubleshooting

| Symptom | First Check |
| :--- | :--- |
| Agent returns no data | `echo $GHL_API_TOKEN` — if blank, run `source ~/.zshrc` and restart terminal |
| Heartbeat fires but no briefing | Is it 8:05 AM CST? Heartbeat is continuous but briefing only triggers at that time |
| `SYSTEM VISIBILITY FAILURE` | One or more APIs unreachable. Test GHL/ClickUp/Stripe manually |
| Sub-agent doesn't spawn | Check `tools.agentToAgent` in `~/.openclaw/openclaw.json` — `allowAgents` must include the target agent id |
| Morning SMS not received | GHL messaging configured? Thomas's phone number in GHL contacts? |
| New agent not visible in UI | Did you restart the gateway after editing `openclaw.json`? |
