# Codex Report: Labourgrid User-Side Product Completion

## Purpose

This report is a handoff brief for a new Codex chat. Read this file first before making changes. The goal is to connect and complete the existing generated UI into a working user-side product flow, without redesigning the UI from scratch.

## Project Location

Workspace:

`C:\Users\User\Desktop\Labourgrid`

Main app folder:

`C:\Users\User\Desktop\Labourgrid\servicelink`

Original ZIP provided by user:

`C:\Users\User\Downloads\stitch_labourgrid_worker_hiring_equipment_rental_system.zip`

The ZIP contains these generated UI modules:

- `servicelink_landing_page/code.html`
- `worker_marketplace/code.html`
- `tool_rental_catalog/code.html`
- `booking_wizard/code.html`
- `user_dashboard/code.html`
- `worker_pro_dashboard/code.html`
- `servicelink_velocity/DESIGN.md`

Use the user-side modules only. Ignore `worker_pro_dashboard` for now.

## Required Local Skill

The user explicitly mentioned the local skill inside the project. Load it before UI work:

`C:\Users\User\Desktop\Labourgrid\.agent\skills\ui-ux-pro-max\SKILL.md`

Use it lightly. The user does not want a full redesign. Apply it mainly for:

- preserving consistent UI/UX quality
- responsive layout checks
- accessibility and form behavior
- button states, loading states, transitions, and clear CTAs

Do not replace the existing generated visual system.

## Existing Dependencies

`node_modules` already exists in the workspace and includes:

- `motion`
- `framer-motion`
- `motion-dom`
- `motion-utils`
- `tslib`

`package.json` currently has:

```json
{
  "dependencies": {
    "motion": "^12.38.0"
  }
}
```

The existing `index.html` also imports Tailwind through CDN and Motion through CDN. Avoid adding a backend or heavy framework unless absolutely necessary.

## Current Extracted App Structure

Current files in `servicelink`:

```text
servicelink/
  index.html
  css/
    main.css
  js/
    auth.js
    booking.js
    dashboard.js
    filters.js
    utils.js
  assets/
```

Important current behavior:

- `index.html` is a polished landing page.
- `index.html` links to `pages/workers.html`, `pages/tools.html`, `pages/booking.html`, and `pages/dashboard.html`, but those pages do not currently exist in the extracted app.
- `filters.js` already contains mock worker and tool data plus rendering logic.
- `booking.js` already contains a multi-step booking object, but it needs real page markup and redirect fixes.
- `dashboard.js` already contains a user dashboard renderer, but it needs active/past booking sections and consistent statuses.
- `auth.js` currently blocks booking/dashboard through `Auth.requireAuth()`, but there is no extracted `login.html`. For this user-side demo, either create a simple login page or allow a default mock user session.

## Product Goal

Build the user side only:

1. Landing Page
2. Search / discover services and tools
3. View worker or tool detail
4. Select worker/tool and proceed
5. Complete booking
6. View booking in user dashboard

The app should feel like a real service marketplace, fully navigable, with mock state stored locally.

## Pages To Build Or Complete

Create this folder:

```text
servicelink/pages/
```

Required user-side pages:

```text
servicelink/pages/search.html
servicelink/pages/workers.html
servicelink/pages/worker-profile.html
servicelink/pages/tools.html
servicelink/pages/tool-detail.html
servicelink/pages/booking.html
servicelink/pages/dashboard.html
```

Optional but useful:

```text
servicelink/pages/login.html
```

Only add login if needed to prevent broken auth redirects. Do not build worker-side dashboards in this phase.

## Core Connections

Implement these routes:

- `index.html` -> `pages/search.html` or `pages/workers.html?q=...`
- `index.html` popular service chips -> `pages/workers.html?cat=plumbing`, etc.
- `index.html` tool chips -> `pages/tools.html?q=drill`
- `pages/search.html` -> worker/tool result detail pages
- `pages/workers.html` -> `pages/worker-profile.html?id=w1`
- `pages/tools.html` -> `pages/tool-detail.html?id=t1`
- `pages/worker-profile.html?id=w1` -> `pages/booking.html?type=service&id=w1`
- `pages/tool-detail.html?id=t1` -> `pages/booking.html?type=tool&id=t1`
- `pages/booking.html` submit -> save booking in local state -> `pages/dashboard.html`
- `pages/dashboard.html` -> show new booking immediately

## State Management

Add a small global state module:

```text
servicelink/js/app-state.js
```

It should provide:

- current user
- mock workers
- mock tools
- selected worker/tool
- booking draft
- saved bookings

Recommended localStorage keys:

```text
labourgrid_current_user
labourgrid_selected_item
labourgrid_booking_draft
labourgrid_bookings
```

Keep compatibility with existing keys if useful:

```text
servicelink_session
selected_worker
selected_tool
servicelink_bookings
```

For the demo, create a default mock user if no user exists:

```js
{
  id: "user_demo",
  name: "Demo User",
  role: "user",
  location: "Bengaluru"
}
```

## Booking Wizard Requirements

The booking wizard must be real and should include these steps:

1. Select service/tool
2. Choose date and time
3. Enter location
4. Show dynamic pricing
5. Confirm booking

Behavior:

