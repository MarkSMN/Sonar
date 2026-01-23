import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

// Global state
let scene, camera, renderer, controls;
let currentSeed = null;
let currentComposition = null;

// Configuration based on your specifications
const CONFIG = {
    // Physical measurements (in mm)
    LAYER_SPACING: 38.1, // 1.5 inches
    RING_WALL_THICKNESS: 1.5,
    RING_HEIGHT: 3.0, // Extrusion height for 3D frames

    // Circle size constraints (in mm)
    MIN_RADIUS: 13,
    MAX_RADIUS: 61,

    // Anchor point configuration
    ANCHOR_POINTS: 3, // Triad

    // Leg configuration
    LEG_DIAMETER: 6.35, // 1/4 inch rod
    LEG_MIN_HEIGHT: 50,
    LEG_MAX_HEIGHT: 150,

    // Composition bounds (mm)
    CANVAS_WIDTH: 300,
    CANVAS_HEIGHT: 300,

    // Color palette
    COLORS: [
        { name: 'yellow', hex: 0xFFEB3B, opacity: 0.6 },
        { name: 'orange', hex: 0xFF9800, opacity: 0.6 },
        { name: 'pink', hex: 0xF48FB1, opacity: 0.6 },
        { name: 'blue', hex: 0x64B5F6, opacity: 0.6 },
        { name: 'purple', hex: 0xBA68C8, opacity: 0.6 },
        { name: 'gray', hex: 0x9E9E9E, opacity: 0.6 }
    ]
};

// Random number generator with seed support
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    range(min, max) {
        return min + this.random() * (max - min);
    }

    int(min, max) {
        return Math.floor(this.range(min, max + 1));
    }

    choice(array) {
        return array[this.int(0, array.length - 1)];
    }
}

// Initialize Three.js scene
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera setup - positioned to view the sculpture
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        5000
    );
    camera.position.set(200, 150, 300);
    camera.lookAt(0, 50, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 50, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 200, 100);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, 100, -100);
    scene.add(directionalLight2);

    // Ground plane for reference
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(500, 50, 0xcccccc, 0xeeeeee);
    scene.add(gridHelper);
}

// Generate anchor point triad (constellation)
function generateAnchorPoints(rng) {
    const points = [];
    const centerX = 0;
    const centerY = CONFIG.CANVAS_HEIGHT / 2;

    // Generate 3 anchor points with some randomness
    // They should be roughly distributed to allow interesting compositions
    const baseRadius = rng.range(40, 80);

    for (let i = 0; i < CONFIG.ANCHOR_POINTS; i++) {
        const angle = (i / CONFIG.ANCHOR_POINTS) * Math.PI * 2 + rng.range(-0.3, 0.3);
        const radius = baseRadius + rng.range(-20, 20);

        points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        });
    }

    return points;
}

// Check if two circles overlap (used to prevent invalid configurations)
function circlesOverlap(c1, c2, buffer = -5) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Negative buffer allows overlap for tighter packing like the original
    return distance < (c1.radius + c2.radius + buffer);
}

// Generate circles for a single layer using anchor points
function generateLayerCircles(anchorPoints, rng, existingCircles = []) {
    const circles = [];
    const attempts = 200;
    const numCircles = rng.int(8, 15); // 8-15 circles per layer for dense packing

    for (let i = 0; i < numCircles; i++) {
        let bestCircle = null;
        let maxAttempts = attempts;

        while (maxAttempts > 0) {
            // Random radius
            const radius = rng.range(CONFIG.MIN_RADIUS, CONFIG.MAX_RADIUS);

            // Choose a random anchor point to center near
            const anchor = rng.choice(anchorPoints);

            // Position with some offset from anchor
            const offsetAngle = rng.range(0, Math.PI * 2);
            const offsetDist = rng.range(0, 30);

            const circle = {
                x: anchor.x + Math.cos(offsetAngle) * offsetDist,
                y: anchor.y + Math.sin(offsetAngle) * offsetDist,
                radius: radius,
                color: rng.choice(CONFIG.COLORS),
                anchorPoint: anchor
            };

            // Check if valid (doesn't overlap too much with existing circles)
            let valid = true;

            // Check against other circles in this layer
            for (const existing of circles) {
                if (circlesOverlap(circle, existing)) {
                    valid = false;
                    break;
                }
            }

            // Check bounds
            if (circle.x - circle.radius < -CONFIG.CANVAS_WIDTH / 2 ||
                circle.x + circle.radius > CONFIG.CANVAS_WIDTH / 2 ||
                circle.y - circle.radius < 0 ||
                circle.y + circle.radius > CONFIG.CANVAS_HEIGHT) {
                valid = false;
            }

            if (valid) {
                bestCircle = circle;
                break;
            }

            maxAttempts--;
        }

        if (bestCircle) {
            circles.push(bestCircle);
        }
    }

    return circles;
}

