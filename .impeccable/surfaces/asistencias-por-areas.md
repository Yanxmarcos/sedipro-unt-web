# Asistencias por áreas

Mode: Operate. Narrow extension of the existing attendance module and internal
panel components; preserve both themes, tables, forms, exports and role gates.

CREATION: Default Todo SEDIPRO. Por áreas reveals five operational-area checkboxes,
auto-included area directors, and optional Presidency/Vicepresidency checkboxes.
General hides these checks and resets the selection. Selection is fixed on save.
Use shared AdminSelect, native labelled checkboxes with 44px label targets, and
the existing form/Guardar asistencia action. Prevent changing scope during save.

HISTORY: No document migration. Missing scope renders Todo SEDIPRO. New records
freeze the participant roster and reduced personal metadata. Edit changes states,
not membership. The administrator list, detail, assignments and check-in label scope.
Excel continues exporting the same roster and its four state totals.

FILTERING: In view/edit, existing compact total/state badges are keyboard buttons
with aria-pressed and a short explanation. Todos resets the state; search combines
with it. Editing a row updates the counts and moves it to the matching filter.
The state filter survives the view-to-edit action. Saving always sends the full
original roster, never just the visible subset; exports also retain the full roster.

QA: Real API and MongoDB temporary fixtures cover legacy reads, directors,
optional leadership, scope validation, check-in exclusion, membership guards,
snapshot and workbook rows. Browser mocks cover creation desktop/mobile.
No test data is written to the user's cloud. No new palette, imagery or motion.

CURRENT FILTER REVIEW: The later `erp-enhancements` review opened all eight
view/edit captures at 1440/390 in light/dark with no material attendance finding.
Its final disposition is ship after resolving the separate chart-axis P2.
Received browser evidence verifies all four original invitees are saved while
only one matches the active filter, including persistence of the changed state.
Real isolated local MongoDB/API integration and both production builds pass.
This documentation pass checked the separate visible-list and complete-registro
save paths; it ran no tests or captures. Full evidence and limits are recorded
in `erp-enhancements.md` and `../review/erp-enhancements/finish-review.md`.
The existing roster, export, lifecycle permissions and historical data remain
authoritative; this extension performs no migration, cloud write or cleanup.
