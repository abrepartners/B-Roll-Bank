# B-Roll Bank MVP (Supabase + Web Push)

Mobile-first B-Roll workflow app for real estate agents.

This repo now includes:
- Optional Supabase auth (`email/password`) with guest mode fallback
- Account-scoped cloud persistence when signed in, local persistence in guest mode
- Web push reminder delivery (`service worker` + `web-push` + scheduled reminder sweep)
- Native-wrapper reminder sync path (Capacitor `LocalNotifications` hook)
- Playwright E2E suite scaffold (auth-gated workflow coverage)
- Existing carousel generation endpoints remain available

## Tech Overview

- Frontend: static HTML/CSS/JS at `/public`
- Backend: Express API at `/server.js`
- Persistence: Supabase (`app_user_state`, `push_subscriptions`, `reminder_events`)
- Notifications: Web Push (`VAPID`) + hourly reminder sweep (local `node-cron` or Vercel Cron)

## 1) Supabase Setup

Run `/Users/camillebrown/.codex/workspaces/default/supabase/schema.sql` in your Supabase SQL editor.

Tables created:
- `app_user_state`
- `push_subscriptions`
- `reminder_events`

## 2) Environment Setup

Copy env template and fill values:

```bash
cp .env.example .env
```

Required for full app behavior:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Optional:
- `REMINDER_TIMEZONE` (default: `America/Chicago`)
- `AUTH_EMAIL_REDIRECT_TO` (default: `http://localhost:3000/app`)
- `CRON_SECRET` (recommended; protects `/api/cron/reminders`)
- `DISABLE_IN_PROCESS_CRON` (set `true` to force cron via external scheduler only)
- `OPENAI_API_KEY` for existing carousel generation routes

## 3) Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Copy output into `.env`.

## 4) Install + Run

```bash
npm install
npm start
```

Open:

- App: [http://localhost:3000/app](http://localhost:3000/app)
- API root: [http://localhost:3000/](http://localhost:3000/)

## Auth + Persistence Flow

- Guest users can use the full app with local persistence only.
- Signed-in users get cloud sync through Supabase.
- Frontend stores Supabase access/refresh tokens in `sessionStorage` when signed in.
- Sync endpoints:
  - `GET /api/app-state`
  - `PUT /api/app-state`

## Reminder Delivery Flow

### Web push path
- User enables push in Settings.
- Browser registers `/sw.js` and subscribes with VAPID key.
- Subscription is saved via `POST /api/push/subscribe`.
- Reminder sweep sends push payloads via `runReminderSweep`.

### Scheduling the sweep
- Local/self-hosted Node server: in-process hourly cron (`node-cron`) runs automatically.
- Vercel Hobby: `vercel.json` must schedule `GET /api/cron/reminders` once daily.
- Vercel Pro: you can switch cron to hourly (`0 * * * *`) if you want higher cadence.
- Protect cron by setting `CRON_SECRET` in environment; Vercel sends it as `Authorization: Bearer <CRON_SECRET>`.

### Native wrapper path
- `Sync Native Reminders` button calls Capacitor LocalNotifications plugin when present.
- In plain web, this path is inert and displays status.

## API Additions

Auth:
- `POST /api/auth/signup`
- `POST /api/auth/resend-confirmation`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/session`

State:
- `GET /api/app-state`
- `PUT /api/app-state`

Push:
- `GET /api/push/vapid-public-key`
- `POST /api/push/subscribe`
- `DELETE /api/push/subscribe`
- `POST /api/push/test`
- `GET /api/cron/reminders` (cron trigger endpoint)

## E2E Tests (Playwright)

List tests:

```bash
npm run test:e2e -- --list
```

Run suite:

```bash
npm run test:e2e
```

Authenticated scenario uses env vars and is skipped when unset:
- `E2E_EMAIL`
- `E2E_PASSWORD`

## Notes

- If Supabase env vars are missing, auth/state routes return `503` with setup guidance.
- Reminder sending requires both Supabase config and VAPID config.
- Existing carousel endpoints are still active.
