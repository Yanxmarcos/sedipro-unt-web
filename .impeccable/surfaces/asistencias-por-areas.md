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

QA: Real API and MongoDB temporary fixtures cover legacy reads, directors,
optional leadership, scope validation, check-in exclusion, membership guards,
snapshot and workbook rows. Browser mocks cover creation desktop/mobile.
No test data is written to the user's cloud. No new palette, imagery or motion.
