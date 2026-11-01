# Acortador de enlaces · /panel/enlaces

Mode: Operate. Precisely specified extension of the established internal panel.
Authority: approved T-017-acortador-institucional.md and the current Events,
Certificates and base template components. Preserve the existing visual world.
Later explicit user instructions supersede the initial seven-character code and
read-only audit policies: use three-character codes and individual admin deletion.
The user's subsequent public-resolution request requires reuse of the existing
404 UI for unavailable links, preserving active direct redirects.

THESIS: Paste a destination, save, and copy a stable institutional link. A shared
library keeps ownership institutional while creator snapshots preserve attribution.
FIRST VIEWPORT: Existing sidebar/header, text-2xl semibold title, text-sm purpose,
create action, and a searchable table with platform, state, creator and date filters.
FORM: A focused standard dialog for creation/editing, automatic server detection,
optional campaign/note/expiry, and a copyable result only after successful save.
CODES: three base36 characters with at least one digit in any position for new links; existing codes keep resolving. Prefix and code remain immutable after creation.
YOUTUBE: Built-in yt platform for youtube.com, www.youtube.com, m.youtube.com,
and youtu.be. Existing automatic detection and platform filters display YouTube;
destination labels distinguish Video, Short, live stream, channel and playlist.
STATES: loading, empty, no results, validation, copy failure, network/session error,
revision conflict, paused/expired links, trash/restoration, audit and deletion confirmation.
ACCESS: all panel roles manage all links; only Administrator and Superadministrator
read audit and delete individual entries with irreversible-action confirmation.
Audit deletion does not modify the link; no bulk cleanup or audit editing.
Permanent link deletion is a separate trash-row action visible only to Superadministrator.
Use AdminConfirm with the link title, irreversibility and preserved code/audit history.
The backend verifies the current account, confirmation and revision, then atomically
reduces the document to a code reservation. Reservations are absent from all link views.
Unfinished `iniciada` entries younger than 15 minutes remain protected, and pagination
adjusts when the final row on a page is removed. Authorization uses the current account.
No custom tokens, fonts, public-site visual effects,
new raster assets or illustrative statistics.
RESPONSIVE: wrapping toolbar, stacked filters on mobile, horizontal table scroll
inside its container, usable row menu, bounded dialog with internal vertical scroll.
PUBLIC: The shared frontend proxy/resolver returns HTTP 302 for active links
before rendering React or the public layout; public GET/HEAD need no session.
Missing/paused/expired/deleted links reuse the existing native 404
at the original URL through an internal rewrite. Temporary failures reuse that
same component with HTTP 503 and `Retry-After: 60`. The temporary-failure page
imports the existing `app/not-found` component without changing its design.
All eight prefixes share this behavior; the seven duplicate route handlers
were removed. No bespoke unavailable-link HTML remains.

REVIEW: 2026-10-30, current public-resolution update. Fresh
`impeccable_finish_reviewer_404` returned ship with no material findings after
opening `public-404-desktop.png` and `public-404-mobile.png` in
`.impeccable/review/enlaces/`. Both captures are valid and preserve the existing
institutional 404 design. Implementation evidence records 24 passing relevant
tests and real isolated local MongoDB/API integration with four passing
Playwright tests, including Instagram GET/HEAD without a session, 404 across
all seven prefixes, pause/reactivate at the same URL and HTTP 503 when the
backend is down. Changed-file lint and the frontend production build pass.
The reported active Instagram URL was confirmed active in the database with
backend HTTP 302 but frontend HTTP 404; recompiling the resolver restored 302,
and the shared proxy/resolver now owns the public response path.

HISTORICAL REVIEW — audit deletion update: `impeccable_finish_reviewer_cleanup`
returned ship with no material findings after examining six updated screenshots
in `.impeccable/review/enlaces/`: `audit-desktop-light.png`,
`audit-desktop-dark.png`, `audit-mobile-light.png`, `audit-mobile-dark.png`,
`audit-delete-confirm-desktop.png` and `audit-delete-confirm-mobile.png`.
Reviewed scope: admin-only individual deletion, irreversible-action confirmation,
active-intent protection, preserved link and incumbent panel UI. Implementation
evidence records 24 passing relevant tests, real isolated local MongoDB/API
integration and three passing Playwright tests. Both production builds pass;
new/changed files lint cleanly. The independent visual review did not rerun
functional tests or measure computed contrast. Full report: `finish-review.md`
in the same review directory.

HISTORICAL REVIEW — initial version: `impeccable_finish_reviewer` returned ship over
13 library, form, audit and trash screenshots, with 21 relevant unit tests and
two Playwright tests reported passing. That review describes the initial
read-only audit version; its four audit captures have been updated by the
audit deletion review above. Initial verification reported no JavaScript errors or
page overflow. The authorized cleanup removed the sole seven-character test
link and preserved collection indexes; this is a completed data cleanup, not
a general deletion policy.

LIMITS: Windows detector execution remained blocked by `cache_directory_failed`;
no detector measurements are claimed. Reviews cover this extension, not the rest
of the panel or public site. Design inheritance is documented in the canonical
sections of `DESIGN.md`; public tokens, assets and `.impeccable/design.json`
remain outside this extension's changes.
