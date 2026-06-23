# Automation Examples

Tranquil automations run JavaScript against any web app loaded in a webview tab. Each automation is a self-contained script injected when a URL matches a pattern.

## Implemented

| Service | Automation |
|---|---|
| **GitHub** | **Copy branch name — adds a "Copy branch" button next to the branch name on any PR page** |

---

## Planned

### Project Management

- **Asana** — keyboard shortcut to mark a task complete without reaching for the mouse (intercept `Enter` on focused task rows)
- **Asana** — bulk complete: select multiple tasks and complete them all in one click
- **Monday.com** — export the current board to CSV (scrape visible rows, build a Blob, trigger download)
- **ClickUp** — collapse all open subtask trees with a single toolbar button
- **ClickUp** — copy task ID + title to clipboard from the task header (for commit messages / Slack links)
- **Linear** — surface the current cycle dates in the issue detail sidebar so they're visible without navigating away
- **Linear** — keyboard shortcut to move an issue to the next status without opening the dropdown
- **Notion** — export the current page as Markdown (access the block tree via the page API, reconstruct Markdown, download)
- **Notion** — quick duplicate block: `Cmd+D` on a selected block without entering the `…` menu

### CRM & Support

- **HubSpot** — one-click copy of contact name + email + company as a formatted string for pasting into notes
- **HubSpot** — auto-expand all collapsed activity timeline entries on a contact record
- **Zendesk** — expand all collapsed comment threads on a ticket so the full conversation is readable
- **Zendesk** — add a "Copy ticket URL" button to the ticket header
- **Salesforce** — keyboard shortcut to log a call without navigating away from a record (`Cmd+L`)
- **Salesforce** — hide the "Chatter" feed sidebar on record pages to reclaim horizontal space

### Productivity Suites (Google & Microsoft)

- **Google Docs** — persistent word/character count in the toolbar (poll `document.body` on mutation)
- **Google Sheets** — auto-resize the formula bar to show the full cell content without dragging
- **Google Calendar** — "decline all" button for bulk declining events matching a pattern (e.g. recurring standups)
- **Google Calendar** — show the week number in the date header
- **Gmail** — keyboard shortcut to archive + move to next email without returning to the inbox list
- **Microsoft Outlook (web)** — flag emails containing unsubscribe links with a visible badge
- **Microsoft Teams (web)** — keyboard shortcut to mute/unmute in a call (`Cmd+Shift+M` like Zoom)

### Collaboration

- **Slack** — "jump to oldest unread" button in a channel header (navigate directly to the first unread message)
- **Slack** — copy a formatted message link (channel + timestamp) with one click
- **Notion** — toggle all page toggles open/closed from a floating button

### Property Management & Field Service

- **Any PM software** — override `window.open` on reconciliation and bank statement pages so report links open in-tab instead of spawning popups (avoids broken popup blockers; swap in a hidden iframe or navigate the current window)
- **Any PM software** — rewrite a POST-only report form to a GET-navigable URL by serialising the hidden inputs into query params, so the report can be bookmarked and linked directly
- **Any PM software** — auto-expand a task/work-order sidebar that the app renders at a fixed narrow width; set `element.style.width = '100%'` on `dom-ready`
- **Any field service software** — replace a disabled or locked "Schedule" button with a working one that calls the scheduling API directly; includes timezone/DST-aware datetime building (detect DST by comparing Jan vs Jul `getTimezoneOffset`, offset accordingly)
- **Any multi-tenant SaaS** — intercept an "Impersonate / Login As" submit button, replace the native form POST with a `fetch`, and redirect to the target user's dashboard on success (avoids full-page reloads and blocked popups)

### E-commerce & Operations

- **Shopify** — one-click CSV export of all visible orders on the orders list page
- **Shopify** — add a "Copy tracking number" button on individual order pages
- **Stripe** — show a 30-day revenue delta (vs. prior 30 days) on the dashboard overview
- **Stripe** — copy a payment's charge ID from the payment detail page with one click
- **ShipStation** — bulk print labels for all selected orders without clicking through each confirmation dialog

### Developer Tools

- **GitHub** — highlight your own open PRs in the PR list (bold or badge your username)
- **GitHub** — add a "Copy PR title + number" button for generating conventional commit messages
- **GitHub** — collapse all resolved review threads on a PR by default
- **Vercel** — add a one-click "Copy deployment URL" button on each deployment row
- **Linear** — display estimated time remaining for the current sprint based on velocity
