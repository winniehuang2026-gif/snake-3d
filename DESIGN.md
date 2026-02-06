# Cosmic Dragon - Technical Design Document

This document describes the technical architecture and design decisions for the Cosmic Dragon 3D Snake Game.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Module Structure](#module-structure)
4. [Core Systems](#core-systems)
5. [Rendering Pipeline](#rendering-pipeline)
6. [Game Loop](#game-loop)
7. [State Management](#state-management)
8. [Collision Detection](#collision-detection)
9. [AI System Design](#ai-system-design)
10. [Event System Design](#event-system-design)
11. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

The game follows a single-file architecture with clear section separation, optimized for simplicity and browser compatibility. All game logic resides in `main.js`, which is loaded as an ES6 module.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
├─────────────────────────────────────────────────────────┤
│  index.html                                              │
│  ├── UI Layer (DOM)                                     │
│  ├── Three.js Canvas                                    │
│  └── ES6 Module Loader                                  │
├─────────────────────────────────────────────────────────┤
│  main.js                                                 │
│  ├── Configuration                                      │
│  ├── Game State                                         │
│  ├── Three.js Scene Setup                               │
│  ├── Entity Systems (Dragon, AI, Food, PowerUps)        │
│  ├── Event Systems (Cosmic Events)                      │
│  ├── Particle Systems                                   │
│  ├── Input Handling                                     │
│  └── Game Loop                                          │
├─────────────────────────────────────────────────────────┤
│  style.css                                               │
│  └── UI Styling & Animations                            │
├─────────────────────────────────────────────────────────┤
│  Three.js (CDN)                                          │
│  └── 3D Rendering Engine                                │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Three.js | 0.160.0 | 3D rendering engine |
| JavaScript | ES6+ | Game logic |
| HTML5 | 5 | Structure & canvas |
| CSS3 | 3 | UI styling |

### Three.js Features Used
- `WebGLRenderer` with antialiasing and shadow maps
- `PerspectiveCamera` with dynamic positioning
- `Scene` with fog effects
- Various geometries: Box, Sphere, Cone, Ring, Plane, etc.
- `MeshStandardMaterial` for PBR rendering
- `MeshBasicMaterial` for emissive objects
- `PointLight` for dynamic lighting
- `Points` for star field

### Module Loading
```html
<script type="importmap">
{
    "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
    }
}
</script>
<script type="module" src="src/main.js"></script>
```

---

## Module Structure

### Configuration Constants
```javascript
const CONFIG = {
    gridSize: 100,           // Grid dimensions
    cellSize: 1,             // World units per cell
    initialSpeed: 150,       // Starting move interval (ms)
    speedIncrease: 0.5,      // Speed reduction per food
    minSpeed: 80,            // Fastest possible speed
    powerUpDuration: 12000,  // Power-up effect duration
    powerUpSpawnInterval: 1500,
    obstacleCount: 10,
    goldenFoodChance: 0.35,
    goldenFoodTimeout: 15000,
    aiSnakeCount: 6,
    aiSpeed: 200,
    aiRandomness: 0.25,
    foodCount: 30,
};
```

### Type Definitions
```javascript
// Power-up type structure
const POWER_UP_TYPES = {
    SPEED_BOOST: {
        name: 'Speed',
        color: 0xff6b6b,
        effect: 'speed_boost',
        icon: '⚡',
        weight: 10
    },
    // ... more types
};

// Cosmic event structure
const COSMIC_EVENTS = {
    SUPERNOVA: {
        name: 'Supernova',
        icon: '💥',
        color: 0xffaa00,
        duration: 3000
    },
    // ... more events
};

// AI color structure
const AI_COLORS = [
    { head: 0xe11d48, body: 0xfb7185, name: 'Red Dragon' },
    // ... more colors
];
```

---

## Core Systems

### Coordinate System

The game uses a dual coordinate system:

#### Grid Coordinates
- Integer-based positions (0 to gridSize-1)
- Used for game logic and collision detection
- Stored in game state

#### World Coordinates
- Float-based positions in 3D space
- Used for rendering
- Centered around origin (0, 0, 0)

```javascript
function gridToWorld(gridPos) {
    const offset = (CONFIG.gridSize / 2) * CONFIG.cellSize - CONFIG.cellSize / 2;
    return {
        x: gridPos.x * CONFIG.cellSize - offset,
        y: 0,
        z: gridPos.z * CONFIG.cellSize - offset
    };
}
```

### Entity Management

Each entity type has consistent management patterns:

```javascript
// Creation
function createEntity(params) {
    const mesh = new THREE.Group();
    // ... build mesh
    scene.add(mesh);
    return { ...params, mesh };
}

// Update
function updateEntity(entity, deltaTime) {
    // Update logic
    // Update mesh position/rotation
}

// Cleanup
function clearEntities() {
    entities.forEach(e => scene.remove(e.mesh));
    entities = [];
}
```

---

## Rendering Pipeline

### Scene Setup
```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.Fog(0x050510, 80, 200);

const camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 2000);
camera.position.set(0, 90, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

### Layer System
```
Layer 0: Ground plane and grid
Layer 1: Obstacles (asteroids)
Layer 2: Food (stars) and Power-ups
Layer 3: Dragons (player and AI)
Layer 4: Particles and effects
Layer 5: Cosmic events
Background: Star field and nebulae
```

### Camera System
```javascript
const cameraTarget = new THREE.Vector3(0, 0, 0);
const cameraOffset = new THREE.Vector3(0, 45, 35);

function updateCamera() {
    const head = gameState.snake[0];
    const worldPos = gridToWorld(head);

    // Smooth lerp following
    cameraTarget.lerp(new THREE.Vector3(worldPos.x, 0, worldPos.z), 0.08);

    camera.position.x = cameraTarget.x + cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraTarget.z + cameraOffset.z;

    camera.lookAt(cameraTarget.x, 0, cameraTarget.z);
}
```

---

## Game Loop

### Main Loop Structure
```javascript
function animate(currentTime) {
    requestAnimationFrame(animate);

    if (gameState.isRunning) {
        // 1. Update game logic
        updateEffects();
        updateCamera();

        // 2. Move player (time-based)
        if (currentTime - gameState.lastMoveTime >= gameState.speed) {
            moveSnake();
            gameState.lastMoveTime = currentTime;
        }

        // 3. Update AI
        gameState.aiSnakes.forEach(ai => moveAISnake(ai, currentTime));

        // 4. Spawn power-ups
        if (currentTime - gameState.lastPowerUpSpawn >= CONFIG.powerUpSpawnInterval) {
            spawnPowerUp();
            gameState.lastPowerUpSpawn = currentTime;
        }

        // 5. Update animations
        updateFoodAnimations(currentTime);
        updateObstacleAnimations(currentTime);

        // 6. Update cosmic events
        updateCosmicEvents(currentTime);

        // 7. Trigger random events
        if (shouldTriggerEvent(currentTime)) {
            triggerRandomCosmicEvent();
        }
    }

    // 8. Update particles (always)
    updateParticles();

    // 9. Rotate star field
    starField.rotation.y += 0.0001;

    // 10. Render
    renderer.render(scene, camera);
}
```

### Timing System
- Uses `requestAnimationFrame` for smooth 60fps
- Game logic uses millisecond timestamps
- Movement is time-gated, not frame-gated

---

## State Management

### Game State Object
```javascript
const gameState = {
    // Player state
    snake: [],                    // Array of {x, z} grid positions
    direction: { x: 1, y: 0, z: 0 },
    nextDirection: { x: 1, y: 0, z: 0 },

    // Game progression
    score: 0,
    speed: CONFIG.initialSpeed,
    baseSpeed: CONFIG.initialSpeed,
    isRunning: false,

    // Timing
    lastMoveTime: 0,
    lastPowerUpSpawn: 0,
    lastFoodTime: 0,
    lastEventTime: 0,

    // Entities
    foods: [],
    powerUps: [],
    obstacles: [],
    aiSnakes: [],

    // Active effects
    activeEffects: {},

    // Statistics
    foodEaten: 0,
    powerUpsCollected: 0,
    maxLength: 0,
    combo: 0,
    aiKills: 0,

    // Cosmic events
    blackHoles: [],
    eventMeshes: [],
};
```

### Effect System
```javascript
// Set effect with expiration timestamp
gameState.activeEffects.invincible = Date.now() + CONFIG.powerUpDuration;

// Check if effect is active
function hasEffect(effect) {
    return gameState.activeEffects[effect] && Date.now() < gameState.activeEffects[effect];
}
```

---

## Collision Detection

### Grid-Based Detection
All collision uses simple grid position comparison:

```javascript
function checkCollision(pos) {
    const invincible = hasEffect('invincible');

    // Boundary check
    if (!invincible) {
        if (pos.x < 0 || pos.x >= CONFIG.gridSize ||
            pos.z < 0 || pos.z >= CONFIG.gridSize) {
            return true;
        }
    }

    // Self collision
    if (!invincible) {
        for (let i = 0; i < gameState.snake.length - 1; i++) {
            if (gameState.snake[i].x === pos.x &&
                gameState.snake[i].z === pos.z) {
                return true;
            }
        }
    }

    // Obstacle collision
    if (!invincible) {
        for (const obs of gameState.obstacles) {
            if (obs.x === pos.x && obs.z === pos.z) {
                return true;
            }
        }
    }

    return false;
}
```

### Occupied Position Tracking
```javascript
function getValidPosition() {
    const occupied = new Set();

    gameState.snake.forEach(s => occupied.add(`${s.x},${s.z}`));
    gameState.obstacles.forEach(o => occupied.add(`${o.x},${o.z}`));
    gameState.powerUps.forEach(p => occupied.add(`${p.x},${p.z}`));
    gameState.foods.forEach(f => occupied.add(`${f.x},${f.z}`));
    gameState.aiSnakes.forEach(ai => {
        ai.segments.forEach(s => occupied.add(`${s.x},${s.z}`));
    });

    let x, z, attempts = 0;
    do {
        x = Math.floor(Math.random() * CONFIG.gridSize);
        z = Math.floor(Math.random() * CONFIG.gridSize);
        attempts++;
    } while (occupied.has(`${x},${z}`) && attempts < 100);

    return { x, z };
}
```

---

## AI System Design

### Pathfinding Algorithm
The AI uses a greedy algorithm with safety checks:

```javascript
function getAIDirection(aiSnake) {
    const head = aiSnake.segments[0];

    // Find nearest food
    let nearestFood = null;
    let minDist = Infinity;
    gameState.foods.forEach(food => {
        const dist = Math.abs(food.x - head.x) + Math.abs(food.z - head.z);
        if (dist < minDist) {
            minDist = dist;
            nearestFood = food;
        }
    });

    // Get all possible directions
    const directions = [
        { x: 1, z: 0 },
        { x: -1, z: 0 },
        { x: 0, z: 1 },
        { x: 0, z: -1 },
    ];

    // Filter safe directions
    const safeDirs = directions.filter(dir => {
        // Can't reverse
        if (dir.x === -aiSnake.direction.x && dir.z === -aiSnake.direction.z) {
            return false;
        }

        const newX = head.x + dir.x;
        const newZ = head.z + dir.z;

        // Check boundaries
        if (newX < 0 || newX >= CONFIG.gridSize ||
            newZ < 0 || newZ >= CONFIG.gridSize) {
            return false;
        }

        // Check self collision
        // Check player collision
        // Check other AI collision
        // Check obstacle collision

        return true;
    });

    // Random factor for unpredictability
    if (Math.random() < CONFIG.aiRandomness) {
        return safeDirs[Math.floor(Math.random() * safeDirs.length)];
    }

    // Choose direction closest to food
    if (nearestFood && safeDirs.length > 0) {
        safeDirs.sort((a, b) => {
            const distA = Math.abs((head.x + a.x) - nearestFood.x) +
                         Math.abs((head.z + a.z) - nearestFood.z);
            const distB = Math.abs((head.x + b.x) - nearestFood.x) +
                         Math.abs((head.z + b.z) - nearestFood.z);
            return distA - distB;
        });
        return safeDirs[0];
    }

    return safeDirs[0] || aiSnake.direction;
}
```

### AI State Machine
```
States:
┌─────────┐     death      ┌──────────┐
│  ALIVE  │ ──────────────>│   DEAD   │
└─────────┘                 └──────────┘
     ^                           │
     │         5 seconds         │
     └───────────────────────────┘
                respawn
```

---

## Event System Design

### Event Architecture
```javascript
// Event definition
const COSMIC_EVENTS = {
    SUPERNOVA: { name: 'Supernova', duration: 3000, ... },
    BLACK_HOLE: { name: 'Black Hole', duration: 8000, ... },
    // ...
};

// Weighted random selection
function triggerRandomCosmicEvent() {
    const events = [
        { fn: triggerSupernova, weight: 15 },
        { fn: triggerBlackHole, weight: 10 },
        { fn: triggerMeteorShower, weight: 20 },
        { fn: triggerWormhole, weight: 10 },
        { fn: triggerStellarBlessing, weight: 25 },
        { fn: triggerCosmicStorm, weight: 20 },
    ];

    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    for (const event of events) {
        random -= event.weight;
        if (random <= 0) {
            event.fn();
            return;
        }
    }
}
```

### Event Mesh Management
```javascript
gameState.eventMeshes.push({
    mesh: threeMesh,
    type: 'supernova_ring',
    startTime: Date.now(),
    duration: 2000,
    expandSpeed: 0.8
});

function updateCosmicEvents(currentTime) {
    for (let i = gameState.eventMeshes.length - 1; i >= 0; i--) {
        const event = gameState.eventMeshes[i];
        const elapsed = Date.now() - event.startTime;
        const progress = elapsed / event.duration;

        if (progress >= 1) {
            scene.remove(event.mesh);
            gameState.eventMeshes.splice(i, 1);
            continue;
        }

        // Type-specific updates
        switch (event.type) {
            case 'supernova_ring':
                event.mesh.scale.setScalar(1 + progress * event.expandSpeed * 30);
                event.mesh.material.opacity = 0.8 * (1 - progress);
                break;
            // ... other types
        }
    }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Grid-Based Collision**: O(1) lookup with Set
2. **Object Pooling**: Particles reuse geometry
3. **Mesh Cleanup**: Automatic removal of expired effects
4. **Limited Particle Count**: Max ~500 active particles
5. **LOD for Background**: Simple star points vs complex meshes

### Memory Management
```javascript
// Cleanup pattern
function clearEntities() {
    entities.forEach(e => {
        scene.remove(e.mesh);
        // Dispose geometry and materials if needed
        if (e.mesh.geometry) e.mesh.geometry.dispose();
        if (e.mesh.material) e.mesh.material.dispose();
    });
    entities = [];
}
```

### Render Optimization
- Shadow maps limited to 4096x4096
- Fog culls distant objects
- No post-processing effects
- Efficient material reuse

---

## Future Considerations

### Potential Improvements
1. Web Workers for AI pathfinding
2. Instanced rendering for particles
3. Texture atlases for UI
4. Sound system integration
5. Mobile touch controls
6. Multiplayer support via WebSocket

### Code Organization
Future refactoring could split into modules:
- `config.js` - Game configuration
- `entities/dragon.js` - Dragon management
- `entities/ai.js` - AI system
- `systems/particles.js` - Particle system
- `systems/events.js` - Cosmic events
- `ui/` - UI components

---

*Document version: 1.0.0*
*Last updated: February 2026*
