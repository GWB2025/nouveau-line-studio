# Milestone 01 validation log

**Date:** 7 November 2026  
**Status:** automated tests pass; browser and physical checks tracked separately.

## TDD evidence

- **Red:** ran `npm test` immediately after writing tests; failure was `ERR_MODULE_NOT_FOUND` for unimplemented geometry/generator modules.
- **Green:** implemented seed PRNG, geometry, botany and generator in dependency order. `npm run check` completed successfully.
- **Automated tests:** 18 passing (`node:test`), comprising PRNG, Bézier/path geometry, reproducibility, SVG layering, shape variation, complexity budget, security, UI structure and deployment contract.
- **SVG validation:** 279 `<path>` records in the default A4 sample, approximately 8.09 metres pen-down, with no bitmap data.
- **Input security:** malicious markup in seed is XML-escaped; numeric controls are bounded.
- **Determinism:** repeated runs produce identical art for the same seed/options.

## Visual and integration evaluation

- [x] Generated SVG inspected by rendering to PNG on a white paper background.
- [x] Local HTTP server responds to a standard HTTP request; JavaScript modules passed Node syntax checks.
- [ ] Browser UI smoke test and download click on target Mac Safari. Chromium automation in this environment was blocked with `net::ERR_BLOCKED_BY_ADMINISTRATOR`; this is not a passed browser test.
- [ ] Import A6/A4 SVG into `GWB2025/svg-plotter-ta4` and confirm correct scale.
- [ ] Verify path count and pen-layer selection in SVG Plotter.
- [ ] Perform a small physical plot with a black MICRON pen and compare to preview.
- [ ] Check for unintended overlapping ink and excessive pen-up movement.
- [ ] Confirm GitHub Pages URL is live after first deployment.

## Acceptance requirements before Milestone 02

- [ ] User approves the overall botanical direction.
- [ ] At least one SVG imported and physically plotted without unsupported features or complexity errors.
- [ ] Any discrepancies entered as issues with screenshots/notes and a reproduction seed.

The first GitHub Pages deployment cannot run until the repository exists and the Pages source is configured to **GitHub Actions**. The README button intentionally links to the eventual stable address, not to a verified live deployment.

---

# Milestone 02 — implementation verification (8 November 2026)

**Status:** software checks passed; manual browser and physical plot evaluation outstanding.

