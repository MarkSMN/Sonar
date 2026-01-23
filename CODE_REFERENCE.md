# Sonar/Cycles - Code Reference

A technical reference for understanding and modifying the generative 3D sculpture code.

## Variable Mapping

### Core Structural Parameters

| Variable | Value | Description | Location |
|----------|-------|-------------|----------|
| `we` | 3.175mm | Material depth (frame & legs) | Line 2819 |
| `ii` | 2.4mm | Frame circle thickness | Line 2819 |
| `ii/2` | 1.2mm | **Leg thickness** (calculated) | Derived |
| `re` | 1.6mm | Channel depth (1.5875mm actual) | Line 2819 |
| `no` | 2.8mm | Connector square hole size | Line 2819 |
| `ze` | 1.75mm | Unknown purpose | Line 2819 |

### Bounding Box (Workspace)

| Variable | Value | Description | Location |
|----------|-------|-------------|----------|
| `Te` | `new wn(new b(-80,0,-40), new b(80,160,40))` | Bounding box definition | Line 2819 |
| X-axis | -80 to 80mm | **160mm width** (6.3") | - |
| Y-axis | 0 to 160mm | **160mm height** (6.3") | - |
| Z-axis | -40 to 40mm | **80mm depth** (3.15") | - |

### Circle Constraints

| Variable | Value | Description | Location |
|----------|-------|-------------|----------|
| `uo` | 19mm | Minimum circle radius | Line 2819 |
| `Ga` | 150mm | Maximum circle radius | Line 2819 |

### Rendering Quality

| Variable | Value | Description | Condition |
|----------|-------|-------------|-----------|
| `Qn` | 96 | Radial segments (normal) | `?fast=false` |
| `Qn` | 32 | Radial segments (fast) | `?fast=true` |
| `ni` | 2 | Height segments (normal) | `?fast=false` |
| `ni` | 1 | Height segments (fast) | `?fast=true` |
| `kh` | boolean | Fast mode check | Checks URL params |

## Physical Measurements (from unit measurments.png)

### Connector Mounting Circles
- Outer circle: 6.36mm × 6.36mm
- Square hole: 2.8mm × 2.8mm

### Frame Circles (Main Rings)
- Thickness: 2.4mm (`ii`)
- Depth: 3.175mm (`we`)

### Channel for Acrylic Rings
- Thickness: 1.2mm
- Depth: 1.5875mm (`re` = 1.6mm)

### Support Legs
- Thickness: 1.2mm (`ii/2`)
- Depth: 3.175mm (`we`)

## Key Relationships

```
Leg Thickness = Frame Thickness / 2
1.2mm = ii / 2 = 2.4mm / 2
```

## Structural Concerns

### Current Scale (160mm × 160mm)
- Legs: 1.2mm thick × 3.175mm deep
- Material: PLA
- Issue: Long vertical legs prone to bending/damage

### Scaling Considerations
If scaling to 250mm × 250mm (56% larger):
- Leg spans increase 56%
- Leg thickness stays 1.2mm (if `ii` unchanged)
- **Recommendation**: Increase `ii` proportionally to maintain strength
- Example: `ii = 3.74mm` would give `ii/2 = 1.87mm` leg thickness

## URL Parameters

### Existing Parameters
- `?fast=true` - Low-res mode (32 segments vs 96)
- `?rotate=true` - Auto-rotate sculpture
- `?export=true` - Enable auto-export

### Hash-based Generation
```javascript
tokenData = {hash: undefined};
```
- Seeds the random number generator
- Different hashes create unique sculptures
- `undefined` generates random seed

## Color Modification

### Palette Function (Line 2826)
Original palette had 7 colors. Modified to single light blue:

```javascript
Pv=e=>{
    const lightBlue={
        color:new st(0.7,0.9,1.0),
        transmission:.15,
        opacity:.9,
        label:"light blue"
    };
    let c=[lightBlue],
        l="Light Blue Only";
    return console.log(`Palette: ${l}`),{LAYERS:3,palette:c}
}
```

**Committed as:** `v1.1-light-blue-experiment`

## File Structure

```
CCodeV001/
├── index.html              # Production (uses original.js)
├── original.js             # OWMO Studio source (600KB, minified)
├── original-backup.js      # Backup before color changes
├── main.js                 # Custom simplified version (experimental, not used)
├── vercel.json            # Deployment config
├── README.md              # Project documentation
├── .gitignore             # Excludes learning files
└── Learning files/
    └── unit measurments.png  # Physical dimensions reference
```

## Git Tags

| Tag | Description |
|-----|-------------|
| `v1.0-original-working` | Initial working version |
| `v1.1-light-blue-experiment` | All lenses changed to light blue |

## Development Workflow

### Local Testing
```bash
python3 -m http.server 8080
open http://localhost:8080
```

### Fast Development Mode
```
http://localhost:8080?fast=true&rotate=true
```

### Export STL
Press `s` key while viewing sculpture

### Version Control
```bash
# Create checkpoint
git tag v1.x-description

# Revert to checkpoint
git checkout v1.0-working

# List all versions
git tag
```

## Next Steps for Parametric Control

### Option A: URL Parameter Approach (Recommended)
1. Read URL params on page load
2. Replace hardcoded values with param values
3. "Regenerate" button reloads page with new params
4. **Pros**: Simple, safe, no real-time complexity
5. **Cons**: Requires page reload

### Option B: Real-time Modification
1. Expose parameters as global variables
2. Add regeneration function
3. Sliders trigger scene rebuild
4. **Pros**: Like ECHOFIELD, instant feedback
5. **Cons**: Complex with minified code, layout challenges

## Algorithm Logic

### Three-Point Anchor System

The core algorithm works by:

1. **Choosing 3 anchor points** per layer
2. **Solving for lens configurations** that connect all 3 anchors
3. **Multiple solution attempts** - tries many times to find valid configurations
4. **Layer variation** - actively seeks different solutions so layers aren't identical

### Anchor Geometry & Visual Styles

The **triangle formed by the 3 anchors** dramatically affects the resulting composition:

**Tight/Equilateral Triangle:**
- Anchors form a compact, roughly equilateral triangle
- Creates tighter, more clustered lens arrangements
- Often results in smaller, denser bubble compositions

**Obtuse/Spread Triangle:**
- One or more obtuse angles (>90°)
- Anchors spread far apart
- Creates stretched, elongated compositions
- Often requires larger lenses or more complex packing to bridge the distance

The anchor placement rules (exact algorithm unknown) seem to vary these geometric configurations to create visual diversity across seeds.

### Scale & Proportion Variation

The algorithm produces dramatic **scale diversity** across different seeds:

**Small, Delicate Compositions:**
- Minimal, compact arrangements
- Small lens clusters
- Fine, delicate support structures

**Tall, Skinny Sculptures:**
- Vertical emphasis
- Narrow profiles
- Extended height using full Y-axis

**Massive, Canvas-Filling Works:**
- Nearly fills entire 160mm × 160mm workspace
- Large lens diameters approaching max radius (150mm)
- Bold, substantial presence
- Dense support structures

This scale variation is **algorithmically driven** - the same parameters (`Ga=150mm` max, `uo=19mm` min) produce vastly different results based on seed, anchor placement, and lens-solving outcomes. The range is impressive, from delicate miniatures to bold, space-filling forms.

### Lens Solutions

A valid solution can be:
- **Single lens** - one large lens touches all 3 anchors
- **Bubble of lenses** - multiple smaller lenses pack together to reach all 3 points

The algorithm uses **Newton's method** for tangent circle packing to find these configurations.

### Iterative Solving Process

- Runs many iterations per layer
- Tests different circle arrangements
- Validates connections to anchor points
- Ensures structural variety between layers

### Support Structure Logic (Legs & Arches)

**Center of Mass Calculation:**
- Algorithm calculates the center of mass for each layer's lens configuration
- This determines the **distribution and placement** of support legs
- Ensures physical stability when assembled in the real world

**Two Types of Supports:**
1. **Straight legs** - Vertical support connections
2. **Curved arches** - Curved connection paths

*Logic for choosing straight vs curved: Unknown (requires further investigation)*

**Physical Validation:**
- These sculptures are printed, assembled, and **stand successfully** in the physical world
- The center-of-mass approach ensures real-world structural integrity
- Support placement is not just aesthetic - it's structurally calculated

## Important Notes

- Code is minified/bundled - variable names are obfuscated
- Original algorithm by OWMO Studio ("Cycles" project)
- Three.js for 3D rendering
- CSG operations for boolean geometry
- Newton's method for tangent circle packing
- Three-layer depth system (38.1mm spacing)
- Each layer solves independently but with variation logic

---

**Reference Created:** January 23, 2026
**Project:** Sonar (study/remix of "Cycles")
