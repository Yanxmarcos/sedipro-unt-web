# Resumen de gestión

Mode: Operate. Implement the confirmed plan inside the existing OrdersDashboard
composition: three headline cards, left community/voting stack, large attendance
panel with four status metrics and circle, lower evolution chart, operational
modules and full-width recent activity. Preserve shared Geist/components, both
themes, existing institutional mark, borders and area colors. No replacement
visual identity or new imagery/motion. The Sediprano summary remains unchanged.

DATA: One current active-member count, never a duplicate account count. No
SEDInvita figures. Events and their external registrations/attendance are a
separate lower block. Year/month/history and area filters apply to participation;
current community and active links are explicitly labelled current state.

RATES: P+T divided by actual stored invitations, weighted across sessions.
Justifications stay separate. New open sessions do not enter statistics; closed
sessions do. Existing sessions without lifecycle remain historical without a
document migration or reconstructed roster. Missing historical area uses current
directory area with an explicit note. Zero denominator displays an em dash.
Voting participation intersects valid ballots with eligible present/tardy rows;
no individual choices or voters are exposed. Graph uses monthly weighted values,
no fabricated zero months, and scrolls internally when narrow.

ACTIVITY: Reuse source audits rather than duplicating their payloads; add minimal
intent/result records for padrón, accounts, voting configuration, marking and
profile updates. Project summary-only fields, preserve account/certificate detail
permissions. Paginated searchable module-filtered list. Only Superadmin can delete
a source history record after confirmation; pending-operation guards remain.
Deleting history never changes business entities or certificate usage counts.
The recent-activity table excludes certificate activity and actions performed as
Superadministrador for every viewer; source audits retain those records. These
filters precede pagination. Certificates are absent from the module selector.
Activity has its own search/module filters and request lifecycle. A failed load
clears rows and pagination metadata, hides the table and pagination, and exposes
the existing retry state. Retry keeps the active filters; stale results must not
appear under a newly selected module or search.

ATTENDANCE: Permanent deletion requires confirmation and rejects any linked vote,
including archived/closed ones. Transaction locks coordinate deletion with vote
creation and new assignments. Remove related assignments. Closing/reopening is
explicitly confirmed in detail and in the main attendance table, whose row action
switches between closing and reopening. Closed records reject changes and marking.
Legacy data stay intact. The exact seven reviewed archived tests were removed
under a separate bounded maintenance script, with minimal audit only.

QA: Weighted-rate unit cases, disposable local replica-set/API fixtures for
concurrency, lifecycle, activity and usage durability; browser desktop/mobile,
light/dark, role gates, filters, recovery and confirmations. No cloud QA fixtures.
The authorized cleanup alone modified cloud data. Reuse existing chart/table
horizontal overflow on mobile; document itself must not overflow.

FINAL EVIDENCE: The implementation handoff records four passing browser tests
and a passing frontend production build after the activity recovery fix; backend
build and integration checks had already passed. A fresh independent review
returned `ship` for that single fix. Eight existing captures are retained in
`.impeccable/review/management-summary/`: desktop, mobile, mobile-actions and
user-1917, each in light and dark themes. This documentation pass inspected code
and contracts only; it did not rerun tests or capture screenshots. Browser
viewports do not establish physical-device or instrumental accessibility QA.

PRESERVATION: This extends the incumbent panel; `DESIGN.md` and
`.impeccable/design.json` remain unchanged by this documentation pass. No new
world, tokens, imagery or animation grammar is introduced.
