# OpenClaw Architecture & Configuration Research

## Core Concepts
- **Gateway**: The central daemon that manages all messaging channels (WhatsApp, Telegram, Slack, etc.) and exposes a WebSocket API.
- **Orchestrator Pattern**: Implemented via `SOUL.md` and `AGENTS.md`. The main agent (Director) routes tasks to specialized sub-agents.
- **Sub-Agents**: Specialized agents defined in `AGENTS.md`. They execute specific tasks delegated by the Orchestrator.
- **Skills**: Modular capabilities that extend agent functionality. In OpenClaw, these are often defined as "Agent Skills" that map to specific SOPs.

## Key Configuration Files
- **`SOUL.md`**: Defines the "soul" or persona of the main agent. For an Orchestrator, it contains instructions on how to manage the team.
- **`AGENTS.md`**: The "Org Chart" or team roster. Lists available sub-agents, their roles, and required credentials.
- **`BOOT.md`**: Instructions for the agent when it first starts or "boots up."
- **`TOOLS.md`**: Defines the tools available to the agent.

## Workflow Mapping (from Operational Canvas)
- **Engine A (Lead to Booked)**: Mapping to "The Scout" agent.
- **Engine B (Production to Delivery)**: Mapping to "The Coordinator" agent.
- **Engine C (Growth to Retention)**: Mapping to "The Copywriter" agent.
- **Engine D (Operations to Automation)**: Mapping to "The Analyst" agent.
- **Engine E (Expansion)**: Mapping to "The Strategist" agent.

## Skill Structure in OpenClaw
- Skills are often structured as: `Business Engine -> Workflow -> SOP -> Agent Skill`.
- Each skill should define: Required context, Decision rules, Inputs, Actions triggered, and Output produced.
