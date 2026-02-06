import * as THREE from 'three';

// ==================== Game Configuration ====================
const CONFIG = {
    gridSize: 100,             // Large map
    cellSize: 1,
    initialSpeed: 150,         // Friendly starting speed
    speedIncrease: 0.5,        // Gradual speed increase
    minSpeed: 80,              // Maximum speed limit
    powerUpDuration: 12000,    // Long power-up duration
    powerUpSpawnInterval: 1500, // Frequent power-up spawns
    obstacleCount: 10,         // Obstacle count
    goldenFoodChance: 0.35,    // Golden food chance
    goldenFoodTimeout: 15000,  // Golden food duration

    // AI Snake config
    aiSnakeCount: 6,           // AI snake count
    aiSpeed: 200,              // AI speed
    aiRandomness: 0.25,        // AI randomness
    foodCount: 30,             // Food count
};

// ==================== AI Dragon Colors ====================
const AI_COLORS = [
    { head: 0xe11d48, body: 0xfb7185, name: 'Red Dragon' },
    { head: 0x7c3aed, body: 0xa78bfa, name: 'Purple Dragon' },
    { head: 0x0891b2, body: 0x22d3ee, name: 'Ice Dragon' },
    { head: 0xf59e0b, body: 0xfbbf24, name: 'Gold Dragon' },
];

// ==================== Power-up Types ====================
const POWER_UP_TYPES = {
    SPEED_BOOST: { name: 'Speed', color: 0xff6b6b, effect: 'speed_boost', icon: '⚡', weight: 10 },
    SLOW_MO: { name: 'Slow', color: 0x4ecdc4, effect: 'slow_mo', icon: '🐢', weight: 15 },
    INVINCIBLE: { name: 'Invincible', color: 0xffe66d, effect: 'invincible', icon: '⭐', weight: 20 },
    DOUBLE_SCORE: { name: 'Double', color: 0xa855f7, effect: 'double_score', icon: '✖2', weight: 15 },
    SHRINK: { name: 'Shrink', color: 0x22d3ee, effect: 'shrink', icon: '📉', weight: 10 },
    MAGNET: { name: 'Magnet', color: 0xec4899, effect: 'magnet', icon: '🧲', weight: 15 },
    FIRE_BREATH: { name: 'Fire', color: 0xff4500, effect: 'fire_breath', icon: '🔥', weight: 20 },
    SHIELD: { name: 'Shield', color: 0x3b82f6, effect: 'shield', icon: '🛡️', weight: 15 },
    BONUS: { name: 'Bonus', color: 0x10b981, effect: 'bonus', icon: '🎁', weight: 15 },
    REVERSE: { name: 'Reverse', color: 0x6b7280, effect: 'reverse', icon: '🔄', weight: 3 },
    BOMB: { name: 'Bomb', color: 0x1f2937, effect: 'bomb', icon: '💣', weight: 2 }
};

// Encouragement messages
const ENCOURAGEMENTS = [
    'Awesome! 🎉',
    'Amazing! 💪',
    'Keep going! 🔥',
    'Unstoppable! ⭐',
    'Perfect! ✨',
    'Nice one! 👏',
    'Incredible! 🏆',
    'Dragon Power! 🐉',
];

// ==================== Cosmic Event Types ====================
const COSMIC_EVENTS = {
    SUPERNOVA: { name: 'Supernova', icon: '💥', color: 0xffaa00, duration: 3000 },
    BLACK_HOLE: { name: 'Black Hole', icon: '🕳️', color: 0x330066, duration: 8000 },
    METEOR_SHOWER: { name: 'Meteor Shower', icon: '☄️', color: 0xff6644, duration: 5000 },
    WORMHOLE: { name: 'Wormhole', icon: '🌀', color: 0x00ffff, duration: 2000 },
    STELLAR_BLESSING: { name: 'Stellar Blessing', icon: '✨', color: 0xffdd00, duration: 1000 },
    COSMIC_STORM: { name: 'Cosmic Storm', icon: '🌪️', color: 0x8844ff, duration: 6000 },
};

// ==================== Game State ====================
const gameState = {
    snake: [],
    direction: { x: 1, y: 0, z: 0 },
    nextDirection: { x: 1, y: 0, z: 0 },
    foods: [],
    score: 0,
    speed: CONFIG.initialSpeed,
    baseSpeed: CONFIG.initialSpeed,
    isRunning: false,
    lastMoveTime: 0,
    lastPowerUpSpawn: 0,
    aiSnakes: [],
    powerUps: [],
    activeEffects: {},
    obstacles: [],
    foodEaten: 0,
    powerUpsCollected: 0,
    maxLength: 0,
    combo: 0,
    lastFoodTime: 0,
    aiKills: 0,
    // Cosmic events
    lastEventTime: 0,
    activeEvent: null,
    blackHoles: [],
    eventMeshes: [],
};

// ==================== Three.js Setup ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.Fog(0x050510, 80, 200);

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(0, 90, 70);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ==================== Space Nebula Background ====================
function createStarField() {
    // 创建星星
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        // 星星位置 - 球形分布
        const radius = 150 + Math.random() * 350;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = radius * Math.cos(phi) * 0.5 + 50; // 偏向上方
        starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // 星星颜色 - 白色、蓝色、黄色混合
        const colorType = Math.random();
        if (colorType < 0.6) {
            // 白色星星
            starColors[i * 3] = 0.9 + Math.random() * 0.1;
            starColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
            starColors[i * 3 + 2] = 1;
        } else if (colorType < 0.8) {
            // 蓝色星星
            starColors[i * 3] = 0.6;
            starColors[i * 3 + 1] = 0.8;
            starColors[i * 3 + 2] = 1;
        } else {
            // 黄/橙色星星
            starColors[i * 3] = 1;
            starColors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
            starColors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
        }

        starSizes[i] = 0.5 + Math.random() * 2;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    return stars;
}

function createNebula() {
    // 创建多个星云层
    const nebulaColors = [
        { color: 0x4a0080, opacity: 0.15 },  // 紫色
        { color: 0x000080, opacity: 0.12 },  // 深蓝
        { color: 0x800040, opacity: 0.1 },   // 暗红
        { color: 0x004060, opacity: 0.1 },   // 青色
    ];

    nebulaColors.forEach((nebula, index) => {
        const geometry = new THREE.PlaneGeometry(400, 400);
        const material = new THREE.MeshBasicMaterial({
            color: nebula.color,
            transparent: true,
            opacity: nebula.opacity,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(
            (Math.random() - 0.5) * 100,
            80 + index * 30,
            (Math.random() - 0.5) * 100 - 100
        );
        plane.rotation.x = -Math.PI / 4 + Math.random() * 0.5;
        plane.rotation.z = Math.random() * Math.PI;
        scene.add(plane);
    });

    // 添加一些发光的星云核心
    for (let i = 0; i < 8; i++) {
        const glowGeometry = new THREE.SphereGeometry(15 + Math.random() * 25, 16, 16);
        const glowColor = [0x6633ff, 0x3366ff, 0xff3366, 0x33ffcc][Math.floor(Math.random() * 4)];
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: 0.05 + Math.random() * 0.05,
            depthWrite: false
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(
            (Math.random() - 0.5) * 300,
            60 + Math.random() * 100,
            (Math.random() - 0.5) * 300 - 50
        );
        scene.add(glow);
    }
}

const starField = createStarField();
createNebula();

// ==================== Lighting ====================
const ambientLight = new THREE.AmbientLight(0x6666aa, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xaabbff, 0.7);
directionalLight.position.set(50, 80, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.left = -60;
directionalLight.shadow.camera.right = 60;
directionalLight.shadow.camera.top = 60;
directionalLight.shadow.camera.bottom = -60;
scene.add(directionalLight);

// 龙的光源
const dragonLight = new THREE.PointLight(0xff6600, 3, 20);
scene.add(dragonLight);

// ==================== Particle System ====================
const particles = [];
const fireParticles = [];

// 共享粒子几何体
const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
const fireParticleGeometry = new THREE.SphereGeometry(0.15, 6, 6);

function createParticle(position, color, count = 10, isFireParticle = false) {
    // 限制总粒子数
    if (particles.length > 100) return;

    const geometry = isFireParticle ? fireParticleGeometry : particleGeometry;
    const actualCount = Math.min(count, 15); // 限制每次创建数量

    for (let i = 0; i < actualCount; i++) {
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * (isFireParticle ? 0.4 : 0.25),
            Math.random() * 0.25 + 0.1,
            (Math.random() - 0.5) * (isFireParticle ? 0.4 : 0.25)
        );
        particle.life = 1.0;
        particle.isFireParticle = isFireParticle;
        scene.add(particle);
        particles.push(particle);
    }
}

// 龙息火焰效果
function createFireBreath(position, direction) {
    const colors = [0xff4500, 0xff6600, 0xffaa00, 0xffff00];

    for (let i = 0; i < 8; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const geometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.9
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            direction.x * (0.3 + Math.random() * 0.2) + (Math.random() - 0.5) * 0.15,
            Math.random() * 0.15,
            direction.z * (0.3 + Math.random() * 0.2) + (Math.random() - 0.5) * 0.15
        );
        particle.life = 1.0;
        particle.isFireParticle = true;
        scene.add(particle);
        fireParticles.push(particle);
    }
}

function updateParticles() {
    // 普通粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.add(p.velocity);
        p.velocity.y -= 0.008;
        p.life -= p.isFireParticle ? 0.04 : 0.03;
        p.scale.setScalar(p.life);
        p.material.opacity = p.life;

        if (p.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }

    // 火焰粒子
    for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.position.add(p.velocity);
        p.velocity.y += 0.005; // 火焰上升
        p.life -= 0.05;
        p.scale.setScalar(p.life * 1.5);
        p.material.opacity = p.life;

        // 颜色渐变
        const hue = 0.05 + (1 - p.life) * 0.05;
        p.material.color.setHSL(hue, 1, 0.5);

        if (p.life <= 0) {
            scene.remove(p);
            fireParticles.splice(i, 1);
        }
    }
}

