# Distributions, attendance filters and institutional QR

Mode: Operate. Extension of the existing management summary, attendance detail
and link library on `feat/resumen-asistencia-qr` in both repositories. Preserve
the panel's shared typography, components, themes, data permissions and layout.
No new visual identity, ornamental assets or motion. The institutional symbol's
original paths remain unchanged. READMEs contain institutional information and
remain outside scope. Dashboard/attendance contracts below retain their original
scope; the current QR contract uses a single fluid design and HD export.

Dashboard: two vertical bar charts, career/sex on X and integer counts on Y.
Use active current membership, as labelled beside the existing community total.
Only careers present in the roster appear; normalize spelling case/spacing/accents
and state missing career separately. Missing sex is Sin especificar. Shared area
buttons filter both charts independently of attendance's date/area filters.
Long full career labels wrap; horizontal scroll stays inside the chart on mobile.
Use the existing ChartContainer/Recharts and Card/Button vocabulary, plus an
accessible table of the displayed values. Only management sees this summary.
Default X/Y ticks explicitly use the existing semantic muted-foreground color;
custom career ticks retain that same color in both themes.

Attendance: Todos/Presentes/Tardanzas/Justificados/Ausentes are compact native
button badges with aria-pressed. Search and status combine in view/edit, with a
brief explanation. The view-to-edit action retains status. An edited row updates
counts and leaves a filter it no longer matches. Save sends all original invitees,
including hidden rows; no member is added or removed. Existing lifecycle locks,
export roster, permissions and server-side roster validation remain authoritative.

CURRENT QR: Library rows and the created-link confirmation open the same shared dialog.
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
penalty-scored mask, then try the remaining masks 0..7 in fixed order. Encode
the displayed canonical URL literally, with normal lowercase http(s) scheme/host;
never uppercase it for density optimization. Require raw decoded text equality,
not URL-normalized equivalence (which hid the production text-search problem).
Each candidate must decode at192/256/288/320/512/1024px using @zxing/library
(pinned0.21.3), both weighted/native grayscale and raw/white-padded surfaces
(24checks). Then verify the same exact text at all6sizes using the file scanner's
exported decoder from html5-qrcode/third_party/zxing-js.umd.js (pinned2.3.8),
without starting a camera, creating scanner DOM or additional Blob URLs. No smaller logo/design is silently
substituted on failure. Preview is 1024px; PNG export lazily renders 4096x4096px
and releases the canvas, while SVG is self-contained vector artwork. Preserve
inactive notice, regeneration, retry, recoverable export errors, cancellation
and Blob URL cleanup. Existing redirect gates and click counting govern the
short URL in every previously downloaded copy.

QR DOWNLOAD STYLES — 2026-11-06. Three mutually exclusive local download styles:
institutional (default), black-white and white-black. User explicitly removed the
transparent option; no transparent renderer, output or checkerboard CSS remains.
Use existing RadioGroup/Label below the preview: stacked full-width options on
mobile, three columns on desktop. Both PNG/SVG use the current style; monochrome
styles also recolor the three logo paths. Preserve the34% symbol and2.6-module
clearance. The inverse uses black clearance and retains its reader compatibility
note/instruction to test with a phone before sharing.

All styles share the exact same URL/matrix. Qualify institutional and monochrome
contrast families with the two existing readers before choosing their shared
mask. Normalize inverse pixels for inversion-capable readers only; this does
not establish compatibility with arbitrary scanners. Cache at most8tiny verified
source matrices/decoder references, never images; generate the requested output.
Fetch the current link on open/regenerate; selecting style adds no request,
endpoint, metadata or image upload. Preserve literal lowercase URL checks,
H correction, protected patterns and four-module outer spacing.

Invalidate pending renders/downloads immediately on style changes. Revoke all
transient BlobURLs on change/close and discard stale async PNG completions.
Preserve keyboard radio selection, errors/retry, inactive notice, deterministic
regen, PNG4096/SVG. Institutional filenames unchanged; monochrome exports have
-negro-blanco or -blanco-negro suffixes. No dependency/backend/database changes.

Verification after removing transparency: only3radio options are present; the
Transparente option is explicitly absent. Six opaquePNG/SVG files yield36literal
URL reads over6sizes (12inverse reads normalize inversion). NativePNG4096,
opaque alpha, grayscale monochrome pixels, samepathmatrix, filenames, keyboard
selection, cancelled stale exports, no extra styleGETs and Blob cleanup pass.
Changed-file lint/whitespace checks pass. The production build passed for the
removal, retaining only the existing CascadiaCode fallback-font warning. A final
browser pass checks the slightly wider desktop dialog after the width-only tweak.
No backend/cloud/README/dependency change, commit or deployment.

QR URL RECOGNITION FIX — 2026-11-05. Production phone screenshot showed a Google
search for HTTPS://SEDIPROUNT.ORG/ig/332. The density optimization uppercased the
payload; canonicalizing decoded text in validation/tests hid that difference.
Encode the displayed canonicalURL literally and compare raw decoded text exactly.
A HEAD request to the live lowercase /ig/332 returned302 with Instagram Location;
no public GET or cloud data mutation was used for diagnosis. This does not prove
every scanner's URL-classification behavior; no physical phone test is claimed.

