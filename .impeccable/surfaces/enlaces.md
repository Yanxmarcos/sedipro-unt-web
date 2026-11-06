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

HISTORICAL REVIEW — 2026-10-30 public-resolution update. Fresh
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

QR: Library rows and the created-link confirmation open the same shared dialog.
Fetch the current link and encode only urlCorta, never urlDestino. There is now
one fluid design for every link. The backend assigns qrDiseno=fluido and returns
fluido for historical origami/missing metadata without migrating documents.
The client no longer selects a renderer from stored metadata. No alternating
turn or configuracion_enlaces access occurs during creation; obsolete control
documents can remain untouched. No QR images are stored or uploaded.

Visual authority: the user's 2.png. Preserve the navy/blue/purple gradient,
joined rounded modules and circular finders. Enlarge the original central symbol
from 24% to 34% of the matrix width. Its white clearance follows the three
original vector paths with the approved 2.6-module total stroke; there is no rounded-square
plate, outline or shadow. sedi-simbolo.svg contains the three unchanged paths
extracted from sedi-logo.svg. This is a functional QR adaptation: the encoded
URL determines the data pattern, and protected alignment/timing patterns remain.
The discontinued giant-symbol model and its white data apertures are removed
from the renderer. No image-generation assets are used.

Use correction H and a four-module quiet zone. Prefer the encoder's standard
penalty-scored mask, then try the remaining masks 0..7 in fixed order. Scheme
and host are uppercased only in the encoded payload to reduce matrix density;
the case-sensitive path is unchanged and the displayed URL remains canonical.
Each candidate must decode to that canonical URL at 192/256/288/320/512/1024px
with public @zxing/library APIs (pinned 0.21.3), both weighted/native grayscale
and raw/white-padded surfaces (24 checks per candidate). No smaller logo/design is silently
substituted on failure. Preview is 1024px; PNG export lazily renders 4096x4096px
and releases the canvas, while SVG is self-contained vector artwork. Preserve
inactive notice, regeneration, retry, recoverable export errors, cancellation
and Blob URL cleanup. Existing redirect gates and click counting govern the
short URL in every previously downloaded copy.

APPROVED SILHOUETTE REFINEMENT — 2026-11-05. User approved the final right-hand
proposal in ../review/qr-silhouette-sketch/comparativo-ampliado-2.png. White
clearance is now a 2.6-module total stroke (1.3 outward) following the same three
paths, with the logo still34% wide. The dedicated browser case passed again in
26.3s:72independent canonicalURL/path comparisons across six sizes, native4096PNG,
SVG, regeneration, historicalmetadata, inactive/error/retry/createQR and no-upload
checks. Root opened all four regenerated desktop/mobile light/dark captures;
no material visual issue. Existing runtime reading gates and geometry remain.
No backend, cloud data, README, commit or deployment change in this refinement.

CURRENT QR EVIDENCE — single fluid model, 2026-11-05. This supersedes all
alternating/giant-symbol reviews below, which do not describe the current design.
The targeted Playwright case passed (34.6s):12PNG/SVG samples at six sizes give72
canonicalURL/path comparisons with the older independent reader. Covers all eight
prefixes, localYT/go, reported localFB/c6l and userIG/w95; native4096PNG, vectorSVG,
stable regeneration, historicalorigami/missing metadata equality, inactive notice,
requestfailure/retry, create-to-QR, BlobURL cleanup and no uploads. The current
runtime additionally checks24 latest-reader variations before showing each QR.
Final frontend production build and changed-file ESLint pass; only the existing
CascadiaCode fallback-font warning remains. No physical camera/print scan claimed.

Independent visual review opened2.png, the user's previous QR, actual exportedPNG
and desktop/mobile light/dark captures and returned ship without material issues.
After mask-selection correction, root opened all four replacement captures and
confirmed the enlarged symbol and silhouette clearance remain correct. Evidence:
../review/qr-single-fluid/{direction,finish-review}.md and solid-fluido-* captures.
Backend21 unit cases, isolated local service checks and focused real redirect
checks passed, including20concurrent302 responses. The earlier broad integration
suite was incomplete under devserver startup/load; do not describe it as passed.
No cloud writes, migration, data cleanup, README edit, commit or deployment.

