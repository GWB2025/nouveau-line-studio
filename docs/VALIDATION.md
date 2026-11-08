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