// ==================== Cosmic Events System (Optimized) ====================
const cosmicEventParticles = [];

// 共享几何体 - 避免重复创建
const sharedGeometries = {
    smallSphere: new THREE.SphereGeometry(0.15, 6, 6),
    mediumSphere: new THREE.SphereGeometry(0.5, 8, 8),
    ring: new THREE.RingGeometry(0.5, 1, 16),
};

// 超新星爆发效果（优化版）
function triggerSupernova() {
    const pos = getValidPosition();
    const worldPos = gridToWorld(pos);
    const center = new THREE.Vector3(worldPos.x, 2, worldPos.z);

    showNotification('💥 Supernova!', COSMIC_EVENTS.SUPERNOVA.color);

    // 创建超新星核心 - 使用低多边形
    const coreGeometry = new THREE.SphereGeometry(1, 12, 12);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.copy(center);
    scene.add(core);
    gameState.eventMeshes.push({ mesh: core, type: 'supernova', startTime: Date.now(), duration: 2000 });

    // 只创建1个爆发波（减少3个到1个）
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(sharedGeometries.ring, ringMaterial);
    ringMesh.position.copy(center);
    ringMesh.rotation.x = -Math.PI / 2;
    scene.add(ringMesh);
    gameState.eventMeshes.push({
        mesh: ringMesh,
        type: 'supernova_ring',
        startTime: Date.now(),
        duration: 1500,
        expandSpeed: 1.2
    });

    // 减少粒子数量（100 -> 20）并分批创建
    const colors = [0xffff00, 0xff8800, 0xff4400];
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 0.4;
        const material = new THREE.MeshBasicMaterial({
            color: colors[i % 3],
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(sharedGeometries.smallSphere, material);
        particle.position.copy(center);
        particle.velocity = new THREE.Vector3(
            Math.cos(angle) * speed,
            0.1,
            Math.sin(angle) * speed
        );
        particle.life = 1.0;
        scene.add(particle);
        cosmicEventParticles.push(particle);
    }

    // 超新星效果：杀死范围内的AI蛇
    setTimeout(() => {
        const blastRadius = 20;
        let killCount = 0;

        gameState.aiSnakes.forEach(ai => {
            if (!ai.alive) return;
            const aiPos = gridToWorld(ai.segments[0]);
            const dx = aiPos.x - worldPos.x;
            const dz = aiPos.z - worldPos.z;
            if (dx * dx + dz * dz < blastRadius * blastRadius) {
                killAISnake(ai, performance.now());
                killCount++;
            }
        });

        if (killCount > 0) {
            gameState.score += killCount * 100;
            gameState.aiKills += killCount;
            showNotification(`Supernova killed ${killCount} dragons! +${killCount * 100}`, 0xff4400);
            updateScore();
        }

        // 生成额外食物（减少到3个）
        for (let i = 0; i < 3; i++) {
            spawnFood();
        }
    }, 400);
}

// 黑洞效果（优化版）
function triggerBlackHole() {
    const pos = getValidPosition();
    const worldPos = gridToWorld(pos);

    showNotification('🕳️ Black Hole!', COSMIC_EVENTS.BLACK_HOLE.color);

    // 创建简化的黑洞视觉效果
    const blackHoleGroup = new THREE.Group();

    // 事件视界（黑色核心）- 低多边形
    const eventHorizonGeometry = new THREE.SphereGeometry(1.5, 12, 12);
    const eventHorizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eventHorizon = new THREE.Mesh(eventHorizonGeometry, eventHorizonMaterial);
    blackHoleGroup.add(eventHorizon);

    // 吸积盘 - 减少面数
    const diskGeometry = new THREE.RingGeometry(2, 4, 24);
    const diskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.rotation.x = -Math.PI / 2.5;
    blackHoleGroup.add(disk);

    // 只保留1个光晕（减少3个到1个）
    const glowGeometry = new THREE.RingGeometry(4, 5.5, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x6600ff,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    blackHoleGroup.add(glow);

    blackHoleGroup.position.set(worldPos.x, 1, worldPos.z);
    scene.add(blackHoleGroup);

    gameState.blackHoles.push({
        mesh: blackHoleGroup,
        gridPos: pos,
        worldPos: new THREE.Vector3(worldPos.x, 1, worldPos.z),
        startTime: Date.now(),
        duration: COSMIC_EVENTS.BLACK_HOLE.duration,
        radius: 12,
        lastParticleTime: 0
    });
}

// 更新黑洞效果（优化版）
function updateBlackHoles(currentTime) {
    for (let i = gameState.blackHoles.length - 1; i >= 0; i--) {
        const bh = gameState.blackHoles[i];
        const elapsed = Date.now() - bh.startTime;

        if (elapsed > bh.duration) {
            scene.remove(bh.mesh);
            gameState.blackHoles.splice(i, 1);
            showNotification('Black Hole vanished', 0x6644aa);
            continue;
        }

        // 旋转吸积盘
        bh.mesh.children[1].rotation.z += 0.03;
        bh.mesh.rotation.y += 0.01;

        // 每5帧才检测一次吸引效果（降低CPU负载）
        if (Math.floor(currentTime / 80) % 5 !== 0) continue;

        // 黑洞吸引食物（简化逻辑）
        for (let j = gameState.foods.length - 1; j >= 0; j--) {
            const food = gameState.foods[j];
            const foodWorld = gridToWorld(food);
            const dx = bh.worldPos.x - foodWorld.x;
            const dz = bh.worldPos.z - foodWorld.z;
            const distSq = dx * dx + dz * dz;

            if (distSq <= 4) {
                // 被吞噬
                scene.remove(food.mesh);
                gameState.foods.splice(j, 1);
            } else if (distSq < bh.radius * bh.radius && Math.random() < 0.2) {
                // 被吸引
                food.x += Math.sign(dx);
                food.z += Math.sign(dz);
                food.x = Math.max(0, Math.min(CONFIG.gridSize - 1, food.x));
                food.z = Math.max(0, Math.min(CONFIG.gridSize - 1, food.z));
                const newWorldPos = gridToWorld(food);
                food.mesh.position.x = newWorldPos.x;
                food.mesh.position.z = newWorldPos.z;
            }
        }

        // 黑洞吸引AI蛇
        gameState.aiSnakes.forEach(ai => {
            if (!ai.alive) return;
            const aiWorld = gridToWorld(ai.segments[0]);
            const dx = bh.worldPos.x - aiWorld.x;
            const dz = bh.worldPos.z - aiWorld.z;
            if (dx * dx + dz * dz <= 9) {
                killAISnake(ai, performance.now());
                gameState.score += 80;
                gameState.aiKills++;
                showNotification(`Black Hole swallowed ${ai.color.name}! +80`, 0x6600ff);
                updateScore();
            }
        });

        // 玩家与黑洞交互
        if (gameState.snake.length > 0 && hasEffect('invincible')) {
            const head = gameState.snake[0];
            const headWorld = gridToWorld(head);
            const dx = bh.worldPos.x - headWorld.x;
            const dz = bh.worldPos.z - headWorld.z;
            if (dx * dx + dz * dz <= 9) {
                gameState.score += 200;
                showNotification('Conquered Black Hole! +200', 0xffd700);
                updateScore();
                scene.remove(bh.mesh);
                gameState.blackHoles.splice(i, 1);
                createParticle(bh.worldPos, 0xffd700, 10);
            }
        }

        // 大幅减少粒子生成频率
        if (currentTime - bh.lastParticleTime > 500 && cosmicEventParticles.length < 30) {
            bh.lastParticleTime = currentTime;
            const angle = Math.random() * Math.PI * 2;
            const material = new THREE.MeshBasicMaterial({
                color: 0x6600ff,
                transparent: true,
                opacity: 0.7
            });
            const particle = new THREE.Mesh(sharedGeometries.smallSphere, material);
            particle.position.set(
                bh.worldPos.x + Math.cos(angle) * 8,
                1,
                bh.worldPos.z + Math.sin(angle) * 8
            );
            particle.targetPos = bh.worldPos.clone();
            particle.life = 1.0;
            particle.isBlackHoleParticle = true;
            scene.add(particle);
            cosmicEventParticles.push(particle);
        }
    }
}

// 流星雨（优化版）
function triggerMeteorShower() {
    showNotification('☄️ Meteor Shower!', COSMIC_EVENTS.METEOR_SHOWER.color);

    // 减少流星数量（8-13 -> 4-6）
    const meteorCount = 4 + Math.floor(Math.random() * 3);

    // 共享几何体
    const meteorGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const tailGeometry = new THREE.ConeGeometry(0.3, 1.5, 6);

    for (let i = 0; i < meteorCount; i++) {
        // 增加间隔时间，分散创建压力
        setTimeout(() => {
            const targetPos = getValidPosition();
            const targetWorld = gridToWorld(targetPos);

            const meteorGroup = new THREE.Group();

            const meteorMaterial = new THREE.MeshBasicMaterial({ color: 0xff6644 });
            const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
            meteorGroup.add(meteor);

            const tailMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa44,
                transparent: true,
                opacity: 0.5
            });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.rotation.x = Math.PI;
            tail.position.y = 1;
            meteorGroup.add(tail);

            meteorGroup.position.set(targetWorld.x, 40, targetWorld.z);
            meteorGroup.targetPos = new THREE.Vector3(targetWorld.x, 0.5, targetWorld.z);
            meteorGroup.targetGridPos = targetPos;
            scene.add(meteorGroup);

            gameState.eventMeshes.push({
                mesh: meteorGroup,
                type: 'meteor',
                startTime: Date.now(),
                duration: 1500
            });
        }, i * 400);
    }
}

