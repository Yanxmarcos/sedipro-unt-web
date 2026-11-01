# Auditoría administrativa de asistencias

Mode: Operate. Local extension of the existing panel and its link/event audit
patterns. Preserve themes, shared Table, Badge, AdminSelect, confirmation dialog,
loading/error/empty states and mobile horizontal table scrolling.

ENTRY: Auditoría button only on the Asistencias management page, visible only
to SUPERADMINISTRADOR. Do not add actions to Tomar asistencia. Frontend route
gate and backend route/middleware gates independently enforce the same role.

HISTORY: Paginated server-side (20 rows), searched by attendance title/person,
filtered by action/result. Show Lima date, actor snapshot and role, attendance
title snapshot, action, expandable before/after changes and result. Record create,
edit (including administrative state edits), archive, assign/remove managers.
No audit of ordinary check-in POSTs, no historical backfill or roster migration.

DELETION: Each row has an accessible delete action and permanent-deletion
confirmation. Delete only that audit document, never attendance or participants.
Prevent deleting running/uncertain operations. No automatic expiry or bulk purge.
Bound duplicate submissions and retain recoverable failures.

DATA: Minimal dedicated auditoria_asistencias collection. Store intent before
mutation, then completion/rejection/uncertain marker. No photos, DNI or complete
roster copies in the log. Indexes prepared additively on first use; no data reset.

QA: Disposable local Mongo/API fixtures verify authorization, mutations, compact
changes, check-in exclusion, pagination and isolated deletion. Mocked browser
fixtures inspect desktop/mobile, visibility, filtering and delete confirmation.
Never use production/cloud data for QA. No new assets, palette, motion or tokens.
