# TI — terminal interactiva

## Authority and scope

- Route: `/tecnologias-de-la-informacion`.
- Mode: **Experience**. The visitor writes meaningful English JavaScript through manual input and constructs the team's portraits in sequence.
- Visual authority: the user's explicit black/orange Cascadia Code HackerTyper direction. This is a separate visual world, scoped to TI.
- Normative tokens and component rules: [TI DESIGN.md](../../src/components/ti-terminal/DESIGN.md).
- Matching extensions and preview components: [TI design.json](../../src/components/ti-terminal/.impeccable/design.json).
- Root `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` retain their existing public-site context. The root design pair explicitly excludes TI and was not replaced or merged for this work. Its historical PRODUCT scope predates this separately authorized TI redesign.

## Experience contract

The initial viewport is an empty black canvas with an orange caret, plus the persistent footer menu. There is no hero, idle typing, shader or automatic introduction. Each permitted key immediately writes 3 characters, cancels pending timed input and synchronizes state; faster typing produces faster code and keyboard output stops when keyboard input stops, matching HackerTyper. Wheel input, touch dragging and Codificar retain the timed queue: exactly one character every 30ms through `setTimeout`, including reduced motion and rapid scrolling. Wheel queues 12–90 characters, touch up to 60 and Codificar 120; that queue caps at 160 characters, about 4.8 seconds pending. Unmount cleanup uses `clearTimeout`. Browser modifier shortcuts, Tab, Escape and excluded function keys remain available; F1 opens help. Enter or Space on a focused link or button activates that control instead of writing code.

The stream validates and compiles member data, queues profiles, and builds example delivery reports. This is illustrative source text, not execution of user input or a claim about actual project delivery. Careers and program prose are translated into English in the source while names and image paths retain their factual values. The menu, help and institutional descriptions are Spanish.

Profiles appear from their first input, with scan progress `(completed lines + current-line fraction) / 4`, capped at one. Full photo, name and allowed links appear within the first four lines of the member block; the next-profile and cycle sequence remains unchanged. Photographs retain their original colors without filters; orange borders and the scan line remain. Desktop keeps the code to the left and accumulated portraits to the right. At 600px or less, the most recent portrait appears beneath the code. Equipo always exposes all 16 members in a separate complete directory.

A completed round stops at 16 profiles and clears pending input. The next physical input begins a new round. The JavaScript text continues with unique identifiers and transaction comments; retained history is bounded at 14,000 characters, cutting at a line boundary when available. This bound applies to retained display text, not to the lifetime progress counter.

## Content to preserve

The source of truth is `src/components/ti-terminal/members.js`: 16 names, their 16 existing `/img/area-ti/` photographs, careers, Elder's Director role and eight existing social URLs: LinkedIn and GitHub for each of the first four members. All member Instagram entries and its icon/network were removed; a render allowlist excludes Instagram even if future data contains it. No additional social accounts or roles were invented. The user's explicit correction sets **Silvestre Ferrer, Jeffran Alberto — Informática**.

Area TI describes systems management, internal control, reports, projects, technical advice and training. Funciones keeps these duties accessible. Subáreas has exactly **Interfaces**, **Sistemas y backend** and **Datos**. Equipo identifies the 2026 period. Ayuda explains input, Codificar, the next round, keyboard navigation and Escape. Inicio returns to HOME.

## Isolation

The page loads Cascadia Code through `next/font/google` and applies its variable only to the TI wrapper. `LandingOnly` returns TI children directly before the legacy landing shell, avoiding its navigation, loader, Hito and shader layers. `SmoothScroll` explicitly excludes TI from Lenis. The terminal module owns its black/orange variables; no public-site token or type changes are implied. The remainder of the application retains its existing design scope.

## Review and evidence

The earlier TI review verdict was **ship**, based on source inspection and the seven required screenshots below; the final scoped review of the accelerated scan and professional-only links also returned **ship**, with no requested fixes. These captures are historical for portrait color and social-link content. Original-color portraits are recorded in [desktop](../review/ti-color-desktop.png) and [mobile](../review/ti-color-mobile.png) captures; keyboard help is recorded in [desktop](../review/ti-keyboard-desktop.png) and [mobile](../review/ti-keyboard-mobile.png) captures. Current scan behavior is captured on [desktop](../review/ti-fast-scan-desktop.png) and [mobile](../review/ti-fast-scan-mobile.png), with the professional-only directory in [mobile](../review/ti-professional-links-mobile.png). The earlier set covers an empty viewport, the built desktop/mobile experience, area information, subareas and the complete team dialog:

- [Empty desktop](../review/ti-empty-desktop.png)
- [Empty mobile](../review/ti-empty-mobile.png)
- [Desktop](../review/ti-desktop.png)
- [Mobile](../review/ti-mobile.png)
- [Área TI, mobile](../review/ti-area-mobile.png)
- [Subáreas, desktop](../review/ti-subareas-desktop.png)
- [Equipo, desktop](../review/ti-team-desktop.png)

Verification recorded for the implementation: scoped lint; pure JavaScript progression for 50 cycles; syntax evaluation across two complete rounds; browser checks at 1280px desktop and 390px mobile; keyboard, wheel, Codificar, modal navigation and loop behavior. The round-transition correction passed scoped lint and three complete rounds using one-character advancement calls, including the round separator, with valid JavaScript. The timed queue passed a deterministic VM test of 100 rapid events capped at 160 pending characters, with all 160 ticks advancing one character at 30ms. The final keyboard correction passed lint and actual-callback VM checks: 100 keys produced 300 characters and canceled pending timed input. Reference and TI browser checks both produced 3 characters for one `s`, 12 for four `s` keys, and no change while idle. The accelerated scan passed scoped lint and two rounds across all 16 members: progress was monotonic from zero to one, complete within four lines and at worst 35% of a source block versus the historical 83% threshold. Data checks confirmed eight links with only allowed network keys; browser Equipo showed eight links and no Instagram, and the first photo was ready after approximately 144 characters. Browser verification confirmed Equipo photo filters are `none` and no horizontal overflow at 390px. Touch and reduced-motion paths were reviewed in source, not certified through physical touch or an emulated reduced-motion browser session; the caret remains static with reduced motion. The Impeccable launcher/detector was unavailable with `cache_directory_failed`, so this review does not claim a successful automated detector run.

## Documentation boundary

Only the three new TI documentation files establish this world's documentation. Existing root design/product files and unrelated content remain intact. This pass does not reconcile historical public-site documentation with implementation or certify unrelated routes. Existing worktree changes outside these files are outside this documentation pass.