// 虫洞传送
function triggerWormhole() {
    if (gameState.snake.length === 0) return;

    showNotification('🌀 Wormhole!', COSMIC_EVENTS.WORMHOLE.color);

    const head = gameState.snake[0];
    const oldWorldPos = gridToWorld(head);

    // 创建入口虫洞效果
    createWormholeEffect(oldWorldPos, 0x00ffff);

    // 延迟后传送
    setTimeout(() => {
        // 找到安全的传送目的地
        let newPos;
        let attempts = 0;
        do {
            newPos = {
                x: Math.floor(Math.random() * (CONFIG.gridSize - 10)) + 5,
                z: Math.floor(Math.random() * (CONFIG.gridSize - 10)) + 5
            };
            attempts++;
        } while (attempts < 50 && (
            Math.abs(newPos.x - head.x) < 20 ||
            gameState.obstacles.some(o => o.x === newPos.x && o.z === newPos.z)
        ));

        // 传送蛇
        const dx = newPos.x - head.x;
        const dz = newPos.z - head.z;

        gameState.snake.forEach(seg => {
            seg.x += dx;
            seg.z += dz;
            // 边界检查
            seg.x = Math.max(0, Math.min(CONFIG.gridSize - 1, seg.x));
            seg.z = Math.max(0, Math.min(CONFIG.gridSize - 1, seg.z));
        });

        const newWorldPos = gridToWorld(gameState.snake[0]);
        createWormholeEffect(newWorldPos, 0xff00ff);

        updateSnakeMeshes();
        showNotification('Teleport complete!', 0x00ff00);

        // 传送奖励
        gameState.score += 50;
        updateScore();
    }, 500);
}

function createWormholeEffect(worldPos, color) {
    // 只创建1个虫洞环（减少3个到1个）
    const ringGeometry = new THREE.RingGeometry(0.8, 2, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(worldPos.x, 0.5, worldPos.z);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);

    gameState.eventMeshes.push({
        mesh: ring,
        type: 'wormhole',
        startTime: Date.now(),
        duration: 1200,
        rotateSpeed: 0.15
    });

    // 减少粒子（30 -> 8）
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(sharedGeometries.smallSphere, material);
        particle.position.set(
            worldPos.x + Math.cos(angle) * 1.5,
            0.5,
            worldPos.z + Math.sin(angle) * 1.5
        );
        particle.velocity = new THREE.Vector3(0, 0.15, 0);
        particle.life = 1.0;
        scene.add(particle);
        cosmicEventParticles.push(particle);
    }
}

// 恒星祝福（优化版）
function triggerStellarBlessing() {
    showNotification('✨ Stellar Blessing! +100', COSMIC_EVENTS.STELLAR_BLESSING.color);

    gameState.score += 100;
    gameState.activeEffects.double_score = Date.now() + 10000;
    updateScore();

    // 减少食物生成（8 -> 4）
    for (let i = 0; i < 4; i++) {
        spawnFood();
    }

    // 只创建1个光柱（减少5个到1个）
    if (gameState.snake.length > 0) {
        const head = gameState.snake[0];
        const worldPos = gridToWorld(head);

        const beamGeometry = new THREE.CylinderGeometry(0.2, 0.5, 15, 6);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            transparent: true,
            opacity: 0.35
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(worldPos.x, 8, worldPos.z);
        scene.add(beam);

        gameState.eventMeshes.push({
            mesh: beam,
            type: 'blessing',
            startTime: Date.now(),
            duration: 1500
        });

        // 减少粒子（50 -> 10）
        createParticle(new THREE.Vector3(worldPos.x, 3, worldPos.z), 0xffdd00, 10);
    }

    setTimeout(() => showNotification('Double Score 10s!', 0xffdd00), 400);
}

// 宇宙风暴（优化版）
function triggerCosmicStorm() {
    showNotification('🌪️ Cosmic Storm!', COSMIC_EVENTS.COSMIC_STORM.color);

    gameState.activeEffects.speed_boost = Date.now() + 6000;

    gameState.aiSnakes.forEach(ai => {
        ai.speed = ai.speed * 1.5;
    });

    // 减少粒子（20 -> 8）
    const stormCenter = gameState.snake.length > 0 ? gridToWorld(gameState.snake[0]) : { x: 0, z: 0 };

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 8 + Math.random() * 5;
        const material = new THREE.MeshBasicMaterial({
            color: 0x8844ff,
            transparent: true,
            opacity: 0.5
        });
        const particle = new THREE.Mesh(sharedGeometries.smallSphere, material);
        particle.position.set(
            stormCenter.x + Math.cos(angle) * radius,
            1 + Math.random() * 3,
            stormCenter.z + Math.sin(angle) * radius
        );
        particle.orbitCenter = new THREE.Vector3(stormCenter.x, 0, stormCenter.z);
        particle.orbitRadius = radius;
        particle.orbitAngle = angle;
        particle.orbitSpeed = 0.03;
        particle.life = 1.0;
        particle.isStormParticle = true;
        scene.add(particle);
        cosmicEventParticles.push(particle);
    }

    setTimeout(() => {
        gameState.aiSnakes.forEach(ai => {
            ai.speed = CONFIG.aiSpeed + Math.random() * 60;
        });
        showNotification('Storm subsided', 0x8844ff);
    }, 6000);
}

// 随机触发宇宙事件
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
    events[0].fn();
}

// 更新宇宙事件效果
function updateCosmicEvents(currentTime) {
    // 更新事件网格（超新星波、流星等）
    for (let i = gameState.eventMeshes.length - 1; i >= 0; i--) {
        const event = gameState.eventMeshes[i];
        const elapsed = Date.now() - event.startTime;
        const progress = elapsed / event.duration;

        if (progress >= 1) {
            scene.remove(event.mesh);
            gameState.eventMeshes.splice(i, 1);
            continue;
        }

        switch (event.type) {
            case 'supernova':
                // 超新星核心膨胀后消失
                const scale = 1 + progress * 5;
                event.mesh.scale.setScalar(scale);
                event.mesh.material.opacity = 1 - progress;
                break;

            case 'supernova_ring':
                // 爆发波扩展
                const ringScale = 1 + progress * event.expandSpeed * 30;
                event.mesh.scale.setScalar(ringScale);
                event.mesh.material.opacity = 0.8 * (1 - progress);
                break;

            case 'meteor':
                // 流星落下
                if (event.mesh.position.y > 0.5) {
                    event.mesh.position.lerp(event.mesh.targetPos, 0.1);
                    event.mesh.rotation.x += 0.08;
                } else if (!event.landed) {
                    event.landed = true;
                    // 落地生成食物
                    const pos = event.mesh.targetGridPos;
                    if (pos && !gameState.foods.find(f => f.x === pos.x && f.z === pos.z)) {
                        const isGolden = Math.random() < 0.5;
                        const mesh = createStarModel(isGolden);
                        const worldPos = gridToWorld(pos);
                        mesh.position.set(worldPos.x, 0.5, worldPos.z);
                        scene.add(mesh);
                        gameState.foods.push({
                            x: pos.x,
                            z: pos.z,
                            isGolden,
                            spawnTime: Date.now(),
                            mesh
                        });
                    }
                    // 减少落地粒子（15 -> 5）
                    createParticle(event.mesh.position, 0xff6644, 5);
                }
                break;

            case 'wormhole':
                event.mesh.rotation.z += event.rotateSpeed;
                event.mesh.material.opacity = 0.7 * (1 - progress);
                const wormholeScale = 1 + progress * 0.5;
                event.mesh.scale.setScalar(wormholeScale);
                break;

            case 'blessing':
                event.mesh.material.opacity = 0.4 * (1 - progress);
                event.mesh.position.y += 0.05;
                break;
        }
    }

    // 更新黑洞
    updateBlackHoles(currentTime);

    // 更新宇宙事件粒子（优化版 - 限制数量和加速衰减）
    // 如果粒子过多，加速清理
    const fastDecay = cosmicEventParticles.length > 50;

    for (let i = cosmicEventParticles.length - 1; i >= 0; i--) {
        const p = cosmicEventParticles[i];
        const decayRate = fastDecay ? 0.05 : 0.025;

        if (p.isBlackHoleParticle && p.targetPos) {
            p.position.lerp(p.targetPos, 0.08);
            p.life -= decayRate;
        } else if (p.isStormParticle) {
            p.orbitAngle += p.orbitSpeed;
            p.position.x = p.orbitCenter.x + Math.cos(p.orbitAngle) * p.orbitRadius;
            p.position.z = p.orbitCenter.z + Math.sin(p.orbitAngle) * p.orbitRadius;
            p.life -= 0.012;
        } else {
            p.position.add(p.velocity);
            p.velocity.y -= 0.008;
            p.life -= decayRate;
        }

        p.material.opacity = p.life;
        p.scale.setScalar(Math.max(0.1, p.life));

        if (p.life <= 0) {
            scene.remove(p);
            cosmicEventParticles.splice(i, 1);
        }
    }
}