- Load selected worker/tool from URL or global state.
- Disable next/confirm buttons when required fields are missing.
- Show loading state on submit.
- Calculate price dynamically.
- Save booking to localStorage.
- Redirect to dashboard after success.

Booking object shape:

```js
{
  id: "book_xxx",
  type: "service" | "tool",
  itemId: "w1" | "t1",
  itemName: "...",
  image: "...",
  category: "...",
  date: "YYYY-MM-DD",
  time: "HH:mm",
  location: {
    address: "...",
    city: "...",
    pincode: "..."
  },
  price: 1234,
  status: "pending",
  createdAt: "ISO date"
}
```

Allowed user-side statuses:

- `pending`
- `confirmed`
- `completed`

Avoid using `accepted` in the user dashboard. If existing code uses `accepted`, normalize it to `confirmed`.

## Dashboard Requirements

Upgrade the user dashboard to show:

- active bookings
- past bookings
- status badges for `pending`, `confirmed`, `completed`
- booking details: service/tool, date, time, location, price

Active bookings:

- `pending`
- `confirmed`

Past bookings:

- `completed`

The dashboard must read from localStorage and reflect a booking created in `booking.html`.

## Search Page Requirements

Create `pages/search.html` with:

- input query for service/tool
- result type tabs or combined results
- filters for location, price, rating
- dynamic results from mock worker/tool data

Search should read `?q=` from URL and prefill the input.

Result CTAs:

- Worker result -> `worker-profile.html?id=...`
- Tool result -> `tool-detail.html?id=...`

## Worker Profile Page Requirements

Create `pages/worker-profile.html`.

Must show:

- worker avatar/name
- service category/skill
- rating and review count
- hourly price
- availability
- location
- experience
- completed jobs
- skills
- short bio
- `Hire Now` button

`Hire Now` should:

- set selected worker in global/local state
- navigate to `booking.html?type=service&id=<workerId>`

## Tool Detail Page Requirements

Create `pages/tool-detail.html`.

Must show:

- tool image/name
- category
- price per day/week
- rating
- availability/stock
- description
- features
- `Rent Now` button

`Rent Now` should:

- set selected tool in global/local state
- navigate to `booking.html?type=tool&id=<toolId>`

## Important Existing JS Notes

`servicelink/js/filters.js`:

- Already has mock workers and mock tools.
- Current worker card `View Profile` opens a modal. Change it to navigate to `worker-profile.html?id=<id>`.
- Current tool cards only have `Rent Now`. Add or make card click navigate to `tool-detail.html?id=<id>`.
- Apply URL params `q` and `cat` during init.

`servicelink/js/booking.js`:

- Currently redirects to `labor.html` when no worker exists. Fix to `workers.html`.
- Currently saves to `servicelink_bookings`. Keep or migrate into global state.
- Currently success action points to `bookings.html`. Fix to `dashboard.html`.
- Current status is `pending`, which is fine.
- Current total steps are 4. Update to 5 if implementing the required pricing step separately.

`servicelink/js/dashboard.js`:

- User dashboard currently seeds mock bookings if none exist.
- It uses `accepted`; normalize to `confirmed`.
- It has worker-side code too. Do not remove it unless necessary, but do not build worker-side pages now.

`servicelink/js/auth.js`:

- Redirects user login to `bookings.html`, which does not exist. Change user redirect to `dashboard.html`.
- Since login page is missing, either create a small user-only login page or ensure booking/dashboard initialize a default mock user.

## UI Rules For Continuation

Follow the existing visual system:

- Keep `css/main.css`.
- Keep dark glass style, cards, badges, buttons, input classes.
- Do not redesign from scratch.
- Do not add a backend.
- Use vanilla JS or very minimal JS only.
- Keep pages component-like and modular.
- Use existing mock data.
- Keep all work user-side.

UX improvements to include:

- smooth page transitions
- visible loading state on booking submit
- disabled buttons when form is invalid
- clear CTA buttons
- mobile responsive page layout
- no broken links in the user journey

## Recommended Implementation Order

1. Create `servicelink/js/app-state.js`.
2. Create shared page structure for `pages/*.html` using the current `index.html` head/nav style.
3. Create `workers.html` and `tools.html` using `filters.js`.
4. Create `worker-profile.html` and `tool-detail.html`.
5. Create `booking.html` and update `booking.js`.
6. Create `dashboard.html` and update `dashboard.js`.
7. Add `search.html`.
8. Update landing links in `index.html` if needed.
9. Smoke test the full flow:
   - landing -> search/workers
   - worker profile -> booking -> dashboard
   - tools -> tool detail -> booking -> dashboard

## Final Verification Checklist

Before final response, verify:

- All created pages load without console-blocking script errors.
- Landing links do not point to missing pages.
- Worker `Hire Now` reaches booking with the selected worker.
- Tool `Rent Now` reaches booking with the selected tool.
- Booking cannot submit with missing required fields.
- Booking price updates based on hours/days.
- Booking is saved to localStorage.
- Dashboard shows the saved booking under active bookings.
- Dashboard separates active and past bookings.
- Status labels are `pending`, `confirmed`, `completed`.
- No worker-side feature was built beyond ignoring existing worker code.

## Expected Final Output To User

When implementation is complete, answer with:

1. Folder structure
2. Updated files
3. New pages created
4. Explanation of page connections
5. Verification performed

Keep the answer concise and cite changed files.
