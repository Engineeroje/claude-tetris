# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vanilla JavaScript Tetris implementation with no dependencies. The game runs in the browser using HTML5 Canvas for rendering. It's a single-player implementation of classic Tetris with standard mechanics: 7-piece types, wall kicks, scoring, levels that increase in difficulty, ghost piece preview, and game over/pause states.

## Running the Game

**No build or compile step required.** The game is a static HTML/CSS/JS project.

**Option 1: Direct file open**
```bash
start index.html       # Windows
open index.html        # macOS
xdg-open index.html    # Linux
```

**Option 2: Local HTTP server (recommended)**
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in browser.

## Architecture

### Core Components

**1. `game.js` (~305 lines)**
- **Game State**: `board` (2D array), `current` (active piece), `next` (preview piece), `score`, `lines`, `level`, `gameOver`, `paused`
- **Game Loop**: `requestAnimationFrame`-based loop that accumulates time since last frame and drops pieces when `dropInterval` is exceeded
- **Board Representation**: `ROWS × COLS` matrix where each cell holds 0 (empty) or 1–7 (piece color index)

**2. `index.html`**
- Main `<canvas id="board">` (300×600 px, 10×20 cells at 30px each)
- Side panel with score, lines, level, next-piece preview, and controls
- Overlay div for pause/game-over states

**3. `style.css`**
- Dark retro-arcade theme with flexbox layout
- Canvas styling with subtle shadow and border
- Overlay with `backdrop-filter: blur(4px)` for pause/game-over UI

### Key Functions & Logic

| Function | Purpose |
|----------|---------|
| `collide(shape, ox, oy)` | Detects collision; returns true if piece hits boundary or existing blocks |
| `rotateCW(shape)` | Rotates piece 90° clockwise via matrix transpose + row reversal |
| `tryRotate()` | Attempts rotation with wall kicks: `[0, ±1, ±2]` column offsets |
| `merge()` | Locks current piece into board |
| `clearLines()` | Scans bottom-to-top, removes complete rows, inserts empty rows at top |
| `ghostY()` | Calculates visual preview position of where piece will land |
| `hardDrop()` | Instant drop; awards 2 pts/cell fallen |
| `softDrop()` | Manual down; awards 1 pt/row |
| `lockPiece()` | Merges piece, clears lines, spawns next |
| `loop(ts)` | Main game loop; driven by RAF, accumulates delta time |
| `draw()` | Renders grid, board blocks, ghost piece, active piece to canvas |

### Game Flow

```
init()
  → createBoard() → randomPiece() → spawn() → loop()
  
loop()
  → accumulate time delta
  → if delta ≥ dropInterval: drop piece or lockPiece()
  → draw()
  → RAF(loop)

keydown
  → move/rotate/soft-drop/hard-drop/pause
```

Collision triggers `lockPiece()`, which merges blocks, clears complete lines, levels up every 10 lines, and spawns next piece. If new piece already collides, `endGame()` fires.

## Tunable Constants (in `game.js`)

| Constant | Default | Purpose |
|----------|---------|---------|
| `COLS` | 10 | Board width in cells |
| `ROWS` | 20 | Board height in cells |
| `BLOCK` | 30 | Pixel size of one cell |
| `COLORS[1..7]` | #4dd0e1, #ffd54f, etc. | Hex colors for I, O, T, S, Z, J, L pieces |
| `LINE_SCORES[1..4]` | [0, 100, 300, 500, 800] | Points for clearing 1, 2, 3, or 4 lines (×level) |
| Initial `dropInterval` | 1000 ms | Starting fall speed |

**Note:** If you change `COLS`, `ROWS`, or `BLOCK`, also update the `<canvas id="board" width="..." height="...">` dimensions in `index.html` to match (`COLS×BLOCK` and `ROWS×BLOCK`).

### Piece Definitions (in `PIECES[]`)

Each piece is a 3×3 or 4×4 grid stored as nested arrays. The value in each cell is either 0 (empty) or 1–7 (the piece type and color index). The I-piece is the only 4×4.

## Development Notes

- **No external libraries**: Pure JS + Canvas 2D API. Changes don't require any build tool.
- **Collision system**: Uses simple iteration over piece shape cells; checks bounds and board occupancy. Wall kicks only try 5 offsets (`[0, ±1, ±2]`), not the full SRS rotation system.
- **Scoring**: Classic Tetris scoring; higher levels award more points. Soft drop = +1/row, hard drop = +2/cell.
- **Level progression**: `level = floor(lines / 10) + 1`; speed = `max(100, 1000 − (level−1)×90)` ms.
- **Ghost piece alpha**: 0.2 (semi-transparent) to distinguish from real piece. Recalculated every frame.
- **Next-piece canvas**: Separate 120×120 canvas using 30px blocks, centered within 4×4 grid.

## Customization Patterns

- **Change colors**: Edit `COLORS` array (hex strings).
- **Adjust difficulty**: Modify `dropInterval` formula or starting `dropInterval`.
- **Add new pieces**: Extend `PIECES` array (not recommended; breaks color count).
- **Scoring tweaks**: Adjust `LINE_SCORES` or multiplier logic in `clearLines()`.

## Controls

| Key | Action |
|-----|--------|
| `←` / `→` | Move left/right |
| `↑` / `X` | Rotate clockwise |
| `↓` | Soft drop |
| `Space` | Hard drop |
| `P` | Pause |
