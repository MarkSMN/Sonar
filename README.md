# Sonar - Generative 3D Sculpture

A generative art project creating unique 3D sculptural compositions with colored acrylic rings, curved connections, and anchor-based structural elements. Based on the "Cycles" algorithm by OWMO Studio.

## Features

- Seeded random generation for reproducible compositions
- Three-layer depth system (38.1mm spacing)
- Newton's method for tangent circle packing
- Curved arch connections and straight leg supports
- CSG boolean operations for complex geometry
- STL export for 3D printing (press 's')
- JSON metadata export

## Live Demo

**Production:** [https://sonar-ten.vercel.app](https://sonar-ten.vercel.app)

## Local Development

```bash
# Start local server
python3 -m http.server 8080

# Open in browser
http://localhost:8080
```

## URL Parameters

- `?fast=true` - Low-res mode for faster rendering (32 segments vs 96)
- `?rotate=true` - Auto-rotate the sculpture
- `?export=true` - Enable auto-export

**Development mode:** `http://localhost:8080?fast=true&rotate=true`

## Files

- `index.html` - Main production file (uses original.js)
- `original.js` - Original compiled code from OWMO Studio
- `main.js` - Custom simplified version (experimental)

## Version Control

This project uses git tags for version control:

```bash
# List all versions
git tag

# Revert to a specific version
git checkout v1.0-working
```

## Controls

- **S**: Export STL files
- **Double-click**: Toggle fullscreen
- **Q**: Quit/shutdown
- **Mouse drag**: Rotate camera

## Tech Stack

- Three.js (3D rendering)
- CSG operations for boolean geometry
- Custom shader pipeline
- Vanilla JavaScript

---

**Note:** This is a study/remix of the "Cycles" project. Original algorithm by OWMO Studio.
