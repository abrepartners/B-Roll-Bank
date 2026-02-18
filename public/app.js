const AUTH_ACCESS_TOKEN_KEY = "brollbank.auth.access";
const AUTH_REFRESH_TOKEN_KEY = "brollbank.auth.refresh";
const GUEST_STATE_KEY = "brollbank.guest.state";

const CATEGORIES = [
  "Walking and entering",
  "Desk and work mode",
  "Phone and social actions",
  "Coffee and kitchen moments",
  "Car and on the go",
  "Listing and home tour style",
  "Hands only details",
  "Over the shoulder",
  "Silent talking head",
  "Transitions",
  "Outdoor lifestyle",
];

const SHOT_TYPES = ["wide", "medium", "tight"];

const VALUE_LINES = {
  reminder: [
    "Most people do not need more ideas. They need a system.",
    "One point, one clip, one call to action. Keep it simple.",
    "Stop overthinking. Start posting.",
  ],
  truth: [
    "Document what you are already doing. Consistency beats perfection.",
    "A boring post every week beats a perfect post once a month.",
    "Track one thing daily and your content will stop feeling random.",
  ],
  quick_tip: [
    "If you do not know what to post, answer the last question a client asked.",
    "Reuse one strong clip with a new angle before filming anything new.",
    "Film three lengths of the same action and your edit options jump fast.",
  ],
};

const CTA_PATTERNS = {
  comment_keyword: 'Comment "SYSTEM" and I will send the checklist.',
  dm_keyword: 'DM "PLAN" and I will send the template.',
  book_link: "Book a call using the link in bio.",
};

const POST_CHECKLIST = [
  "Pick one clip from recommended types.",
  "Use first caption line as on-screen text.",
  "Keep post to one value point.",
  "End with one CTA only.",
];

const GOAL_WEEKLY_TARGET = {
  "3_per_week": 10,
  "5_per_week": 16,
  daily: 24,
};

const DEFAULT_STATE = {
  user: {
    onboardingComplete: false,
    market: "",
    postingGoal: "3_per_week",
    batchSessionLength: 90,
    platforms: ["Instagram", "TikTok"],
  },
  reminders: {
    monthlyBatchEnabled: true,
    monthlyBatchDate: isoDate(addDays(new Date(), 7)),
    weeklyAddEnabled: true,
    weeklyAddDay: "Monday",
    monthlyRefreshEnabled: true,
    monthlyRefreshDate: isoDate(addDays(new Date(), 28)),
  },
  clips: [],
  sessions: [],
  templates: [],
  postDrafts: [],
  activeBatchSession: null,
  activeQuickSession: null,
  latestCaption: null,
  latestFiller: null,
};

const auth = {
  user: null,
  accessToken: sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || "",
  refreshToken: sessionStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || "",
  restoring: false,
};

let state = loadGuestState();
let toastTimer = null;
let saveTimer = null;
let saveInFlight = false;
let pendingSave = false;
let pushStatusMessage = "Push not enabled.";

const els = {
  toast: document.getElementById("toast"),
  auth: {
    overlay: document.getElementById("auth-overlay"),
    status: document.getElementById("auth-status"),
    userEmail: document.getElementById("auth-user-email"),
    openBtn: document.getElementById("auth-open-btn"),
    logoutBtn: document.getElementById("auth-logout-btn"),
    resendBtn: document.getElementById("auth-resend-btn"),
    guestBtn: document.getElementById("auth-guest-btn"),
    signInForm: document.getElementById("sign-in-form"),
    signUpForm: document.getElementById("sign-up-form"),
    signInSubmit: document.getElementById("sign-in-submit"),
    signUpSubmit: document.getElementById("sign-up-submit"),
  },
  onboardingOverlay: document.getElementById("onboarding-overlay"),
  onboardingForm: document.getElementById("onboarding-form"),
  tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
  modeButtons: Array.from(document.querySelectorAll(".mode-btn")),
  modePanels: Array.from(document.querySelectorAll(".mode-panel")),
  quickJumpButtons: Array.from(document.querySelectorAll("[data-jump-tab]")),
  stats: {
    clips: document.getElementById("stat-clips"),
    drafts: document.getElementById("stat-drafts"),
    streak: document.getElementById("stat-streak"),
  },
  today: {
    nextActionText: document.getElementById("next-action-text"),
    nextActionBtn: document.getElementById("next-action-btn"),
    clipProgressLabel: document.getElementById("clip-progress-label"),
    clipProgressBar: document.getElementById("clip-progress-bar"),
    streakValue: document.getElementById("streak-value"),
  },
  film: {
    batchForm: document.getElementById("batch-form"),
    batchOutput: document.getElementById("batch-session-output"),
    quick10Form: document.getElementById("quick10-form"),
    quick10Output: document.getElementById("quick10-output"),
    quick10Category: document.getElementById("quick10-category"),
  },
  library: {
    clipForm: document.getElementById("clip-form"),
    clipCategory: document.getElementById("clip-category"),
    search: document.getElementById("library-search"),
    categoryFilter: document.getElementById("library-category-filter"),
    favoritesFilter: document.getElementById("library-favorites-filter"),
    overusedFilter: document.getElementById("library-overused-filter"),
    count: document.getElementById("library-count"),
    list: document.getElementById("library-list"),
  },
  post: {
    captionForm: document.getElementById("caption-first-form"),
    captionOutput: document.getElementById("caption-output"),
    fillerForm: document.getElementById("daily-filler-form"),
    fillerOutput: document.getElementById("filler-output"),
    dailyClipId: document.getElementById("daily-clip-id"),
    draftList: document.getElementById("draft-list"),
  },
  settings: {
    reminderForm: document.getElementById("reminder-form"),
    pushEnableBtn: document.getElementById("push-enable-btn"),
    pushTestBtn: document.getElementById("push-test-btn"),
    nativeSyncBtn: document.getElementById("native-sync-btn"),
    pushStatus: document.getElementById("push-status"),
    exportBackupBtn: document.getElementById("export-backup"),
    importBackupInput: document.getElementById("import-backup"),
    resetDemoBtn: document.getElementById("reset-demo"),
  },
};

bootstrap().catch((error) => {
  console.error(error);
  showToast("App failed to initialize.");
});

async function bootstrap() {
  populateCategorySelects();
  bindEvents();
  setPostMode("caption");
  applyTabFromQuery();
  renderAll();
  await restoreSession();
}

