try {
  require("dotenv").config();
} catch (error) {
  // Ignore missing dotenv; environment variables can be supplied by shell.
}

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cron = require("node-cron");
const webpush = require("web-push");
const { createClient } = require("@supabase/supabase-js");
const {
  CAROUSEL_INPUT_SCHEMA,
  GRAPHICS_CREATION_SKILL,
  SAMPLE_INPUT,
  generateCarousel,
} = require("./carouselGenerator");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data", "carousels");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:hello@example.com";
const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE || "America/Chicago";
const CRON_SECRET = process.env.CRON_SECRET || "";
const AUTH_EMAIL_REDIRECT_TO =
  process.env.AUTH_EMAIL_REDIRECT_TO ||
  process.env.APP_BASE_URL ||
  "http://localhost:3000/app";
const DISABLE_IN_PROCESS_CRON =
  String(process.env.DISABLE_IN_PROCESS_CRON || "").toLowerCase() === "true";
const IS_VERCEL_RUNTIME =
  String(process.env.VERCEL || "").toLowerCase() === "1" ||
  String(process.env.VERCEL || "").toLowerCase() === "true";

const hasSupabase =
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  SUPABASE_SERVICE_ROLE_KEY.length > 0;

const hasPushConfig =
  VAPID_PUBLIC_KEY.length > 0 &&
  VAPID_PRIVATE_KEY.length > 0;

const supabaseAuth = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

const supabaseAdmin = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (hasPushConfig) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

if (hasSupabase && hasPushConfig && !DISABLE_IN_PROCESS_CRON && !IS_VERCEL_RUNTIME) {
  cron.schedule("0 * * * *", runReminderSweep, {
    timezone: REMINDER_TIMEZONE,
  });
}

app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/", (req, res) => {
  res.json({
    name: "b-roll-bank-api",
    status: "ok",
    supabase_configured: hasSupabase,
    push_configured: hasPushConfig,
    endpoints: [
      "POST /api/auth/signup",
      "POST /api/auth/resend-confirmation",
      "POST /api/auth/login",
      "POST /api/auth/refresh",
      "GET /api/auth/session",
      "GET /api/app-state",
      "PUT /api/app-state",
      "GET /api/push/vapid-public-key",
      "POST /api/push/subscribe",
      "POST /api/push/test",
      "GET /api/cron/reminders",
      "GET /api/schema",
      "GET /api/graphics-skill",
      "GET /api/sample-input",
      "POST /api/carousel",
    ],
  });
});

app.get("/api/schema", (req, res) => {
  res.json(CAROUSEL_INPUT_SCHEMA);
});

app.get("/api/sample-input", (req, res) => {
  res.json(SAMPLE_INPUT);
});

app.get("/api/graphics-skill", (req, res) => {
  res.json(GRAPHICS_CREATION_SKILL);
});

app.post("/api/carousel", async (req, res) => {
  const { persist, ...input } = req.body || {};
  const forceMockFromQuery =
    String(req.query.mock || "").toLowerCase() === "1" ||
    String(req.query.mock || "").toLowerCase() === "true";
  const useMock =
    forceMockFromQuery ||
    process.env.MOCK_MODE === "true" ||
    !process.env.OPENAI_API_KEY;

  try {
    const generated = await generateCarousel(input, {
      allowMock: true,
      forceMock: useMock,
    });
    const generationMode =
      generated && typeof generated._generation_mode === "string"
        ? generated._generation_mode
        : useMock
          ? "mock_forced"
          : "live";
    const output = { ...generated };
    delete output._generation_mode;

    const mode = generationMode.startsWith("live") ? "live" : "mock";
    const shouldPersist =
      persist === true ||
      String(persist || "").toLowerCase() === "true" ||
      String(req.query.persist || "").toLowerCase() === "1" ||
      String(req.query.persist || "").toLowerCase() === "true";

    let savedPath = null;
    if (shouldPersist) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `carousel-${stamp}.json`;
      const filePath = path.join(DATA_DIR, fileName);
      const record = {
        created_at: new Date().toISOString(),
        mode,
        mode_detail: generationMode,
        input,
        output,
      };

      fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
      savedPath = filePath;
    }

    res.json({
      mode,
      mode_detail: generationMode,
      input,
      output,
      saved_path: savedPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isValidationError =
      message.includes("Missing required field") ||
      message.includes("must be a non-empty string") ||
      message.includes("must be a string when provided") ||
      message.includes("num_slides must be an integer") ||
      message.includes("Input must be an object");

    res.status(isValidationError ? 400 : 500).json({
      error: message,
    });
  }
});

app.get("/api/carousels", (req, res) => {
  try {
    const files = fs
      .readdirSync(DATA_DIR)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .reverse();

    const items = files.map((name) => ({
      file: name,
      path: path.join(DATA_DIR, name),
    }));

    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: "Failed to list saved carousels." });
  }
});