HISTORICAL QR REVIEW — opaque A rebuild, subsequently rejected by the user: the user's screenshot
and rejection supersede the earlier transparent/watermark A ship below. A new
full review returned ship with no material fixes after opening the rejected
result, desired reference, before/after, actual downloaded PNG and all eight
solid-{origami,fluido}-{1440,390}-{light,dark}.png captures. The watermark is
visibly resolved; white apertures remain an explicit functional adaptation.
See ../review/qr-origami-redesign/{direction,finish-review}.md.

Received final evidence: the dedicated browser case passed in 34.1s, with 22
PNG/SVG samples at 192/256/320/1024 producing 88 canonical exact-URL and
case-sensitive-path comparisons using an independent older reader. It includes
the reported http://localhost:7000/fb/c6l and all eight prefixes. PNG IHDR confirms
4096 × 4096; SVG, stable regeneration, inactive/error/retry/create-to-QR, Blob URL
cleanup and no uploads pass. The frontend build passes with its pre-existing
Cascadia Code fallback warning; changed QR files lint cleanly. Backend source,
assignment/metadata, redirects, click counts and lifecycle are unchanged by this
correction; backend integration/build evidence below is historical, not rerun.
No new DB writes, migration or cloud cleanup occurred. This documentation pass
compared source/contracts and ran no tests or captures. No physical camera/print
scan or detector result is claimed; the session launcher was unavailable.

HISTORICAL QR REVIEW — alternating designs and HD export, transparent A superseded
by the user's rejection and opaque rebuild above: the fresh reviewer returned
ship with no material fixes after opening both artistic references, eight final
captures at 1440/390 in both themes and four exact dark detail crops. Some dark
QR regions appeared white in the image viewer; raw pixel inspection and the exact
crops established a viewer anomaly, not a product failure. The review describes
functional adaptations, not literal equivalence to the references. Full direction
and disposition: ../review/qr-designs/direction.md and finish-review.md there.

Received final evidence records 20 shortener unit cases, isolated real local
MongoDB/API integration (including eight concurrent creates, transactional
alternation/rollback, lifecycle persistence, strict forged-field rejection and
legacy fallback), and the dedicated browser case. Twenty PNG/SVG samples decoded
at 256/320/1024 with an independent older reader produce 60 exact URL assertions;
native PNG IHDR confirms 4096 × 4096, SVG and regeneration stay stable, and the
case covers inactive/error/retry/create-to-QR, URL cleanup and no uploads. The
final case and frontend build pass with the pinned decoder; backend build also
passes. Changed QR files lint without warnings. The frontend build retains only
the pre-existing Cascadia Code fallback warning. This documentation pass compared
source/contracts and ran no tests or captures. No cloud writes, cleanup or
migration occurred; no physical camera or printed scan is claimed.

HISTORICAL QR REVIEW — `erp-enhancements`, earlier single-design PNG: the fresh review opened all four QR
captures at 1440/390 in light/dark with no material QR finding. Its final ship
disposition resolves the separate chart-axis P2. Received browser evidence
records successful PNG download and exact short-URL decoding at 1024 and 320px,
inactive notice, failure/retry, regeneration/object-URL revocation and creation
confirmation to QR. The extension's three unit cases, three browser feature
cases, real isolated local MongoDB/API integration and both production builds
pass. The documentation comparison confirmed current-link fetching, urlCorta
encoding, original-logo rendering and transient PNG cleanup in the then-current code; it ran no
tests or captures. See `erp-enhancements.md` and
`../review/erp-enhancements/finish-review.md` for the combined evidence and limits.
That QR extension made no cloud writes, cleanup or migration; historical cleanup
notes above are not authorization for new cleanup. No physical camera/print scan
is claimed.

LIMITS: Windows detector execution remained blocked by `cache_directory_failed`;
no detector measurements are claimed. Reviews cover this extension, not the rest
of the panel or public site. Design inheritance is documented in the canonical
sections of `DESIGN.md`; public tokens, assets and `.impeccable/design.json`
remain outside this extension's changes.