function bindEvents() {
  els.auth.openBtn.addEventListener("click", () => {
    showAuthOverlay(true);
    setAuthStatus("Sign in to continue.");
  });

  els.auth.logoutBtn.addEventListener("click", onLogoutClick);
  els.auth.resendBtn.addEventListener("click", onResendConfirmationClick);
  els.auth.guestBtn.addEventListener("click", () => {
    showAuthOverlay(false);
    setAuthStatus("Guest mode active. Sign in anytime to sync.");
    showToast("Continuing in guest mode.");
  });
  els.auth.signInForm.addEventListener("submit", onSignInSubmit);
  els.auth.signUpForm.addEventListener("submit", onSignUpSubmit);

  els.onboardingForm.addEventListener("submit", onOnboardingSubmit);

  for (const btn of els.tabButtons) {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  }

  for (const btn of els.quickJumpButtons) {
    btn.addEventListener("click", () => {
      if (!assertAuthenticated()) {
        return;
      }

      const tab = btn.dataset.jumpTab;
      const selector = btn.dataset.focus;
      setActiveTab(tab);
      if (selector) {
        const target = document.querySelector(selector);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          if (typeof target.focus === "function") {
            target.focus();
          }
        }
      }
    });
  }

  els.today.nextActionBtn.addEventListener("click", () => {
    if (!assertAuthenticated()) {
      return;
    }
    const tab = els.today.nextActionBtn.dataset.tab || "film";
    const focusSelector = els.today.nextActionBtn.dataset.focus || "";
    setActiveTab(tab);
    if (focusSelector) {
      const focusTarget = document.querySelector(focusSelector);
      focusTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  els.film.batchForm.addEventListener("submit", onBatchFormSubmit);
  els.film.quick10Form.addEventListener("submit", onQuick10FormSubmit);
  els.film.batchOutput.addEventListener("click", onBatchOutputClick);
  els.film.batchOutput.addEventListener("change", onBatchOutputChange);
  els.film.quick10Output.addEventListener("click", onQuick10OutputClick);
  els.film.quick10Output.addEventListener("change", onQuick10OutputChange);

  els.library.clipForm.addEventListener("submit", onClipFormSubmit);
  els.library.search.addEventListener("input", renderLibrary);
  els.library.categoryFilter.addEventListener("change", renderLibrary);
  els.library.favoritesFilter.addEventListener("change", renderLibrary);
  els.library.overusedFilter.addEventListener("change", renderLibrary);
  els.library.list.addEventListener("click", onLibraryListClick);

  els.post.captionForm.addEventListener("submit", onCaptionFormSubmit);
  els.post.fillerForm.addEventListener("submit", onFillerFormSubmit);
  els.post.captionOutput.addEventListener("click", onCaptionOutputClick);
  els.post.fillerOutput.addEventListener("click", onFillerOutputClick);
  els.post.draftList.addEventListener("click", onDraftListClick);

  for (const btn of els.modeButtons) {
    btn.addEventListener("click", () => setPostMode(btn.dataset.mode));
  }

  els.settings.reminderForm.addEventListener("submit", onReminderFormSubmit);
  els.settings.pushEnableBtn.addEventListener("click", onEnablePushClick);
  els.settings.pushTestBtn.addEventListener("click", onPushTestClick);
  els.settings.nativeSyncBtn.addEventListener("click", onNativeSyncClick);
  els.settings.exportBackupBtn.addEventListener("click", exportBackup);
  els.settings.importBackupInput.addEventListener("change", importBackup);
  els.settings.resetDemoBtn.addEventListener("click", resetDemoData);
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function mergeWithDefault(candidate) {
  const fresh = cloneDefaultState();
  const merged = {
    ...fresh,
    ...candidate,
    user: { ...fresh.user, ...(candidate?.user || {}) },
    reminders: { ...fresh.reminders, ...(candidate?.reminders || {}) },
  };
  merged.clips = Array.isArray(candidate?.clips) ? candidate.clips : [];
  merged.sessions = Array.isArray(candidate?.sessions) ? candidate.sessions : [];
  merged.templates = Array.isArray(candidate?.templates) ? candidate.templates : [];
  merged.postDrafts = Array.isArray(candidate?.postDrafts) ? candidate.postDrafts : [];
  merged.activeBatchSession = candidate?.activeBatchSession || null;
  merged.activeQuickSession = candidate?.activeQuickSession || null;
  merged.latestCaption = candidate?.latestCaption || null;
  merged.latestFiller = candidate?.latestFiller || null;
  return merged;
}

function loadGuestState() {
  try {
    const raw = localStorage.getItem(GUEST_STATE_KEY);
    if (!raw) {
      return cloneDefaultState();
    }
    return mergeWithDefault(JSON.parse(raw));
  } catch (error) {
    return cloneDefaultState();
  }
}

function saveGuestState(nextState) {
  try {
    localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(nextState));
  } catch (error) {
    // Ignore storage write failures.
  }
}

async function restoreSession() {
  if (!auth.accessToken) {
    showAuthOverlay(false);
    setAuthStatus("Guest mode active. Sign in anytime to sync.");
    renderAuthUI();
    return;
  }

  auth.restoring = true;
  renderAuthUI();

  try {
    const sessionResult = await apiFetch("/api/auth/session", { authRequired: true });
    auth.user = sessionResult.user || null;
    setAuthStatus("Session restored.");
    await loadRemoteState();
    showAuthOverlay(false);
  } catch (error) {
    clearAuthTokens();
    auth.user = null;
    showAuthOverlay(false);
    setAuthStatus("Session expired. Continuing in guest mode.");
  } finally {
    auth.restoring = false;
    renderAll();
  }
}

function setAuthTokens(session) {
  auth.accessToken = String(session?.access_token || "");
  auth.refreshToken = String(session?.refresh_token || "");

  sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, auth.accessToken);
  sessionStorage.setItem(AUTH_REFRESH_TOKEN_KEY, auth.refreshToken);
}

function clearAuthTokens() {
  auth.accessToken = "";
  auth.refreshToken = "";
  sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

async function refreshAuthSession() {
  if (!auth.refreshToken) {
    return false;
  }

  try {
    const result = await apiFetch("/api/auth/refresh", {
      method: "POST",
      body: { refresh_token: auth.refreshToken },
      authRequired: false,
      allowRefreshRetry: false,
    });

    if (!result?.session) {
      return false;
    }

    setAuthTokens(result.session);
    auth.user = result.user || auth.user;
    renderAuthUI();
    return true;
  } catch (error) {
    return false;
  }
}

async function apiFetch(url, options = {}) {
  const {
    method = "GET",
    body,
    authRequired = false,
    allowRefreshRetry = true,
  } = options;

  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (authRequired && auth.accessToken) {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await safeJson(response);

  if (response.status === 401 && authRequired && allowRefreshRetry) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      return apiFetch(url, {
        method,
        body,
        authRequired,
        allowRefreshRetry: false,
      });
    }
  }

  if (!response.ok) {
    const message = payload?.error || `${method} ${url} failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

async function onSignInSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.auth.signInForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    setAuthStatus("Email and password are required.");
    return;
  }

  setAuthStatus("Signing in...");
  els.auth.signInSubmit.disabled = true;

  try {
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (!result?.session || !result?.user) {
      throw new Error("Could not establish session.");
    }

    setAuthTokens(result.session);
    auth.user = result.user;
    await loadRemoteState();
    persist({ immediate: true });

    showAuthOverlay(false);
    setAuthStatus("Signed in.");
    showToast("Welcome back.");
    renderAll();
  } catch (error) {
    setAuthStatus(error.message || "Sign in failed.");
  } finally {
    els.auth.signInSubmit.disabled = false;
  }
}

async function onSignUpSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.auth.signUpForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    setAuthStatus("Email and password are required.");
    return;
  }

  if (password.length < 8) {
    setAuthStatus("Use at least 8 characters.");
    return;
  }

  setAuthStatus("Creating account...");
  els.auth.signUpSubmit.disabled = true;

  try {
    const result = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: { email, password },
    });

    if (result.email_confirmation_required) {
      setAuthStatus("Account created. Confirm your email, then sign in.");
      showToast("Check your email to confirm your account.");
      return;
    }

    if (result.session && result.user) {
      setAuthTokens(result.session);
      auth.user = result.user;
      await loadRemoteState();
      persist({ immediate: true });
      showAuthOverlay(false);
      showToast("Account created.");
      setAuthStatus("Account created and signed in.");
      renderAll();
      return;
    }

    setAuthStatus("Account created. Please sign in.");
  } catch (error) {
    setAuthStatus(error.message || "Sign up failed.");
  } finally {
    els.auth.signUpSubmit.disabled = false;
  }
}

async function onResendConfirmationClick() {
  const signUpEmailInput = document.getElementById("sign-up-email");
  const signInEmailInput = document.getElementById("sign-in-email");
  const candidate = String(signUpEmailInput?.value || signInEmailInput?.value || "")
    .trim()
    .toLowerCase();

  if (!candidate) {
    setAuthStatus("Enter your email first, then resend confirmation.");
    return;
  }

  els.auth.resendBtn.disabled = true;
  setAuthStatus("Sending confirmation email...");

  try {
    await apiFetch("/api/auth/resend-confirmation", {
      method: "POST",
      body: { email: candidate },
    });
    setAuthStatus("Confirmation email sent. Check inbox and spam.");
    showToast("Confirmation email sent.");
  } catch (error) {
    setAuthStatus(error.message || "Could not resend confirmation.");
  } finally {
    els.auth.resendBtn.disabled = false;
  }
}

function onLogoutClick() {
  if (auth.user) {
    saveGuestState(state);
  }

  clearAuthTokens();
  auth.user = null;
  auth.restoring = false;
  pendingSave = false;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  showAuthOverlay(false);
  setAuthStatus("Signed out. Continuing in guest mode.");
  showToast("Signed out. Local mode active.");
  renderAll();
}

async function loadRemoteState() {
  const guestSnapshot = state;
  const result = await apiFetch("/api/app-state", { authRequired: true });
  state = result?.data ? mergeWithDefault(result.data) : mergeWithDefault(guestSnapshot);
}

function persist(options = {}) {
  if (!auth.user) {
    saveGuestState(state);
    return;
  }

  pendingSave = true;
  if (options.immediate) {
    void flushStateSave();
    return;
  }

  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    void flushStateSave();
  }, 500);
}

async function flushStateSave() {
  if (!auth.user || saveInFlight || !pendingSave) {
    return;
  }

  saveInFlight = true;
  pendingSave = false;

  try {
    await apiFetch("/api/app-state", {
      method: "PUT",
      authRequired: true,
      body: state,
    });
  } catch (error) {
    pendingSave = true;
    console.error(error);
    showToast("Could not sync. Will retry.");
  } finally {
    saveInFlight = false;
    if (pendingSave) {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      saveTimer = setTimeout(() => {
        void flushStateSave();
      }, 900);
    }
  }
}

function setAuthStatus(message) {
  els.auth.status.textContent = message;
}

function showAuthOverlay(show) {
  els.auth.overlay.classList.toggle("hidden", !show);
}

function renderAuthUI() {
  if (auth.user) {
    els.auth.userEmail.textContent = auth.user.email || "Signed in";
    els.auth.openBtn.textContent = "Account";
    els.auth.logoutBtn.disabled = false;
    if (!auth.restoring) {
      showAuthOverlay(false);
    }
  } else {
    els.auth.userEmail.textContent = "Guest mode (local only)";
    els.auth.openBtn.textContent = "Sign In";
    els.auth.logoutBtn.disabled = true;
  }
}

function assertAuthenticated(options = {}) {
  const requireLogin = Boolean(options.requireLogin);
  if (auth.user) {
    return true;
  }

  if (!requireLogin) {
    return true;
  }

  showAuthOverlay(true);
  setAuthStatus("Sign in required.");
  showToast("Sign in to continue.");
  return false;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    els.toast.classList.remove("visible");
  }, 2000);
}

function applyTabFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  const allowed = new Set(["today", "film", "library", "post", "settings"]);
  if (tab && allowed.has(tab)) {
    setActiveTab(tab);
    return;
  }
  setActiveTab("today");
}

function renderAll() {
  renderAuthUI();
  renderOnboarding();
  renderStats();
  renderToday();
  renderBatchSession();
  renderQuickSession();
  renderLibrary();
  renderClipOptions();
  renderPostOutputs();
  renderDrafts();
  renderReminderForm();
  renderPushStatus();
}

function renderOnboarding() {
  const needsOnboarding = !state.user.onboardingComplete;
  els.onboardingOverlay.classList.toggle("hidden", !needsOnboarding);
}

function onOnboardingSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.onboardingForm);
  const platforms = formData.getAll("platforms").map((item) => String(item));
  state.user = {
    onboardingComplete: true,
    market: String(formData.get("market") || "").trim(),
    postingGoal: String(formData.get("postingGoal") || "3_per_week"),
    batchSessionLength: Number(formData.get("batchSessionLength") || 90),
    platforms: platforms.length ? platforms : ["Instagram"],
  };

  state.reminders = {
    ...state.reminders,
    monthlyBatchDate: isoDate(addDays(new Date(), 7)),
    monthlyRefreshDate: isoDate(addDays(new Date(), 28)),
  };

  persist({ immediate: true });
  renderAll();
  showToast("Plan saved.");
}

function renderStats() {
  const streak = calculateStreakDays();
  els.stats.clips.textContent = String(state.clips.length);
  els.stats.drafts.textContent = String(state.postDrafts.length);
  els.stats.streak.textContent = `${streak}d`;
}

function renderToday() {
  const weeklyTarget = GOAL_WEEKLY_TARGET[state.user.postingGoal] || 10;
  const weeklyClipCount = getRecentClipsCount(7);
  const progressPct = Math.min(100, Math.round((weeklyClipCount / weeklyTarget) * 100));
  const streak = calculateStreakDays();
  const action = computeNextAction();

  els.today.nextActionText.textContent = action.text;
  els.today.nextActionBtn.textContent = action.button;
  els.today.nextActionBtn.dataset.tab = action.tab;
  els.today.nextActionBtn.dataset.focus = action.focus;

  els.today.clipProgressLabel.textContent = `${weeklyClipCount} / ${weeklyTarget} clips this week`;
  els.today.clipProgressBar.style.width = `${progressPct}%`;
  els.today.streakValue.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
}

function computeNextAction() {
  if (state.clips.length < 20) {
    return {
      text: "Run Monthly Batch Day and capture your first 20 reusable clips.",
      button: "Start Batch Session",
      tab: "film",
      focus: "#batch-form",
    };
  }

  const recentSessionCount = state.sessions.filter((session) => isWithinDays(session.startedAt, 7)).length;
  if (recentSessionCount < 1) {
    return {
      text: "You have a clip base. Run Quick Add 10 to keep the library fresh.",
      button: "Run Quick Add 10",
      tab: "film",
      focus: "#quick10-form",
    };
  }

  const weeklyDrafts = state.postDrafts.filter((draft) => isWithinDays(draft.createdAt, 7)).length;
  if (weeklyDrafts < 2) {
    return {
      text: "Generate a Caption First package so you can post in under 10 minutes.",
      button: "Build Caption First Post",
      tab: "post",
      focus: "#caption-first-form",
    };
  }

  return {
    text: "Momentum looks good. Ship a Daily Filler package to keep the streak alive.",
    button: "Create Daily Filler",
    tab: "post",
    focus: "#daily-filler-form",
  };
}

function setActiveTab(tabName) {
  for (const btn of els.tabButtons) {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  }

  for (const panel of els.tabPanels) {
    panel.classList.toggle("active", panel.dataset.tab === tabName);
  }
}

function setPostMode(mode) {
  for (const btn of els.modeButtons) {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  }
  for (const panel of els.modePanels) {
    panel.classList.toggle("active", panel.dataset.modePanel === mode);
  }
}

function populateCategorySelects() {
  fillCategorySelect(els.film.quick10Category, false);
  fillCategorySelect(els.library.clipCategory, false);
  fillCategorySelect(els.library.categoryFilter, true);
}

function fillCategorySelect(selectEl, withAll) {
  const currentValue = selectEl.value;
  selectEl.innerHTML = "";
  if (withAll) {
    const option = document.createElement("option");
    option.value = "all";
    option.textContent = "All categories";
    selectEl.appendChild(option);
  }

  for (const category of CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    selectEl.appendChild(option);
  }

  if (currentValue) {
    selectEl.value = currentValue;
  }
}

function onBatchFormSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.film.batchForm);
  const locations = String(formData.get("locations") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!locations.length) {
    showToast("Add at least one location.");
    return;
  }

  const payload = {
    timeAvailable: Number(formData.get("timeAvailable") || state.user.batchSessionLength || 90),
    wardrobeCount: Number(formData.get("wardrobeCount") || 1),
    locations,
    gear: formData.getAll("gear").map((value) => String(value)),
  };

  state.activeBatchSession = {
    id: uid("batch"),
    startedAt: new Date().toISOString(),
    sessionType: "batch",
    payload,
    queue: buildBatchQueue(payload),
    completedItemIds: [],
    completionLogged: false,
  };

  persist();
  renderBatchSession();
  showToast("Batch queue generated.");
}

function buildBatchQueue(payload) {
  const prompts = [
    { category: "Walking and entering", action: "Walk toward camera with folder in hand" },
    { category: "Desk and work mode", action: "Review contracts and make one note" },
    { category: "Phone and social actions", action: "Reply to a client text and nod" },
    { category: "Coffee and kitchen moments", action: "Pour coffee while checking schedule" },
    { category: "Car and on the go", action: "Close car door and step toward listing" },
    { category: "Listing and home tour style", action: "Open front door and invite viewer in" },
    { category: "Hands only details", action: "Hand place key on countertop" },
    { category: "Over the shoulder", action: "View laptop market stats from shoulder angle" },
    { category: "Silent talking head", action: "Deliver one silent line and smile" },
    { category: "Transitions", action: "Pass hand over lens for transition" },
    { category: "Outdoor lifestyle", action: "Walk sidewalk and point to local hotspot" },
  ];

  const shotsPerLocation = Math.max(3, Math.min(8, Math.floor(payload.timeAvailable / payload.locations.length / 10)));
  let promptIndex = 0;
  const queue = [];

  for (const location of payload.locations) {
    for (let i = 0; i < shotsPerLocation; i += 1) {
      const base = prompts[promptIndex % prompts.length];
      promptIndex += 1;
      for (const shotType of SHOT_TYPES) {
        queue.push({
          id: uid("shot"),
          location,
          category: base.category,
          shotType,
          prompt: base.action,
          durationSeconds: 6,
          takes: 2,
          wardrobeCycles: Math.max(1, payload.wardrobeCount),
        });
      }
    }
  }

  return queue;
}

function renderBatchSession() {
  const session = state.activeBatchSession;
  if (!session) {
    els.film.batchOutput.innerHTML = '<p class="hint">Generate a queue to start your monthly filming session.</p>';
    return;
  }

  const completedCount = session.completedItemIds.length;
  const total = session.queue.length;
  const progressPct = total ? Math.round((completedCount / total) * 100) : 0;

  const groups = new Map();
  for (const item of session.queue) {
    const key = item.location;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }

  let html = `
    <div class="output-block">
      <strong>Session Progress</strong>
      <p>${completedCount} / ${total} shots completed</p>
      <div class="progress-track"><span style="width:${progressPct}%"></span></div>
      <p class="hint">Rule: every action = wide + medium + tight, 5-8 sec, two takes (neutral then smile).</p>
    </div>
  `;

  for (const [location, items] of groups.entries()) {
    html += `<section class="queue-group"><h4>${escapeHtml(location)}</h4>`;
    for (const item of items) {
      const done = session.completedItemIds.includes(item.id);
      html += `
        <label class="queue-item ${done ? "done" : ""}">
          <input type="checkbox" data-batch-toggle="${item.id}" ${done ? "checked" : ""} />
          <span>
            <strong>${escapeHtml(item.category)} - ${escapeHtml(capitalize(item.shotType))}</strong>
            <span class="meta">${escapeHtml(item.prompt)} | ${item.durationSeconds}s x ${item.takes} takes</span>
          </span>
          <button type="button" class="btn-action" data-batch-add-clip="${item.id}">Log Clip</button>
        </label>
      `;
    }
    html += "</section>";
  }

  els.film.batchOutput.innerHTML = html;
}

function onBatchOutputChange(event) {
  const input = event.target;
  const shotId = input.dataset.batchToggle;
  if (!shotId || !state.activeBatchSession) {
    return;
  }

  const completed = new Set(state.activeBatchSession.completedItemIds);
  if (input.checked) {
    completed.add(shotId);
  } else {
    completed.delete(shotId);
  }
  state.activeBatchSession.completedItemIds = Array.from(completed);

  if (
    !state.activeBatchSession.completionLogged &&
    state.activeBatchSession.completedItemIds.length === state.activeBatchSession.queue.length
  ) {
    state.sessions.push({
      id: state.activeBatchSession.id,
      sessionType: "batch",
      startedAt: state.activeBatchSession.startedAt,
      endedAt: new Date().toISOString(),
      completedCount: state.activeBatchSession.queue.length,
      plannedShots: state.activeBatchSession.queue.length,
    });
    state.activeBatchSession.completionLogged = true;
    showToast("Batch session complete.");
  }

  persist();
  renderBatchSession();
  renderToday();
  renderStats();
}

function onBatchOutputClick(event) {
  const button = event.target.closest("[data-batch-add-clip]");
  if (!button || !state.activeBatchSession) {
    return;
  }

  const shotId = button.dataset.batchAddClip;
  const shot = state.activeBatchSession.queue.find((item) => item.id === shotId);
  if (!shot) {
    return;
  }

  const added = addClip({
    category: shot.category,
    shotType: shot.shotType,
    locationTag: shot.location,
    outfitTag: `Look ${Math.min(shot.wardrobeCycles, 1)}`,
    moodTag: "neutral",
    tags: ["batch-day", shot.location.toLowerCase()],
    notes: shot.prompt,
  });

  if (added) {
    showToast("Clip logged to library.");
  }
}

function onQuick10FormSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.film.quick10Form);
  const category = String(formData.get("category") || CATEGORIES[0]);
  const location = String(formData.get("location") || "").trim();
  if (!location) {
    showToast("Add a location tag.");
    return;
  }

  const prompts = buildQuickPrompts(category, location);
  state.activeQuickSession = {
    id: uid("quick10"),
    sessionType: "quick10",
    startedAt: new Date().toISOString(),
    category,
    location,
    items: prompts,
    completionLogged: false,
  };

  persist();
  renderQuickSession();
  showToast("Quick Add 10 ready.");
}

function buildQuickPrompts(category, location) {
  const actions = [
    "start with motion into frame",
    "hold for one beat then turn",
    "capture hands detail",
    "capture over-shoulder context",
    "capture silent reaction",
  ];

  const items = [];
  for (let i = 0; i < 10; i += 1) {
    const shotType = SHOT_TYPES[i % SHOT_TYPES.length];
    const action = actions[i % actions.length];
    items.push({
      id: uid("quick"),
      prompt: `${category}: ${action} at ${location}`,
      shotType,
      done: false,
    });
  }

  return items;
}

function renderQuickSession() {
  const session = state.activeQuickSession;
  if (!session) {
    els.film.quick10Output.innerHTML = '<p class="hint">Use Quick Add 10 when you need fresh clips in under 20 minutes.</p>';
    return;
  }

  const completedCount = session.items.filter((item) => item.done).length;
  const progressPct = Math.round((completedCount / session.items.length) * 100);

  let html = `
    <div class="output-block">
      <strong>${escapeHtml(session.category)} - ${escapeHtml(session.location)}</strong>
      <p>${completedCount} / ${session.items.length} prompts completed</p>
      <div class="progress-track"><span style="width:${progressPct}%"></span></div>
    </div>
    <section class="queue-group">
  `;

  for (const item of session.items) {
    html += `
      <label class="queue-item ${item.done ? "done" : ""}">
        <input type="checkbox" data-quick-toggle="${item.id}" ${item.done ? "checked" : ""} />
        <span>
          <strong>${escapeHtml(capitalize(item.shotType))}</strong>
          <span class="meta">${escapeHtml(item.prompt)}</span>
        </span>
        <button type="button" class="btn-action" data-quick-add-clip="${item.id}">Log Clip</button>
      </label>
    `;
  }

  html += "</section>";
  els.film.quick10Output.innerHTML = html;
}

function onQuick10OutputChange(event) {
  const input = event.target;
  const promptId = input.dataset.quickToggle;
  if (!promptId || !state.activeQuickSession) {
    return;
  }

  const item = state.activeQuickSession.items.find((entry) => entry.id === promptId);
  if (!item) {
    return;
  }

  item.done = input.checked;

  const completedCount = state.activeQuickSession.items.filter((entry) => entry.done).length;
  if (!state.activeQuickSession.completionLogged && completedCount === state.activeQuickSession.items.length) {
    state.sessions.push({
      id: state.activeQuickSession.id,
      sessionType: "quick10",
      startedAt: state.activeQuickSession.startedAt,
      endedAt: new Date().toISOString(),
      completedCount,
      plannedShots: state.activeQuickSession.items.length,
    });
    state.activeQuickSession.completionLogged = true;
    showToast("Quick Add 10 complete.");
  }

  persist();
  renderQuickSession();
  renderToday();
  renderStats();
}

function onQuick10OutputClick(event) {
  const button = event.target.closest("[data-quick-add-clip]");
  if (!button || !state.activeQuickSession) {
    return;
  }

  const promptId = button.dataset.quickAddClip;
  const item = state.activeQuickSession.items.find((entry) => entry.id === promptId);
  if (!item) {
    return;
  }

  const added = addClip({
    category: state.activeQuickSession.category,
    shotType: item.shotType,
    locationTag: state.activeQuickSession.location,
    outfitTag: "Quick set",
    moodTag: "smile",
    tags: ["quick10"],
    notes: item.prompt,
  });

  if (added) {
    showToast("Clip logged to library.");
  }
}

function onClipFormSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.library.clipForm);
  const added = addClip({
    category: String(formData.get("category") || CATEGORIES[0]),
    shotType: String(formData.get("shotType") || "wide"),
    locationTag: String(formData.get("locationTag") || "").trim(),
    outfitTag: String(formData.get("outfitTag") || "").trim(),
    moodTag: String(formData.get("moodTag") || "neutral"),
    tags: normalizeTags(String(formData.get("tags") || "")),
    notes: String(formData.get("notes") || "").trim(),
  });

  if (!added) {
    return;
  }

  els.library.clipForm.reset();
  els.library.clipCategory.value = CATEGORIES[0];
  showToast("Clip saved.");
}

function addClip(payload) {
  if (!payload.locationTag) {
    showToast("Location tag is required.");
    return false;
  }

  state.clips.unshift({
    id: uid("clip"),
    category: payload.category,
    shotType: payload.shotType,
    locationTag: payload.locationTag,
    outfitTag: payload.outfitTag || "",
    moodTag: payload.moodTag,
    tags: payload.tags || [],
    notes: payload.notes || "",
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    isFavorite: false,
    isOverused: false,
  });

  persist();
  renderStats();
  renderToday();
  renderLibrary();
  renderClipOptions();
  return true;
}

function renderLibrary() {
  const q = String(els.library.search.value || "")
    .trim()
    .toLowerCase();
  const categoryFilter = els.library.categoryFilter.value || "all";
  const favoritesOnly = Boolean(els.library.favoritesFilter.checked);
  const overusedOnly = Boolean(els.library.overusedFilter.checked);

  const filtered = state.clips.filter((clip) => {
    if (categoryFilter !== "all" && clip.category !== categoryFilter) {
      return false;
    }
    if (favoritesOnly && !clip.isFavorite) {
      return false;
    }
    if (overusedOnly && !clip.isOverused) {
      return false;
    }
    if (!q) {
      return true;
    }

    const corpus = [
      clip.category,
      clip.locationTag,
      clip.outfitTag,
      clip.moodTag,
      clip.notes,
      ...(clip.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(q);
  });

  els.library.count.textContent = `${filtered.length} clip${filtered.length === 1 ? "" : "s"} shown`;

  if (!filtered.length) {
    els.library.list.innerHTML = '<p class="hint">No clips match these filters yet.</p>';
    return;
  }

  let html = "";
  for (const clip of filtered) {
    html += `
      <article class="clip-card">
        <div class="clip-head">
          <strong>${escapeHtml(clip.category)}</strong>
          <span class="hint">${formatShortDate(clip.createdAt)}</span>
        </div>
        <p>${escapeHtml(capitalize(clip.shotType))} shot - ${escapeHtml(clip.locationTag)}</p>
        <div class="badges">
          <span class="badge">${escapeHtml(clip.moodTag)}</span>
          ${clip.isFavorite ? '<span class="badge favorite">favorite</span>' : ""}
          ${clip.isOverused ? '<span class="badge overused">overused</span>' : ""}
          ${(clip.tags || []).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <p class="hint">Last used: ${clip.lastUsedAt ? formatShortDate(clip.lastUsedAt) : "Not used yet"}</p>
        ${clip.notes ? `<p class="hint">${escapeHtml(clip.notes)}</p>` : ""}
        <div class="row-actions">
          <button type="button" class="btn-action" data-clip-favorite="${clip.id}">${clip.isFavorite ? "Unfavorite" : "Favorite"}</button>
          <button type="button" class="btn-action" data-clip-overused="${clip.id}">${clip.isOverused ? "Clear Overused" : "Mark Overused"}</button>
          <button type="button" class="btn-action" data-clip-used="${clip.id}">Mark Used</button>
          <button type="button" class="btn-action" data-clip-delete="${clip.id}">Delete</button>
        </div>
      </article>
    `;
  }

  els.library.list.innerHTML = html;
}

function onLibraryListClick(event) {
  if (!assertAuthenticated()) {
    return;
  }

  const favoriteId = event.target.dataset.clipFavorite;
  const overusedId = event.target.dataset.clipOverused;
  const usedId = event.target.dataset.clipUsed;
  const deleteId = event.target.dataset.clipDelete;

  if (favoriteId) {
    const clip = state.clips.find((entry) => entry.id === favoriteId);
    if (clip) {
      clip.isFavorite = !clip.isFavorite;
      persist();
      renderLibrary();
      renderClipOptions();
      showToast(clip.isFavorite ? "Saved as favorite." : "Removed from favorites.");
    }
    return;
  }

  if (overusedId) {
    const clip = state.clips.find((entry) => entry.id === overusedId);
    if (clip) {
      clip.isOverused = !clip.isOverused;
      persist();
      renderLibrary();
      showToast(clip.isOverused ? "Marked as overused." : "Overused flag cleared.");
    }
    return;
  }

  if (usedId) {
    const clip = state.clips.find((entry) => entry.id === usedId);
    if (clip) {
      clip.lastUsedAt = new Date().toISOString();
      persist();
      renderLibrary();
      showToast("Last used date updated.");
    }
    return;
  }

  if (deleteId) {
    if (!window.confirm("Delete this clip metadata?")) {
      return;
    }
    state.clips = state.clips.filter((entry) => entry.id !== deleteId);
    persist();
    renderAll();
    showToast("Clip deleted.");
  }
}

function onCaptionFormSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.post.captionForm);
  const payload = {
    postType: String(formData.get("postType") || "Tip"),
    topic: String(formData.get("topic") || "").trim(),
    tone: String(formData.get("tone") || "confident"),
  };

  if (!payload.topic) {
    showToast("Add a topic.");
    return;
  }

  state.latestCaption = buildCaptionPackage(payload);
  persist();
  renderPostOutputs();
  showToast("Caption package generated.");
}

function buildCaptionPackage(payload) {
  const hooks = {
    Tip: `Quick tip for ${payload.topic}:`,
    "Lesson learned": `Lesson learned from ${payload.topic}:`,
    "Myth vs truth": `Myth vs truth about ${payload.topic}:`,
    "3 mistakes": `3 mistakes agents make with ${payload.topic}:`,
    Checklist: `Checklist for ${payload.topic}:`,
  };

  const toneMap = {
    confident: ["Lead with certainty.", "Make one clear promise.", "End with a direct next step."],
    friendly: ["Keep the language conversational.", "Use one relatable example.", "Invite a quick reply."],
    bold: ["Challenge the common habit.", "Keep each sentence sharp.", "Close with urgency."],
  };

  const firstLine = hooks[payload.postType] || `Quick take on ${payload.topic}:`;
  const structure = toneMap[payload.tone] || toneMap.confident;
  const cta = CTA_PATTERNS.comment_keyword;

  const caption = `${firstLine}\n${structure[0]}\n${structure[1]}\n${structure[2]}\n\n${cta}`;

  return {
    id: uid("caption"),
    postMode: "captionFirst",
    postType: payload.postType,
    topic: payload.topic,
    tone: payload.tone,
    caption,
    onScreenText: firstLine,
    cta,
    recommendedClipTypes: ["movement", "hands detail", "reaction or talking head"],
    checklist: POST_CHECKLIST,
    createdAt: new Date().toISOString(),
  };
}

function onCaptionOutputClick(event) {
  if (!assertAuthenticated()) {
    return;
  }

  const copyCaption = event.target.dataset.copyCaption;
  const copyOnscreen = event.target.dataset.copyOnscreen;
  const saveTemplate = event.target.dataset.saveTemplate;
  const saveDraft = event.target.dataset.saveDraft;

  if (!state.latestCaption) {
    return;
  }

  if (copyCaption) {
    copyText(state.latestCaption.caption, "Caption copied.");
    return;
  }
  if (copyOnscreen) {
    copyText(state.latestCaption.onScreenText, "On-screen text copied.");
    return;
  }
  if (saveTemplate) {
    state.templates.unshift({
      id: uid("tpl"),
      templateType: "captionFirst",
      structure: {
        postType: state.latestCaption.postType,
        tone: state.latestCaption.tone,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    persist();
    showToast("Template saved.");
    return;
  }
  if (saveDraft) {
    saveDraftFromPackage(state.latestCaption);
  }
}

function onFillerFormSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.post.fillerForm);
  const clipId = String(formData.get("clipId") || "");
  const valueType = String(formData.get("valueType") || "reminder");
  const topic = String(formData.get("topic") || "").trim();
  const ctaType = String(formData.get("ctaType") || "comment_keyword");

  if (!clipId) {
    showToast("Add at least one clip to use Daily Filler.");
    return;
  }

  const selectedClip = state.clips.find((clip) => clip.id === clipId);
  if (!selectedClip) {
    showToast("Clip not found.");
    return;
  }

  const bucket = VALUE_LINES[valueType] || VALUE_LINES.reminder;
  const base = bucket[Math.floor(Math.random() * bucket.length)];
  const valueLine = topic ? `${base} ${topic} is your prompt for today.` : base;
  const cta = CTA_PATTERNS[ctaType] || CTA_PATTERNS.comment_keyword;

  state.latestFiller = {
    id: uid("filler"),
    postMode: "dailyFiller",
    selectedClipId: selectedClip.id,
    selectedClipSummary: `${selectedClip.category} - ${selectedClip.locationTag}`,
    valueLine,
    cta,
    onScreenText: valueLine,
    caption: `${valueLine}\n\n${cta}`,
    checklist: POST_CHECKLIST,
    createdAt: new Date().toISOString(),
  };

  selectedClip.lastUsedAt = new Date().toISOString();

  persist();
  renderPostOutputs();
  renderLibrary();
  showToast("Daily filler package generated.");
}

function onFillerOutputClick(event) {
  if (!assertAuthenticated()) {
    return;
  }

  const copyCaption = event.target.dataset.copyFillerCaption;
  const copyOnscreen = event.target.dataset.copyFillerOnscreen;
  const saveDraft = event.target.dataset.saveFillerDraft;

  if (!state.latestFiller) {
    return;
  }

  if (copyCaption) {
    copyText(state.latestFiller.caption, "Filler caption copied.");
    return;
  }
  if (copyOnscreen) {
    copyText(state.latestFiller.onScreenText, "Filler on-screen text copied.");
    return;
  }
  if (saveDraft) {
    saveDraftFromPackage(state.latestFiller);
  }
}

function saveDraftFromPackage(pkg) {
  state.postDrafts.unshift({
    id: uid("draft"),
    postMode: pkg.postMode,
    caption: pkg.caption,
    onScreenText: pkg.onScreenText,
    cta: pkg.cta,
    recommendedClipTypes: pkg.recommendedClipTypes || [],
    selectedClipIds: pkg.selectedClipId ? [pkg.selectedClipId] : [],
    createdAt: new Date().toISOString(),
  });
  persist();
  renderStats();
  renderToday();
  renderDrafts();
  showToast("Draft saved.");
}

function renderPostOutputs() {
  if (!state.latestCaption) {
    els.post.captionOutput.innerHTML = '<p class="hint">Generate a Caption First package to see copy + recommended clips.</p>';
  } else {
    const pkg = state.latestCaption;
    els.post.captionOutput.innerHTML = `
      <div class="output-block">
        <strong>${escapeHtml(pkg.postType)} - ${escapeHtml(pkg.topic)}</strong>
        <p class="hint">Recommended clips: ${pkg.recommendedClipTypes.map(escapeHtml).join(", ")}</p>
        <pre>${escapeHtml(pkg.caption)}</pre>
        <p class="hint">Checklist: ${pkg.checklist.map(escapeHtml).join(" | ")}</p>
        <div class="output-actions">
          <button type="button" class="btn-action" data-copy-caption="1">Copy caption</button>
          <button type="button" class="btn-action" data-copy-onscreen="1">Copy on-screen text</button>
          <button type="button" class="btn-action" data-save-template="1">Save template</button>
          <button type="button" class="btn-action" data-save-draft="1">Save draft</button>
        </div>
      </div>
    `;
  }

  if (!state.latestFiller) {
    els.post.fillerOutput.innerHTML = '<p class="hint">Generate a Daily Filler package from one existing clip.</p>';
  } else {
    const pkg = state.latestFiller;
    els.post.fillerOutput.innerHTML = `
      <div class="output-block">
        <strong>${escapeHtml(pkg.selectedClipSummary)}</strong>
        <pre>${escapeHtml(pkg.caption)}</pre>
        <p class="hint">Checklist: ${pkg.checklist.map(escapeHtml).join(" | ")}</p>
        <div class="output-actions">
          <button type="button" class="btn-action" data-copy-filler-caption="1">Copy caption</button>
          <button type="button" class="btn-action" data-copy-filler-onscreen="1">Copy on-screen text</button>
          <button type="button" class="btn-action" data-save-filler-draft="1">Save draft</button>
        </div>
      </div>
    `;
  }
}

function renderClipOptions() {
  const options = ['<option value="">Select a clip</option>'];
  for (const clip of state.clips) {
    options.push(
      `<option value="${clip.id}">${escapeHtml(clip.category)} - ${escapeHtml(clip.locationTag)} (${escapeHtml(capitalize(clip.shotType))})</option>`
    );
  }
  els.post.dailyClipId.innerHTML = options.join("");
}

function renderDrafts() {
  if (!state.postDrafts.length) {
    els.post.draftList.innerHTML = '<p class="hint">No drafts yet. Save one from Caption First or Daily Filler.</p>';
    return;
  }

  const drafts = state.postDrafts.slice(0, 12);
  let html = "";

  for (const draft of drafts) {
    const excerpt = draft.caption.split("\n")[0] || "Draft";
    html += `
      <article class="draft-card">
        <strong>${escapeHtml(excerpt)}</strong>
        <p class="small">${escapeHtml(draft.postMode)} | ${formatShortDate(draft.createdAt)}</p>
        <div class="row-actions">
          <button type="button" class="btn-action" data-copy-draft="${draft.id}">Copy draft</button>
          <button type="button" class="btn-action" data-delete-draft="${draft.id}">Delete</button>
        </div>
      </article>
    `;
  }

  els.post.draftList.innerHTML = html;
}

function onDraftListClick(event) {
  if (!assertAuthenticated()) {
    return;
  }

  const copyId = event.target.dataset.copyDraft;
  const deleteId = event.target.dataset.deleteDraft;

  if (copyId) {
    const draft = state.postDrafts.find((entry) => entry.id === copyId);
    if (draft) {
      copyText(draft.caption, "Draft copied.");
    }
    return;
  }

  if (deleteId) {
    state.postDrafts = state.postDrafts.filter((entry) => entry.id !== deleteId);
    persist();
    renderStats();
    renderToday();
    renderDrafts();
    showToast("Draft deleted.");
  }
}

function onReminderFormSubmit(event) {
  event.preventDefault();
  if (!assertAuthenticated()) {
    return;
  }

  const formData = new FormData(els.settings.reminderForm);
  state.reminders = {
    monthlyBatchEnabled: formData.get("monthlyBatchEnabled") === "on",
    monthlyBatchDate: String(formData.get("monthlyBatchDate") || ""),
    weeklyAddEnabled: formData.get("weeklyAddEnabled") === "on",
    weeklyAddDay: String(formData.get("weeklyAddDay") || "Monday"),
    monthlyRefreshEnabled: formData.get("monthlyRefreshEnabled") === "on",
    monthlyRefreshDate: String(formData.get("monthlyRefreshDate") || ""),
  };

  persist({ immediate: true });
  showToast("Reminder settings saved.");
}

function renderReminderForm() {
  const form = els.settings.reminderForm;
  form.monthlyBatchEnabled.checked = Boolean(state.reminders.monthlyBatchEnabled);
  form.monthlyBatchDate.value = state.reminders.monthlyBatchDate || "";
  form.weeklyAddEnabled.checked = Boolean(state.reminders.weeklyAddEnabled);
  form.weeklyAddDay.value = state.reminders.weeklyAddDay || "Monday";
  form.monthlyRefreshEnabled.checked = Boolean(state.reminders.monthlyRefreshEnabled);
  form.monthlyRefreshDate.value = state.reminders.monthlyRefreshDate || "";
}

async function onEnablePushClick() {
  if (!assertAuthenticated({ requireLogin: true })) {
    return;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    updatePushStatus("Push is not supported in this browser.");
    return;
  }

  try {
    updatePushStatus("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      updatePushStatus("Notification permission was not granted.");
      return;
    }

    await navigator.serviceWorker.register("/sw.js");
    const registration = await navigator.serviceWorker.ready;

    const keyResult = await apiFetch("/api/push/vapid-public-key", {
      authRequired: true,
    });

    const vapidKey = urlBase64ToUint8Array(String(keyResult.public_key || ""));
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
    }

    await apiFetch("/api/push/subscribe", {
      method: "POST",
      authRequired: true,
      body: { subscription: subscription.toJSON() },
    });

    updatePushStatus("Web push enabled.");
    showToast("Web push enabled.");
  } catch (error) {
    updatePushStatus(error.message || "Push setup failed.");
  }
}

async function onPushTestClick() {
  if (!assertAuthenticated({ requireLogin: true })) {
    return;
  }

  try {
    const result = await apiFetch("/api/push/test", {
      method: "POST",
      authRequired: true,
      body: {},
    });

    const delivered = Number(result.delivered || 0);
    updatePushStatus(`Test push sent to ${delivered} subscription${delivered === 1 ? "" : "s"}.`);
    showToast("Test push requested.");
  } catch (error) {
    updatePushStatus(error.message || "Could not send test push.");
  }
}

async function onNativeSyncClick() {
  if (!assertAuthenticated({ requireLogin: true })) {
    return;
  }

  try {
    const synced = await syncNativeRemindersIfAvailable();
    if (synced) {
      updatePushStatus("Native reminders synced via Capacitor LocalNotifications.");
      showToast("Native reminders synced.");
    }
  } catch (error) {
    updatePushStatus(error.message || "Native reminder sync failed.");
  }
}

function renderPushStatus() {
  els.settings.pushStatus.textContent = pushStatusMessage;
}

function updatePushStatus(message) {
  pushStatusMessage = message;
  renderPushStatus();
}

async function syncNativeRemindersIfAvailable() {
  const localNotifications =
    window.Capacitor?.Plugins?.LocalNotifications ||
    window.Capacitor?.Plugins?.LocalNotification;

  if (!localNotifications) {
    updatePushStatus("Native plugin not available in this browser context.");
    return false;
  }

  const permissionResult = await localNotifications.requestPermissions();
  const displayStatus = permissionResult?.display || permissionResult?.granted || "denied";
  if (displayStatus !== "granted") {
    throw new Error("Native notification permission not granted.");
  }

  const notifications = buildNativeReminderNotifications(state.reminders);

  if (!notifications.length) {
    await localNotifications.cancel({
      notifications: [
        { id: 101 },
        { id: 102 },
        { id: 103 },
      ],
    });
    return true;
  }

  await localNotifications.cancel({
    notifications: notifications.map((item) => ({ id: item.id })),
  });

  await localNotifications.schedule({ notifications });
  return true;
}

function buildNativeReminderNotifications(reminders) {
  const items = [];

  if (reminders.monthlyBatchEnabled) {
    const day = parseDayOfMonth(reminders.monthlyBatchDate);
    if (day) {
      items.push({
        id: 101,
        title: "Monthly Batch Day",
        body: "Film your reusable clips for the month.",
        schedule: {
          on: { day, hour: 9, minute: 0 },
          repeats: true,
        },
      });
    }
  }

  if (reminders.weeklyAddEnabled) {
    const weekday = weekdayToCapacitor(reminders.weeklyAddDay);
    if (weekday) {
      items.push({
        id: 102,
        title: "Weekly Add 10",
        body: "Capture 10 fresh clips to keep momentum.",
        schedule: {
          on: { weekday, hour: 9, minute: 0 },
          repeats: true,
        },
      });
    }
  }

  if (reminders.monthlyRefreshEnabled) {
    const day = parseDayOfMonth(reminders.monthlyRefreshDate);
    if (day) {
      items.push({
        id: 103,
        title: "Library Refresh",
        body: "Rotate overused clips and keep your feed fresh.",
        schedule: {
          on: { day, hour: 10, minute: 0 },
          repeats: true,
        },
      });
    }
  }

  return items;
}

function weekdayToCapacitor(label) {
  const map = {
    sunday: 1,
    monday: 2,
    tuesday: 3,
    wednesday: 4,
    thursday: 5,
    friday: 6,
    saturday: 7,
  };
  return map[String(label || "").trim().toLowerCase()] || null;
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

function exportBackup() {
  const snapshot = JSON.stringify(state, null, 2);
  const blob = new Blob([snapshot], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `broll-bank-backup-${isoDate(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup exported.");
}

function importBackup(event) {
  if (!assertAuthenticated()) {
    event.target.value = "";
    return;
  }

  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state = mergeWithDefault(parsed);
      persist({ immediate: true });
      renderAll();
      showToast("Backup imported.");
    } catch (error) {
      showToast("Backup file is invalid.");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
}

function resetDemoData() {
  if (!assertAuthenticated()) {
    return;
  }

  const approved = window.confirm("Reset all app data for this account? This clears clips, drafts, and settings.");
  if (!approved) {
    return;
  }

  state = cloneDefaultState();
  persist({ immediate: true });
  populateCategorySelects();
  setPostMode("caption");
  setActiveTab("today");
  renderAll();
  showToast("Data reset complete.");
}

function getRecentClipsCount(days) {
  return state.clips.filter((clip) => isWithinDays(clip.createdAt, days)).length;
}

function calculateStreakDays() {
  if (!state.postDrafts.length) {
    return 0;
  }

  const dateSet = new Set(
    state.postDrafts
      .map((draft) => {
        const parsed = new Date(draft.createdAt);
        if (Number.isNaN(parsed.getTime())) {
          return null;
        }
        return isoDate(parsed);
      })
      .filter(Boolean)
  );

  let streak = 0;
  const cursor = new Date();

  while (dateSet.has(isoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function isWithinDays(isoString, days) {
  if (!isoString) {
    return false;
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const diffMs = Date.now() - date.getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

function normalizeTags(raw) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function copyText(text, successMessage) {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(successMessage))
    .catch(() => showToast("Copy failed in this browser."));
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uid(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatShortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function capitalize(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
