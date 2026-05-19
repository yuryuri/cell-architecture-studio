# Cell Architecture Studio

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=fff)
![Three.js](https://img.shields.io/badge/Three.js-0.181-000000?logo=threedotjs&logoColor=fff)
![3D Assets](https://img.shields.io/badge/GLB-native%20materials-4f8a3f)
![Verification](https://img.shields.io/badge/verification-playwright%20screenshots-2ea44f)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-brain--app%20v0-f59e0b)
[![Live Demo](https://img.shields.io/badge/live-demo-16a34a)](https://cell-architecture-studio-inky.vercel.app)

An interactive cell architecture gallery built with React, Vite, Three.js, and staged GLB or procedural 3D cell assets. The project recreates a premium educational biology interface with selectable cell types, organelle details, comparison mode, responsive layout, and visual verification coverage.

## Brain-App

This repo is also an installable **BrainFoundry brain-app** (`brain-app/v1`).
Installed into a brain via Settings -> Apps, it mounts as a "Cell Studio" tab,
and its AI Tutor panel answers cell-biology questions through the brain's
`llm.complete` bridge intent — generated on the operator's BYOK model, over the
brain's own ingested corpus. The app holds no API key and picks no model.

- Manifest: `brain-app.yaml` at the repo root.
- Bridge client: `src/brainBridge.ts` (a postMessage `llm.complete` client).
- `vite.config.ts` sets `base: "./"` — the app is served from a nested iframe
  path (`/apps/<id>/`), so absolute `/assets/...` URLs would 404.
- `dist/` is committed (it is the `ui_bundle`); rebuild with `npm run build`.
- Run standalone outside a brain with `npm run dev`; the AI Tutor then reports
  that it needs a brain host, and everything else still works.

## Live Demo

[Open the live Vercel deployment](https://cell-architecture-studio-inky.vercel.app)

[![Cell Architecture Studio demo](docs/media/cell-architecture-studio-demo.gif)](https://cell-architecture-studio-inky.vercel.app)

[View the MP4 demo file](docs/media/cell-architecture-studio-demo.mp4)

## Highlights

- Seven specimen views: plant cell, white blood cell, neuron, epithelial cell, bacteria cell, animal cell, and muscle cell.
- NIH-sourced GLB rendering for the neuron, animal, and bacteria specimens, with native texture preservation.
- Mesh first experience with 3D canvas rendering as the default view.
- Live AI Tutor: prompt buttons and a free-text box that ask the host brain (via the `llm.complete` bridge intent) and render the answer with corpus sources; lesson focus and mastery tracking alongside.
- Model loading overlay for GLB assets on slower networks.
- Procedural Three.js geometry for the plant, white blood, epithelial, and muscle specimens.
- Detail panel for organelles, microscope modes, specimen metadata, and comparison workflow.
- Responsive desktop, compact, and mobile layouts with browser screenshot verification.

## Preview Modes

| Mode | Purpose |
| --- | --- |
| Mesh | Loads available GLB models or procedural Three.js geometry. |
| Focus | Emphasizes selected organelles and supporting biological details. |

## Tech Stack

| Layer | Tools |
| --- | --- |
| App | React 19, TypeScript, Vite |
| 3D | Three.js, React Three Fiber, Drei |
| UI | CSS modules in `src/styles.css`, Lucide icons |
| Assets | GLB models, transparent PNG thumbnails, NIH previews |
| Verification | Playwright Core, PNG pixel metrics |

## Project Structure

```text
.
|-- docs/
|   |-- media/
|   `-- ASSETS.md
|-- public/
|   |-- cell-renders/
|   |-- cell-renders-transparent/
|   |-- models/
|   `-- nih-previews/
|-- scripts/
|   `-- verify.mjs
`-- src/
    |-- App.tsx
    |-- components/
    |-- data/
    `-- styles.css
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open the app:

```text
http://127.0.0.1:5173/
```

Build for production:

```bash
npm run build
```

Run visual verification:

```bash
npm run verify
```

## Asset Notes

The highest fidelity specimens are loaded from `public/models/` and configured in `src/data/cells.ts`.

| Specimen | Current asset |
| --- | --- |
| Animal Cell | `public/models/animal-cell-nih.glb` |
| Neuron | `public/models/neuron-nih.glb` |
| Bacteria Wall | `public/models/bacteria-wall-nih.glb` |

Plant and White Blood cells render with procedural geometry — see the brain-app note in `docs/ASSETS.md` for why their large GLB files were dropped.

Transparent PNG references in `public/cell-renders-transparent/` are used for thumbnails and model previews. Detailed provenance is tracked in `docs/ASSETS.md`.

## Verification

`npm run verify` launches the local app, captures desktop, compact, mobile, and interaction screenshots, then checks canvas pixel metrics to catch blank renders or major layout regressions.

Current coverage includes:

- Desktop, compact, and mobile smoke checks.
- Plant Cell GLB render check.
- White Blood Cell GLB render check.
- Bacteria mesh interaction check.
- Comparison modal check.

## Roadmap

- Add Draco/meshopt-compressed GLBs for the plant and white blood cells (~3-8 MB each) to restore GLB rendering without the 100 MB+ bundle tax.
- Add production quality GLB models for the remaining specimens.
- Add lazy loading and route level code splitting for 3D bundles.
- Expand educational annotations for each organelle.
- Add screenshot export and 3D export workflows.
- Add asset license metadata directly into the UI.

## License

The application code is licensed under the MIT License. Included GLB models and image assets retain their documented provenance in `docs/ASSETS.md`.

## Credits

Special thanks to the original creator [@DilumSanjaya](https://x.com/DilumSanjaya) for the source inspiration and visual direction.

Additional 3D model provenance is documented in `docs/ASSETS.md`.
