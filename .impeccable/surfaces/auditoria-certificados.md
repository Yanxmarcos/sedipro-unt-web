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
project/person search and action/type/result filters. Preserve existing local date
formatting without a timezone label. Horizontal table scrolling on mobile follows
the other audit surfaces. Row deletion remains. The superadmin-only toolbar adds
"Limpiar toda la auditoría" beside "Actualizar", using the existing destructive
outline Button and AdminConfirm. Actions wrap inside the header on mobile.

BULK CLEANUP: Global across all pages/types even with filters active; confirmation
states this explicitly. The GET returns a server cutoff and global count (so a
zero-result filter does not hide cleanup of the rest). Require explicit mode,
confirmation and nonfuture cutoff. Protect active intents for15minutes and retain
new/changed records after the loaded view. Older interrupted intents may be cleaned.
Only audit documents are deleted; preserve usage metrics, files and other modules.
Disable cleanup while loading/deleting/error, without a cutoff or when globally
empty. Cancel sends no request; failure keeps confirmation available for retry;
refresh/clamp pagination after success. No TTL or automatic cleanup. Additive
indexes on first use.

QA: Isolated Mongo/API covers actor/role freshness, payload boundaries, duplicate
requests, finalization ownership/results, pagination, cleanup and no other data
mutation. Browser fixtures exercise real local generation with mocked activity
API, plus audit desktop/mobile in both themes. No cloud QA data. No new assets,
tokens, palette or motion.

VERIFICATION — bulk cleanup, 2026-11-05. Focused real local MongoDB replica-set/API
verification passed the existing certificate-audit integration plus new global
cleanup assertions: lower roles/no session/stale role rejected, strict payloads,
future cutoff rejected, active/new/modified entries retained, expired intent
removed, repeated cleanup returns0 and indices/usage/other-module data preserved.
Two focused Playwright cases passed: superadmin access and responsive history,
confirmed row/full cleanup, cancel, failure/retry and cleanup with zero filtered
matches. Root opened desktop/mobile light/dark and mobile confirmation captures
in ../review/certificate-audit/. No production audit cleanup or cloud QA writes.

Both production builds and changed-file ESLint pass. The frontend keeps the
existing Cascadia Code fallback-font warning. Source whitespace checks pass;
the generated API catalog/OpenAPI include the new DELETE method. No README edit.
