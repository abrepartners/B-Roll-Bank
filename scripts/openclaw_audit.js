#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const DEFAULT_BOOTSTRAP_MAX_CHARS = 20000;
const DANGEROUS_TOOLS = ["exec", "bash", "apply_patch", "browser"];
const PUBLIC_BINDING_HINTS = [
  "telegram",
  "discord",
  "slack",
  "sms",
  "facebook",
  "instagram",
  "whatsapp",
  "email",
  "public",
];
const SECTION_DEFS = [
  { id: "context_workspace_hygiene", title: "CONTEXT & WORKSPACE HYGIENE" },
  { id: "security_sandboxing", title: "SECURITY & SANDBOXING" },
  { id: "skill_integrity", title: "SKILL.MD INTEGRITY (AgentSkills Format)" },
  { id: "multi_agent_routing", title: "MULTI-AGENT & ROUTING RULES" },
  { id: "sub_agents_concurrency", title: "SUB-AGENTS & CONCURRENCY" },
  { id: "heartbeat_cost_optimization", title: "HEARTBEAT COST OPTIMIZATION" },
];
const BLOCKING_SEVERITIES = new Set(["critical", "high", "medium"]);
const SEVERITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function usage() {
  console.log(
    [
      "Usage:",
      "  node scripts/openclaw_audit.js --root <openclaw_workspace_dir> [--out <report.json>] [--bootstrap-max-chars 20000] [--orchestrator auto|true|false]",
      "",
      "Example:",
      "  node scripts/openclaw_audit.js --root \"/Users/me/.openclaw/workspace\" --out /tmp/openclaw_audit_report.json",
    ].join("\n"),
  );
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_err) {
    return null;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function getByPath(obj, dottedPath) {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = dottedPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

function findPrimaryFile(root, baseName) {
  const direct = path.join(root, baseName);
  if (fs.existsSync(direct)) return direct;

  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch (_err) {
    return null;
  }
  const lower = baseName.toLowerCase();
  const exactCaseInsensitive = entries.find(
    (entry) => entry.isFile() && entry.name.toLowerCase() === lower,
  );
  if (exactCaseInsensitive) return path.join(root, exactCaseInsensitive.name);

  const prefixed = entries.find(
    (entry) => entry.isFile() && entry.name.toLowerCase().startsWith(lower),
  );
  if (prefixed) return path.join(root, prefixed.name);
  return null;
}

function findOpenClawConfig(root) {
  const candidates = [
    "openclaw.json",
    "openclaw.config.json",
    ".openclaw/openclaw.json",
    "config/openclaw.json",
  ];
  for (const rel of candidates) {
    const candidate = path.join(root, rel);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function parseJsonStrict(raw) {
  try {
    return { value: JSON.parse(raw), error: null };
  } catch (err) {
    return { value: null, error: String(err && err.message ? err.message : err) };
  }
}

function walkFiles(root, matcher, skipDirs = new Set()) {
  const found = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (_err) {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && matcher(fullPath, entry.name)) {
        found.push(fullPath);
      }
    }
  }
  return found;
}

function initSections() {
  return SECTION_DEFS.map((section) => ({
    id: section.id,
    title: section.title,
    status: "PASS",
    findings: [],
  }));
}

function addFinding(section, finding) {
  section.findings.push({
    severity: finding.severity,
    rule: finding.rule,
    message: finding.message,
    location: finding.location || null,
    evidence: finding.evidence || null,
    recommendation: finding.recommendation || null,
    correctedCodeBlock: finding.correctedCodeBlock || null,
  });
}

function finalizeSections(sections) {
  for (const section of sections) {
    section.status = section.findings.some((f) => BLOCKING_SEVERITIES.has(f.severity))
      ? "FAIL"
      : "PASS";
    section.findings.sort((a, b) => (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0));
  }
}

function extractAgents(config) {
  const agentsNode = config && config.agents;
  if (!agentsNode) return [];
  const normalized = [];

  if (Array.isArray(agentsNode)) {
    for (let i = 0; i < agentsNode.length; i += 1) {
      const item = agentsNode[i];
      if (!item || typeof item !== "object") continue;
      normalized.push({ name: item.name || item.id || `agent-${i + 1}`, ...item });
    }
    return normalized;
  }

  if (Array.isArray(agentsNode.list)) {
    for (let i = 0; i < agentsNode.list.length; i += 1) {
      const item = agentsNode.list[i];
      if (!item || typeof item !== "object") continue;
      normalized.push({ name: item.name || item.id || `agent-${i + 1}`, ...item });
    }
  }

  if (Array.isArray(agentsNode.items)) {
    for (let i = 0; i < agentsNode.items.length; i += 1) {
      const item = agentsNode.items[i];
      if (!item || typeof item !== "object") continue;
      normalized.push({ name: item.name || item.id || `agent-${i + 1}`, ...item });
    }
  }

  if (normalized.length > 0) return normalized;

  if (typeof agentsNode === "object") {
    for (const [key, value] of Object.entries(agentsNode)) {
      if (key === "defaults" || key === "heartbeat") continue;
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      normalized.push({ name: value.name || value.id || key, ...value });
    }
  }
  return normalized;
}

function collectBindings(config, agents) {
  const bindings = [];
  if (Array.isArray(config && config.bindings)) {
    for (const binding of config.bindings) {
      if (binding && typeof binding === "object") bindings.push({ scope: "global", value: binding });
    }
  } else if (config && typeof config.bindings === "object" && config.bindings) {
    bindings.push({ scope: "global", value: config.bindings });
  }

  for (const agent of agents) {
    if (Array.isArray(agent.bindings)) {
      for (const binding of agent.bindings) {
        if (binding && typeof binding === "object") {
          bindings.push({ scope: `agent:${agent.name}`, value: binding });
        }
      }
    } else if (agent.binding && typeof agent.binding === "object") {
      bindings.push({ scope: `agent:${agent.name}`, value: agent.binding });
    }
  }
  return bindings;
}

function isLikelyPublicBinding(bindingObj) {
  const haystack = JSON.stringify(bindingObj).toLowerCase();
  return PUBLIC_BINDING_HINTS.some((hint) => haystack.includes(hint));
}

function uniq(values) {
  return Array.from(new Set(values.filter((v) => typeof v === "string" && v.trim().length > 0)));
}

function splitFrontmatter(markdown) {
  const fmMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) {
    return { frontmatter: null, body: markdown };
  }
  return {
    frontmatter: fmMatch[1],
    body: markdown.slice(fmMatch[0].length),
  };
}

function extractTopLevelYamlKeys(frontmatter) {
  const keys = [];
  const lines = frontmatter.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (/^\s/.test(line)) continue;
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:/);
    if (m) keys.push(m[1]);
  }
  return keys;
}

