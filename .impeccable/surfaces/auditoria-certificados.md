# Auditoría de uso de certificados

Mode: Operate. Extend the existing certificate workspace and panel audit patterns.
Keep the generator's temporary data, workflow, themes and shared components.

ENTRY: Auditoría action in the generator header and /panel/certificados/auditoria
are SUPERADMINISTRADOR only. All panel roles retain access to the generator.
Middleware, API account checks and the frontend independently enforce audit access.

ACTIVITY: Log module entry once per mount, type selection, prepared participants,
loaded template, editor opening, template downloads, individual PDF/PNG, ZIP batches
and session reset. No per-keystroke/canvas log. Save server-verified actor/time,
project title, kind/source, quantity/format and browser-reported outcome only.
Never save certificate files, recipient names/lists, image/signature data or Excel.

EXPORTS: Persist an idempotent intent before rendering. Finalize as download
initiated, failed or cancelled with generated count. Download initiated does not
claim that the user saved the file. Finalization failures must not report an
already-triggered download as failed. If the browser closes, retain the intent.

HISTORY: Shared Table, Badge, AdminSelect and confirmation; 20-row server pages,
project/person search and action/type/result filters. Show Lima dates. Horizontal
table scrolling on mobile follows the other audit surfaces. Delete only one log
with explicit confirmation; active intents protected for 15 minutes, interrupted
older intents may be cleaned. No TTL or bulk purge. Additive indexes on first use.

QA: Isolated Mongo/API covers actor/role freshness, payload boundaries, duplicate
requests, finalization ownership/results, pagination, cleanup and no other data
mutation. Browser fixtures exercise real local generation with mocked activity
API, plus audit desktop/mobile in both themes. No cloud QA data. No new assets,
tokens, palette or motion.
