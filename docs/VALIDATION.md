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
