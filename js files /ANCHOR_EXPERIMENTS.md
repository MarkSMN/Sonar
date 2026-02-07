# Anchor Point Experiments

Experimental interface for modifying anchor point generation rules to explore aesthetic variations.

## Quick Start

```bash
# Start local server
python3 -m http.server 8080

# Open experimental interface
open http://localhost:8080/index-anchors.html
```

## URL Parameters

### Number of Anchors
```
?anchors=N         # 2-8 anchors (default: 3)
```
**Effect:** Changes fundamental geometry
- **2 anchors:** Linear/bilateral symmetry
- **3 anchors:** Triangular (default)
- **4 anchors:** Square/rectangular
- **5+ anchors:** Complex polygonal patterns

### Base Radius (Distance from Center)
```
?baseRadius=N      # Fixed radius in mm
?baseRadiusMin=N   # Minimum radius (default: 40)
?baseRadiusMax=N   # Maximum radius (default: 80)
```
**Effect:** Controls anchor spread
- **Small (20-40mm):** Tight, compact, dense clusters
- **Medium (40-80mm):** Balanced (default)
- **Large (80-120mm):** Expansive, airy, spread out

### Angle Jitter
```
?jitter=N          # Radians (default: 0.3 = ±17°)
```
**Effect:** Controls geometric perfection vs chaos
- **0:** Perfect geometric shape (equilateral/square)
- **0.1-0.3:** Subtle variation (default range)
- **0.5-0.8:** High asymmetry, organic chaos
- **1.0+:** Extreme randomness

### Radius Variation
```
?variation=N       # ±mm per anchor (default: 20)
```
**Effect:** Individual anchor distance variation
- **0:** All anchors same distance (perfect circle)
- **10-20:** Moderate variation (default)
- **30-50:** Dramatic obtuse/acute angles

### Center Point
```
?centerX=N         # mm (default: 0)
?centerY=N         # mm (default: 150)
```
**Effect:** Shifts entire anchor constellation
- **centerY < 100:** Bottom-heavy compositions
- **centerX ≠ 0:** Asymmetric bias

### Seed
```
?seed=N            # Specific seed for reproducibility
```

## Aesthetic Experiments

### Perfect Symmetry
```
?anchors=3&jitter=0&variation=0&baseRadius=60
```
- Perfect equilateral triangle
- Uniform, mechanical aesthetic
- Highly symmetric compositions

### Organic Chaos
```
?anchors=3&jitter=0.6&variation=40&baseRadiusMin=30&baseRadiusMax=100
```
- Wild asymmetry
- Stretched, obtuse triangles
- Natural, unpredictable forms

### Tight Cluster
```
?anchors=3&baseRadius=30&variation=10&jitter=0.2
```
- Compact arrangement
- Dense bubble compositions
- Small, delicate forms

### Expansive Canvas
```
?anchors=4&baseRadius=100&variation=20&jitter=0.4
```
- 4-point square base
- Spread across full workspace
- Bold, space-filling sculptures

### Linear Compositions
```
?anchors=2&baseRadius=80&jitter=0&variation=0
```
- Bilateral symmetry
- Linear arrangements
- Minimal, reductive aesthetic

### Pentagon Complex
```
?anchors=5&baseRadius=60&jitter=0.3&variation=15
```
- 5-point star pattern
- Complex packing challenges
- Dense, intricate results

## Recommended Parameter Ranges

| Parameter | Safe Range | Experimental Range | Notes |
|-----------|------------|-------------------|-------|
| `anchors` | 2-4 | 5-8 | Higher counts may be unpredictable |
| `baseRadius` | 30-100 | 20-120 | <20mm too tight, >120mm exceeds bounds |
| `jitter` | 0-0.5 | 0.5-1.0 | >1.0 very chaotic |
| `variation` | 0-30 | 30-60 | >60mm may exceed bounds |
| `centerX` | -20 to 20 | -40 to 40 | Keep near center |
| `centerY` | 100-180 | 80-200 | Default canvas is 300mm tall |

## Tips for Exploration

1. **Start with one parameter** - Change one thing at a time to see its effect
2. **Use seed parameter** - Lock a seed to compare parameter variations
3. **Document successes** - Copy URLs of aesthetically interesting results
4. **Combine extremes** - Mix perfect symmetry (jitter=0) with chaos (variation=40)
5. **Export STLs** - Press 's' to save interesting compositions

## Example Discovery Session

```bash
# 1. Start with defaults, pick a nice seed
http://localhost:8080/index-anchors.html

# 2. Lock that seed and experiment
http://localhost:8080/index-anchors.html?seed=42857

# 3. Try perfect symmetry
http://localhost:8080/index-anchors.html?seed=42857&jitter=0&variation=0

# 4. Try tight cluster
http://localhost:8080/index-anchors.html?seed=42857&baseRadius=35

# 5. Try 4 anchors
http://localhost:8080/index-anchors.html?seed=42857&anchors=4

# 6. Combine discoveries
http://localhost:8080/index-anchors.html?seed=42857&anchors=4&baseRadius=35&jitter=0
```

## Understanding the Effects

### Anchor Count Changes
- Affects fundamental composition structure
- More anchors = more complex solving required
- May affect circle placement success rate

### Radius Changes
- Directly affects composition scale
- Larger radius = more spread circles
- May require adjusting circle size ranges

### Jitter Changes
- 0 = perfect geometry (predictable)
- 0.3 = default (balanced variation)
- 0.6+ = organic asymmetry (unpredictable)

### Variation Changes
- Creates obtuse vs equilateral triangles
- High variation = stretched compositions
- Affects lens-solving difficulty

## Technical Notes

- Modified file: `main.js`
- Entry point: `index-anchors.html`
- Parameters parsed on load (requires page reload)
- Console shows active configuration
- Original algorithm in `original.js` unchanged

## Next Steps

After finding interesting parameter combinations:
1. Document the aesthetic style achieved
2. Create presets for specific looks
3. Consider implementing in production code
4. Explore interaction with other parameters (circle sizes, layer counts)

---

**Created:** January 23, 2026
**Project:** Sonar Anchor Experiments
