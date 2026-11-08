# Incremental development and release gates

Keep every milestone independently testable. **Do not begin the next milestone before user review**. Preserve seed reproducibility and the known-good plotting geometry.

## Milestone 01 — Complete and physically plotted

- 18 initial unit and UI-contract tests passed.
- User confirmed successful A6 export, SVG Plotter import and physical T-A4 plotting.
- User accepted the first botanical line-art design.
- **Protected reference:** use the Classic engine with A6 seed `2412028838`, lily, foliage 65, curvature 75, hatching 40, scale 100, margin 0. Its SVG SHA-256 is protected by regression tests.

## Milestone 02 — Implemented; awaiting acceptance

- [x] Bottom-up TDD: layout primitives, safe hatching spacing, deterministic flower plan, frame generation, SVG isolation and UI contract.
- [x] Organic multi-bloom compositions with controlled asymmetry and conservative flower-spacing rules.
- [x] Three Art Nouveau frames: arch, halo and trellis.
- [x] Contour and crosshatch strokes on independent pen layers.
- [x] Independent paper-fit scale and minimum margins in millimetres, with no SVG transform elements.
- [x] Repeatable mixed-botanical selection and selectable Classic mode.
- [x] 36 automated tests passing; two validated sample SVGs.
- [ ] GitHub Pages smoke test in Safari and user review of controls.
- [ ] Import A6 Milestone 2 example into SVG Plotter; confirm scale, layers and complexity.
- [ ] Physical T-A4 plot, photograph and acceptance feedback.
- [ ] Explicit user approval before Milestone 03.

**Design note:** 100% symmetry mirrors the flower *centres and sizes*, while individual petals remain varied; this is not full pathwise reflective symmetry. Layout may reduce the requested scale to satisfy margins. The original v1 drawing remains directly accessible.

## Milestone 03 — Stylised human figures (not started)

Develop pose silhouettes, line-based faces, hair and drapery. Review anatomy separately from style, and keep all geometry suitable for pen plotting.

## Milestone 04 — AI-assisted line-art (optional, not started)

Review model licensing, offline execution and vector extraction. Compare AI artwork quality against procedural linework before integration.