// Generate complete composition
function generateComposition(seed) {
    const rng = new SeededRandom(seed);

    // Generate shared anchor points
    const anchorPoints = generateAnchorPoints(rng);

    // Generate three layers
    const layers = [];

    for (let i = 0; i < 3; i++) {
        const layerCircles = generateLayerCircles(anchorPoints, rng);
        layers.push({
            index: i,
            z: i * CONFIG.LAYER_SPACING,
            circles: layerCircles
        });
    }

    return {
        seed,
        anchorPoints,
        layers
    };
}

// Create 3D geometry for a ring (torus-like frame)
function createRingGeometry(circle, height) {
    const shape = new THREE.Shape();
    const outerRadius = circle.radius;
    const innerRadius = circle.radius - CONFIG.RING_WALL_THICKNESS;

    // Outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Inner circle (hole)
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings = {
        depth: height,
        bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// Create lens (filled circle for visual representation)
function createLens(circle) {
    const geometry = new THREE.CircleGeometry(circle.radius - CONFIG.RING_WALL_THICKNESS, 64);
    const material = new THREE.MeshPhysicalMaterial({
        color: circle.color.hex,
        transparent: true,
        opacity: circle.color.opacity,
        side: THREE.DoubleSide,
        transmission: 0.9,
        thickness: 0.5,
        roughness: 0.1,
        metalness: 0.0
    });

    return new THREE.Mesh(geometry, material);
}

// Newton's method to find tangent circle (from original source)
function findTangentCircle(x1, y1, x2, y2, targetX, targetY, r1, r2) {
    let x3 = 0, y3 = 0;

    function f1(x, y) {
        return (x - x1) ** 2 + (y - y1) ** 2 - (x - targetX) ** 2 - (y - targetY) ** 2 - r1 ** 2;
    }

    function f2(x, y) {
        return (-(x - x2)) ** 2 - (y - y2) ** 2 + (x - targetX) ** 2 + (y - targetY) ** 2 - r2 ** 2;
    }

    function df1dx(x) { return 2 * (x - x1) - 2 * (x - targetX); }
    function df1dy(y) { return 2 * (y - y1) - 2 * (y - targetY); }
    function df2dx(x) { return -2 * (x - x2) + 2 * (x - targetX); }
    function df2dy(y) { return -2 * (y - y2) + 2 * (y - targetY); }

    const maxIterations = 100;
    const tolerance = 1e-6;
    let iterations = 0;
    let deltaX = Infinity, deltaY = Infinity;

    while ((Math.abs(deltaX) > tolerance || Math.abs(deltaY) > tolerance) && iterations < maxIterations) {
        const F1 = f1(x3, y3);
        const F2 = f2(x3, y3);
        const J11 = df1dx(x3);
        const J12 = df1dy(y3);
        const J21 = df2dx(x3);
        const J22 = df2dy(y3);
        const det = J11 * J22 - J21 * J12;

        deltaX = (-F1 * J22 + F2 * J12) / det;
        deltaY = (F1 * J21 - F2 * J11) / det;

        x3 += deltaX;
        y3 += deltaY;
        iterations++;
    }

    if (iterations === maxIterations) return null;
    return { x: x3, y: y3 };
}

// Create straight leg/arm geometry
function createStraightLeg(position, placement, legWidth = 1.2, depth = 3.175) {
    const height = position.y + (placement === 'D' ? 0.6 : 0);
    const geometry = new THREE.BoxGeometry(legWidth, height, depth);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x202020 }));

    mesh.position.y = height * 0.5;
    mesh.position.x = position.x;
    mesh.position.z = position.z || 0;

    if (placement === 'L') {
        mesh.position.x += legWidth * 0.5;
    } else if (placement === 'R') {
        mesh.position.x -= legWidth * 0.5;
    }

    return mesh;
}

