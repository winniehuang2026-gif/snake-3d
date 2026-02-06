# Cosmic Dragon - Feature Documentation

This document provides a comprehensive overview of all features in the Cosmic Dragon 3D Snake Game.

## Table of Contents
1. [Core Gameplay](#core-gameplay)
2. [Visual System](#visual-system)
3. [Dragon System](#dragon-system)
4. [AI Opponent System](#ai-opponent-system)
5. [Food System](#food-system)
6. [Power-Up System](#power-up-system)
7. [Cosmic Events System](#cosmic-events-system)
8. [Scoring System](#scoring-system)
9. [UI System](#ui-system)

---

## Core Gameplay

### Grid System
- **Grid Size**: 100 x 100 cells
- **Cell Size**: 1 unit
- **Total Play Area**: 100 x 100 units

### Movement Mechanics
- Grid-based movement (one cell per tick)
- Four directional movement (up, down, left, right)
- Cannot reverse direction directly
- Speed increases as you collect food

### Speed Settings
| Parameter | Value |
|-----------|-------|
| Initial Speed | 150ms per move |
| Speed Increase | 0.5ms per food |
| Minimum Speed (fastest) | 80ms per move |

### Collision Rules
- **Wall Collision**: Game over (unless invincible)
- **Self Collision**: Game over (unless invincible)
- **Obstacle Collision**: Game over (unless invincible)
- **AI Collision**: AI dies, player survives!

---

## Visual System

### Space Background
The game features a multi-layered cosmic background:

#### Star Field
- **Star Count**: 3000 stars
- **Distribution**: Spherical around the play area
- **Color Distribution**:
  - 60% White/Blue-white stars
  - 20% Blue stars
  - 20% Yellow/Orange stars
- **Animation**: Slow rotation (0.0001 rad/frame)

#### Nebula Layers
- 4 colored nebula planes (purple, deep blue, dark red, cyan)
- 8 glowing nebula cores with random colors
- Semi-transparent with depth-based opacity

### Lighting
| Light Type | Color | Intensity | Purpose |
|------------|-------|-----------|---------|
| Ambient | Blue-ish (#6666aa) | 0.3 | Base illumination |
| Directional | Light blue (#aabbff) | 0.7 | Main shadows |
| Dragon Point Light | Orange (#ff6600) | 2-3 | Player highlight |

### Ground Plane
- Semi-transparent dark platform (opacity: 0.85)
- Blue-purple grid lines
- Energy shield-style borders with glow effect

---

## Dragon System

### Player Dragon
The player controls a detailed 3D dragon model:

#### Head Components
- Main head body (box geometry)
- Two golden horns (cone geometry)
- Two red glowing eyes (sphere geometry)
- Snout with nostrils (fire emitters)

#### Body Components
- Segmented body with size gradient
- Alternating back spikes (golden)
- Side scale decorations
- Color gradient from light to dark green

#### Tail Components
- Cone-shaped tail tip
- Octahedron fire decoration

#### Visual Effects
- Floating animation (sine wave)
- Golden glow when invincible
- Orange glow with fire breath

---

## AI Opponent System

### Configuration
| Parameter | Value |
|-----------|-------|
| AI Count | 6 dragons |
| Base Speed | 200ms per move |
| Speed Variation | ±60ms random |
| AI Randomness | 25% random moves |

### AI Colors
| Name | Head Color | Body Color |
|------|------------|------------|
| Red Dragon | #e11d48 | #fb7185 |
| Purple Dragon | #7c3aed | #a78bfa |
| Ice Dragon | #0891b2 | #22d3ee |
| Gold Dragon | #f59e0b | #fbbf24 |

### AI Behavior
1. **Pathfinding**: Greedy algorithm targeting nearest food
2. **Collision Avoidance**: Avoids walls, obstacles, self, other AI, and player
3. **Random Factor**: 25% chance to make random valid move
4. **Respawn**: Returns after 5 seconds at safe location

### AI Death Conditions
- Colliding with walls
- Colliding with obstacles
- Colliding with player (any segment)
- Being hit by player's fire breath
- Being caught in supernova blast
- Being swallowed by black hole

---

## Food System

### Star Models
Food items are rendered as detailed 3D stars:

#### Regular Stars (Orange)
- Glowing sphere core (#ff6633)
- 3 glow layers with decreasing opacity
- 4-point lens flare (cross pattern)
- Point light (intensity: 1, range: 8)

#### Golden Stars
- Brighter core (#ffdd44)
- 4 glow layers
- Corona ring effect
- Stronger point light (intensity: 2, range: 8)
- Time-limited (15 seconds)
- Blinks when about to disappear

### Food Configuration
| Parameter | Value |
|-----------|-------|
| Initial Food Count | 30 |
| Golden Food Chance | 35% |
| Golden Food Timeout | 15 seconds |

### Food Animation
- Slow rotation (0.01 rad/frame)
- Floating motion (sine wave)
- Pulsing scale effect

---

## Power-Up System

### Spawn Settings
| Parameter | Value |
|-----------|-------|
| Spawn Interval | 1.5 seconds |
| Max Active Power-Ups | 15 |
| Double Spawn Chance | 30% |

### Power-Up Details

#### Positive Power-Ups

| Icon | Name | Effect | Duration | Weight |
|------|------|--------|----------|--------|
| ⚡ | Speed Boost | 40% faster movement | 12s | 10 |
| 🐢 | Slow Motion | 50% slower movement | 12s | 15 |
| ⭐ | Invincibility | Pass through everything, wrap around edges | 12s | 20 |
| ✖2 | Double Score | 2x points for food | 12s | 15 |
| 📉 | Shrink | Remove up to 3 body segments | Instant | 10 |
| 🧲 | Magnet | Food moves toward you | 12s | 15 |
| 🔥 | Fire Breath | Shoot fire, kill AI in front | 12s | 20 |
| 🛡️ | Shield | Short invincibility + 25 points | 6s | 15 |
| 🎁 | Bonus | 50-100 random points | Instant | 15 |

#### Negative Power-Ups (Rare)

| Icon | Name | Effect | Duration | Weight |
|------|------|--------|----------|--------|
| 🔄 | Reverse | Inverted controls | 6s | 3 |
| 💣 | Bomb | Game over (blocked by invincibility) | Instant | 2 |

### Power-Up Visuals
- Dodecahedron geometry (most types)
- Octahedron for bombs
- Cone for fire breath
- Rotation animation
- Floating animation
- Color-coded glow

---

## Cosmic Events System

### Event Trigger Settings
| Parameter | Value |
|-----------|-------|
| Minimum Interval | 15 seconds |
| Maximum Interval | 30 seconds |
| Trigger Chance | 70% |

### Event Details

#### Supernova (Weight: 15)
**Visual Effects:**
- Bright white core expanding and fading
- 3 expanding ring waves (yellow, orange, red)
- 100 particle explosion

**Gameplay Effects:**
- Kills all AI within 20-unit radius
- Awards 100 points per AI killed
- Spawns 5 bonus food items

#### Black Hole (Weight: 10)
**Visual Effects:**
- Black sphere event horizon
- Orange rotating accretion disk
- Purple glow rings
- Particle attraction effect

**Gameplay Effects:**
- Duration: 8 seconds
- Attracts food within 15-unit radius
- Swallows food that gets too close
- Kills AI that get within 3 units (+80 points)
- Player with invincibility can destroy it (+200 points)

#### Meteor Shower (Weight: 20)
**Visual Effects:**
- 8-12 falling meteors with tails
- Impact particle effects

**Gameplay Effects:**
- Each meteor becomes a star (50% chance golden)
- Bonus food collection opportunity

#### Wormhole (Weight: 10)
**Visual Effects:**
- 3-layer spinning rings (cyan/magenta)
- Particle vortex effects

**Gameplay Effects:**
- Teleports player to random safe location
- Awards 50 bonus points
- Useful for escaping danger

#### Stellar Blessing (Weight: 25)
**Visual Effects:**
- 5 golden light beams from above
- Golden particle shower

**Gameplay Effects:**
- Instant 100 points
- 10 seconds of double score
- Spawns 8 bonus food items

#### Cosmic Storm (Weight: 20)
**Visual Effects:**
- 20 purple particles orbiting player
- Swirling storm effect

**Gameplay Effects:**
- Player gets speed boost for 6 seconds
- All AI dragons slowed by 50%
- Tactical advantage period

---

## Scoring System

### Base Scores
| Action | Points |
|--------|--------|
| Regular Star | 10 |
| Golden Star | 30 |
| AI Kill (touch) | 30 + (kills × 5) |
| AI Kill (invincible) | 50 + (kills × 10) |
| Fire Breath Kill | 50 |
| Black Hole Kill | 80 |

### Multipliers
- **Combo System**: +5 points per combo level (eating within 3 seconds)
- **Double Score Power-Up**: 2x all food points

### Event Bonuses
| Event | Bonus |
|-------|-------|
| Supernova AI Kill | 100 per AI |
| Conquer Black Hole | 200 |
| Wormhole Travel | 50 |
| Stellar Blessing | 100 + double score |
| Shield Collect | 25 |
| Bonus Power-Up | 50-100 random |

### Milestone Encouragements
| Food Eaten | Message |
|------------|---------|
| 10 | "10 food! Keep going!" |
| 25 | "25! You're amazing!" |
| 50 | "50! Legendary player!" |
| Every 25 after 50 | "Unstoppable!" |

---

## UI System

### HUD Elements
- **Score Display**: Top-left, always visible
- **Combo Counter**: Below score, visible during combos
- **Active Effects**: Top-right, shows power-up timers
- **Notifications**: Center screen, animated messages

### Screens
1. **Start Screen**
   - Game title and subtitle
   - AI dragon list
   - Power-up list
   - Cosmic events list
   - Start button

2. **Game Over Screen**
   - Final score
   - Food eaten count
   - Maximum length achieved
   - Power-ups collected
   - AI kills count
   - Restart button

### Visual Feedback
- Particle effects for food collection
- Glow effects for power-ups
- Screen notifications for achievements
- Color-coded messages

---

## Performance Optimizations

- Efficient grid-based collision detection
- Object pooling for particles
- Level-of-detail for distant objects
- Automatic cleanup of expired effects
- Optimized shadow mapping

---

*This document covers all features as of version 1.0.0*
