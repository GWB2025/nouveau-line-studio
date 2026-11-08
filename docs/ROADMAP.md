# Incremental development and release gates

Keep every milestone independently testable. **Do not begin the next milestone before user review**. Preserve seed reproducibility and the known-good plotting geometry.

## Milestone 01 — Complete and physically plotted

- 18 initial unit and UI-contract tests passed.
- User confirmed successful A6 export, SVG Plotter import and physical T-A4 plotting.
- User accepted the first botanical line-art design.
- **Protected reference:** use the Classic engine with A6 seed `2412028838`, lily, foliage 65, curvature 75, hatching 40, scale 100, margin 0. Its SVG SHA-256 is protected by regression tests.

## Milestone 02 — Implemented; physical acceptance remains open

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
- [x] User explicitly authorised development of Milestone 03 on 8 November 2026, while Milestone 02 physical acceptance remained outstanding.

**Design note:** 100% symmetry mirrors the flower *centres and sizes*, while individual petals remain varied; this is not full pathwise reflective symmetry. Layout may reduce the requested scale to satisfy margins. The original v1 drawing remains directly accessible.

## Milestone 03 — Stylised human figures (software complete; awaiting evaluation)

- [x] First wrote failing figure tests, then built deterministic anatomy landmarks and projection primitives.
- [x] Implemented parametric frontal, three-quarter and profile contours.
- [x] Added flowing waves, chignon and braid hair, gown and shawl clothing.
- [x] Preserved four independent black-ink pen layers and no SVG transforms.
- [x] Kept old Classic/Organic engines and added their exact SVG SHA-256 hashes as regression gates.
- [x] Added A6 sample and bounded path count / physical margins tests.
- [ ] Verify Safari UI interactions with the three figure selectors.
- [ ] Import example A6 SVG into SVG Plotter, check scale, path count and shading.
- [ ] Perform physical Writing Robot T-A4 plot and inspect face and clothing contour clarity.
- [ ] Review figure anatomy, pose variation and artistic merit; record feedback.
- [ ] User explicitly approves before Milestone 04.

This first figure engine is deliberately stylised, not anatomy-accurate portraiture or AI-generated raster tracing.

## Milestone 03.1 — Face-focused portrait refinement (implemented for artistic review)

- Original close-up portrait generator with face-specific landmarks and enlarged
  facial proportions, independent of the earlier stylised figure geometry.
- Front, three-quarter and profile studies; serene, direct and sideward gaze;
  flowing hair, chignon and braid styles. Compact headpiece botanicals.
- SVG-only independent frame, outline, detail and hatching layers; margins,
  seeding and path budgets remain validated.
- Previous Classic, Organic and original Figure outputs are checked by exact
  SHA-256 regression tests.
- **Open:** visual acceptance of the facial quality, Safari input check, SVG
  Plotter import and real A6 T-A4 pen plot. Do not begin Milestone 04 without
  the user explicitly approving this figurative direction.

## Milestone 03.2 — Curated Portrait Library (first of six, user evaluation required)

- [x] Based on the user's four Mucha reference illustrations, choose the
  frontal Sarah Bernhardt figure as an artistic starting point.
- [x] First *original hand-curated* Bézier portrait (face, flowing hair,
  lilied headpiece, neck, shoulders, clothing), not a bitmap trace.
- [x] Reusable standalone SVG asset in `assets/portraits/muse-01.svg`.
- [x] New **Curated portrait** mode with **01 — The Muse** selector;
  seed, flowers and frames vary **without varying the face**.
- [x] Tested pen-safe layers, fixed facial paths, 24 random seed/ornament
  combinations, margins and old Classic SVG hash; 81 automated tests passed.
- [x] A6 example saved to `samples/nouveau-curated-muse-01-A6.svg`.
- [ ] User accepts the portrait's facial expression and hairstyle after comparing
  it with their supplied Mucha examples.
- [ ] Import both standalone portrait and full A6 composition into SVG Plotter.
- [ ] Physically plot and inspect eye/nose/lip clarity and hair intersections.
- [ ] Only then select and draw the other five approved portraits.

**Do not** label missing portraits as working choices. Face is a constant
asset; random seeds influence ornamentation only. Existing Classic, Organic,
Figure and Expressive portrait engines must remain unchanged.

## Milestone 04 — AI-assisted line-art (optional, not started)

Review model licensing, offline execution and vector extraction. Compare AI artwork quality against procedural linework before integration.