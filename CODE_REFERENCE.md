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

## Algorithm Flow Diagram

```
SCULPTURE GENERATION PIPELINE
══════════════════════════════════════════════════════════════

1. INITIALIZATION
   ├─ seed = hash or random value
   └─ rng = new SeededRandom(seed)

2. ANCHOR GENERATION (generateAnchorPoints)
   ├─ Center: (0, 150mm)
   ├─ Base radius: 40-80mm from center
   ├─ 3 points at 120° intervals (±17° jitter)
   └─ Output: [anchor1, anchor2, anchor3]

3. LAYER GENERATION (3 layers at z = 0, 38.1, 76.2mm)
   │
   ├─ FOR EACH LAYER:
   │  │
   │  ├─ numCircles = random(8-15)
   │  │
   │  ├─ FOR EACH CIRCLE (generateLayerCircles):
   │  │  │
   │  │  ├─ attempts = 200
   │  │  │
   │  │  ├─ WHILE attempts > 0:
   │  │  │  ├─ radius = random(19mm, 150mm)
   │  │  │  ├─ anchor = randomChoice(anchors)
   │  │  │  ├─ position = anchor + random offset (0-30mm)
   │  │  │  │
   │  │  │  ├─ VALIDATE:
   │  │  │  │  ├─ No overlap with existing (buffer = -5mm)
   │  │  │  │  └─ Within bounds: x∈[-80,80], y∈[0,160]
   │  │  │  │
   │  │  │  └─ IF VALID: accept & break
   │  │  │     ELSE: attempts--
   │  │  │
   │  │  └─ Add circle to layer (if found)
   │  │
   │  └─ Optional: Solve tangent circles (findTangentCircle)
   │
   └─ Total per composition: 24-45 circles across 3 layers

4. SUPPORT STRUCTURE (createStraightLeg, createArch)
   ├─ Calculate center of mass per layer
   ├─ Generate vertical legs (1.2mm × 3.175mm)
   ├─ Generate curved arches where needed
   └─ Connect to ground and between layers

5. 3D GEOMETRY (Three.js + CSG)
   ├─ Create ring frames (2.4mm thick, 3.175mm deep)
   ├─ Cut channels for acrylic (1.2mm × 1.6mm)
   ├─ Cut connector holes (2.8mm square)
   ├─ Generate lenses (transparent acrylic)
   └─ Assemble support structure

6. OUTPUT
   ├─ Render in browser (WebGL via Three.js)
   └─ Export STL (press 's' key)

══════════════════════════════════════════════════════════════
ITERATION COUNTS PER COMPOSITION:
- Anchor generation: 3 points
- Circle attempts: 200 attempts × 8-15 circles × 3 layers
                 = 4,800 to 9,000 total placement attempts
- Newton iterations: up to 100 per tangent solve
- Result: ~5,000-10,000 algorithmic steps per sculpture
══════════════════════════════════════════════════════════════
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

### Overview

The algorithm generates compositions through:
1. Seeded random number generation (reproducible outputs)
2. Three-point anchor constellation (geometric foundation)
3. Iterative circle placement with validation (lens solving)
4. Newton's method for tangent circle calculations
5. Layer-independent generation with shared anchors
6. Center-of-mass support structure calculations

### Three-Point Anchor System

**Location:** `main.js:124-145` (`generateAnchorPoints()`)

The core algorithm works by:

1. **Choosing 3 anchor points** per composition (shared across all 3 layers)
2. **Solving for lens configurations** that connect to these anchors
3. **Multiple solution attempts** - tries many times to find valid configurations
4. **Layer variation** - each layer consumes different RNG state for diversity

**Anchor Generation Algorithm:**
```javascript
// Center point: (0, 150mm) - middle of canvas
centerX = 0
centerY = CONFIG.CANVAS_HEIGHT / 2  // 150mm

// Base distance from center: 40-80mm
baseRadius = random(40, 80)

// For each of 3 anchors:
for i in [0, 1, 2]:
    angle = (i/3) * 2π + random(-0.3, 0.3)  // 120° apart ± 17°
    radius = baseRadius + random(-20, 20)   // ± 20mm variation

    anchor[i].x = centerX + cos(angle) * radius
    anchor[i].y = centerY + sin(angle) * radius
```

**Key Parameters:**
- **3 anchors per composition** - Defines geometric constraints
- **40-80mm base radius** - Distance from center point
- **±0.3 radian angle jitter** (~17°) - Creates triangle variation
- **±20mm radius variation** - Per-anchor distance adjustment
- **Shared across layers** - All 3 layers use same anchor points

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

### Iterative Circle Placement (Lens Solving)

**Location:** `main.js:157-218` (`generateLayerCircles()`)

Each layer independently generates 8-15 circles through iterative placement:

```javascript
attempts = 200  // Max attempts per circle
numCircles = random(8, 15)  // Circles per layer

for each circle to place (8-15 times):
    maxAttempts = 200

    while maxAttempts > 0:
        // Generate candidate
        radius = random(19mm, 150mm)           // uo to Ga
        anchor = randomChoice([anchor1, anchor2, anchor3])
        offsetAngle = random(0, 2π)
        offsetDist = random(0, 30mm)

        circle.x = anchor.x + cos(offsetAngle) * offsetDist
        circle.y = anchor.y + sin(offsetAngle) * offsetDist
        circle.radius = radius

        // Validate
        valid = true
        for existing in circles:
            if overlaps(circle, existing):  // buffer = -5mm
                valid = false
                break

        if outOfBounds(circle, bbox):
            valid = false

        if valid:
            accept circle
            break  // Success! Move to next circle

        maxAttempts--

    if found valid circle:
        add to layer
