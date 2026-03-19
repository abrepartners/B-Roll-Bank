# MODELS.md - Cost-Optimized Routing Guide

This guide defines the model tiering strategy for Avery & Bryant to ensure maximum performance at the lowest possible cost.

---

## Your Current Setup

Your OpenClaw install (`~/.openclaw/openclaw.json`) uses:
- **Primary model**: `openai-codex/gpt-5.3-codex` (via Codex app OAuth)
- **Also available**: `openai/gpt-4o`, `openai/gpt-4o-mini`, `google/gemini-2.5-flash`, `anthropic` (API key)

---

## Model Tiers

| Tier | Category | Recommended Models | Use Case |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Frontier** | `openai-codex/gpt-5.3-codex`, `openai/gpt-4o` | Main Orchestrator synthesis, The Strategist, complex strategy, architecture decisions. |
| **Tier 2** | **Mid-Tier** | `openai/gpt-4o-mini`, `google/gemini-2.5-flash` | Sub-agents executing real tasks: Scout, Marketer, Copywriter, Designer, GHL Expert. |
| **Tier 3** | **Budget** | `openai/gpt-4o-mini`, `google/gemini-2.5-flash` | Heartbeat checks, briefing data pulls, status lookups, classification. |

---

## Routing Rules

1. **Heartbeats**: Use **Tier 3** (`openai/gpt-4o-mini`). Fire every 30 minutes — minimize cost.
2. **Briefing data agents** (Analyst, Coordinator, Bookkeeper, Comms Manager during morning/EOD pulls): Use **Tier 3**. Routine retrieval only.
3. **Sub-agents executing tasks** (Scout, Marketer, Copywriter, Designer, GHL Expert): Use **Tier 2**.
4. **Strategist**: Use **Tier 1**. Strategic reasoning requires full capability.
5. **Orchestrator synthesis** (Thomas-facing output, final report assembly): Use **Tier 1**.
6. **Fallback**: If OpenAI rate limits, switch to `google/gemini-2.5-flash` (same tier).

---

## Provider Fallback Map

| Primary | Fallback |
| :--- | :--- |
| `openai-codex/gpt-5.3-codex` | `openai/gpt-4o` |
| `openai/gpt-4o-mini` | `google/gemini-2.5-flash` |

---

## Cost Efficiency Target

- **Goal**: 90% of background tasks routed to Tier 3. Tier 1 used only for Thomas-facing output and The Strategist.
- **Monitoring**: The Bookkeeper should include a token cost estimate in the weekly revenue report.
- **Heartbeat model** is configured in `openclaw.json` under `agents.defaults.heartbeat.model` and per-agent `heartbeat.model`. Sub-agent models are passed via the `model` parameter in `sessions_spawn`.