// Create curved arch connection between two points
function createCurvedArch(leftPoint, rightPoint, archRadius, depth = 3.175, legWidth = 1.2) {
    const group = new THREE.Group();
    const centerX = (leftPoint.x + rightPoint.x) / 2;
    const archHeight = archRadius;

    // Create main arch (half-cylinder)
    const archGeometry = new THREE.CylinderGeometry(archRadius, archRadius, depth, 32, 1, false, 0, Math.PI);
    const archMesh = new THREE.Mesh(archGeometry, new THREE.MeshStandardMaterial({ color: 0x202020 }));

    archMesh.rotation.z = Math.PI / 2;
    archMesh.rotation.y = Math.PI / 2;
    archMesh.position.set(centerX, archHeight, 0);
    group.add(archMesh);

    // Create left vertical support
    const leftLeg = createStraightLeg(
        { x: leftPoint.x, y: leftPoint.y - archRadius, z: 0 },
        leftPoint.placement || 'D',
        legWidth,
        depth
    );
    leftLeg.position.y += archRadius;
    group.add(leftLeg);

    // Create right vertical support
    const rightLeg = createStraightLeg(
        { x: rightPoint.x, y: rightPoint.y - archRadius, z: 0 },
        rightPoint.placement || 'D',
        legWidth,
        depth
    );
    rightLeg.position.y += archRadius;
    group.add(rightLeg);

    return group;
}

// Create leg geometry (simplified version)
function createLegGeometry(startPoint, endPoint, diameter) {
    const curve = new THREE.LineCurve3(
        new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
        new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z)
    );

    const tubeGeometry = new THREE.TubeGeometry(curve, 1, diameter / 2, 8, false);
    return tubeGeometry;
}

