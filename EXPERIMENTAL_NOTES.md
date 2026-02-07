# SONAR Experimental Strategy System

## Files
- **tangent-solver.html** - Your SAFE production version (unchanged)
- **tangent-solver-experimental.html** - New experimental version with strategy system
- **Git tag: stable-production-v1** - Permanent savepoint you can always return to

## What's New

### 5 Compositional Strategies

Press **N** to cycle through strategies while keeping anchors locked in place:

1. **Dense Packing** (default)
   - Current behavior - pack as many lenses as fit
   - 1-12 lenses with weighted random sizing
   - Bubble-like, efficient packing

2. **Sparse Giant**
   - Only 3-5 lenses total
   - All lenses are large (40-80mm)
   - Dramatic negative space, fewer legs

3. **Minimalist**
   - Only 1-3 lenses
   - Each lens as large as possible
   - Maximum negative space, architectural feel

4. **Apollonian**
   - Starts with circle tangent to all 3 anchors
   - Then packs smaller circles in remaining space
   - Fractal-like nesting, mathematical precision

5. **Top-Heavy**
   - All lenses constrained to upper half of workspace (y < 0)
   - Creates tall structures with long legs reaching down
   - 1-10 lenses clustered at top

## Workflow

1. **Spacebar** - Generate new anchors (starts new sculpture set)
2. **N** - Cycle to next strategy with SAME anchors
3. Keep pressing N to explore different mathematical approaches for your anchor configuration
4. When you find one you like, export as usual

## Strategy Info

The sidebar now shows:
- **Strategy**: [name] - so you know which one is active
- All other info remains the same

## Safety

Your production file is completely untouched. The experimental file is a separate copy you can test safely. If you want to go back to production, just use tangent-solver.html instead.

## Testing

1. Open tangent-solver-experimental.html in your browser
2. Hit Spacebar to generate a composition
3. Hit N repeatedly to cycle through the 5 different strategies
4. Watch how dramatically different the same anchor configuration can look!

## Next Steps

If you like certain strategies more than others, we can:
- Refine the strategies you prefer
- Remove strategies you don't use
- Add new strategies based on what you discover
- Eventually merge your favorites into production

Have fun exploring!