```

**Key Statistics:**
- **200 attempts per circle** - Tries up to 200 placements before giving up
- **8-15 circles per layer** - Random count for variety
- **1,600-3,000 total attempts per layer** - 200 attempts × 8-15 circles
- **Greedy selection** - Takes first valid solution, doesn't globally optimize
- **Buffer = -5mm** - Allows 5mm controlled overlap for tight packing

**Validation Criteria:**
1. No destructive overlap with existing circles (-5mm buffer tolerance)
2. Must fit within bounding box: x ∈ [-80, 80], y ∈ [0, 160]
3. Radius must be within [19mm, 150mm] range

### Lens Solutions

A valid solution can be:
- **Single lens** - one large lens reaches all 3 anchors (or comes close)
- **Bubble of lenses** - multiple smaller lenses pack together to cover anchor points

The algorithm uses **Newton's method** for tangent circle packing to find advanced configurations.

### Newton's Method for Tangent Circles

**Location:** `main.js:285-326` (`findTangentCircle()`)

This function solves for circles tangent to two existing circles using Newton-Raphson iteration:

```javascript
// Given: Two anchor circles (x1,y1,r1) and (x2,y2,r2)
// Find: Target circle (x3,y3) tangent to both

// Constraint equations (circle tangency conditions)
f1(x,y) = (x-x1)² + (y-y1)² - (x-targetX)² - (y-targetY)² - r1²
f2(x,y) = -(x-x2)² - (y-y2)² + (x-targetX)² + (y-targetY)² - r2²

// Jacobian matrix (partial derivatives)
J = [ df1/dx  df1/dy ]
    [ df2/dx  df2/dy ]

// Newton-Raphson step
[Δx, Δy]ᵀ = -J⁻¹ · [f1, f2]ᵀ

// Update guess
x3 = x3 + Δx
y3 = y3 + Δy
```

**Algorithm Parameters:**
- **Max iterations:** 100
- **Convergence tolerance:** 1e-6 (0.000001mm precision)
- **Starting point:** (0, 0) - origin
- **Returns:** `{x, y}` or `null` if fails to converge

**Mathematical Properties:**
- **Quadratic convergence** - Doubles precision per iteration when near solution
- **2x2 system** - Solves for 2D circle center position
- **Deterministic** - Same inputs always produce same outputs
- **High precision** - Sub-micron accuracy for physical manufacturing

### Layer Variation Logic

**Location:** `main.js:220-244` (`generateComposition()`)

Layers share anchors but differ through sequential RNG consumption:

```javascript
function generateComposition(seed):
    rng = new SeededRandom(seed)

    // SHARED: All layers use same 3 anchor points
    anchorPoints = generateAnchorPoints(rng)  // Consumes RNG state

    // DIFFERENT: Each layer gets fresh random values
    for layer in [0, 1, 2]:
        circles = generateLayerCircles(anchorPoints, rng)  // Consumes RNG state
        layers[layer] = {
            z: layer * 38.1mm,  // Vertical spacing
            circles: circles
        }

    return {seed, anchorPoints, layers}
```

**Variation Mechanism:**
1. **Same anchors, different RNG state** - Geometric foundation shared
2. **Sequential RNG consumption** - Each `rng.random()` advances internal state
3. **Deterministic but diverse** - Seed controls entire composition reproducibly
4. **38.1mm vertical spacing** - Physical constraint between layers (3 × 12.7mm = 38.1mm)

**Why Layers Differ:**
- Each call to `generateLayerCircles()` makes ~2,000 RNG calls (attempts)
- Layer 1 starts with RNG state after anchor generation
- Layer 2 starts with RNG state after Layer 1 completes
- Layer 3 starts with RNG state after Layer 2 completes
- Result: Dramatically different circle placements despite shared anchors

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

## Code Structure

### Files Overview

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `original.js` | 600KB | Production code (minified OWMO Studio source) | Used in production |
| `main.js` | 19KB | Readable reference implementation | Study/reference |
| `index.html` | 2KB | Entry point (loads original.js) | Production |
| `index-parametric.html` | 5KB | Experimental parametric UI (abandoned) | Archived |

**Algorithm Code Locations:**

| Function | Location | Purpose |
|----------|----------|---------|
| `generateAnchorPoints()` | main.js:124-145 | Creates 3-point anchor constellation |
| `circlesOverlap()` | main.js:147-154 | Validates circle placement (-5mm buffer) |
| `generateLayerCircles()` | main.js:157-218 | Iterative circle placement (200 attempts) |
| `generateComposition()` | main.js:220-244 | Orchestrates full generation pipeline |
| `findTangentCircle()` | main.js:285-326 | Newton's method for tangent circles |
| `createStraightLeg()` | main.js:328+ | Support structure geometry |

## Important Notes

- **original.js is minified/bundled** - variable names are obfuscated (we, ii, Te, etc.)
- **main.js is readable** - clear function names, comments, educational structure
- Original algorithm by **OWMO Studio** ("Cycles" project)
- **Three.js** for 3D rendering (WebGL)
- **CSG operations** for boolean geometry (frame channels, connector holes)
- **Newton's method** for tangent circle packing (high-precision math)
- **Three-layer depth system** (38.1mm spacing = 3 × 12.7mm)
- **Each layer solves independently** but shares anchors for structural coherence
- **Seeded RNG** ensures reproducibility (same seed = same sculpture)

---

**Reference Created:** January 23, 2026
**Project:** Sonar (study/remix of "Cycles")