app.post("/api/auth/signup", requireSupabase, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({
      user: data.user || null,
      session: data.session || null,
      email_confirmation_required: !data.session,
    });
  } catch (error) {
    res.status(500).json({ error: "Signup failed." });
  }
});

app.post("/api/auth/resend-confirmation", requireSupabase, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  try {
    const { error } = await supabaseAuth.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: AUTH_EMAIL_REDIRECT_TO,
      },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend confirmation email." });
  }
});

app.post("/api/auth/login", requireSupabase, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      res.status(401).json({ error: error?.message || "Invalid credentials." });
      return;
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});

app.post("/api/auth/refresh", requireSupabase, async (req, res) => {
  const refreshToken = String(req.body?.refresh_token || "");
  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token is required." });
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      res.status(401).json({ error: error?.message || "Could not refresh session." });
      return;
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ error: "Refresh failed." });
  }
});

app.get("/api/auth/session", requireSupabase, requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/app-state", requireSupabase, requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("app_user_state")
      .select("data")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({
      data: data?.data || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load app state." });
  }
});

app.put("/api/app-state", requireSupabase, requireAuth, async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    res.status(400).json({ error: "State payload must be an object." });
    return;
  }

  try {
    const { error } = await supabaseAdmin.from("app_user_state").upsert(
      {
        user_id: req.user.id,
        data: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ ok: true, updated_at: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: "Failed to save app state." });
  }
});

app.get("/api/push/vapid-public-key", requireSupabase, requireAuth, (req, res) => {
  if (!hasPushConfig) {
    res.status(503).json({ error: "Push notifications are not configured on the server." });
    return;
  }

  res.json({ public_key: VAPID_PUBLIC_KEY });
});

app.post("/api/push/subscribe", requireSupabase, requireAuth, async (req, res) => {
  if (!hasPushConfig) {
    res.status(503).json({ error: "Push notifications are not configured on the server." });
    return;
  }

  const subscription = req.body?.subscription;
  if (!isValidPushSubscription(subscription)) {
    res.status(400).json({ error: "Invalid push subscription payload." });
    return;
  }

  const hash = hashSubscriptionEndpoint(subscription.endpoint);

  try {
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id: req.user.id,
        subscription_hash: hash,
        endpoint: subscription.endpoint,
        subscription_json: subscription,
        created_at: new Date().toISOString(),
      },
      { onConflict: "subscription_hash" }
    );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save push subscription." });
  }
});

app.delete("/api/push/subscribe", requireSupabase, requireAuth, async (req, res) => {
  const endpoint = String(req.body?.endpoint || "").trim();
  if (!endpoint) {
    res.status(400).json({ error: "Endpoint is required." });
    return;
  }

  const hash = hashSubscriptionEndpoint(endpoint);

  try {
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", req.user.id)
      .eq("subscription_hash", hash);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove push subscription." });
  }
});

