# Toma de asistencia: confirmación de identidad

Mode: Operate. Extend the existing internal attendance page and shared panel
components, preserving both themes, permissions and the saved attendance roster.

COUNTERS: Five compact outlined badges (Total, Presentes, Tardanzas, Justificados,
Ausentes), following Ver asistencia. Responsive two/three/five-column grid.

HEADER: Resolve the assigned attendance description, never expose its database
identifier. Bound displayed text to 56 characters including ellipsis, keep the
full description in the title attribute, and allow flex truncation on mobile.

CHECK-IN: Registrar refreshes the authorized roster and opens an identity preview;
it never writes attendance. Show a 160px mobile / 176px desktop profile photo,
initials when unavailable, full name in title case, shared area color, DNI and
the intended attendance status. Atrás closes without changes. Confirmar registro
uses the frozen preview DNI and status and retains backend authorization and
roster validation. Prevent duplicate submissions and disable another marking
when the person already has a recorded status. Keep errors retryable.

QA: Mocked browser fixtures cover desktop/mobile long titles, identity/photo,
cancel without writes, confirm exactly once and out-of-roster rejection. Fixtures
use an existing local photo; no test data is written to cloud services. No new
imagery, palette, motion or shared-system replacement.