- **Red:** 14 new behavioural tests initially failed with `ERR_MODULE_NOT_FOUND`, as the new composition/layout modules were not yet implemented.
- **Green:** implemented pure flower planning and line spacing, sampled Bézier bounds, transform-free path scaling, organic floral grammar and browser options.
- **Refactor:** retained existing Classic engine unchanged for a SHA-256 exact regression comparison with user-approved A6 seed `2412028838`.
- **Tests:** 36 total passing across the original engine and new modules (`npm run check`).
- **Sample:** A6 mixed botanical study, seed `20261108`, 281 SVG paths, approximately 2.61 metres of pen-down travel, no raster images or SVG transforms.
- **Layout:** cubic curve bounds are sampled before fitting paths inside physical millimetre margins; actual scale may be lower than requested.
- **Bounded complexity:** 24 demanding seeds across frame, symmetry, flower and shading variants all remained below 900 paths and 30 m for A6.
- **Browser smoke test:** Chromium attempted but the execution environment returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` on local HTTP; do **not** count this as a passed UI test.
- **Hardware:** Milestone 2 SVG Plotter import and physical T-A4 plot not yet conducted. Previous Milestone 1 successful plot does not establish Milestone 2 compatibility.

## Milestone 02 acceptance checklist

- [ ] Test the deployed app in Safari, including randomising the seed and restoring the Classic reference.
- [ ] Change symmetry, flower selection, each frame, cross-hatching, scale and margin; inspect previews.
- [ ] Export the provided A6 Milestone 2 SVG and import into SVG Plotter.
- [ ] Confirm page size, true drawing dimensions, pass layers, command count and physical pen plotting.
- [ ] Collect photograph and comments, then approve or refine before Milestone 03.


---

# Milestone 02 — live-slider correction (8 November 2026)

**Cause:** Organic mode ignored `curvature`; its hatching count was quantised so
all settings from 5% to 70% produced exactly 58 identical hatching paths for
seed `20261108`. The SVG hatching stroke width of 0.18 design units made that
small effect particularly hard to see in the browser preview.

**Test-driven correction:**

- Added tests before the implementation and confirmed failure.
- Curve expression now continuously adjusts organic flower petal fullness,
  leaf outlines and Bézier stem controls, without altering the Classic engine.
- Fine hatching now changes the number **and length/placement of strokes**; it
  varies on every 5% slider step. At 0% the shading layer contains no paths.
- Organic shading uses a more legible preview stroke width (0.48 design units);
  plotted pen movement remains determined by the same SVG centreline paths.
- All slider `input` events schedule a redraw for the **next animation frame**,
  using current slider values and coalescing redundant intermediate events.
- The hatching slider is disabled when the Shading lines layer is hidden.
- Integrated DOM-mock test confirms changing curvature and hatching via `input`
  alone updates SVG and percentage labels, without requiring `change` or release.
- **42 automated tests passed** and `npm run check` validated the SVG samples.
- Latest sample: `nouveau-mixed-seed-20261108-A6.svg`, **312 paths**, approximately
  **2.76 metres** pen-down; the original Classic A6 SHA-256 regression still passes.
- A Chromium interaction test using the real browser was attempted but local
  HTTP requests were blocked by environment policy. This is **not** a passed
  browser test and requires confirmation on Safari.

## Remaining acceptance steps

- [ ] Reload the deployed app in Safari; move both sliders from 0% to 100% and
      confirm the picture and labels update while dragging.
- [ ] Confirm Classic mode still reproduces the previously approved illustration.
- [ ] Export and import an Organic A6 example into SVG Plotter.
- [ ] Plot an Organic sample on the Writing Robot T-A4 and inspect the hatching.
- [ ] Sign off before starting Milestone 03.


---

# Milestone 03 — figure study implementation (8 November 2026)

**Status:** software checks passed; real Safari and physical plot checks outstanding.

## Test-driven approach

- **Red:** wrote `tests/milestone3.test.js` before the figure modules. `npm test` failed due to missing `src/figure-primitives.js`.
- **Green:** built pure deterministic landmarks, face projection, SVG Bézier strokes, figurative composition, generator integration, then browser UI controls.
- **Refactor:** reused existing physical layout and frame drawing rather than duplicating their rules. All four SVG layers remain independent and plotter friendly.
- **Regressions:** verified the exact Classic A6 SVG SHA-256 `192a1ca23727c08535ba5825f8fe84774600803fdb38582c7f90bb0490e5534a` and Organic A6 SHA-256 `e676c0452af8753939b0e02c16b028a00b7e33d1fd9b38285d7b11687fd1201f`.
- **Unit/integration:** 56 automated tests passing via Node.js built-in runner.
- **Example:** `nouveau-figure-seed-20261108-A6.svg`, 133 paths, estimated pen-down 2.94 m, portrait A6, 8 mm requested minimum margin. No raster images or SVG transformations.
- **Variation:** three face poses, three hairstyles, two drapery modes; independent shading and botanical accents.
- **Limits:** 25 demanding seed/pose/hair combinations all below 900 paths, 30 m of pen-down travel, and fitted within requested page margins.
- **Visual check:** example SVG rendered successfully to PNG for manual visual inspection. The portraits are simplified procedural studies; facial anatomy is not independently clinically or artistically validated.

## Remaining acceptance

- [ ] Open GitHub Pages release in Safari and verify figure control interactions.
- [ ] Inspect multiple figures and provide anatomy / appearance feedback.
- [ ] Import A6 figure SVG into SVG Plotter, preserving page dimensions and stroke layers.
- [ ] Plot actual artwork with T-A4 using a fine black pen, photograph the result and check overdraw, curve precision and elapsed time.
- [ ] Record user approval or requested improvements before starting any Milestone 4 work.


---

# Milestone 03.1 — Face-focused Art Nouveau study (8 November 2026)

The previous figure prototype had mechanical eyes, flat lips, a narrow
expressional range and insufficient facial presence on an A6 sheet. A separate
`portrait` generator now creates more prominent heads with a landmark-based
face, half-lidded almond eyes, cupid's-bow lips, projected nose contours,
head-framing flowing hair and an open halo. This is original stylistic geometry,
not a reproduction of a particular historical artwork.

## TDD evidence

- **Red:** wrote portrait anatomy, SVG and UI checks before the generator; saw
  missing-module failures, then a missing integration/validation failure.
- **Green:** pure facial landmark planning → SVG facial primitives → hair and
  drapery → seeded art → generator integration → live UI → sample validation.
- **Regression:** exact output hashes for Classic, Organic and original Figure
  remain unchanged. Input sanitisation, no-raster, separate layers, bounded
  length and clipping tested for 30 portrait pose/seed variants.
- **Visual assessment:** generated images visually inspected for frontal,
  three-quarter and profile views, with a visible larger face than Milestone 3.
- **Not tested:** physical T-A4 plot or Safari use of the portrait mode.

## Acceptance checklist

- [ ] Verify the new portrait mode and gaze selector in Safari.
- [ ] Inspect facial proportions, eye shapes, nose, lips and hair at A6 scale.
- [ ] Compare three-quarter, profile and frontal expressions.
- [ ] Export new A6 portrait, import to SVG Plotter and confirm page scale.
- [ ] Plot the A6 sample on the T-A4; review fine eye/lip line quality.
- [ ] Record refinements before broadening into AI-assisted image models.

---

# Milestone 03.2a — first curated portrait SVG (8 November 2026)

**Scope:** Sarah Bernhardt tribute poster selected as **stylistic reference**;
new original, hand-authored face-and-hair vector portrait (not automatic tracing).
The uploaded poster image itself is not embedded in any SVG.

- **Red:** first 9 new tests failed because `portrait-muse.js` was not implemented.
- **Green:** implemented fixed vector geometry, seed-independent face/hair,
  restrained botanical surround and a new browser portrait selector.
- **Tests:** **81 passing** (including 12 new curated portrait/source/UI checks);
  all old output regression hashes retain their expected values.
- **A6 sample:** `nouveau-curated-muse-01-A6.svg` — **157 paths**, approximately
  **3.70 metres** of pen-down travel, four stroke layers, 105 × 148 mm.
- **Face-only asset:** `assets/portraits/muse-01.svg`, regenerated from
  `src/portrait-muse.js`, independent of seed and surrounding ornament.
- **Drawing safety:** tested 24 seeds and frame/flower variations; under 600
  paths and 20 metres A6. No bitmap, SVG text, transforms, or external links.
- **Illustration review:** rendered SVG to PNG on white paper; the portrait
  still reflects stylised hand-authored geometry and requires the user's
  assessment for likeness and anatomical subtlety.

## Acceptance requirements

- [ ] Safari live preview: change seed and botanicals; facial features unchanged.
- [ ] Change frame, flowers, curve expression and hatching while dragging controls.
- [ ] Export A6 composition; import into SVG Plotter and check true paper size.
- [ ] Import `assets/portraits/muse-01.svg` separately, check pen paths.
- [ ] Physical A6 T-A4 plot of both face and full composition.
- [ ] Obtain specific face/hair feedback and user sign-off before slot 02.

The other five portraits have **not** been created. This is an evaluation
release rather than a completed six-portrait catalogue.