Canonical payloads changed the real matrix. Initial recheck caught a legacy
reader failure at256px for IGw95, so candidate validation now also uses the exported
file-scanner decoder at six sizes. No logo/clearance/palette changes or silent
fallback to uppercase payloads. Pin html5-qrcode2.3.8 for the exported vendored
module, already present in the dependency tree; no camera or hidden scanner DOM.
The final browser case passed26.6s (33.8s total):13PNG/SVG samples, sixsizes,
78literalURL/path comparisons including /ig/332. Native4096PNG, vectorSVG, stable
regen, inactive/error/retry/createQR, legacy metadata and no uploads remain covered.
Build and changed-file lint passed; only existing CascadiaCode fallback warning.
Root opened all four final desktop/mobile light/dark captures with no material UI
issue. The data matrix is denser when encoding the normal URL, as expected.

Existing downloaded/printed QR images retain their original payload and must be
regenerated/replaced after frontend deployment. Short-link records stay unchanged.
No backend source, README, database cleanup, commit or deployment in this fix.
Prior canonical-normalization QA results do not certify literalURL compatibility.

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

HISTORICAL QR EVIDENCE — opaque A rebuild, subsequently rejected by the user: the user's rejected watermark screenshot
supersedes the earlier transparent-A ship below. A new full review returned ship
without material fixes after opening that screenshot, desired reference,
before/after, actual downloaded PNG and eight solid-{origami,fluido}-{1440,390}-
{light,dark}.png captures. The watermark is visibly resolved; white apertures are
documented as functional adaptation. The latest browser case passed in 34.1s:
22 PNG/SVG samples at four scales give 88 canonical exact-URL and case-sensitive
path comparisons with an independent older reader, including the reported
http://localhost:7000/fb/c6l and all eight prefixes. PNG IHDR confirms 4096 × 4096;
SVG, stable regeneration, inactive/error/retry/create-to-QR, cleanup and no uploads
pass. Frontend build passes with its pre-existing Cascadia Code fallback warning;
changed QR files lint cleanly. Backend source was not edited or rebuilt for this
correction; earlier integration/build results remain historical. No new DB writes,
migration or cloud cleanup occurred. No physical camera/print or detector result
is claimed; the session launcher was unavailable. See enlaces.md and
../review/qr-origami-redesign/{direction,finish-review}.md.

HISTORICAL QR EVIDENCE — alternating designs/HD export, transparent A superseded
by the user's rejection and opaque rebuild above: fresh review returned ship
with no material fixes after opening both references, eight final captures at
1440/390 in light/dark and four
exact dark detail crops. Pixel inspection/crops resolve a white-region image-viewer
anomaly; it is not a product capture failure. Received implementation evidence:
20 shortener unit cases, isolated local MongoDB/API integration (eight concurrent
creates, alternation/rollback, forged-field rejection, lifecycle and legacy), and
the dedicated browser case with 60 exact URL reads from 20 PNG/SVG samples at
256/320/1024 using an independent older decoder. Native PNG IHDR is 4096 × 4096;
SVG, stable regeneration, inactive/error/retry/create-to-QR, cleanup and no uploads
pass. Final pinned-decoder browser/build rechecks pass, as does the backend build;
changed QR files lint without warnings. Only the pre-existing Cascadia Code font
fallback warning remains in the frontend build. See
../review/qr-designs/{direction,finish-review}.md for that historical contract and
review limits. No cloud cleanup, migration or physical camera/print scan occurred.

HISTORICAL ERP EVIDENCE — original extension and single-design PNG: Three unit cases pass, including weighted summary and membership
distributions. Three browser feature cases pass, covering filtered save with all
four original invitees while one is visible and persistence of the changed state;
charts/area selection/missing career/sex; PNG download and exact short-URL decoding
at 1024 and 320px; regeneration/object-URL revocation, inactive notice, retry and
create-to-QR flow. The final directed chart case also asserts computed contrast
of at least 4.5:1 for every default tick at both widths in both themes.
Isolated real local MongoDB/API integration, both production builds, changed-file
frontend ESLint and diff checks pass. These are received implementation results;
this documentation pass inspected code/contracts and ran no tests or captures.

Historical reviewed captures in `.impeccable/review/erp-enhancements/`: summary,
attendance-view, attendance-edit and qr, each suffixed `-1440-light.png`,
`-1440-dark.png`, `-390-light.png`, `-390-dark.png` (16 files). Browser viewport
heights are 1000px, full-page for summary/attendance and viewport for the modal.
The fresh reviewer opened all 16 and found one P2: dim default chart axes in dark
mode. After the semantic tick-color fix, the reviewer reopened all four replacement
summary captures and returned ship, resolving P2 with no remaining material fixes.
The other twelve captures retain their initial review result. Full disposition:
`../review/erp-enhancements/finish-review.md`.

LIMITS AND PRESERVATION: Context and detector launchers failed with
`cache_directory_failed`; no detector QA is claimed. Viewports and directed
contrast assertions do not establish a complete accessibility audit, screen-reader
or physical-device test, or camera/print QR scan. No cloud writes, cleanup or
migration occurred in the original extension or later QR extension. This
documentation pass compared source/contracts and ran no tests or captures.
DESIGN.md, .impeccable/design.json, README files, institutional assets and the
existing visual world remain unchanged by this documentation pass; no new tokens
or identity are introduced.
