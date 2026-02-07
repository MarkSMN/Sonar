# CLAUDE.md - Project Guide for SONAR

## Project Overview

SONAR is a generative 3D sculpture system that creates unique compositions with colored acrylic rings, curved connections, and anchor-based structural elements. Based on the "Cycles" algorithm by OWMO Studio, extended with interactive editing, multiple compositional strategies, and support for different workspace sizes (desktop 160mm, wall 250mm, tower variants).

**Live:** https://sonar-ten.vercel.app

## Tech Stack

- **Vanilla JavaScript** (ES6 modules, no build step)
- **Three.js** for 3D WebGL rendering, STL export
- **Canvas 2D API** for composition preview
- **Vercel** for deployment (static, no backend)
- Newton-Raphson iteration for tangent circle solving
- Seeded RNG for reproducible compositions

## Key Files

| File | Purpose |
|------|---------|
| `tangent-solver-wall.html` | **Current default** - Wall sculpture (250mm) |
| `tangent-solver-experimental.html` | Desktop version with strategies (160mm) |
| `tangent-solver-tower.html` | Tower/vertical variant |
| `tangent-solver.html` | Original production version |
| `scadx.html` | OpenSCAD export interface |
| `three-exporter.html` | Three.js model exporter |
| `js files/original.js` | Production OWMO code (minified) |
| `js files/main.js` | Readable reference implementation |
| `js files/vercel.json` | Deployment routing config |

## Running Locally

```bash
python3 -m http.server 8080
# Then open http://localhost:8080
```

No npm, no build tools. All dependencies loaded as ES6 module imports in HTML files.

## URL Parameters

- `?fast=true` - Low-res rendering (32 segments vs 96)
- `?rotate=true` - Auto-rotate 3D view
- `?export=true` - Auto-export mode
- `?seed=N` - Set random seed
- `?anchors=N`, `?baseRadius=N`, `?jitter=N`, `?variation=N` - Parametric anchor control

## Code Conventions

### Two Code Styles in This Project

1. **Production code** (`original.js`) uses minified/obfuscated names:
   - `we` = 3.175mm (frame height), `ii` = 2.4mm (frame thickness), `re` = 1.6mm (channel depth)
   - `no` = 2.8mm (connector hole), `uo` = 19mm (min radius), `Ga` = 150mm (max radius)
   - `Te` = bounding box, `Qn` = radial segments, `Pv` = palette function

2. **Reference implementation** (`main.js`) uses descriptive names:
   - `generateAnchorPoints()`, `generateLayerCircles()`, `findTangentCircle()`

### Key Patterns

- **Seeded random generation** (xorshift algorithm) for reproducible results
- **Three-point anchor system**: 3 layers share same anchor points at 120deg intervals
- **Iterative circle placement**: 200 attempts per circle, 8-15 circles per layer, -5mm overlap buffer
- **Strategy pattern**: 10 compositional strategies as objects with `name`, `radiusMode`, `minLenses`, `maxLenses`
- **Two-phase generation**: anchors + lenses first, then support structures (legs, arches)
- **70/30 split**: straight legs vs curved paths

### Physical Constants (mm)

- Leg thickness: 1.2mm | Lens/frame thickness: 2.4mm
- Anchor diameter: 6.36mm | Anchor hole: 2.8mm square
- Layer spacing: 38.1mm (3 layers)
- Min circle radius: 19mm | Max circle radius: 150mm
- Desktop workspace: 160mm x 160mm | Wall workspace: 250mm x 250mm

## Architecture Notes

- All HTML files are self-contained (inline JS, no separate CSS files)
- Main application files are large single-file HTML (1000-3200 lines each)
- No test framework; test data exists as JSON composition files
- Export formats: STL, JSON, PNG, SVG, SCAD

## Git Tags

- `stable-production-v1` - Current stable version
- `v1.0-original-working` - Initial working version
- `v1.1-light-blue-experiment` - Palette experiment

## Documentation

- `js files/CODE_REFERENCE.md` - Comprehensive technical reference (variable mappings, algorithms, constants)
- `js files/ANCHOR_EXPERIMENTS.md` - Parametric anchor URL parameters and presets
- `EXPERIMENTAL_NOTES.md` - Compositional strategies documentation
- `WALL_SCULPTURE_NOTES.md` - Wall sculpture specs and workflow
