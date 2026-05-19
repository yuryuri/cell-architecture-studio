# 3D Asset Provenance

The app uses NIH-sourced GLB files for the GLB-rendered specimens. These files are loaded from `public/models/` and paired with preview images in `public/nih-previews/`.

| Specimen | Local files | Source |
| --- | --- | --- |
| Animal Cell | `public/models/animal-cell-nih.glb`, `public/nih-previews/animal-cell-nih.png` | NIH 3D entry: https://3d.nih.gov/entries/3DPX-015797/2 |
| Neuron | `public/models/neuron-nih.glb`, `public/nih-previews/neuron-nih.png` | NIH 3D entry: https://3d.nih.gov/entries/3DPX-015796/2 |
| Gram Positive Cell Wall | `public/models/bacteria-wall-nih.glb`, `public/nih-previews/bacteria-wall-nih.png` | NIH 3D entry: https://3d.nih.gov/entries/3DPX-010752/2 |

The remaining cell types — plant, white blood, epithelial, and muscle — render with procedural Three.js geometry so the experience stays complete.

> **Brain-app note (2026-05-19).** The Plant Cell and White Blood Cell
> previously shipped large user-provided GLB files (~57 MB and ~54 MB). They
> were dropped for the brain-app build: a brain-app commits its `dist/` bundle
> and is cloned onto a RAM/disk-constrained ARM VM at install, so 100 MB+ of
> models is not viable. Both cells now use procedural geometry. A v1 follow-up
> is to add Draco/meshopt-compressed GLBs (~3-8 MB each) and restore GLB
> rendering for them.

## Reference Renders

The app also includes single-subject generated reference images for thumbnails, model previews, and downstream 3D asset experiments.

| Specimen | Local file |
| --- | --- |
| Plant Cell | `public/cell-renders/plant.png` |
| White Blood Cell | `public/cell-renders/white-blood.png` |
| Neuron | `public/cell-renders/neuron.png` |
| Epithelial Cell | `public/cell-renders/epithelial.png` |
| Bacteria Cell | `public/cell-renders/bacteria.png` |
| Animal Cell | `public/cell-renders/animal.png` |
| Muscle Cell | `public/cell-renders/muscle.png` |

Transparent-background versions live in `public/cell-renders-transparent/` and are used by sidebar thumbnails and GLB preview metadata.