app.post("/api/push/test", requireSupabase, requireAuth, async (req, res) => {
  if (!hasPushConfig) {
    res.status(503).json({ error: "Push notifications are not configured on the server." });
    return;
  }

  try {
    const delivered = await sendPushToUser(req.user.id, {
      title: "B-Roll Bank Test",
      body: "Push reminders are working.",
      url: "/app?tab=settings",
      reminderType: "test",
    });

    res.json({ ok: true, delivered });
  } catch (error) {
    res.status(500).json({ error: "Failed to send test notification." });
  }
});

app.get("/api/cron/reminders", requireSupabase, async (req, res) => {
  if (!hasPushConfig) {
    res.status(503).json({ error: "Push notifications are not configured on the server." });
    return;
  }

  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({ error: "Unauthorized cron request." });
    return;
  }

  const summary = await runReminderSweep();
  if (summary.error) {
    res.status(500).json({
      ok: false,
      ...summary,
    });
    return;
  }

  res.json({
    ok: true,
    ...summary,
  });
});

async function requireAuth(req, res, next) {
  const token = parseBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Authorization token is required." });
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: error?.message || "Invalid or expired token." });
      return;
    }

    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Could not validate token." });
  }
}

function requireSupabase(req, res, next) {
  if (!hasSupabase) {
    res.status(503).json({
      error:
        "Supabase is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    });
    return;
  }
  next();
}

function parseBearerToken(req) {
  const raw = String(req.headers.authorization || "");
  if (!raw.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return raw.slice(7).trim();
}

function isValidPushSubscription(subscription) {
  if (!subscription || typeof subscription !== "object") {
    return false;
  }

  if (typeof subscription.endpoint !== "string" || !subscription.endpoint.length) {
    return false;
  }

  if (!subscription.keys || typeof subscription.keys !== "object") {
    return false;
  }

  return (
    typeof subscription.keys.p256dh === "string" &&
    subscription.keys.p256dh.length > 0 &&
    typeof subscription.keys.auth === "string" &&
    subscription.keys.auth.length > 0
  );
}

function hashSubscriptionEndpoint(endpoint) {
  return crypto.createHash("sha256").update(endpoint).digest("hex");
}

function isAuthorizedCronRequest(req) {
  const authorization = String(req.headers.authorization || "");
  const token = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (CRON_SECRET.length > 0) {
    return secureStringMatch(token, CRON_SECRET);
  }

  const userAgent = String(req.headers["user-agent"] || "").toLowerCase();
  return userAgent.includes("vercel-cron");
}

function secureStringMatch(a, b) {
  const left = Buffer.from(String(a), "utf8");
  const right = Buffer.from(String(b), "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

async function runReminderSweep() {
  const summary = {
    ran_at: new Date().toISOString(),
    timezone: REMINDER_TIMEZONE,
    processed_users: 0,
    due_events: 0,
    notifications_delivered: 0,
  };

  if (!hasSupabase || !hasPushConfig || !supabaseAdmin) {
    return {
      ...summary,
      error: "Supabase and push settings are required for reminder delivery.",
    };
  }

  try {
    const now = new Date();
    const nowParts = getDatePartsInTimezone(now, REMINDER_TIMEZONE);

    const { data: states, error } = await supabaseAdmin
      .from("app_user_state")
      .select("user_id,data");

    if (error) {
      console.error("[reminders] state query failed:", error.message);
      return {
        ...summary,
        error: error.message,
      };
    }

    const rows = Array.isArray(states) ? states : [];
    summary.processed_users = rows.length;
    for (const row of rows) {
      const reminders = row?.data?.reminders || {};
      const dueTypes = getDueReminderTypes(reminders, nowParts);

      for (const reminderType of dueTypes) {
        const inserted = await markReminderEvent(row.user_id, reminderType, nowParts.isoDate);
        if (!inserted) {
          continue;
        }

        summary.due_events += 1;
        const payload = buildReminderPayload(reminderType);
        const delivered = await sendPushToUser(row.user_id, payload);
        summary.notifications_delivered += delivered;
      }
    }

    return summary;
  } catch (error) {
    console.error("[reminders] sweep error:", error);
    return {
      ...summary,
      error: error instanceof Error ? error.message : "Unknown reminder sweep error.",
    };
  }
}

function getDatePartsInTimezone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });

  const parts = formatter.formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return {
    isoDate: `${map.year}-${map.month}-${map.day}`,
    weekday: map.weekday,
    dayOfMonth: Number(map.day),
  };
}

function parseDayOfMonth(dateString) {
  if (typeof dateString !== "string" || !dateString.includes("-")) {
    return null;
  }
  const parts = dateString.split("-");
  const day = Number(parts[2]);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }
  return day;
}

function getDueReminderTypes(reminders, nowParts) {
  const due = [];

  if (reminders.monthlyBatchEnabled) {
    const day = parseDayOfMonth(reminders.monthlyBatchDate);
    if (day && day === nowParts.dayOfMonth) {
      due.push("monthlyBatch");
    }
  }

  if (reminders.weeklyAddEnabled) {
    const weeklyDay = String(reminders.weeklyAddDay || "").trim().toLowerCase();
    if (weeklyDay && weeklyDay === nowParts.weekday.toLowerCase()) {
      due.push("weeklyAdd10");
    }
  }

  if (reminders.monthlyRefreshEnabled) {
    const day = parseDayOfMonth(reminders.monthlyRefreshDate);
    if (day && day === nowParts.dayOfMonth) {
      due.push("monthlyRefresh");
    }
  }

  return due;
}

async function markReminderEvent(userId, reminderType, reminderDate) {
  const { error } = await supabaseAdmin.from("reminder_events").insert({
    user_id: userId,
    reminder_type: reminderType,
    reminder_date: reminderDate,
    sent_at: new Date().toISOString(),
  });

  if (!error) {
    return true;
  }

  const message = String(error.message || "");
  const duplicate =
    message.includes("duplicate key") ||
    message.includes("reminder_events_user_id_reminder_type_reminder_date_key");

  if (duplicate) {
    return false;
  }

  console.error("[reminders] could not mark event:", error.message);
  return false;
}

function buildReminderPayload(reminderType) {
  const map = {
    monthlyBatch: {
      title: "Monthly Batch Day",
      body: "Film 120-200 reusable clips today so posting is easier all month.",
      url: "/app?tab=film",
    },
    weeklyAdd10: {
      title: "Weekly Add 10",
      body: "Capture 10 new clips now to keep your library fresh.",
      url: "/app?tab=film",
    },
    monthlyRefresh: {
      title: "Library Refresh",
      body: "Mark overused clips and rotate in new options for better variety.",
      url: "/app?tab=library",
    },
  };

  const selected = map[reminderType] || {
    title: "B-Roll Bank Reminder",
    body: "Open the app and take your next best action.",
    url: "/app",
  };

  return {
    ...selected,
    reminderType,
  };
}

async function sendPushToUser(userId, payload) {
  if (!hasPushConfig) {
    return 0;
  }

  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id,subscription_json")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const subscriptions = Array.isArray(data) ? data : [];
  let delivered = 0;

  for (const row of subscriptions) {
    try {
      await webpush.sendNotification(row.subscription_json, JSON.stringify(payload));
      delivered += 1;
    } catch (error) {
      const statusCode = Number(error?.statusCode || 0);
      const isGone = statusCode === 404 || statusCode === 410;

      if (isGone) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", row.id);
      } else {
        console.error("[push] send failed:", error?.message || error);
      }
    }
  }

  return delivered;
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`B-Roll Bank API listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  hasSupabase,
  hasPushConfig,
  runReminderSweep,
};
