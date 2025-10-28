## Repository snapshot

- Small static playground for GA4 + Google Tag Manager (GTM).
- Files of interest: `index.html` (main markup + inline dataLayer/sendEvent), `script.js` (currently empty placeholder for additional JS).
- GTM container id present in `index.html`: `GTM-KBPG55VP` (do not remove or hard-replace without confirmation).

## Big picture (what this repo is / how it works)

- This is a single-page static test harness. The page initializes a `dataLayer` and exposes a `sendEvent(eventName, params)` helper that pushes objects to `window.dataLayer`.
- Typical data flow: UI button -> `sendEvent(...)` -> `dataLayer.push(...)` -> GTM listens for events -> GTM forwards to GA4 or other tags.

## What an AI coding agent should know first

- Primary files to edit: `index.html` for markup and GTM bootstrap; `script.js` for adding JS logic or richer event builders.
- Keep `dataLayer` name and GTM snippet structure intact. The page relies on `window.dataLayer` being present before calls.
- Example event shapes used in the codebase:
  - sendEvent('button_click', { button_name: 'cta_topo' })
  - sendEvent('add_to_cart', { item_id: '123', item_name: 'Produto X', price: 29.9 })
  - sendEvent('purchase', { transaction_id: 'TX999', value: 59.9 })
  - sendEvent('form_submit', { form_name: 'newsletter' })

## Conventions and patterns to preserve

- Event naming: lower_snake or simple strings (see examples above). Prefer not to change existing event names without updating GTM rules.
- Parameter keys are simple (no nested objects used today). If adding fields, use flat key names (e.g., `currency`, `items_count`).
- Locale: page markup uses `pt-BR` so copy texts and comments accordingly when editing UI strings.

## Developer workflows (how to run / test)

- No build step. Open `index.html` in a browser to test. For a more realistic environment, run a local static server (recommended):

  - Python (if available): `python -m http.server 8000` from repo root, then open `http://localhost:8000`.
  - Or use any static file server / Live Server extension in the editor.

- Use browser DevTools to verify `dataLayer` pushes and network requests. The page logs pushes via `console.log('Evento enviado:', ...)`.
- If editing events, verify GTM Preview/Debug (outside this repo) and update GTM triggers/tags accordingly.

## Integration points & external dependencies

- External: Google Tag Manager script (`https://www.googletagmanager.com/gtm.js`) and noscript iframe. The project assumes public GTM availability.
- There are no package manifests or CI in this repo. Changes are static edits to files.

## Safe edit rules for AI agents

- Do not remove or replace the GTM container snippet unless the change is explicitly requested. If a different container is required, add a comment describing the change and keep the original for rollback.
- When adding new events: do not rename existing event names or parameter keys that appear in `index.html` without a corresponding note to update GTM triggers.
- Keep console debug output when adding new pushes (use `console.log` similar to the existing pattern) to make local verification easier.

## Examples for common tasks

- Add a currency to purchases:
  - Update calls like `sendEvent('purchase', { transaction_id: 'TX999', value: 59.9 })` to include `currency: 'BRL'`.

- Move inline helper into `script.js`:
  - Copy `sendEvent` implementation from `index.html` to `script.js`, export or attach it to `window` (e.g., `window.sendEvent = sendEvent`) and include `<script src="script.js"></script>` before other callers.

## What not to do

- Don’t invent a build system or package files without explicit instruction—this repository is intentionally minimal.
- Don’t assume other environments (Node, bundlers) are present.

## Where to look for more context

- `index.html` — event usage, GTM snippet, UI controls.
- `script.js` — currently empty; intended place for progressive JS changes.

---
If anything here is unclear or if you'd like the agent to follow stricter commit/message conventions or add tests/linters, tell me what style you prefer and I will update this guidance.