// Render composition in 3D
function renderComposition(composition) {
    // Clear only meshes, keep lights
    const objectsToRemove = [];
    scene.children.forEach(child => {
        if (child.isMesh || child.isGroup) {
            objectsToRemove.push(child);
        }
    });

    objectsToRemove.forEach(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(m => m.dispose());
            } else {
                object.material.dispose();
            }
        }
        scene.remove(object);
    });

    // Re-add ground and grid
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(500, 50, 0xcccccc, 0xeeeeee);
    scene.add(gridHelper);

    // Material for frames (black)
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.3,
        metalness: 0.1
    });

    // Create all layers
    composition.layers.forEach((layer, layerIndex) => {
        layer.circles.forEach((circle, circleIndex) => {
            // Create ring frame
            const ringGeometry = createRingGeometry(circle, CONFIG.RING_HEIGHT);
            const ringMesh = new THREE.Mesh(ringGeometry, frameMaterial);
            ringMesh.position.set(circle.x, layer.z, -circle.y); // Note: y and z swapped for 3D space
            ringMesh.rotation.x = Math.PI / 2;
            ringMesh.castShadow = true;
            scene.add(ringMesh);

            // Create lens
            const lens = createLens(circle);
            lens.position.set(circle.x, layer.z + CONFIG.RING_HEIGHT / 2, -circle.y);
            lens.rotation.x = Math.PI / 2;
            scene.add(lens);

            // Create anchor-based legs (4 directions: Down, Up, Left, Right)
            const anchorDirections = {
                'D': new THREE.Vector3(0, -1, 0),   // Down
                'L': new THREE.Vector3(-1, 0, 0),   // Left
                'R': new THREE.Vector3(1, 0, 0)     // Right
            };

            // Generate legs from anchor points
            Object.entries(anchorDirections).forEach(([direction, vector]) => {
                // Calculate anchor position at circle edge
                const anchorPos = new THREE.Vector3(circle.x, -circle.y, layer.z)
                    .add(vector.clone().multiplyScalar(circle.radius));

                // Decide whether to create straight leg or curved connection
                const useDirectLeg = Math.random() < 0.7; // 70% straight, 30% curved

                if (useDirectLeg && direction === 'D') {
                    // Straight leg down to ground
                    const leg = createStraightLeg(
                        { x: anchorPos.x, y: anchorPos.z, z: anchorPos.y },
                        direction,
                        CONFIG.LEG_DIAMETER,
                        CONFIG.RING_HEIGHT
                    );
                    leg.rotation.x = Math.PI / 2;
                    leg.position.z = -circle.y;
                    scene.add(leg);
                }
            });

            // Occasionally add curved arches between adjacent circles
            if (circleIndex < layer.circles.length - 1 && Math.random() < 0.2) {
                const nextCircle = layer.circles[circleIndex + 1];
                const distance = Math.sqrt((nextCircle.x - circle.x) ** 2 + (nextCircle.y - circle.y) ** 2);

                if (distance < circle.radius + nextCircle.radius + 30 && distance > 15) {
                    const archRadius = distance * 0.5;
                    const arch = createCurvedArch(
                        { x: circle.x, y: -circle.y, placement: 'D' },
                        { x: nextCircle.x, y: -nextCircle.y, placement: 'D' },
                        archRadius,
                        CONFIG.RING_HEIGHT,
                        CONFIG.LEG_DIAMETER
                    );
                    arch.rotation.x = Math.PI / 2;
                    arch.position.z = layer.z;
                    scene.add(arch);
                }
            }
        });
    });

    currentComposition = composition;
}

// Generate new composition
function generateNew() {
    const seed = Math.floor(Math.random() * 1000000);
    currentSeed = seed;

    document.getElementById('seed-info').textContent = `Seed: ${seed}`;

    const composition = generateComposition(seed);
    renderComposition(composition);
}

// Export STL files
function exportSTL() {
    if (!currentComposition) return;

    const exporter = new STLExporter();

    // Export each layer's frames separately
    currentComposition.layers.forEach((layer, index) => {
        const layerGroup = new THREE.Group();

        // Add all frames from this layer
        layer.circles.forEach(circle => {
            const ringGeometry = createRingGeometry(circle, CONFIG.RING_HEIGHT);
            const ringMesh = new THREE.Mesh(ringGeometry);
            ringMesh.position.set(circle.x, layer.z, -circle.y);
            ringMesh.rotation.x = Math.PI / 2;
            layerGroup.add(ringMesh);
        });

        const stl = exporter.parse(layerGroup, { binary: true });
        const blob = new Blob([stl], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `frame_${index + 1}_seed_${currentSeed}.stl`;
        link.click();
    });

    console.log('STL files exported');
}

// Export JSON metadata
function exportJSON() {
    if (!currentComposition) return;

    const metadata = {
        seed: currentComposition.seed,
        layers: currentComposition.layers.map(layer => ({
            index: layer.index,
            z: layer.z,
            circles: layer.circles.map(circle => ({
                x: circle.x,
                y: circle.y,
                radius: circle.radius,
                color: circle.color.name,
                dimensions: {
                    diameter: circle.radius * 2,
                    innerDiameter: (circle.radius - CONFIG.RING_WALL_THICKNESS) * 2,
                    wallThickness: CONFIG.RING_WALL_THICKNESS,
                    height: CONFIG.RING_HEIGHT
                }
            }))
        }))
    };

    const json = JSON.stringify(metadata, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `composition_${currentSeed}.json`;
    link.click();

    console.log('JSON metadata exported');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Event listeners
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        generateNew();
    } else if (e.code === 'KeyS') {
        e.preventDefault();
        exportSTL();
    } else if (e.code === 'KeyJ') {
        e.preventDefault();
        exportJSON();
    }
});

// Initialize
initScene();
generateNew();
animate();
