# Resumen Sediprano · /panel

Mode: Operate. Approved extension of the existing internal panel, preserving its
components, typography, semantic tokens, light/dark themes and mobile sidebar.
All accounts are linked to a real Sediprano record; no unlinked-account UI.

GREETING: Capitalize the first name only (Eliaser), followed by the real area in
", miembro del área de TI" at the same heading size. Color only the area using
the shared Sedipranos AREA_TEXT_CLASSES. Keep "Tu espacio de trabajo en SEDIPRO UNT." below.
THESIS: Help an ordinary member attend to participation, find upcoming events,
use tools and retrieve the institutional links they created. No administrative KPIs.
FIRST VIEWPORT: Greeting with the real name/area, Mi perfil, refresh, task section
and compact tools. Desktop has a 1.5:1 working column and utility column; mobile
stacks tasks, upcoming events, tools and recent links without horizontal overflow.
INTERACTION: Crear enlace opens the existing LinkForm directly; saved links refresh
the summary. Recent links use CopyLink and expose their URL for manual copying.
No new animation grammar; existing button focus/loading/error feedback only.

DATA: Three future, published, nonarchived events in date order. Three recent
links created by the authenticated account, excluding trash and code reservations.
Read the real profile area; never derive it from role or hardcode a department.
Reuse existing personal voting eligibility and attendance assignments. Only
eligible uncast votes offer Participar; already-cast votes show no selected option.
Attendance assignments mean responsibility for taking attendance, not own attendance.

ACCESS: Only SEDIPRANO/legacy USER gets this component and its Resumen sidebar item.
Directiva, Administrator and Superadministrator still use OrdersDashboard unchanged.
The new /api/mi/resumen verifies the current persisted account and role, password
state and active profile; a query cannot choose another creator. No new collections.

STATES: loading, section failure/retry while tools and independent voting remain
usable, no active votes, no assignments, no upcoming events, no created links,
cast votes, ineligible votes, saving/copying links, refresh and navigation.
QA: Backend API tests use only a disposable local MongoDB harness; browser tests
mock APIs in a separate local server. Do not write test data to the user's cloud.
Captures: .impeccable/review/member-summary/{desktop,mobile}-{light,dark}.png.