// 清理宇宙事件
function clearCosmicEvents() {
    gameState.eventMeshes.forEach(e => scene.remove(e.mesh));
    gameState.eventMeshes = [];

    gameState.blackHoles.forEach(bh => scene.remove(bh.mesh));
    gameState.blackHoles = [];

    cosmicEventParticles.forEach(p => scene.remove(p));
    cosmicEventParticles.length = 0;
}

// ==================== Ground Grid ====================
function createGround() {
    const size = CONFIG.gridSize * CONFIG.cellSize;

    // 宇宙平台地面 - 半透明深空效果
    const groundGeometry = new THREE.PlaneGeometry(size, size);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a20,
        side: THREE.DoubleSide,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 星空网格线 - 发光蓝紫色
    const gridHelper = new THREE.GridHelper(size, CONFIG.gridSize, 0x4466aa, 0x1a1a40);
    gridHelper.position.y = -0.49;
    scene.add(gridHelper);

    // 边界 - 能量护盾风格
    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0x2244aa,
        emissive: 0x4488ff,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const borderHeight = 0.8;
    const halfSize = size / 2;

    const borders = [
        { pos: [0, 0.15, -halfSize], scale: [size + 0.4, borderHeight, 0.4] },
        { pos: [0, 0.15, halfSize], scale: [size + 0.4, borderHeight, 0.4] },
        { pos: [-halfSize, 0.15, 0], scale: [0.4, borderHeight, size] },
        { pos: [halfSize, 0.15, 0], scale: [0.4, borderHeight, size] },
    ];

    borders.forEach(({ pos, scale }) => {
        const geometry = new THREE.BoxGeometry(...scale);
        const border = new THREE.Mesh(geometry, borderMaterial);
        border.position.set(...pos);
        border.castShadow = true;
        scene.add(border);
    });
}

// ==================== Dragon 3D Model ====================
const snakeMeshes = [];
const dragonParts = { horns: [], spikes: [], tail: null };

function createDragonHead() {
    const group = new THREE.Group();

    // 头部主体
    const headGeometry = new THREE.BoxGeometry(1.0, 0.8, 1.2);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        emissive: 0x114411,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    group.add(head);

    // 龙角
    const hornGeometry = new THREE.ConeGeometry(0.12, 0.5, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4,
        metalness: 0.6
    });

    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-0.3, 0.5, -0.2);
    leftHorn.rotation.z = -0.3;
    leftHorn.rotation.x = -0.2;
    group.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.3, 0.5, -0.2);
    rightHorn.rotation.z = 0.3;
    rightHorn.rotation.x = -0.2;
    group.add(rightHorn);

    // 龙眼
    const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.8
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.35, 0.15, 0.4);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.35, 0.15, 0.4);
    group.add(rightEye);

    // 龙鼻
    const snoutGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
    const snout = new THREE.Mesh(snoutGeometry, headMaterial);
    snout.position.set(0, -0.1, 0.7);
    group.add(snout);

    // 鼻孔（喷火口）
    const nostrilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const nostrilMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: 0xff4400,
        emissiveIntensity: 0.5
    });

    const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    leftNostril.position.set(-0.15, 0, 0.9);
    group.add(leftNostril);

    const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    rightNostril.position.set(0.15, 0, 0.9);
    group.add(rightNostril);

    group.castShadow = true;
    return group;
}

function createDragonBody(index, total) {
    const group = new THREE.Group();

    // 身体主体
    const t = index / total;
    const size = 0.85 - t * 0.2;

    const bodyGeometry = new THREE.BoxGeometry(size, size * 0.9, size);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().lerpColors(
            new THREE.Color(0x32cd32),
            new THREE.Color(0x228b22),
            t
        ),
        emissive: 0x114411,
        emissiveIntensity: 0.2,
        metalness: 0.2,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // 背部尖刺
    if (index % 2 === 0) {
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.35, 6);
        const spikeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(0, size * 0.5 + 0.15, 0);
        group.add(spike);
    }

    // 鳞片纹理效果（用小块表示）
    const scaleGeometry = new THREE.BoxGeometry(size * 0.3, size * 0.15, 0.05);
    const scaleMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a5a1a,
        metalness: 0.4
    });

    [-1, 1].forEach(side => {
        const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
        scale.position.set(side * size * 0.4, 0, size * 0.3);
        scale.rotation.y = side * 0.3;
        group.add(scale);
    });

    group.castShadow = true;
    return group;
}

function createDragonTail() {
    const group = new THREE.Group();

    // 尾巴尖端
    const tailGeometry = new THREE.ConeGeometry(0.25, 0.8, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        emissive: 0x114411,
        emissiveIntensity: 0.2
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.rotation.x = Math.PI / 2;
    tail.position.z = -0.3;
    group.add(tail);

    // 尾巴装饰
    const tipGeometry = new THREE.OctahedronGeometry(0.2);
    const tipMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff4400,
        emissiveIntensity: 0.5
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.z = -0.7;
    group.add(tip);

    group.castShadow = true;
    return group;
}

function gridToWorld(gridPos) {
    const offset = (CONFIG.gridSize / 2) * CONFIG.cellSize - CONFIG.cellSize / 2;
    return {
        x: gridPos.x * CONFIG.cellSize - offset,
        y: 0,
        z: gridPos.z * CONFIG.cellSize - offset
    };
}

function updateSnakeMeshes() {
    const isInvincible = hasEffect('invincible');
    const hasFireBreath = hasEffect('fire_breath');

    // 移除多余的mesh
    while (snakeMeshes.length > gameState.snake.length) {
        const mesh = snakeMeshes.pop();
        scene.remove(mesh);
    }

    // 添加缺少的mesh
    while (snakeMeshes.length < gameState.snake.length) {
        let mesh;
        if (snakeMeshes.length === 0) {
            mesh = createDragonHead();
        } else if (snakeMeshes.length === gameState.snake.length - 1) {
            mesh = createDragonTail();
        } else {
            mesh = createDragonBody(snakeMeshes.length, gameState.snake.length);
        }
        scene.add(mesh);
        snakeMeshes.push(mesh);
    }

    // 更新位置和旋转
    gameState.snake.forEach((segment, index) => {
        const worldPos = gridToWorld(segment);
        snakeMeshes[index].position.set(worldPos.x, 0.1, worldPos.z);

        // 计算朝向
        if (index === 0) {
            // 头部朝向移动方向
            const angle = Math.atan2(gameState.direction.x, gameState.direction.z);
            snakeMeshes[index].rotation.y = angle;

            // 更新龙的光源
            dragonLight.position.set(worldPos.x, 1.5, worldPos.z);

            // 无敌效果
            if (isInvincible) {
                snakeMeshes[index].children.forEach(child => {
                    if (child.material) {
                        child.material.emissive = new THREE.Color(0xffd700);
                        child.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.01) * 0.3;
                    }
                });
                dragonLight.color.setHex(0xffd700);
            } else if (hasFireBreath) {
                dragonLight.color.setHex(0xff4400);
                dragonLight.intensity = 3;
            } else {
                dragonLight.color.setHex(0xff6600);
                dragonLight.intensity = 2;
            }
        } else if (index < gameState.snake.length - 1) {
            // 身体朝向下一节
            const next = gameState.snake[index + 1];
            const dx = segment.x - next.x;
            const dz = segment.z - next.z;
            snakeMeshes[index].rotation.y = Math.atan2(dx, dz);
        } else {
            // 尾巴
            const prev = gameState.snake[index - 1];
            const dx = prev.x - segment.x;
            const dz = prev.z - segment.z;
            snakeMeshes[index].rotation.y = Math.atan2(dx, dz);
        }

        // 轻微浮动动画
        snakeMeshes[index].position.y = 0.1 + Math.sin(Date.now() * 0.003 + index * 0.5) * 0.05;
    });
}