function extractYamlScalar(frontmatter, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = frontmatter.match(new RegExp(`^${escaped}:\\s*(.+)$`, "m"));
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function hasMetadataRequires(frontmatter) {
  return /metadata:\s*[\s\S]*?openclaw:\s*[\s\S]*?requires:\s*/m.test(frontmatter);
}

function renderSectionSummary(section) {
  const icon = section.status === "PASS" ? "PASS" : "FAIL";
  return `- ${icon} ${section.title} (${section.findings.length} finding${section.findings.length === 1 ? "" : "s"})`;
}

function renderNoteMarkdown(report) {
  const lines = [];
  lines.push(`# OpenClaw Audit Report`);
  lines.push("");
  lines.push(`- Timestamp: ${report.auditRun.timestamp}`);
  lines.push(`- Workspace: \`${report.auditRun.root}\``);
  lines.push(`- Audit Status: **${report.overall.status}**`);
  lines.push(`- Deployment Readiness: **${report.overall.deploymentReadiness}**`);
  lines.push(`- Security Level: **${report.ghl.openclawSecurityLevel}**`);
  lines.push("");
  lines.push("## Section Results");
  for (const section of report.sections) {
    lines.push(renderSectionSummary(section));
  }
  const critical = [];
  for (const section of report.sections) {
    for (const finding of section.findings) {
      if (finding.severity === "critical") {
        critical.push({ section: section.title, finding });
      }
    }
  }
  lines.push("");
  lines.push("## Critical Findings");
  if (critical.length === 0) {
    lines.push("- None");
  } else {
    for (const item of critical) {
      lines.push(`- [${item.section}] ${item.finding.rule}: ${item.finding.message}`);
    }
  }
  lines.push("");
  lines.push("## Required Clarifications");
  for (const clarification of report.requiredClarifications) {
    lines.push(`- ${clarification.question} (${clarification.status})`);
  }
  return lines.join("\n");
}

function analyze(root, options) {
  const sections = initSections();
  const byId = new Map(sections.map((s) => [s.id, s]));
  const contextSection = byId.get("context_workspace_hygiene");
  const securitySection = byId.get("security_sandboxing");
  const skillSection = byId.get("skill_integrity");
  const routingSection = byId.get("multi_agent_routing");
  const concurrencySection = byId.get("sub_agents_concurrency");
  const heartbeatSection = byId.get("heartbeat_cost_optimization");

  const bootstrapMaxChars = options.bootstrapMaxChars;

  const agentsFile = findPrimaryFile(root, "AGENTS.md");
  const soulFile = findPrimaryFile(root, "SOUL.md");
  const toolsFile = findPrimaryFile(root, "TOOLS.md");
  const userFile = findPrimaryFile(root, "USER.md");
  const coreFiles = [
    { label: "AGENTS.md", filePath: agentsFile },
    { label: "SOUL.md", filePath: soulFile },
    { label: "TOOLS.md", filePath: toolsFile },
    { label: "USER.md", filePath: userFile },
  ];

  let combinedChars = 0;
  const coreContent = {};
  for (const coreFile of coreFiles) {
    if (!coreFile.filePath) {
      if (coreFile.label !== "USER.md") {
        addFinding(contextSection, {
          severity: "medium",
          rule: "CONTEXT_REQUIRED_FILE_MISSING",
          message: `${coreFile.label} was not found in the workspace root.`,
          location: root,
          recommendation: `Add ${coreFile.label} or a concise equivalent file to keep agent bootstrapping deterministic.`,
        });
      }
      continue;
    }
    const text = readFileSafe(coreFile.filePath);
    if (typeof text !== "string") continue;
    coreContent[coreFile.label] = text;
    combinedChars += text.length;
    if (text.length > bootstrapMaxChars) {
      addFinding(contextSection, {
        severity: "high",
        rule: "CONTEXT_FILE_EXCEEDS_BOOTSTRAP_MAX_CHARS",
        message: `${coreFile.label} exceeds bootstrapMaxChars (${text.length} > ${bootstrapMaxChars}).`,
        location: coreFile.filePath,
        recommendation:
          "Split operational detail into reference files and keep only routing rules + constraints in bootstrapped files.",
        correctedCodeBlock: [
          "```md",
          "## Compact Bootstrap Pattern",
          "- Keep this file under the bootstrap char limit.",
          "- Move long SOPs to `references/*.md`.",
          "- Load references only when needed using `read`.",
          "```",
        ].join("\n"),
      });
    }
  }

  if (combinedChars > bootstrapMaxChars) {
    addFinding(contextSection, {
      severity: "high",
      rule: "COMBINED_CONTEXT_EXCEEDS_BOOTSTRAP_MAX_CHARS",
      message: `Combined AGENTS/SOUL/TOOLS content exceeds bootstrapMaxChars (${combinedChars} > ${bootstrapMaxChars}).`,
      location: root,
      recommendation:
        "Truncate bootstrapped files and move details into progressive-disclosure references to avoid context-window waste.",
    });
  }

  const rememberPattern = /\b(always remember|remember that|do not forget|never forget)\b/i;
  const memoryPolicyPattern = /\bMEMORY\.md\b/i;
  const dailyMemoryPattern = /\bmemory\/YYYY-MM-DD\.md\b/i;
  for (const [label, text] of Object.entries(coreContent)) {
    if (rememberPattern.test(text)) {
      addFinding(contextSection, {
        severity: "medium",
        rule: "PROMPT_MEMORY_ANTIPATTERN",
        message: `${label} contains memory-style phrasing ("remember") that should be externalized.`,
        location: label,
        recommendation:
          "Replace memory instructions with explicit persistence rules pointing to MEMORY.md and memory/YYYY-MM-DD.md.",
        correctedCodeBlock: [
          "```md",
          "## Memory Policy",
          "- Never ask the model to \"remember\" durable facts in system prompt files.",
          "- Persist durable facts in `MEMORY.md`.",
          "- Write daily logs to `memory/YYYY-MM-DD.md`.",
          "```",
        ].join("\n"),
      });
    }
  }

  const hasMemoryPolicy = Object.values(coreContent).some((text) => memoryPolicyPattern.test(text));
  const hasDailyMemoryPolicy = Object.values(coreContent).some((text) => dailyMemoryPattern.test(text));
  if (!hasMemoryPolicy || !hasDailyMemoryPolicy) {
    addFinding(contextSection, {
      severity: "medium",
      rule: "MEMORY_POLICY_MISSING",
      message: "Core workspace files do not fully define MEMORY.md + memory/YYYY-MM-DD.md persistence rules.",
      location: root,
      recommendation:
        "Add explicit memory persistence instructions so durable and daily facts stay out of the injected system prompt.",
      correctedCodeBlock: [
        "```md",
        "## Persistence Rules",
        "- Long-term facts: `MEMORY.md`",
        "- Daily notes: `memory/YYYY-MM-DD.md`",
        "- Do not store long-term memory inside AGENTS.md, SOUL.md, or TOOLS.md",
        "```",
      ].join("\n"),
    });
  }

  const openClawConfigPath = findOpenClawConfig(root);
  let config = null;
  if (!openClawConfigPath) {
    addFinding(securitySection, {
      severity: "critical",
      rule: "OPENCLAW_CONFIG_MISSING",
      message: "openclaw.json configuration file was not found.",
      location: root,
      recommendation: "Add openclaw.json so sandbox, tool policy, heartbeat, and routing can be validated deterministically.",
    });
    addFinding(routingSection, {
      severity: "critical",
      rule: "OPENCLAW_CONFIG_MISSING",
      message: "Cannot validate workspace isolation and bindings without openclaw.json.",
      location: root,
      recommendation: "Add openclaw.json with explicit agents, bindings, workspace, and agentDir settings.",
    });
    addFinding(concurrencySection, {
      severity: "high",
      rule: "OPENCLAW_CONFIG_MISSING",
      message: "Cannot validate sub-agent depth and session-tool policy without openclaw.json.",
      location: root,
      recommendation: "Add openclaw.json with maxSpawnDepth and per-agent tool policy.",
    });
    addFinding(heartbeatSection, {
      severity: "high",
      rule: "OPENCLAW_CONFIG_MISSING",
      message: "Cannot validate heartbeat model and reasoning settings without openclaw.json.",
      location: root,
      recommendation: "Add openclaw.json with heartbeat.model and includeReasoning.",
    });
  } else {
    const configRaw = readFileSafe(openClawConfigPath);
    const parsed = parseJsonStrict(configRaw || "");
    if (parsed.error) {
      addFinding(securitySection, {
        severity: "critical",
        rule: "OPENCLAW_CONFIG_INVALID_JSON",
        message: `openclaw.json could not be parsed: ${parsed.error}`,
        location: openClawConfigPath,
        recommendation: "Fix JSON syntax so policy checks can run reliably.",
      });
    } else {
      config = parsed.value;
    }
  }

  const agents = config ? extractAgents(config) : [];
  const bindings = config ? collectBindings(config, agents) : [];
  const allToolAllow = [];
  const allToolDeny = [];

  if (config) {
    const sandboxMode =
      getByPath(config, "agents.defaults.sandbox.mode") ||
      getByPath(config, "sandbox.mode") ||
      getByPath(config, "agents.sandbox.mode");
    if (sandboxMode !== "non-main" && sandboxMode !== "all") {
      addFinding(securitySection, {
        severity: "critical",
        rule: "SANDBOX_MODE_TOO_PERMISSIVE",
        message: `agents.defaults.sandbox.mode is "${String(sandboxMode)}" (must be "non-main" or "all").`,
        location: openClawConfigPath,
        recommendation: 'Set sandbox mode to "non-main" (minimum) or "all" for untrusted-channel safety.',
        correctedCodeBlock: [
          "```json",
          "{",
          "  \"agents\": {",
          "    \"defaults\": {",
          "      \"sandbox\": { \"mode\": \"non-main\" }",
          "    }",
          "  }",
          "}",
          "```",
        ].join("\n"),
      });
    }

    const globalAllow = normalizeList(getByPath(config, "tools.allow"));
    const globalDeny = normalizeList(getByPath(config, "tools.deny"));
    allToolAllow.push(...globalAllow);
    allToolDeny.push(...globalDeny);

    const defaultsAllow = normalizeList(getByPath(config, "agents.defaults.tools.allow"));
    const defaultsDeny = normalizeList(getByPath(config, "agents.defaults.tools.deny"));
    allToolAllow.push(...defaultsAllow);
    allToolDeny.push(...defaultsDeny);

    for (const agent of agents) {
      allToolAllow.push(...normalizeList(getByPath(agent, "tools.allow")));
      allToolDeny.push(...normalizeList(getByPath(agent, "tools.deny")));
    }

    const dangerousAllowed = uniq(allToolAllow.filter((tool) => DANGEROUS_TOOLS.includes(tool)));
    const dangerousDenied = uniq(allToolDeny.filter((tool) => DANGEROUS_TOOLS.includes(tool)));
    const hasPublicBinding = bindings.some((binding) => isLikelyPublicBinding(binding.value));

    if (dangerousAllowed.length > 0 && hasPublicBinding) {
      addFinding(securitySection, {
        severity: "critical",
        rule: "SECURITY_PUBLIC_EXEC_EXPOSURE",
        message: `Public-facing bindings appear to allow dangerous tools: ${dangerousAllowed.join(", ")}.`,
        location: openClawConfigPath,
        recommendation:
          "Fail closed. Explicitly deny dangerous tools for public agents or use a strict allowlist without exec/bash/apply_patch/browser.",
        correctedCodeBlock: [
          "```json",
          "{",
          "  \"tools\": {",
          "    \"allow\": [\"read\", \"write\", \"http_get\"],",
          "    \"deny\": [\"exec\", \"bash\", \"apply_patch\", \"browser\"]",
          "  }",
          "}",
          "```",
        ].join("\n"),
      });
    } else if (hasPublicBinding && dangerousDenied.length < DANGEROUS_TOOLS.length) {
      addFinding(securitySection, {
        severity: "high",
        rule: "DANGEROUS_TOOLS_NOT_EXPLICITLY_DENIED",
        message:
          "Public-facing bindings detected, but dangerous tools are not fully denied in tools.deny / defaults deny lists.",
        location: openClawConfigPath,
        recommendation: "Add explicit deny rules for exec, bash, apply_patch, and browser.",
      });
    }

    if (bindings.length === 0) {
      addFinding(routingSection, {
        severity: "medium",
        rule: "BINDINGS_MISSING",
        message: "No bindings found. Inbound routing cannot be validated.",
        location: openClawConfigPath,
        recommendation: "Define deterministic bindings for each agent (peer/accountId/channel).",
      });
    }

    for (const binding of bindings) {
      const value = binding.value || {};
      const hasDeterministicField = "peer" in value || "accountId" in value || "channel" in value;
      if (!hasDeterministicField) {
        addFinding(routingSection, {
          severity: "high",
          rule: "BINDING_NON_DETERMINISTIC",
          message: `${binding.scope} binding is missing deterministic match fields (peer/accountId/channel).`,
          location: openClawConfigPath,
          recommendation: "Add deterministic matcher fields so inbound messages route to isolated agents correctly.",
          correctedCodeBlock: [
            "```json",
            "{",
            "  \"bindings\": [",
            "    { \"peer\": \"telegram:123456\", \"channel\": \"support\", \"agent\": \"coordinator\" }",
            "  ]",
            "}",
            "```",
          ].join("\n"),
        });
      }
    }

    const workspaceByAgent = new Map();
    const agentDirByAgent = new Map();
    for (const agent of agents) {
      const workspace = getByPath(agent, "workspace");
      const agentDir = getByPath(agent, "agentDir");
      if (!workspace || !agentDir) {
        addFinding(routingSection, {
          severity: "high",
          rule: "AGENT_ISOLATION_FIELDS_MISSING",
          message: `Agent "${agent.name}" is missing workspace and/or agentDir.`,
          location: openClawConfigPath,
          recommendation: "Every agent must define both workspace and agentDir for auth/session isolation.",
          correctedCodeBlock: [
            "```json",
            "{",
            "  \"agents\": [",
            "    {",
            "      \"name\": \"coordinator\",",
            "      \"workspace\": \"/srv/openclaw/workspaces/coordinator\",",
            "      \"agentDir\": \"/srv/openclaw/agents/coordinator\"",
            "    }",
            "  ]",
            "}",
            "```",
          ].join("\n"),
        });
      }
      if (workspace) workspaceByAgent.set(agent.name, workspace);
      if (agentDir) agentDirByAgent.set(agent.name, agentDir);
    }

    const workspaceValues = Array.from(workspaceByAgent.values());
    const agentDirValues = Array.from(agentDirByAgent.values());
    if (new Set(workspaceValues).size !== workspaceValues.length) {
      addFinding(routingSection, {
        severity: "high",
        rule: "WORKSPACE_COLLISION",
        message: "Two or more agents share the same workspace path.",
        location: openClawConfigPath,
        recommendation: "Assign a unique workspace per agent to prevent session/auth collisions.",
      });
    }
    if (new Set(agentDirValues).size !== agentDirValues.length) {
      addFinding(routingSection, {
        severity: "high",
        rule: "AGENTDIR_COLLISION",
        message: "Two or more agents share the same agentDir path.",
        location: openClawConfigPath,
        recommendation: "Assign a unique agentDir per agent to isolate state and credentials.",
      });
    }

    const maxSpawnDepthRaw =
      getByPath(config, "maxSpawnDepth") ||
      getByPath(config, "agents.defaults.maxSpawnDepth") ||
      getByPath(config, "orchestrator.maxSpawnDepth");
    const maxSpawnDepth = Number.isFinite(Number(maxSpawnDepthRaw)) ? Number(maxSpawnDepthRaw) : null;

    const anySessionSpawner = agents.some((agent) =>
      normalizeList(getByPath(agent, "tools.allow")).includes("sessions_spawn"),
    );
    const orchestratorArg = options.orchestrator;
    const orchestratorEnabled =
      orchestratorArg === true ||
      (orchestratorArg === "auto" && (anySessionSpawner || maxSpawnDepth !== null));

    if (orchestratorEnabled) {
      if (maxSpawnDepth === null || maxSpawnDepth < 2) {
        addFinding(concurrencySection, {
          severity: "high",
          rule: "MAX_SPAWN_DEPTH_TOO_LOW",
          message: `maxSpawnDepth is "${String(maxSpawnDepthRaw)}" (must be at least 2 when orchestrator pattern is enabled).`,
          location: openClawConfigPath,
          recommendation: "Set maxSpawnDepth to 2 to allow orchestrator->worker delegation without runaway nesting.",
          correctedCodeBlock: [
            "```json",
            "{",
            "  \"agents\": {",
            "    \"defaults\": {",
            "      \"maxSpawnDepth\": 2",
            "    }",
            "  }",
            "}",
            "```",
          ].join("\n"),
        });
      }

      for (const agent of agents) {
        const allow = normalizeList(getByPath(agent, "tools.allow"));
        const deny = normalizeList(getByPath(agent, "tools.deny"));
        const isOrchestrator = allow.includes("sessions_spawn");

        if (isOrchestrator && !allow.includes("sessions_list")) {
          addFinding(concurrencySection, {
            severity: "high",
            rule: "ORCHESTRATOR_MISSING_SESSIONS_LIST",
            message: `Agent "${agent.name}" allows sessions_spawn but not sessions_list.`,
            location: openClawConfigPath,
            recommendation: "Depth-1 orchestrators should include sessions_spawn and sessions_list together.",
          });
        }

        if (!isOrchestrator) {
          const leafAllowsSessionTool = allow.includes("sessions_spawn") || allow.includes("sessions_list");
          if (leafAllowsSessionTool) {
            addFinding(concurrencySection, {
              severity: "critical",
              rule: "LEAF_WORKER_SESSION_TOOL_EXPOSURE",
              message: `Leaf agent "${agent.name}" can access session tools.`,
              location: openClawConfigPath,
              recommendation: "Depth-2 workers must be denied sessions_spawn and sessions_list.",
            });
          }
          const leafDeniesSessionTools = deny.includes("sessions_spawn") && deny.includes("sessions_list");
          if (!leafDeniesSessionTools) {
            addFinding(concurrencySection, {
              severity: "medium",
              rule: "LEAF_WORKER_SESSION_DENY_MISSING",
              message: `Leaf agent "${agent.name}" does not explicitly deny both session tools.`,
              location: openClawConfigPath,
              recommendation: "Add explicit deny entries for sessions_spawn and sessions_list on depth-2 workers.",
            });
          }
        }
      }
    }

    const heartbeat =
      getByPath(config, "agents.defaults.heartbeat") ||
      getByPath(config, "heartbeat") ||
      getByPath(config, "agents.heartbeat") ||
      {};
    const heartbeatModel = heartbeat.model;
    const includeReasoning = heartbeat.includeReasoning;
    if (!heartbeatModel || typeof heartbeatModel !== "string") {
      addFinding(heartbeatSection, {
        severity: "high",
        rule: "HEARTBEAT_MODEL_MISSING",
        message: "Heartbeat model is missing.",
        location: openClawConfigPath,
        recommendation:
          "Set agents.defaults.heartbeat.model to a local/free provider (for example lmstudio/qwen3-4b).",
      });
    } else if (!/^(lmstudio\/|ollama\/|local\/|localhost|127\.0\.0\.1)/i.test(heartbeatModel)) {
      addFinding(heartbeatSection, {
        severity: "high",
        rule: "HEARTBEAT_MODEL_NOT_LOCAL",
        message: `Heartbeat model "${heartbeatModel}" does not look local/free.`,
        location: openClawConfigPath,
        recommendation:
          "Route heartbeats to a local/free provider (for example lmstudio/qwen3-4b) to avoid background API cost spikes.",
        correctedCodeBlock: [
          "```json",
          "{",
          "  \"agents\": {",
          "    \"defaults\": {",
          "      \"heartbeat\": {",
          "        \"model\": \"lmstudio/qwen3-4b\",",
          "        \"includeReasoning\": false",
          "      }",
          "    }",
          "  }",
          "}",
          "```",
        ].join("\n"),
      });
    }
    if (includeReasoning !== false) {
      addFinding(heartbeatSection, {
        severity: "medium",
        rule: "HEARTBEAT_INCLUDE_REASONING_NOT_FALSE",
        message: `heartbeat.includeReasoning is "${String(includeReasoning)}" (must be false).`,
        location: openClawConfigPath,
        recommendation: "Set includeReasoning to false for recurring heartbeat runs.",
      });
    }
  }

  const skillFiles = walkFiles(
    root,
    (_fullPath, name) => name === "SKILL.md",
    new Set([".git", "node_modules", "dist", "build", ".next", ".openclaw"]),
  );
  if (skillFiles.length === 0) {
    addFinding(skillSection, {
      severity: "medium",
      rule: "SKILL_FILES_NOT_FOUND",
      message: "No SKILL.md files were found.",
      location: root,
      recommendation: "Add skill definitions under skills/*/SKILL.md and enforce AgentSkills frontmatter.",
    });
  }

  for (const skillPath of skillFiles) {
    const content = readFileSafe(skillPath);
    if (typeof content !== "string") continue;
    const { frontmatter, body } = splitFrontmatter(content);
    const bodyLineCount = body.split(/\r?\n/).length;
    if (bodyLineCount > 500) {
      addFinding(skillSection, {
        severity: "high",
        rule: "SKILL_BODY_TOO_LONG",
        message: `Skill body exceeds 500 lines (${bodyLineCount}).`,
        location: skillPath,
        recommendation:
          "Move long references to separate files and load them progressively via read/open instructions.",
      });
    }

    if (!frontmatter) {
      addFinding(skillSection, {
        severity: "high",
        rule: "SKILL_FRONTMATTER_MISSING",
        message: "YAML frontmatter is missing.",
        location: skillPath,
        recommendation: "Add AgentSkills frontmatter with name + description (+ metadata.openclaw.requires when needed).",
        correctedCodeBlock: [
          "```md",
          "---",
          "name: skill-name",
          "description: One-line purpose of this skill.",
          "metadata:",
          "  openclaw:",
          "    requires:",
          "      binaries: []",
          "      env: []",
          "      os: []",
          "---",
          "",
          "Use progressive disclosure.",
          "- Read `references/DETAILS.md` only when needed.",
          "```",
        ].join("\n"),
      });
      continue;
    }

    const topLevelKeys = extractTopLevelYamlKeys(frontmatter);
    const allowedTopLevel = new Set(["name", "description", "metadata"]);
    const extraTopLevel = topLevelKeys.filter((key) => !allowedTopLevel.has(key));
    const missingCore = ["name", "description"].filter((key) => !topLevelKeys.includes(key));
    if (missingCore.length > 0) {
      addFinding(skillSection, {
        severity: "high",
        rule: "SKILL_FRONTMATTER_REQUIRED_KEYS_MISSING",
        message: `Missing frontmatter key(s): ${missingCore.join(", ")}.`,
        location: skillPath,
        recommendation: "Add both name and description to skill frontmatter.",
      });
    }
    if (extraTopLevel.length > 0) {
      addFinding(skillSection, {
        severity: "medium",
        rule: "SKILL_FRONTMATTER_UNEXPECTED_KEYS",
        message: `Unexpected top-level frontmatter key(s): ${extraTopLevel.join(", ")}.`,
        location: skillPath,
        recommendation:
          "Keep top-level fields constrained to name, description, and metadata to match AgentSkills formatting strictness.",
      });
    }

    const nameValue = extractYamlScalar(frontmatter, "name");
    if (!nameValue || nameValue.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nameValue)) {
      addFinding(skillSection, {
        severity: "high",
        rule: "SKILL_NAME_INVALID",
        message:
          "Frontmatter name must be lowercase-hyphen format and <= 64 chars (for example: `lead-capture-pro`).",
        location: skillPath,
        recommendation: "Rename skill frontmatter name to lowercase-hyphen format.",
      });
    }

    const descriptionValue = extractYamlScalar(frontmatter, "description");
    if (!descriptionValue || descriptionValue.length > 1024) {
      addFinding(skillSection, {
        severity: "high",
        rule: "SKILL_DESCRIPTION_INVALID",
        message: "Frontmatter description is missing or exceeds 1024 characters.",
        location: skillPath,
        recommendation: "Provide a concise description with max length 1024.",
      });
    }

    const dependencyHint = /\b(requires?|dependencies?|install|binary|api key|env var|environment variable|macos|linux|windows)\b/i.test(
      content,
    );
    if (dependencyHint && !hasMetadataRequires(frontmatter)) {
      addFinding(skillSection, {
        severity: "medium",
        rule: "SKILL_METADATA_REQUIRES_MISSING",
        message:
          "Skill appears to depend on binaries/env/platform constraints but metadata.openclaw.requires is missing.",
        location: skillPath,
        recommendation: "Add metadata.openclaw.requires so runtime prerequisites are explicit.",
      });
    }

    const hasReadPath = /\b(read|open)\b[^\n]{0,120}(?:\.md|\.json|\.ya?ml|\.txt|scripts\/|references\/|assets\/)/i.test(
      body,
    );
    const hasConditionalLanguage = /\b(only when needed|only if needed|if needed|when required|as needed|progressive disclosure)\b/i.test(
      body,
    );
    if (!hasReadPath || !hasConditionalLanguage) {
      addFinding(skillSection, {
        severity: "high",
        rule: "SKILL_PROGRESSIVE_DISCLOSURE_MISSING",
        message:
          "Skill does not clearly enforce progressive disclosure (read/open secondary references only when needed).",
        location: skillPath,
        recommendation:
          "Add explicit progressive-disclosure rules and reference loading behavior to keep context lean.",
        correctedCodeBlock: [
          "```md",
          "## Progressive Disclosure",
          "- Start with this file only.",
          "- Read `references/FORMS.md` only when needed for form logic.",
          "- Open files in `scripts/` only when the current task requires execution details.",
          "```",
        ].join("\n"),
      });
    }
  }

  finalizeSections(sections);
  const flatFindings = sections.flatMap((section) => section.findings.map((finding) => ({ ...finding, sectionId: section.id })));
  const criticalCount = flatFindings.filter((f) => f.severity === "critical").length;
  const highCount = flatFindings.filter((f) => f.severity === "high").length;
  const mediumCount = flatFindings.filter((f) => f.severity === "medium").length;
  const lowCount = flatFindings.filter((f) => f.severity === "low").length;
  const blockingCount = flatFindings.filter((f) => BLOCKING_SEVERITIES.has(f.severity)).length;

  const overallStatus = sections.some((section) => section.status === "FAIL") ? "Failed" : "Approved";
  const hasPublicExecExposure = flatFindings.some((f) => f.rule === "SECURITY_PUBLIC_EXEC_EXPOSURE");
  const deploymentReadiness = hasPublicExecExposure
    ? "NOT SAFE TO BUILD"
    : overallStatus === "Approved"
      ? "SAFE TO BUILD"
      : "REQUIRES FIXES";

  const permissionFlags = [];
  const sandboxMode =
    (config && (getByPath(config, "agents.defaults.sandbox.mode") || getByPath(config, "sandbox.mode"))) || "unknown";
  permissionFlags.push(`sandbox_mode:${String(sandboxMode)}`);
  const approvedTools = uniq(
    (config ? normalizeList(getByPath(config, "tools.allow")) : [])
      .concat(config ? normalizeList(getByPath(config, "agents.defaults.tools.allow")) : [])
      .filter((tool) => !DANGEROUS_TOOLS.includes(tool)),
  );
  if (approvedTools.length > 0) permissionFlags.push(`approved_tools:${approvedTools.join(",")}`);

  let openclawSecurityLevel = "Unknown";
  if (sandboxMode === "non-main" || sandboxMode === "all") {
    openclawSecurityLevel = "Sandboxed";
  } else if (sandboxMode === "off" || sandboxMode === "none" || sandboxMode === false) {
    openclawSecurityLevel = "Host Exec";
  } else if (flatFindings.some((f) => f.rule === "SECURITY_PUBLIC_EXEC_EXPOSURE")) {
    openclawSecurityLevel = "Mixed";
  }

  const requiredClarifications = [
    {
      id: "heartbeat_model",
      question: "Which specific model runs OpenClaw heartbeats?",
      recommendation: "Use a free/local model via LM Studio (for example lmstudio/qwen3-4b).",
      status:
        config && getByPath(config, "agents.defaults.heartbeat.model")
          ? "answered"
          : "unanswered",
      value: config ? getByPath(config, "agents.defaults.heartbeat.model") || null : null,
    },
    {
      id: "nested_orchestrator",
      question: "Are you using nested sub-agent orchestration (maxSpawnDepth: 2)?",
      recommendation: "Set maxSpawnDepth to at least 2 when using orchestrator pattern.",
      status:
        config && (getByPath(config, "agents.defaults.maxSpawnDepth") || getByPath(config, "maxSpawnDepth"))
          ? "answered"
          : "unanswered",
      value: config ? getByPath(config, "agents.defaults.maxSpawnDepth") || getByPath(config, "maxSpawnDepth") || null : null,
    },
    {
      id: "host_exec_need",
      question: "Do agents require host-level exec permissions or strict sandboxing only?",
      recommendation: "Use strict sandboxing for non-main sessions and public channels.",
      status:
        config && (getByPath(config, "agents.defaults.sandbox.mode") || getByPath(config, "sandbox.mode"))
          ? "answered"
          : "unanswered",
      value: config ? getByPath(config, "agents.defaults.sandbox.mode") || getByPath(config, "sandbox.mode") || null : null,
    },
  ];

  const report = {
    schemaVersion: "1.0.0",
    auditRun: {
      timestamp: new Date().toISOString(),
      root,
      openclawConfigPath: openClawConfigPath,
      bootstrapMaxChars,
      skillFilesScanned: skillFiles.length,
    },
    requiredClarifications,
    sections,
    overall: {
      status: overallStatus,
      deploymentReadiness,
      findingCounts: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        blocking: blockingCount,
      },
    },
    ghl: {
      openclawAuditStatus: overallStatus === "Approved" ? "Approved" : "Failed",
      openclawSecurityLevel,
      approvedTools,
      permissionFlags,
      noteMarkdown: "",
    },
  };
  report.ghl.noteMarkdown = renderNoteMarkdown(report);

  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    usage();
    process.exit(0);
  }
  const root = args.root ? path.resolve(String(args.root)) : null;
  if (!root) {
    usage();
    process.exit(2);
  }
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`Root path is not a directory: ${root}`);
    process.exit(2);
  }

  const bootstrapMaxChars = Number(args["bootstrap-max-chars"] || DEFAULT_BOOTSTRAP_MAX_CHARS);
  const orchestratorArgRaw = String(args.orchestrator || "auto").toLowerCase();
  const orchestrator =
    orchestratorArgRaw === "true" ? true : orchestratorArgRaw === "false" ? false : "auto";

  const report = analyze(root, { bootstrapMaxChars, orchestrator });
  const outPath = args.out ? path.resolve(String(args.out)) : null;
  if (outPath) {
    writeJson(outPath, report);
  }

  const summary = [
    `OpenClaw Audit Status: ${report.overall.status}`,
    `Deployment Readiness: ${report.overall.deploymentReadiness}`,
    `Findings: critical=${report.overall.findingCounts.critical}, high=${report.overall.findingCounts.high}, medium=${report.overall.findingCounts.medium}, low=${report.overall.findingCounts.low}`,
  ];
  console.log(summary.join("\n"));
  if (outPath) {
    console.log(`Report written: ${outPath}`);
  }

  if (report.overall.status !== "Approved") {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
