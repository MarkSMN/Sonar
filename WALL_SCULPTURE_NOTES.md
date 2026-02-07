# SONAR Wall Sculpture Edition

## Specs
- **Workspace**: 250mm × 250mm (vs 152mm × 152mm for desktop)
- **Print Bed**: Maximizes 250mm × 250mm printer bed
- **Ground Plane**: Y = +125mm (vs +76mm)
- **Scale**: 2.4x (vs 3.5x for desktop)
- **Display**: Wall-mounted triple layer sculpture

## Files
- **tangent-solver-wall.html** - Wall sculpture generator
- **tangent-solver-experimental.html** - Desktop version (6" × 6" boxes)
- **tangent-solver.html** - Production stable version

## Key Differences from Desktop Version

### Increased Lens Counts (almost 3x area):
- **Dense Packing**: 15-25 lenses (was 8-12)
- **Sparse Giant**: 3-6 lenses (was 2-4)
- **Minimalist**: 1-3 lenses (was 1-2)
- **Top/Bottom Heavy**: 8-15 lenses (was 4-7)
- **Ring Formation**: 10-18 lenses (was 5-9)
- **Micro Cluster**: 25-45 lenses (was 15-25)
- **Twins**: 10-18 lenses (was 5-9)
- **Apollonian**: 1-15 lenses (was 1-8)
- **Halo**: 20-35 lenses (was 12-20)

### Anchor Constraints:
- Max anchor position: ±120mm from center (was ±71mm)
- Anchor diameter: Still 10mm (same as desktop)
- Constellation ranges scaled up proportionally

### Same Features:
- 10 compositional strategies (Z key)
- 6 constellation patterns (Spacebar)
- All leg types including left_only, right_only
- Bridge frequency: 60% (same)
- Export all files button (PNG, JSON, SVG, SCAD)

## Workflow
1. Hit **Spacebar** to generate new anchor constellation
2. Hit **Z** to cycle through strategies
3. Hit **N** to regenerate lenses within strategy
4. Hit **M** to regenerate legs only
5. When happy, click **Export All Files**
6. Repeat 3 times for triple layer (keep same anchors!)

## Display Concept
- Create 3 layers with contrasting strategies
- Example: Micro Cluster + Sparse Giant + Minimalist
- Stack together for wall display with depth
- Printed frames & rings in different colors = beautiful!

