# Curated Nouveau Portrait Library

This folder holds **finished, independently selectable authored face-and-hair assets**.
A portrait is not generated anew for each random seed; only the Art Nouveau surrounds vary.

| Slot | Portrait | Status | SVG |
|---|---|---|---|
| 01 | The Muse — frontal lilies | **First evaluation asset** | [`muse-01.svg`](muse-01.svg) |
| 02–06 | To be chosen after visual/plotting review | Not implemented | — |

## Provenance and technical notes

Slot 01 is an **original hand-authored Bézier line drawing**, visually informed by
the frontal, floral-crowned figure in Alphonse Mucha's *Sarah Bernhardt* tribute
poster supplied as reference by the user. It is a stylistic interpretation,
**not** a literal trace, reproduction, or claim to depict the historical person.
The uploaded low-resolution reference image was not incorporated into the project.

- **Source of truth:** [`../../src/portrait-muse.js`](../../src/portrait-muse.js)
- **Generated standalone SVG:** `muse-01.svg` (A6 portrait, fixed face/hair/flowers)
- **Generated example composition:** [`../../samples/nouveau-curated-muse-01-A6.svg`](../../samples/nouveau-curated-muse-01-A6.svg)
- **Layers:** `frame`, `outlines`, `detail`, `hatching`, all stroked black SVG paths
- **No raster images, external fonts, text primitives, CSS transforms or network dependencies**
- **Drawing scale:** physically sized in millimetres; actual pen width depends on the pen

Run `npm run check` to regenerate the standalone asset and composition sample.
The available catalogue is exported from the same JavaScript source to avoid
maintaining conflicting lists in separate metadata files.

## Adding another portrait

Begin with a **separate artistic review of face, eyes, lips and hair**.
Add an authored vector module with repeatable geometry and layers; verify the
SVG path budget, file dimensions, paper margins and T-A4 import. Only after a
successful plot should it become selectable. Do not fill slots with placeholders.