# TOOLS.md

## Tool Policy (Default)
- Allow by default: `read`, `write`, `http_get`.
- Deny by default: `exec`, `bash`, `apply_patch`, `browser`.
- Session tools allowed only for orchestrator layer: `sessions_spawn`, `sessions_list`.

## Security Guardrails
- Public or group channel agents must run in sandbox mode (`non-main` or `all`).
- Leaf worker agents must deny all session tools.
- Any public-channel agent exposing dangerous tools is not safe to deploy.
