# Incremental plan and review gates

The key rule is **test and evaluate each milestone before starting the next**. Each milestone gets a branch or release tag, clear acceptance criteria, and a manual plot trial.

## Milestone 01: Procedural vector ornament — implemented

1. Red: write failing tests for seed reproducibility, geometry, SVG export, layer isolation, bounds and complexity.
2. Green: implement minimal pure units; generator and browser integration.
3. Refactor: keep UI away from geometry, prevent unnecessary packages, centralise physical paper dimensions.
4. Validate: `npm run check`, browser smoke test and sample image visual inspection.
5. **User evaluation gate:** check botanical appearance, desired variations, import into the current SVG Plotter, and perform a low-density physical trial on the T-A4.

Evidence of the automated tests and outstanding physical checks is in `VALIDATION.md`.

## Milestone 02: More expressive floral compositions — not started

Potential improvements (subject to Milestone 01 evaluation): formal floral grammars, nested organic arches, realistic lily petals and stamen, more controllable hatching, shape overlap reduction, minimum line spacing and pen-up optimisation. Write regression tests for all changes before implementing them. Rust geometry is a candidate if complexity warrants it.

## Milestone 03: Stylised human figures — not started

Develop pose silhouettes, basic proportions, profile/three-quarter faces, flowing hair and fabric, preserving simple plotter geometry. Assess anatomy and aesthetics separately; do not claim a neural generator if figures are template driven.

## Milestone 04: Model-assisted illustration — not started

Research pretrained models, licences and costs, then test whether line-art-to-centreline SVG meets a quality and path budget. Offline operation remains a preference; cloud inference requires explicit agreement before integration.
