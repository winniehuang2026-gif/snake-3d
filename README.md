# Cosmic Dragon - 3D Snake Game

A stunning 3D snake game set in a cosmic universe, built with Three.js. Control your dragon through space, collect stars, defeat AI opponents, and experience epic cosmic events!

**[Play Now](https://winniehuang2026-gif.github.io/snake-3d/)**

![Game Preview](https://img.shields.io/badge/Game-3D%20Snake-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-orange)

## Features

### Core Gameplay
- Classic snake mechanics in a beautiful 3D environment
- 100x100 grid battlefield for expansive exploration
- Smooth camera following system
- Progressive difficulty with speed increases

### Visual Design
- **Space Nebula Background**: 3000+ stars with realistic colors (white, blue, orange)
- **Nebula Clouds**: Multi-layered cosmic clouds with glowing cores
- **Star Food**: Collectible suns with corona effects, lens flares, and point lights
- **Asteroid Obstacles**: Irregular rocks with energy crystals
- **Dragon Model**: Detailed dragon with horns, eyes, spikes, and glowing effects

### AI Opponents
- 6 AI dragons with unique colors (Red, Purple, Cyan, Gold)
- Pathfinding AI that chases nearest food
- AI collision system - touch them to defeat them!
- Respawn system after 5 seconds

### Power-Up System (11 Types)
| Power-Up | Effect | Duration |
|----------|--------|----------|
| Speed Boost | Move faster | 12s |
| Slow Motion | Move slower (easier control) | 12s |
| Invincibility | Pass through walls & obstacles | 12s |
| Double Score | 2x points for food | 12s |
| Shrink | Reduce body length | Instant |
| Magnet | Attract nearby food | 12s |
| Fire Breath | Shoot fire, kill AI in front | 12s |
| Shield | Temporary invincibility + bonus | 6s |
| Bonus | Instant score boost | Instant |
| Reverse | Inverted controls (rare) | 6s |
| Bomb | Game over if not protected (rare) | Instant |

### Cosmic Events System
Random cosmic events occur every 15-30 seconds:

| Event | Description |
|-------|-------------|
| **Supernova** | Massive explosion that eliminates nearby AI dragons (+100 each) and spawns bonus food |
| **Black Hole** | 8-second gravitational anomaly that pulls in food and AI. Conquer it while invincible for +200! |
| **Meteor Shower** | 8-12 meteors rain down, each becoming collectible star food |
| **Wormhole** | Instant teleportation to a random location (+50 bonus) |
| **Stellar Blessing** | +100 points, 10s double score, and 8 bonus food spawns |
| **Cosmic Storm** | Player speeds up, all AI slows down for 6 seconds |

### Scoring System
- Regular star: 10 points
- Golden star: 30 points
- Combo multiplier for consecutive eating
- AI kills: 30+ points (increases with kill count)
- Cosmic event bonuses

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move Up |
| S / Arrow Down | Move Down |
| A / Arrow Left | Move Left |
| D / Arrow Right | Move Right |

## Installation

### Play Online
Visit: https://winniehuang2026-gif.github.io/snake-3d/

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/winniehuang2026-gif/snake-3d.git
cd snake-3d
```

2. Start a local server:
```bash
npm run dev
```

3. Open your browser and navigate to the displayed URL (usually `http://localhost:3000`)

## Tech Stack

- **Three.js** (v0.160.0) - 3D graphics rendering
- **Vanilla JavaScript** - Game logic with ES6 modules
- **HTML5/CSS3** - UI and styling

## Project Structure

```
snake-3d/
├── index.html          # Main HTML file with UI elements
├── style.css           # Styling and animations
├── src/
│   └── main.js         # Game logic (2000+ lines)
├── package.json        # Project configuration
├── LICENSE             # MIT License
├── README.md           # This file
├── FEATURES.md         # Detailed feature documentation
└── DESIGN.md           # Technical design document
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

Requires WebGL support.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Inspired by classic Snake games
- Space theme inspired by cosmic phenomena

---

Made with love in the cosmos