// ==================== AI Snake Management ====================
function createAISnake(colorIndex) {
    const color = AI_COLORS[colorIndex % AI_COLORS.length];

    const startPositions = [
        { x: 10, z: 10 },
        { x: 89, z: 89 },
        { x: 10, z: 89 },
        { x: 89, z: 10 },
        { x: 50, z: 10 },
        { x: 50, z: 89 },
        { x: 10, z: 50 },
        { x: 89, z: 50 },
    ];

    const startPos = startPositions[colorIndex % startPositions.length];

    const aiSnake = {
        segments: [
            { x: startPos.x, z: startPos.z },
            { x: startPos.x - 1, z: startPos.z },
            { x: startPos.x - 2, z: startPos.z },
        ],
        direction: { x: 1, z: 0 },
        color: color,
        meshes: [],
        lastMoveTime: 0,
        speed: CONFIG.aiSpeed + Math.random() * 60,
        alive: true,
        respawnTime: 0,
    };

    // 创建AI龙的mesh
    aiSnake.segments.forEach((seg, index) => {
        const group = new THREE.Group();

        if (index === 0) {
            // AI龙头
            const headGeometry = new THREE.BoxGeometry(0.9, 0.7, 1.0);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: color.head,
                emissive: color.head,
                emissiveIntensity: 0.3,
                metalness: 0.3
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            group.add(head);

            // 眼睛
            const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            [-0.25, 0.25].forEach(x => {
                const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                eye.position.set(x, 0.1, 0.4);
                group.add(eye);
            });

            // 小角
            const hornGeometry = new THREE.ConeGeometry(0.08, 0.3, 6);
            const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            [-0.2, 0.2].forEach(x => {
                const horn = new THREE.Mesh(hornGeometry, hornMaterial);
                horn.position.set(x, 0.45, -0.1);
                horn.rotation.z = x > 0 ? 0.2 : -0.2;
                group.add(horn);
            });
        } else {
            // AI龙身体
            const size = 0.75 - index * 0.03;
            const bodyGeometry = new THREE.BoxGeometry(size, size * 0.8, size);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: color.body,
                emissive: color.body,
                emissiveIntensity: 0.15
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            group.add(body);
        }

        group.castShadow = true;
        const worldPos = gridToWorld(seg);
        group.position.set(worldPos.x, 0, worldPos.z);
        scene.add(group);
        aiSnake.meshes.push(group);
    });

    return aiSnake;
}

function updateAISnakeMeshes(aiSnake) {
    if (!aiSnake.alive) {
        aiSnake.meshes.forEach(m => m.visible = false);
        return;
    }

    while (aiSnake.meshes.length > aiSnake.segments.length) {
        const mesh = aiSnake.meshes.pop();
        scene.remove(mesh);
    }

    while (aiSnake.meshes.length < aiSnake.segments.length) {
        const group = new THREE.Group();
        const size = 0.7;
        const bodyGeometry = new THREE.BoxGeometry(size, size * 0.8, size);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: aiSnake.color.body,
            emissive: aiSnake.color.body,
            emissiveIntensity: 0.15
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        group.castShadow = true;
        scene.add(group);
        aiSnake.meshes.push(group);
    }

    aiSnake.segments.forEach((seg, index) => {
        const worldPos = gridToWorld(seg);
        aiSnake.meshes[index].position.set(worldPos.x, 0, worldPos.z);
        aiSnake.meshes[index].visible = true;

        if (index === 0 && aiSnake.segments.length > 1) {
            const angle = Math.atan2(aiSnake.direction.x, aiSnake.direction.z);
            aiSnake.meshes[index].rotation.y = angle;
        }

        aiSnake.meshes[index].position.y = Math.sin(Date.now() * 0.004 + index) * 0.03;
    });
}

function getAIDirection(aiSnake) {
    const head = aiSnake.segments[0];

    let nearestFood = null;
    let minDist = Infinity;

    gameState.foods.forEach(food => {
        const dist = Math.abs(food.x - head.x) + Math.abs(food.z - head.z);
        if (dist < minDist) {
            minDist = dist;
            nearestFood = food;
        }
    });

    const directions = [
        { x: 1, z: 0 },
        { x: -1, z: 0 },
        { x: 0, z: 1 },
        { x: 0, z: -1 },
    ];

    const safeDirs = directions.filter(dir => {
        if (dir.x === -aiSnake.direction.x && dir.z === -aiSnake.direction.z) {
            return false;
        }

        const newX = head.x + dir.x;
        const newZ = head.z + dir.z;

        if (newX < 0 || newX >= CONFIG.gridSize || newZ < 0 || newZ >= CONFIG.gridSize) {
            return false;
        }

        for (let i = 0; i < aiSnake.segments.length - 1; i++) {
            if (aiSnake.segments[i].x === newX && aiSnake.segments[i].z === newZ) {
                return false;
            }
        }

        for (const seg of gameState.snake) {
            if (seg.x === newX && seg.z === newZ) {
                return false;
            }
        }

        for (const other of gameState.aiSnakes) {
            if (other === aiSnake || !other.alive) continue;
            for (const seg of other.segments) {
                if (seg.x === newX && seg.z === newZ) {
                    return false;
                }
            }
        }

        for (const obs of gameState.obstacles) {
            if (obs.x === newX && obs.z === newZ) {
                return false;
            }
        }

        return true;
    });

    if (safeDirs.length === 0) {
        return aiSnake.direction;
    }

    if (Math.random() < CONFIG.aiRandomness) {
        return safeDirs[Math.floor(Math.random() * safeDirs.length)];
    }

    if (nearestFood) {
        safeDirs.sort((a, b) => {
            const distA = Math.abs((head.x + a.x) - nearestFood.x) + Math.abs((head.z + a.z) - nearestFood.z);
            const distB = Math.abs((head.x + b.x) - nearestFood.x) + Math.abs((head.z + b.z) - nearestFood.z);
            return distA - distB;
        });
        return safeDirs[0];
    }

    return safeDirs[0];
}

function moveAISnake(aiSnake, currentTime) {
    if (!aiSnake.alive) {
        if (currentTime - aiSnake.respawnTime > 5000) {
            respawnAISnake(aiSnake);
        }
        return;
    }

    if (currentTime - aiSnake.lastMoveTime < aiSnake.speed) {
        return;
    }
    aiSnake.lastMoveTime = currentTime;

    aiSnake.direction = getAIDirection(aiSnake);

    const head = aiSnake.segments[0];
    const newHead = {
        x: head.x + aiSnake.direction.x,
        z: head.z + aiSnake.direction.z,
    };

    if (checkAICollision(aiSnake, newHead)) {
        killAISnake(aiSnake, currentTime);
        return;
    }

    aiSnake.segments.unshift(newHead);

    let ateFood = false;
    for (let i = 0; i < gameState.foods.length; i++) {
        const food = gameState.foods[i];
        if (food.x === newHead.x && food.z === newHead.z) {
            ateFood = true;
            scene.remove(food.mesh);
            gameState.foods.splice(i, 1);
            spawnFood();

            const worldPos = gridToWorld(newHead);
            createParticle(new THREE.Vector3(worldPos.x, 0, worldPos.z), aiSnake.color.head, 8);
            break;
        }
    }

    if (!ateFood) {
        aiSnake.segments.pop();
    }

    // AI蛇碰到玩家就会死！玩家太强了！
    for (const seg of gameState.snake) {
        if (seg.x === newHead.x && seg.z === newHead.z) {
            killAISnake(aiSnake, currentTime);
            const bonus = 30 + gameState.aiKills * 5;
            gameState.score += bonus;
            gameState.aiKills++;
            showNotification(`${aiSnake.color.name} crashed into you! +${bonus}`, aiSnake.color.head);

            // 被动击杀鼓励
            if (Math.random() < 0.5) {
                setTimeout(() => showNotification('Too easy! 😎', 0xfbbf24), 300);
            }
            updateScore();
            return;
        }
    }

    updateAISnakeMeshes(aiSnake);
}

function checkAICollision(aiSnake, pos) {
    if (pos.x < 0 || pos.x >= CONFIG.gridSize || pos.z < 0 || pos.z >= CONFIG.gridSize) {
        return true;
    }

    for (let i = 0; i < aiSnake.segments.length - 1; i++) {
        if (aiSnake.segments[i].x === pos.x && aiSnake.segments[i].z === pos.z) {
            return true;
        }
    }

    for (const obs of gameState.obstacles) {
        if (obs.x === pos.x && obs.z === pos.z) {
            return true;
        }
    }

    return false;
}

