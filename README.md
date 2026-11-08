# Nouveau Line Studio

**Generative black-and-white Art Nouveau botanical compositions, designed for pen plotting.**

[![Launch Nouveau Line Studio](https://img.shields.io/badge/%E2%9D%A6_LAUNCH-NOUVEAU_LINE_STUDIO-385b45?style=for-the-badge&labelColor=1d3927)](https://gwb2025.github.io/nouveau-line-studio/)

**GitHub Pages launch address:** <https://gwb2025.github.io/nouveau-line-studio/>

> **Publishing status:** GitHub Pages is deployed from `main` via GitHub Actions. Milestone 2 should be released only after automated checks pass.

## Milestone 02 — Expressive botanical compositions (evaluation release)

Milestone 2 adds an **Organic** generator without altering the **Classic** engine. Select **Load Milestone 1 reference** to recover the original A6 seeded artwork exactly. The zero-build, dependency-free browser app still exports plain stroked SVG with the same four plotter layers.

- **Flowers:** lilies, irises, poppies or a mixed bouquet, with seeded natural petal variations.
- **Composition:** flower-placement symmetry from paired (100%) to intentionally asymmetric (0%); protective spacing between blossoms.
- **Frames:** architectural double arch, oval halo or trellis.
- **Curve expression:** changes organic stem sweeps, petal fullness and leaf shapes throughout the 0–100% range.
- **Fine hatching:** changes the actual number and length of pen paths continuously across the slider; 0% removes shading. Keep the **Shading lines** layer enabled to see it.
- **Live controls:** slider movements regenerate the preview at the next animation frame, without requiring mouse release.
- **Shading:** separate contour or crosshatching paths with conservative minimum separation.
- **Paper:** A4, A5 or A6 portrait, adjustable artwork scale (50–130%) and minimum physical margin (0–20 mm). Bounds are measured from Bézier curves; actual scale is reduced when needed to avoid clipping.
- **Testing:** original Milestone 1 SVG regression hash, deterministic seeded variation, paper geometry, shading isolation, frame switching, SVG sanitisation, plotting complexity and static UI checks.

**[Open the new Milestone 2 example SVG](samples/nouveau-mixed-seed-20261108-A6.svg)** (A6, seed `20261108`, 312 paths, approximately 2.76 m pen-down). The previous A4 sample remains available below.

**Important:** Milestone 2 and its slider fix are software-validated. It still needs independent evaluation in Safari, SVG Plotter and on the physical T-A4 before sign-off. A successful Milestone 1 plot is not proof that this new geometry plots correctly.

## Milestone 01 — Botanical ornament (validated reference)

The original release creates **original** monochrome Art Nouveau-inspired floral ornaments. It does not copy Mucha's drawings or claim to generate human figures yet.

- Reproducible random seed; different seeds create different drawings.
- Lily, poppy and iris-inspired motifs; adjustable foliage density, curvature and fine hatching.
- Three portrait paper formats: A4, A5 and A6.
- Four individually selectable SVG stroke layers: frame, outlines, detail and hatching.
- No raster images, filled shapes, external fonts or network requests in the generated artwork.
- An indicative pen-down distance and path count; these are **not** a physical plotting-time estimate.
- Works entirely in the browser with no account and no third-party dependencies.

![Milestone 2 botanical composition](samples/nouveau-mixed-seed-20261108-A6.svg)

Classic reference: ![Original Milestone 1 ornament](samples/preview-white.png)

[Open an example A4 SVG](samples/nouveau-lily-seed-20261107-A4.svg)

### Launch locally

1. Extract the project into `~/Documents/Projects/Generative-Art/Nouveau-Line-Studio` on your Mac, or another backed-up development folder.
2. Open Terminal in that folder and run `python3 -m http.server 8000`.
3. Open <http://localhost:8000> in Safari or Chrome.

Alternatively, with Node.js 20 or later:

```bash
npm run serve
```

A local HTTP server is required for JavaScript modules. Opening `index.html` directly with `file://` is not supported in all browsers.

### Test-driven development

Tests were written first (confirmed failing due to missing modules), then functionality was implemented from the bottom up: deterministic random generator → geometry/path measuring → botanical primitives → SVG generation → browser UI.

```bash
npm test        # Node.js built-in test runner, no npm install needed
npm run check   # Tests + sample SVG validation/generation
```

`npm run check` refreshes both example SVGs and validates their path counts, lengths and clipping margins. The CI workflow runs the same command before deploying Pages.

### Export to Writing Robot T-A4

1. Choose an A4, A5 or A6 portrait format and a seed.
2. Disable any pen layers you do not wish to plot.
3. Select **Export SVG for plotter**.
4. Import the SVG into your SVG Plotter app. First inspect the path count, physical scaling and preview; begin with a small low-density test plot.

All layers use open or continuous stroked `<path>` elements, with simple groups, black strokes and no fills. The **Classic** drawing has been imported and plotted successfully on the T-A4. The revised **Organic** drawing still needs its own physical test. Previewing in a web browser is not evidence of hardware compatibility.

## Project layout

```text
nouveau-line-studio/
├── README.md
├── index.html                  # Browser UI and semantic controls
├── styles.css                  # Offline UI styling
├── favicon.svg
├── src/
│   ├── prng.js                 # Seeded deterministic PRNG
│   ├── geometry.js             # Bézier and path primitives
│   ├── layout.js               # Physical margin/scale fitting
│   ├── composition.js          # Organic flower planning and safe hatching
│   ├── organic.js              # Milestone 2 compositions
│   ├── botany.js               # Procedural botanical composition
│   ├── generator.js            # Pure generator and SVG export
│   ├── live-controls.js        # Responsive frame-scheduled redraws
│   └── app.js                  # Browser event handling
├── tests/                      # 42 node:test regression and behavioural tests
├── scripts/validate.mjs        # Reproducible sample validation
├── samples/                    # A4 example SVG and preview image
├── docs/VALIDATION.md          # Evidence and physical test checklist
├── docs/ROADMAP.md             # Stage gates before continuing
└── .github/workflows/ci-pages.yml
```

## Release stages and acceptance gates

| Stage | Scope | Gate before next stage |
|---|---|---|
| **01 — passed** | Seeded ornamental flora, curves, SVG layers, paper sizes, UI | Automated tests; visual evaluation; SVG Plotter import; physical T-A4 small plot |
| **02 — evaluation** | More authentic Art Nouveau botanicals, line-hatching and compositional grammars | Repeatability, style evaluation, complexity budgets and physical plots |
| **03 — planned** | Parametric face/figure outlines, hairstyles, drapery | Anatomy and composition review; plotted figure tests |
| **04 — optional** | AI-assisted figures followed by vector simplification | Quality, licensing, offline/cloud costs, and SVG plot quality reviewed separately |

**No stage proceeds automatically.** Stage 02 requires explicit review of Stage 01 results.

### Engineering approach

Milestone 01 uses **small, testable, pure JavaScript ES modules** and HTML/CSS: this is a deliberate zero-build starting point for reliable GitHub Pages delivery. We will evaluate moving mathematically intensive core modules to **Rust/WebAssembly** later, with `cargo test` tests written before migrating behaviour, when the build/deployment complexity is justified. Geometry and SVG export are kept separate from DOM code to avoid reimplementation.

### GitHub Pages publication

The public repository is <https://github.com/GWB2025/nouveau-line-studio>. Updates to `main` trigger the [test-and-deploy workflow](https://github.com/GWB2025/nouveau-line-studio/actions/workflows/ci-pages.yml). Deployments are gated on the automated tests. To update a checkout that has not yet received Milestone 2:

```bash
cd ~/Documents/Projects/Generative-Art/nouveau-line-studio
git pull --ff-only
npm run check
```

Under **Settings → Pages**, the source should remain **GitHub Actions**. The README launch badge opens the latest successful `main` deployment.

### Scope and limitations

This is an exploratory software artefact; the florals are stylised and **not** portraits or exact reconstructions of Alphonse Mucha artwork. Stroke width in the SVG is a visual aid and actual pen width is determined by your chosen pen. The reported pen-down distance approximates the actual distance by sampling Bézier curves; it excludes pen-up movements and plotter overhead.

**Licence:** MIT for original code. © 2026 Nouveau Line Studio contributors.