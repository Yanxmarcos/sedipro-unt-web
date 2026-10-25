# Certificates · /panel/certificados

Mode: Operate. Extend the established internal panel; no replacement visual identity.

Access: all authenticated panel roles, including Sediprano. Directory selection
uses the explicitly authorized read-only certificate projection; management
pages and personnel edits retain their original role restrictions.

## Direction contract

THESIS: A temporary certificate session that guides staff from a participant source to reviewed, downloadable certificates. Separate internal team rules from flexible external recognition.

OWN-WORLD: Inherit the Events and Attendance panel primitives, Geist typography, text-2xl/semibold titles, text-sm descriptions, neutral semantic colors, standard buttons, fields, tables, dialogs and tabs. No custom display typography in the interface. Certificate typography belongs to the document canvas only.

STORY: Choose Sedipranos or external participants; name the project and prepare the roster; upload a background and configure signatures; review every certificate and download individual files or a ZIP. Only personnel metadata persists through the existing directory. Certificate contents, images, signatures and imported workbooks stay in browser memory.

FIRST VIEWPORT: Existing sidebar and panel header; title and plain-language temporary-data notice; two direct audience choices. Inside the editor, a sticky document preview sits beside standard tabbed controls on desktop and stacks on mobile. The participant table supports review and export selection.

FORM: Precisely specified extension of the existing panel, code-led. No concept seed or replacement world. The user's PNG is an unchanged design reference/download, never automatically substituted for the uploaded background.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Design inheritance

The panel extension is recorded in DESIGN.md within the existing canonical
sections. Its public-site frontmatter and `.impeccable/design.json` remain
unchanged: certificates use the incumbent panel components and semantic themes,
without new global tokens. The background reference is recorded in
`.impeccable/assets-provenance.json` under `/panel/certificados`.

## Rules and evidence

- Sedipranos: multiple project directors, coordinators and advisers; a person has one project role. Unknown grammatical treatment requires an explicit choice, never a name-based inference.
- Officials resolve by cargoDirectiva, areaDirectiva and periodoDirectiva, from active people in the DIRECTIVA area, independently of their web account role. Director recipients use Presidency + PMO; other internal recipients use Presidency + project directors.
- Names remain on one line; role, area and project variables are bold. Uploaded transparent signatures sit above centered black lines and centered labels.
- The PNG at public/certificados/plantilla-base.png is copied unchanged from the user-supplied C:/Users/Marcos/Downloads/plantilla-certificado.png. No image generation or raster retouching.
- Supplied Excel templates were rebuilt with distinct example participants and matching first-sheet columns, using artifact-tool. They are examples, not real personnel.
- Runtime state is memory-only. Directory/event reads use existing authenticated APIs; no certificate write endpoint exists.
- Context launcher was unavailable (cache_directory_failed); context and component consistency were read directly. No automated design detector ran.

## Operational boundaries

- Each personnel record stores one current institutional assignment, not a
  historical board roster. Set sex/treatment, institutional office, area where
  relevant and period on existing people through `/panel/sedipranos`.
- Presidency and PMO require an active person and account in area DIRECTIVA,
  exact office and selected year. Missing or ambiguous officials require explicit
  correction or selection. No official or grammatical treatment is inferred from
  a name.
- Internal Excel uses Nombre, Rol and Área; external Excel uses Nombre and Rol.
  Only the first worksheet is imported; each template also carries an
  Instrucciones sheet and fictitious examples.
- Limit sessions to 500 participants, seven project directors and eight signers.
  Excel and background images are limited to 10 MB; transparent PNG/WebP signature
  images to 4 MB. Batch export stops above 250 MB of generated files.
- PDF and PNG export supports the current person, or a ZIP of all, selected or
  ranged participants. Full-name filenames receive safe collision suffixes.
  PDF uses A4 with the image aspect ratio preserved and matching orientation.
- Certificate working data is held in browser memory. Authentication, directory
  and event requests still use the existing backend; saved personnel metadata
  persists through its normal APIs. Resetting the generator discards its working
  session, while downloaded files remain on the user's device.
- The old `plantilla-sedichampions.png` and `src/lib/certificates.mjs` remain for
  compatibility; the latter still supplies date helpers. The active modules are
  `certificate-data.mjs`, `certificate-renderer.mjs` and the prefixed certificate
  components under `src/components/admin/certificates/`.

## Finish review · 2026-10-24

Independent review returned **ship**, with no material visual findings. The
documentation request to register the panel scope and supplied PNG and record
this extension in DESIGN.md is closed. A fresh mobile editor capture also
showed no issues. This verdict applies to the certificate extension, not the
public site.

Implementation verification reported 25 passing frontend unit tests (21
certificates and four authentication), five passing backend metadata tests,
successful frontend/backend builds and a passing final frontend lint. Final
browser checks passed all exercised scenarios. Browser checks
with mocked data covered internal PDF, PNG and ZIP, plus external event loading
across two pages (101 registrations), PDF/ZIP range export and Excel import.
These checks do not assert live-backend or production-data coverage. The local
certificate tests are currently excluded by the frontend `/tests/*` ignore rule;
README.md records the commands and that reproducibility limitation.