function killAISnake(aiSnake, currentTime) {
    aiSnake.alive = false;
    aiSnake.respawnTime = currentTime;

    aiSnake.segments.forEach(seg => {
        const worldPos = gridToWorld(seg);
        createParticle(new THREE.Vector3(worldPos.x, 0, worldPos.z), aiSnake.color.body, 8, true);
    });

    updateAISnakeMeshes(aiSnake);
}

function respawnAISnake(aiSnake) {
    const startPositions = [
        { x: 10, z: 10 },
        { x: 89, z: 89 },
        { x: 10, z: 89 },
        { x: 89, z: 10 },
        { x: 50, z: 10 },
        { x: 50, z: 89 },
        { x: 10, z: 50 },
        { x: 89, z: 50 },
    ];

    let startPos = null;
    for (const pos of startPositions) {
        let safe = true;
        for (const seg of gameState.snake) {
            if (Math.abs(seg.x - pos.x) < 8 && Math.abs(seg.z - pos.z) < 8) {
                safe = false;
                break;
            }
        }
        if (safe) {
            startPos = pos;
            break;
        }
    }

    if (!startPos) {
        startPos = startPositions[Math.floor(Math.random() * startPositions.length)];
    }

    aiSnake.segments = [
        { x: startPos.x, z: startPos.z },
        { x: startPos.x - 1, z: startPos.z },
        { x: startPos.x - 2, z: startPos.z },
    ];
    aiSnake.direction = { x: 1, z: 0 };
    aiSnake.alive = true;

    updateAISnakeMeshes(aiSnake);
    showNotification(`${aiSnake.color.name} respawned!`, aiSnake.color.head);
}

function clearAISnakes() {
    gameState.aiSnakes.forEach(ai => {
        ai.meshes.forEach(m => scene.remove(m));
    });
    gameState.aiSnakes = [];
}

