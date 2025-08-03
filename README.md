# 3D Tic Tac Toe Game

A stunning 3D Tic Tac Toe game built with Three.js, featuring a modern black and dark red theme with smooth animations and interactive 3D controls.

## Features

### 🎮 Game Mechanics
- **3x3x3 Grid**: Full 3D game board with 27 positions
- **Accurate Selection**: Click on any cube to place your marker, including the center position
- **Win Detection**: Detects wins across all axes (X, Y, Z) and diagonals
- **Turn-based**: Alternates between X and O players
- **Draw Detection**: Automatically detects when the game is a draw

### 🎨 Visual Design
- **Dark Theme**: Black and dark red color scheme
- **Transparent Cubes**: Semi-transparent cubes for better 3D visualization
- **3D Markers**: X and O markers created with 3D geometry
- **Smooth Animations**: Every move triggers smooth scale animations
- **Hover Effects**: Cubes highlight when hovered over

### 🎯 Controls
- **Orbit Controls**: Click and drag to rotate the camera around the game board
- **Slider Controls**: Use the X, Y, Z rotation sliders for precise camera control
- **Mouse Interaction**: Click on any cube to place your marker
- **Reset Button**: Start a new game at any time

### ✨ Special Effects
- **Win Animation**: Winning markers pulse and glow when a player wins
- **Glowing Effects**: Winning line highlights with emissive materials
- **Responsive Design**: Works on desktop and mobile devices
- **Status Messages**: Real-time game status updates

## How to Play

1. **Start the Game**: Open `index.html` in a modern web browser
2. **Navigate**: Use your mouse to rotate the camera and view the 3D grid from different angles
3. **Place Markers**: Click on any transparent cube to place your X or O marker
4. **Win Conditions**: Get 3 of your markers in a row across any axis or diagonal
5. **Reset**: Click the "Reset Game" button to start over

## Technical Details

### Technologies Used
- **Three.js**: 3D graphics and rendering
- **TWEEN.js**: Smooth animations
- **Vanilla JavaScript**: Game logic and interactions
- **HTML5/CSS3**: Modern responsive UI

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Optimized 3D rendering with WebGL
- Smooth 60fps animations
- Responsive design for all screen sizes

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # Game logic and Three.js implementation
└── README.md          # This file
```

## Game Rules

1. **Players**: Two players (X and O)
2. **Objective**: Get 3 of your markers in a row
3. **Winning Lines**: 
   - Horizontal lines (X, Y, or Z axis)
   - Vertical lines (X, Y, or Z axis)
   - Diagonal lines (any plane or 3D diagonal)
4. **Turns**: Players alternate placing markers
5. **Draw**: When all 27 positions are filled without a winner

## 3D Navigation Tips

- **Orbit Controls**: Click and drag to rotate around the game board
- **Zoom**: Scroll to zoom in/out
- **Slider Controls**: Use the X, Y, Z sliders for precise camera positioning
- **Center View**: The center cube (1,1,1) is accessible from any angle

## Development

To modify or extend the game:

1. **Add New Features**: Modify `script.js` for game logic changes
2. **Update Styling**: Edit `styles.css` for visual changes
3. **Change 3D Elements**: Update Three.js objects in the main class
4. **Add Animations**: Use TWEEN.js for new animation effects

## License

This project is open source and available under the MIT License.

---

Enjoy playing 3D Tic Tac Toe! 🎮✨ 