// ==================== Food - Stars ====================
// 创建恒星模型
function createStarModel(isGolden) {
    const group = new THREE.Group();

    // 恒星核心 - 发光球体
    const coreGeometry = new THREE.SphereGeometry(0.35, 24, 24);
    const coreColor = isGolden ? 0xffdd44 : 0xff6633;
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    // 恒星光晕 - 多层发光效果
    const glowLayers = isGolden ? 4 : 3;
    for (let i = 0; i < glowLayers; i++) {
        const glowSize = 0.5 + i * 0.2;
        const glowGeometry = new THREE.SphereGeometry(glowSize, 16, 16);
        const glowOpacity = 0.3 - i * 0.07;
        const glowColor = isGolden ? 0xffee88 : 0xff8855;
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: glowOpacity,
            depthWrite: false
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
    }

    // 恒星耀斑 - 十字光芒
    const flareGeometry = new THREE.PlaneGeometry(1.5, 0.08);
    const flareMaterial = new THREE.MeshBasicMaterial({
        color: isGolden ? 0xffffaa : 0xffaa66,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const flare1 = new THREE.Mesh(flareGeometry, flareMaterial);
    flare1.rotation.z = 0;
    group.add(flare1);

    const flare2 = new THREE.Mesh(flareGeometry, flareMaterial);
    flare2.rotation.z = Math.PI / 2;
    group.add(flare2);

    // 对角光芒
    const flare3 = new THREE.Mesh(flareGeometry.clone(), flareMaterial);
    flare3.rotation.z = Math.PI / 4;
    flare3.scale.set(0.7, 1, 1);
    group.add(flare3);

    const flare4 = new THREE.Mesh(flareGeometry.clone(), flareMaterial);
    flare4.rotation.z = -Math.PI / 4;
    flare4.scale.set(0.7, 1, 1);
    group.add(flare4);

    // 金色恒星额外添加日冕
    if (isGolden) {
        const coronaGeometry = new THREE.RingGeometry(0.5, 0.8, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        corona.rotation.x = Math.PI / 2;
        group.add(corona);
    }

    // 添加点光源让恒星真正发光
    const starLight = new THREE.PointLight(
        isGolden ? 0xffdd44 : 0xff6633,
        isGolden ? 2 : 1,
        8
    );
    group.add(starLight);

    group.castShadow = true;
    return group;
}

function getValidPosition() {
    const occupied = new Set();

    gameState.snake.forEach(s => occupied.add(`${s.x},${s.z}`));
    gameState.obstacles.forEach(o => occupied.add(`${o.x},${o.z}`));
    gameState.powerUps.forEach(p => occupied.add(`${p.x},${p.z}`));
    gameState.foods.forEach(f => occupied.add(`${f.x},${f.z}`));
    gameState.aiSnakes.forEach(ai => {
        ai.segments.forEach(s => occupied.add(`${s.x},${s.z}`));
    });

    let x, z;
    let attempts = 0;
    do {
        x = Math.floor(Math.random() * CONFIG.gridSize);
        z = Math.floor(Math.random() * CONFIG.gridSize);
        attempts++;
    } while (occupied.has(`${x},${z}`) && attempts < 100);

    return { x, z };
}

function spawnFood() {
    const pos = getValidPosition();
    const isGolden = Math.random() < CONFIG.goldenFoodChance;

    // 使用恒星模型
    const mesh = createStarModel(isGolden);
    const worldPos = gridToWorld(pos);
    mesh.position.set(worldPos.x, 0.5, worldPos.z);
    scene.add(mesh);

    gameState.foods.push({
        x: pos.x,
        z: pos.z,
        isGolden,
        spawnTime: Date.now(),
        mesh
    });
}

function clearFoods() {
    gameState.foods.forEach(f => scene.remove(f.mesh));
    gameState.foods = [];
}

// ==================== Obstacles - Asteroids ====================
function createObstacles() {
    clearObstacles();

    for (let i = 0; i < CONFIG.obstacleCount; i++) {
        const pos = getValidPosition();

        const distFromCenter = Math.abs(pos.x - 50) + Math.abs(pos.z - 50);
        if (distFromCenter < 15) {
            i--;
            continue;
        }

        // 创建不规则的小行星形状
        const asteroidGroup = new THREE.Group();

        // 主体 - 不规则岩石
        const asteroidGeometry = new THREE.DodecahedronGeometry(0.6, 1);
        const asteroidMaterial = new THREE.MeshStandardMaterial({
            color: 0x444455,
            emissive: 0x221133,
            emissiveIntensity: 0.1,
            metalness: 0.3,
            roughness: 0.9
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.scale.set(1, 1.5, 1);
        asteroid.rotation.set(Math.random(), Math.random(), Math.random());
        asteroidGroup.add(asteroid);

        // 添加一些小碎石
        for (let j = 0; j < 3; j++) {
            const debrisGeometry = new THREE.OctahedronGeometry(0.15);
            const debris = new THREE.Mesh(debrisGeometry, asteroidMaterial);
            debris.position.set(
                (Math.random() - 0.5) * 0.8,
                0.3 + Math.random() * 0.8,
                (Math.random() - 0.5) * 0.8
            );
            debris.rotation.set(Math.random(), Math.random(), Math.random());
            asteroidGroup.add(debris);
        }

        // 顶部能量晶体
        const crystalGeometry = new THREE.OctahedronGeometry(0.2);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0x8844ff,
            emissive: 0x8844ff,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = 1.0;
        crystal.scale.y = 1.5;
        asteroidGroup.add(crystal);

        const worldPos = gridToWorld(pos);
        asteroidGroup.position.set(worldPos.x, 0.3, worldPos.z);
        asteroidGroup.castShadow = true;
        scene.add(asteroidGroup);

        gameState.obstacles.push({ x: pos.x, z: pos.z, mesh: asteroidGroup });
    }
}

function clearObstacles() {
    gameState.obstacles.forEach(o => scene.remove(o.mesh));
    gameState.obstacles = [];
}

// ==================== Power-up System ====================
function getWeightedRandomPowerUp() {
    const types = Object.values(POWER_UP_TYPES);
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of types) {
        random -= type.weight;
        if (random <= 0) {
            return type;
        }
    }
    return types[0];
}

function spawnPowerUp() {
    const type = getWeightedRandomPowerUp();
    const pos = getValidPosition();

    let geometry;
    if (type.effect === 'bomb') {
        geometry = new THREE.OctahedronGeometry(0.4);
    } else if (type.effect === 'fire_breath') {
        geometry = new THREE.ConeGeometry(0.35, 0.6, 8);
    } else {
        geometry = new THREE.DodecahedronGeometry(0.35);
    }

    const material = new THREE.MeshStandardMaterial({
        color: type.color,
        emissive: type.color,
        emissiveIntensity: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    const worldPos = gridToWorld(pos);
    mesh.position.set(worldPos.x, 0.3, worldPos.z);
    mesh.castShadow = true;
    scene.add(mesh);

    gameState.powerUps.push({
        x: pos.x,
        z: pos.z,
        type,
        mesh,
        spawnTime: Date.now()
    });
}

function clearPowerUps() {
    gameState.powerUps.forEach(p => scene.remove(p.mesh));
    gameState.powerUps = [];
}

function collectPowerUp(powerUp) {
    const effect = powerUp.type.effect;

    scene.remove(powerUp.mesh);
    gameState.powerUps = gameState.powerUps.filter(p => p !== powerUp);

    const worldPos = gridToWorld({ x: powerUp.x, z: powerUp.z });
    createParticle(new THREE.Vector3(worldPos.x, 0, worldPos.z), powerUp.type.color, 20);

    let bonusPoints = 0;

    switch (effect) {
        case 'speed_boost':
            gameState.activeEffects.speed_boost = Date.now() + CONFIG.powerUpDuration;
            break;
        case 'slow_mo':
            gameState.activeEffects.slow_mo = Date.now() + CONFIG.powerUpDuration;
            break;
        case 'invincible':
            gameState.activeEffects.invincible = Date.now() + CONFIG.powerUpDuration;
            showNotification(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)], 0xffd700);
            break;
        case 'double_score':
            gameState.activeEffects.double_score = Date.now() + CONFIG.powerUpDuration;
            break;
        case 'shrink':
            if (gameState.snake.length > 4) {
                const removeCount = Math.min(3, gameState.snake.length - 3);
                for (let i = 0; i < removeCount; i++) {
                    gameState.snake.pop();
                }
            }
            break;
        case 'magnet':
            gameState.activeEffects.magnet = Date.now() + CONFIG.powerUpDuration;
            break;
        case 'fire_breath':
            gameState.activeEffects.fire_breath = Date.now() + CONFIG.powerUpDuration;
            showNotification('Burn! 🔥', 0xff4500);
            break;
        case 'shield':
            // 护盾：获得短暂无敌+额外分数
            gameState.activeEffects.invincible = Date.now() + CONFIG.powerUpDuration / 2;
            bonusPoints = 25;
            break;
        case 'bonus':
            // 奖励：直接获得大量分数
            bonusPoints = 50 + Math.floor(Math.random() * 50);
            showNotification(`+${bonusPoints} pts! 🎁`, 0x10b981);
            break;
        case 'reverse':
            gameState.activeEffects.reverse = Date.now() + CONFIG.powerUpDuration / 2; // 减少反转时间
            break;
        case 'bomb':
            if (!hasEffect('invincible') && !hasEffect('shield')) {
                gameOver();
                return;
            } else {
                bonusPoints = 30; // 无敌状态下吃炸弹得分
                showNotification('Bomb blocked! 💪', 0x22c55e);
            }
            break;
    }

    if (bonusPoints > 0) {
        gameState.score += bonusPoints;
        updateScore();
    }

    gameState.powerUpsCollected++;
    showNotification(powerUp.type.icon + ' ' + powerUp.type.name, powerUp.type.color);

    // 随机鼓励
    if (Math.random() < 0.3 && effect !== 'bomb' && effect !== 'reverse') {
        setTimeout(() => {
            showNotification(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)], 0xfbbf24);
        }, 500);
    }
}

function hasEffect(effect) {
    return gameState.activeEffects[effect] && Date.now() < gameState.activeEffects[effect];
}

function updateEffects() {
    let speed = gameState.baseSpeed;

    if (hasEffect('speed_boost')) {
        speed *= 0.6;
    }
    if (hasEffect('slow_mo')) {
        speed *= 1.5;
    }

    gameState.speed = speed;

    // 磁铁效果
    if (hasEffect('magnet') && gameState.foods.length > 0) {
        const head = gameState.snake[0];

        gameState.foods.forEach(food => {
            const dx = Math.sign(head.x - food.x);
            const dz = Math.sign(head.z - food.z);

            if (Math.random() < 0.3) {
                const newX = food.x + dx;
                const newZ = food.z + dz;

                if (newX >= 0 && newX < CONFIG.gridSize && newZ >= 0 && newZ < CONFIG.gridSize) {
                    food.x = newX;
                    food.z = newZ;
                    const worldPos = gridToWorld(food);
                    food.mesh.position.set(worldPos.x, food.mesh.position.y, worldPos.z);
                }
            }
        });
    }

    updateEffectsUI();
}

// ==================== Notification System ====================
function showNotification(text, color) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = text;
    notif.style.color = '#' + color.toString(16).padStart(6, '0');
    document.getElementById('notifications').appendChild(notif);

    setTimeout(() => notif.remove(), 2000);
}

function updateEffectsUI() {
    const container = document.getElementById('active-effects');
    container.innerHTML = '';

    const effects = [
        { key: 'speed_boost', icon: '⚡', name: 'Speed' },
        { key: 'slow_mo', icon: '🐢', name: 'Slow' },
        { key: 'invincible', icon: '⭐', name: 'Invincible' },
        { key: 'double_score', icon: '✖2', name: 'Double' },
        { key: 'magnet', icon: '🧲', name: 'Magnet' },
        { key: 'fire_breath', icon: '🔥', name: 'Fire' },
        { key: 'shield', icon: '🛡️', name: 'Shield' },
        { key: 'reverse', icon: '🔄', name: 'Reverse' },
    ];

    effects.forEach(e => {
        if (hasEffect(e.key)) {
            const remaining = Math.ceil((gameState.activeEffects[e.key] - Date.now()) / 1000);
            const div = document.createElement('div');
            div.className = 'effect-item';
            div.innerHTML = `${e.icon} ${e.name} <span class="effect-time">${remaining}s</span>`;
            container.appendChild(div);
        }
    });
}

// ==================== Game Logic ====================
function initGame() {
    gameState.snake = [
        { x: 50, y: 0, z: 50 },
        { x: 49, y: 0, z: 50 },
        { x: 48, y: 0, z: 50 },
    ];

    gameState.direction = { x: 1, y: 0, z: 0 };
    gameState.nextDirection = { x: 1, y: 0, z: 0 };
    gameState.score = 0;
    gameState.speed = CONFIG.initialSpeed;
    gameState.baseSpeed = CONFIG.initialSpeed;
    gameState.lastMoveTime = 0;
    gameState.lastPowerUpSpawn = 0;
    gameState.activeEffects = {};
    gameState.foodEaten = 0;
    gameState.powerUpsCollected = 0;
    gameState.combo = 0;
    gameState.lastFoodTime = 0;
    gameState.aiKills = 0;
    gameState.lastEventTime = 0;

    // 清理mesh
    snakeMeshes.forEach(m => scene.remove(m));
    snakeMeshes.length = 0;

    clearPowerUps();
    clearObstacles();
    clearFoods();
    clearAISnakes();
    clearCosmicEvents();

    createObstacles();

    for (let i = 0; i < CONFIG.foodCount; i++) {
        spawnFood();
    }

    for (let i = 0; i < CONFIG.aiSnakeCount; i++) {
        gameState.aiSnakes.push(createAISnake(i));
    }

    updateScore();
    updateSnakeMeshes();
    updateEffectsUI();
}

function moveSnake() {
    gameState.direction = { ...gameState.nextDirection };

    const head = gameState.snake[0];
    let newHead = {
        x: head.x + gameState.direction.x,
        y: 0,
        z: head.z + gameState.direction.z,
    };

    if (hasEffect('invincible')) {
        if (newHead.x < 0) newHead.x = CONFIG.gridSize - 1;
        if (newHead.x >= CONFIG.gridSize) newHead.x = 0;
        if (newHead.z < 0) newHead.z = CONFIG.gridSize - 1;
        if (newHead.z >= CONFIG.gridSize) newHead.z = 0;
    }

    if (checkCollision(newHead)) {
        gameOver();
        return;
    }

    gameState.snake.unshift(newHead);

    // 喷火效果
    if (hasEffect('fire_breath')) {
        const worldPos = gridToWorld(newHead);
        createFireBreath(
            new THREE.Vector3(worldPos.x, 0.3, worldPos.z),
            { x: gameState.direction.x, z: gameState.direction.z }
        );

        // 龙息可以击杀前方的AI蛇
        const fireX = newHead.x + gameState.direction.x;
        const fireZ = newHead.z + gameState.direction.z;

        gameState.aiSnakes.forEach(ai => {
            if (!ai.alive) return;
            const aiHead = ai.segments[0];
            if (aiHead.x === fireX && aiHead.z === fireZ) {
                killAISnake(ai, performance.now());
                gameState.score += 50;
                gameState.aiKills++;
                showNotification(`Fire killed ${ai.color.name}! +50`, 0xff4400);
                updateScore();
            }
        });
    }

    // 检查吃食物
    let ateFood = false;
    for (let i = 0; i < gameState.foods.length; i++) {
        const food = gameState.foods[i];
        if (newHead.x === food.x && newHead.z === food.z) {
            ateFood = true;

            let points = food.isGolden ? 30 : 10;

            const now = Date.now();
            if (now - gameState.lastFoodTime < 3000) {
                gameState.combo++;
                points += gameState.combo * 5;
            } else {
                gameState.combo = 0;
            }
            gameState.lastFoodTime = now;

            if (hasEffect('double_score')) {
                points *= 2;
            }

            gameState.score += points;
            gameState.foodEaten++;
            gameState.baseSpeed = Math.max(CONFIG.minSpeed, gameState.baseSpeed - CONFIG.speedIncrease);

            const worldPos = gridToWorld(newHead);
            // 恒星爆发粒子效果
            createParticle(
                new THREE.Vector3(worldPos.x, 0.5, worldPos.z),
                food.isGolden ? 0xffdd44 : 0xff6633,
                food.isGolden ? 25 : 15
            );

            if (gameState.combo > 0) {
                showNotification(`Combo x${gameState.combo}!`, 0x22d3ee);
                if (gameState.combo >= 5) {
                    showNotification('Combo Master! 🔥', 0xff6600);
                }
            }

            // Milestone encouragement
            if (gameState.foodEaten === 10) {
                showNotification('10 stars! Keep going! 💪', 0x22c55e);
            } else if (gameState.foodEaten === 25) {
                showNotification('25! Amazing! 🌟', 0xfbbf24);
            } else if (gameState.foodEaten === 50) {
                showNotification('50! Legendary! 👑', 0xff6600);
            } else if (gameState.foodEaten % 25 === 0 && gameState.foodEaten > 50) {
                showNotification(`${gameState.foodEaten}! Unstoppable! 🐉`, 0xff4500);
            }

            // 随机鼓励
            if (Math.random() < 0.15) {
                setTimeout(() => {
                    showNotification(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)], 0x4ade80);
                }, 300);
            }

            scene.remove(food.mesh);
            gameState.foods.splice(i, 1);
            spawnFood();

            updateScore();
            break;
        }
    }

    if (!ateFood) {
        gameState.snake.pop();
    }

    // 检查道具
    const powerUp = gameState.powerUps.find(p => p.x === newHead.x && p.z === newHead.z);
    if (powerUp) {
        collectPowerUp(powerUp);
    }

    // 检查是否撞到AI蛇
    if (hasEffect('invincible') || hasEffect('fire_breath')) {
        gameState.aiSnakes.forEach(ai => {
            if (!ai.alive) return;
            for (const seg of ai.segments) {
                if (seg.x === newHead.x && seg.z === newHead.z) {
                    killAISnake(ai, performance.now());
                    const bonus = 50 + gameState.aiKills * 10; // 连续击杀奖励更多！
                    gameState.score += bonus;
                    gameState.aiKills++;
                    showNotification(`Killed ${ai.color.name}! +${bonus}`, ai.color.head);

                    // Kill encouragement
                    if (gameState.aiKills === 1) {
                        setTimeout(() => showNotification('First Blood! 🎯', 0xff6600), 400);
                    } else if (gameState.aiKills === 3) {
                        setTimeout(() => showNotification('Triple Kill! Dragon Slayer! 🗡️', 0xff4500), 400);
                    } else if (gameState.aiKills >= 5) {
                        setTimeout(() => showNotification('Godlike! Unstoppable! 👑', 0xffd700), 400);
                    }

                    updateScore();
                    break;
                }
            }
        });
    }

    gameState.maxLength = Math.max(gameState.maxLength, gameState.snake.length);

    updateSnakeMeshes();
}

function checkCollision(pos) {
    const invincible = hasEffect('invincible');

    if (!invincible) {
        if (pos.x < 0 || pos.x >= CONFIG.gridSize ||
            pos.z < 0 || pos.z >= CONFIG.gridSize) {
            return true;
        }
    }

    if (!invincible) {
        for (let i = 0; i < gameState.snake.length - 1; i++) {
            if (gameState.snake[i].x === pos.x && gameState.snake[i].z === pos.z) {
                return true;
            }
        }
    }

    if (!invincible) {
        for (const obs of gameState.obstacles) {
            if (obs.x === pos.x && obs.z === pos.z) {
                return true;
            }
        }
    }

    // 玩家撞到AI蛇不会死，AI蛇会死！
    // 这个检查移到moveSnake中处理

    return false;
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${gameState.score}`;
    if (gameState.combo > 0) {
        document.getElementById('combo').textContent = `Combo: x${gameState.combo}`;
        document.getElementById('combo').classList.remove('hidden');
    } else {
        document.getElementById('combo').classList.add('hidden');
    }
}

function gameOver() {
    gameState.isRunning = false;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-food').textContent = gameState.foodEaten;
    document.getElementById('final-length').textContent = gameState.maxLength;
    document.getElementById('final-powerups').textContent = gameState.powerUpsCollected;
    document.getElementById('final-kills').textContent = gameState.aiKills;
    document.getElementById('game-over').classList.remove('hidden');
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    initGame();
    gameState.isRunning = true;
}

// ==================== Input Handling ====================
document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning) return;

    const dir = gameState.direction;
    const reverse = hasEffect('reverse');

    let up = { x: 0, y: 0, z: -1 };
    let down = { x: 0, y: 0, z: 1 };
    let left = { x: -1, y: 0, z: 0 };
    let right = { x: 1, y: 0, z: 0 };

    if (reverse) {
        [up, down] = [down, up];
        [left, right] = [right, left];
    }

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dir.z !== -up.z) gameState.nextDirection = up;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dir.z !== -down.z) gameState.nextDirection = down;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dir.x !== -left.x) gameState.nextDirection = left;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dir.x !== -right.x) gameState.nextDirection = right;
            break;
    }
});

// ==================== UI Events ====================
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// ==================== Window Resize ====================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== Camera Follow ====================
const cameraTarget = new THREE.Vector3(0, 0, 0);
const cameraOffset = new THREE.Vector3(0, 45, 35);

function updateCamera() {
    if (gameState.snake.length > 0) {
        const head = gameState.snake[0];
        const worldPos = gridToWorld(head);

        // 平滑跟随
        cameraTarget.lerp(new THREE.Vector3(worldPos.x, 0, worldPos.z), 0.08);

        camera.position.x = cameraTarget.x + cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraTarget.z + cameraOffset.z;

        camera.lookAt(cameraTarget.x, 0, cameraTarget.z);
    }
}

// ==================== Game Main Loop ====================
function animate(currentTime) {
    requestAnimationFrame(animate);

    if (gameState.isRunning) {
        updateEffects();
        updateCamera();

        if (currentTime - gameState.lastMoveTime >= gameState.speed) {
            moveSnake();
            gameState.lastMoveTime = currentTime;
        }

        gameState.aiSnakes.forEach(ai => {
            moveAISnake(ai, currentTime);
        });

        if (currentTime - gameState.lastPowerUpSpawn >= CONFIG.powerUpSpawnInterval) {
            if (gameState.powerUps.length < 15) {
                spawnPowerUp();
                // 有时候生成两个道具！
                if (Math.random() < 0.3) {
                    spawnPowerUp();
                }
            }
            gameState.lastPowerUpSpawn = currentTime;
        }

        gameState.foods.forEach((food, index) => {
            if (food.isGolden && Date.now() - food.spawnTime > CONFIG.goldenFoodTimeout) {
                scene.remove(food.mesh);
                gameState.foods.splice(index, 1);
                spawnFood();
            }
        });

        // 道具动画
        gameState.powerUps.forEach(p => {
            p.mesh.rotation.y += 0.03;
            p.mesh.rotation.x += 0.02;
            p.mesh.position.y = 0.3 + Math.sin(currentTime * 0.005 + p.x) * 0.15;
        });

        // 恒星食物动画
        gameState.foods.forEach(food => {
            // 恒星缓慢自转
            food.mesh.rotation.y += 0.01;

            // 恒星浮动
            food.mesh.position.y = 0.5 + Math.sin(currentTime * 0.003 + food.x) * 0.15;

            // 恒星脉动效果
            const pulse = 1 + Math.sin(currentTime * 0.008 + food.x * 0.5) * 0.1;
            food.mesh.scale.setScalar(pulse);

            if (food.isGolden) {
                const remaining = CONFIG.goldenFoodTimeout - (Date.now() - food.spawnTime);
                if (remaining < 2000) {
                    food.mesh.visible = Math.floor(currentTime / 100) % 2 === 0;
                }
            }
        });

        // 小行星动画
        gameState.obstacles.forEach((o, i) => {
            // 小行星缓慢旋转
            o.mesh.rotation.y += 0.003;
            o.mesh.position.y = 0.3 + Math.sin(currentTime * 0.002 + i) * 0.1;

            // 能量晶体脉动
            const crystal = o.mesh.children[o.mesh.children.length - 1];
            if (crystal) {
                const pulse = 1 + Math.sin(currentTime * 0.008 + i * 2) * 0.2;
                crystal.scale.set(pulse, pulse * 1.5, pulse);
            }
        });

        // 更新宇宙事件
        updateCosmicEvents(currentTime);

        // 随机触发宇宙事件（每15-30秒一次）
        // 宇宙事件触发间隔增加（减少卡顿）
        if (currentTime - gameState.lastEventTime > 25000 + Math.random() * 20000) {
            if (Math.random() < 0.6) { // 60%概率触发
                triggerRandomCosmicEvent();
            }
            gameState.lastEventTime = currentTime;
        }
    }

    updateParticles();

    // 星空背景缓慢旋转
    if (starField) {
        starField.rotation.y += 0.0001;
    }

    renderer.render(scene, camera);
}

// ==================== Initialization ====================
createGround();
initGame();
animate(0);
