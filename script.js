class TicTacToe3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        
        this.cubes = [];
        this.gameBoard = [];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningLine = [];
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.isAITurn = false;
        
        this.cubeSize = 0.8;
        this.cubeSpacing = 1.2;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        
        // Setup renderer
        const container = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // Setup controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 15;
        this.controls.minDistance = 3;
        
        // Setup raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add lighting
        this.setupLighting();
        
        // Create 3D grid
        this.createGameBoard();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Soft fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Colored accent lights for glassy effect
        const accentLight1 = new THREE.PointLight(0xff6b6b, 0.15, 15);
        accentLight1.position.set(5, 3, 5);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x4ecdc4, 0.15, 15);
        accentLight2.position.set(-5, 3, -5);
        this.scene.add(accentLight2);
        
        // Top light for glassy highlights
        const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
        topLight.position.set(0, 10, 0);
        this.scene.add(topLight);
    }
    
    createGameBoard() {
        // Initialize 3D game board array
        this.gameBoard = Array(3).fill().map(() => 
            Array(3).fill().map(() => Array(3).fill(null))
        );
        
        // Create cubes for each position
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    this.createCube(x, y, z);
                }
            }
        }
    }
    
    createCube(x, y, z) {
        // Create transparent cube geometry
        const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
        
        // Create glassy material
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide,
            shininess: 100,
            specular: 0x444444
        });
        
        const cube = new THREE.Mesh(geometry, material);
        
        // Position cube in 3D space
        cube.position.set(
            (x - 1) * this.cubeSpacing,
            (y - 1) * this.cubeSpacing,
            (z - 1) * this.cubeSpacing
        );
        
        // Store cube data
        cube.userData = {
            x: x,
            y: y,
            z: z,
            occupied: false,
            player: null
        };
        
        this.scene.add(cube);
        this.cubes.push(cube);
    }
    
    setupEventListeners() {
        // Mouse move for hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        // Mouse click for placing markers
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Game mode selector
        document.getElementById('game-mode').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.resetGame();
        });
        
        // Floating camera controls
        document.getElementById('camera-controls-btn').addEventListener('click', () => {
            this.toggleCameraPanel();
        });
        
        document.getElementById('close-camera-panel').addEventListener('click', () => {
            this.toggleCameraPanel();
        });
        
        // Rotation controls
        document.getElementById('x-rotation').addEventListener('input', (e) => {
            this.rotateCamera('x', e.target.value);
            document.getElementById('x-value').textContent = e.target.value + '°';
        });
        
        document.getElementById('y-rotation').addEventListener('input', (e) => {
            this.rotateCamera('y', e.target.value);
            document.getElementById('y-value').textContent = e.target.value + '°';
        });
        
        document.getElementById('z-rotation').addEventListener('input', (e) => {
            this.rotateCamera('z', e.target.value);
            document.getElementById('z-value').textContent = e.target.value + '°';
        });
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubes);
        
        // Reset all cube materials
        this.cubes.forEach(cube => {
            if (!cube.userData.occupied) {
                cube.material.opacity = 0.05;
                cube.material.color.setHex(0xffffff);
                cube.material.specular.setHex(0x444444);
            }
        });
        
        // Highlight hovered cube
        if (intersects.length > 0 && !intersects[0].object.userData.occupied) {
            const hoveredCube = intersects[0].object;
            hoveredCube.material.opacity = 0.2;
            hoveredCube.material.color.setHex(0xff6b6b);
            hoveredCube.material.specular.setHex(0xff6b6b);
        }
    }
    
    onMouseClick(event) {
        if (!this.gameActive || this.isAITurn) return;
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubes);
        
        console.log('Click detected, intersects:', intersects.length);
        
        if (intersects.length > 0) {
            const clickedCube = intersects[0].object;
            console.log('Clicked cube:', clickedCube.userData);
            if (!clickedCube.userData.occupied) {
                console.log('Placing marker for player:', this.currentPlayer);
                this.placeMarker(clickedCube);
            } else {
                console.log('Cube already occupied');
            }
        }
    }
    
    placeMarker(cube) {
        const { x, y, z } = cube.userData;
        
        console.log('PlaceMarker called for position:', x, y, z, 'player:', this.currentPlayer);
        
        // Update game board
        this.gameBoard[x][y][z] = this.currentPlayer;
        cube.userData.occupied = true;
        cube.userData.player = this.currentPlayer;
        
        // Create 3D marker
        this.createMarker(cube, this.currentPlayer);
        
        console.log('Marker created, switching player');
        
        // Check for win
        if (this.checkWin(x, y, z)) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updatePlayerDisplay();
            
            // If AI mode and it's AI's turn, make AI move
            if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
                this.isAITurn = true;
                this.updateStatusForAITurn();
                setTimeout(() => {
                    this.makeAIMove();
                }, 1000); // 1 second delay for better UX
            }
        }
    }
    
    createMarker(cube, player) {
        console.log('Creating marker for player:', player);
        
        // Create 2D HTML overlay for the marker
        const markerDiv = document.createElement('div');
        markerDiv.className = 'game-marker';
        markerDiv.textContent = player;
        markerDiv.style.color = player === 'X' ? '#ff6b6b' : '#4ecdc4';
        markerDiv.style.fontSize = '24px';
        markerDiv.style.fontWeight = 'bold';
        markerDiv.style.position = 'absolute';
        markerDiv.style.pointerEvents = 'none';
        markerDiv.style.zIndex = '1000';
        markerDiv.style.opacity = '0';
        markerDiv.style.transition = 'opacity 0.5s ease';
        
        // Get the canvas container
        const canvasContainer = document.getElementById('game-canvas');
        canvasContainer.appendChild(markerDiv);
        
        // Calculate position based on cube position
        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(cube.matrixWorld);
        vector.project(this.camera);
        
        const x = (vector.x * 0.5 + 0.5) * canvasContainer.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * canvasContainer.clientHeight;
        
        markerDiv.style.left = x + 'px';
        markerDiv.style.top = y + 'px';
        markerDiv.style.transform = 'translate(-50%, -50%)';
        
        // Animate the marker appearance
        setTimeout(() => {
            markerDiv.style.opacity = '1';
        }, 100);
        
        // Store reference
        cube.userData.marker = markerDiv;
        cube.userData.player = player;
        
        console.log('2D marker created for player:', player, 'at position:', x, y);
    }
    
    toggleCameraPanel() {
        const panel = document.getElementById('camera-controls-panel');
        panel.classList.toggle('show');
    }
    
    makeAIMove() {
        if (!this.gameActive || !this.isAITurn) return;
        
        // Simple AI: Find the best available move
        const bestMove = this.findBestMove();
        
        if (bestMove) {
            const { x, y, z } = bestMove;
            const cube = this.cubes.find(c => 
                c.userData.x === x && 
                c.userData.y === y && 
                c.userData.z === z
            );
            
            if (cube && !cube.userData.occupied) {
                this.placeMarker(cube);
                this.isAITurn = false;
            }
        }
    }
    
    findBestMove() {
        // Simple AI strategy:
        // 1. Try to win if possible
        // 2. Block opponent's winning move
        // 3. Take center if available
        // 4. Take any available corner
        // 5. Take any available edge
        
        const availableMoves = [];
        
        // Collect all available moves
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    if (this.gameBoard[x][y][z] === null) {
                        availableMoves.push({ x, y, z });
                    }
                }
            }
        }
        
        if (availableMoves.length === 0) return null;
        
        // 1. Try to win
        for (const move of availableMoves) {
            this.gameBoard[move.x][move.y][move.z] = 'O';
            if (this.checkWin(move.x, move.y, move.z)) {
                this.gameBoard[move.x][move.y][move.z] = null;
                return move;
            }
            this.gameBoard[move.x][move.y][move.z] = null;
        }
        
        // 2. Block opponent's winning move
        for (const move of availableMoves) {
            this.gameBoard[move.x][move.y][move.z] = 'X';
            if (this.checkWin(move.x, move.y, move.z)) {
                this.gameBoard[move.x][move.y][move.z] = null;
                return move;
            }
            this.gameBoard[move.x][move.y][move.z] = null;
        }
        
        // 3. Take center if available
        if (this.gameBoard[1][1][1] === null) {
            return { x: 1, y: 1, z: 1 };
        }
        
        // 4. Take any available corner
        const corners = [
            { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
            { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 },
            { x: 0, y: 0, z: 2 }, { x: 2, y: 0, z: 2 },
            { x: 0, y: 2, z: 2 }, { x: 2, y: 2, z: 2 }
        ];
        
        for (const corner of corners) {
            if (this.gameBoard[corner.x][corner.y][corner.z] === null) {
                return corner;
            }
        }
        
        // 5. Take any available move
        return availableMoves[0];
    }
    

    
    checkWin(x, y, z) {
        const player = this.currentPlayer;
        
        // Check all possible winning lines through the placed marker
        const directions = [
            // X-axis lines
            [[1, 0, 0], [-1, 0, 0]],
            // Y-axis lines
            [[0, 1, 0], [0, -1, 0]],
            // Z-axis lines
            [[0, 0, 1], [0, 0, -1]],
            // Diagonal lines in XY plane
            [[1, 1, 0], [-1, -1, 0]],
            [[1, -1, 0], [-1, 1, 0]],
            // Diagonal lines in XZ plane
            [[1, 0, 1], [-1, 0, -1]],
            [[1, 0, -1], [-1, 0, 1]],
            // Diagonal lines in YZ plane
            [[0, 1, 1], [0, -1, -1]],
            [[0, 1, -1], [0, -1, 1]],
            // 3D diagonal lines
            [[1, 1, 1], [-1, -1, -1]],
            [[1, 1, -1], [-1, -1, 1]],
            [[1, -1, 1], [-1, 1, -1]],
            [[1, -1, -1], [-1, 1, 1]]
        ];
        
        for (const [dir1, dir2] of directions) {
            let count = 1; // Count the current position
            const winningPositions = [{x, y, z}];
            
            // Check in first direction
            for (let i = 1; i < 3; i++) {
                const newX = x + dir1[0] * i;
                const newY = y + dir1[1] * i;
                const newZ = z + dir1[2] * i;
                
                if (this.isValidPosition(newX, newY, newZ) && 
                    this.gameBoard[newX][newY][newZ] === player) {
                    count++;
                    winningPositions.push({x: newX, y: newY, z: newZ});
                } else {
                    break;
                }
            }
            
            // Check in second direction
            for (let i = 1; i < 3; i++) {
                const newX = x + dir2[0] * i;
                const newY = y + dir2[1] * i;
                const newZ = z + dir2[2] * i;
                
                if (this.isValidPosition(newX, newY, newZ) && 
                    this.gameBoard[newX][newY][newZ] === player) {
                    count++;
                    winningPositions.push({x: newX, y: newY, z: newZ});
                } else {
                    break;
                }
            }
            
            if (count >= 3) {
                this.winningLine = winningPositions;
                return true;
            }
        }
        
        return false;
    }
    
    isValidPosition(x, y, z) {
        return x >= 0 && x < 3 && y >= 0 && y < 3 && z >= 0 && z < 3;
    }
    
    checkDraw() {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    if (this.gameBoard[x][y][z] === null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    handleWin() {
        this.gameActive = false;
        this.highlightWinningLine();
        this.updateStatusMessage(`Player ${this.currentPlayer} wins!`);
        
        // Animate winning line
        this.winningLine.forEach((pos, index) => {
            const cube = this.cubes.find(c => 
                c.userData.x === pos.x && 
                c.userData.y === pos.y && 
                c.userData.z === pos.z
            );
            
            if (cube && cube.userData.marker) {
                setTimeout(() => {
                    // Animate 2D HTML markers
                    const marker = cube.userData.marker;
                    marker.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    marker.style.transition = 'transform 0.2s ease';
                    
                    setTimeout(() => {
                        marker.style.transform = 'translate(-50%, -50%) scale(1)';
                    }, 200);
                }, index * 100);
            }
        });
    }
    
    handleDraw() {
        this.gameActive = false;
        this.updateStatusMessage("It's a draw!");
    }
    
    highlightWinningLine() {
        this.winningLine.forEach(pos => {
            const cube = this.cubes.find(c => 
                c.userData.x === pos.x && 
                c.userData.y === pos.y && 
                c.userData.z === pos.z
            );
            
            if (cube && cube.userData.marker) {
                // Highlight 2D HTML markers
                const marker = cube.userData.marker;
                marker.style.textShadow = '0 0 10px #ff6b6b';
                marker.style.filter = 'brightness(1.5)';
            }
        });
    }
    
    resetGame() {
        // Clear game board
        this.gameBoard = Array(3).fill().map(() => 
            Array(3).fill().map(() => Array(3).fill(null))
        );
        
        // Remove all markers
        this.cubes.forEach(cube => {
            if (cube.userData.marker) {
                // Remove 2D HTML markers
                if (cube.userData.marker.remove) {
                    cube.userData.marker.remove();
                }
                
                cube.userData.marker = null;
                cube.userData.text = null;
                cube.userData.occupied = false;
                cube.userData.player = null;
            }
        });
        
        // Reset game state
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningLine = [];
        this.isAITurn = false;
        
        // Reset camera
        this.camera.position.set(5, 5, 5);
        this.controls.reset();
        
        // Reset sliders
        document.getElementById('x-rotation').value = 0;
        document.getElementById('y-rotation').value = 0;
        document.getElementById('z-rotation').value = 0;
        document.getElementById('x-value').textContent = '0°';
        document.getElementById('y-value').textContent = '0°';
        document.getElementById('z-value').textContent = '0°';
        
        this.updatePlayerDisplay();
        this.updateStatusMessage("Click on any cube to place your marker!");
    }
    
    rotateCamera(axis, value) {
        const radians = (value * Math.PI) / 180;
        const distance = this.camera.position.length();
        
        switch(axis) {
            case 'x':
                this.camera.position.x = distance * Math.sin(radians);
                this.camera.position.y = distance * Math.cos(radians);
                break;
            case 'y':
                this.camera.position.x = distance * Math.cos(radians);
                this.camera.position.z = distance * Math.sin(radians);
                break;
            case 'z':
                this.camera.position.y = distance * Math.sin(radians);
                this.camera.position.z = distance * Math.cos(radians);
                break;
        }
        
        this.camera.lookAt(0, 0, 0);
    }
    
    updatePlayerDisplay() {
        document.getElementById('player-display').textContent = this.currentPlayer;
    }
    
    updateStatusMessage(message) {
        document.getElementById('status-message').textContent = message;
    }
    
    updateStatusForAITurn() {
        if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
            this.updateStatusMessage("AI is thinking...");
        }
    }
    
    onWindowResize() {
        const container = document.getElementById('game-canvas');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update 2D marker positions when camera moves
        this.cubes.forEach(cube => {
            if (cube.userData.occupied && cube.userData.marker) {
                const vector = new THREE.Vector3();
                vector.setFromMatrixPosition(cube.matrixWorld);
                vector.project(this.camera);
                
                const canvasContainer = document.getElementById('game-canvas');
                const x = (vector.x * 0.5 + 0.5) * canvasContainer.clientWidth;
                const y = (vector.y * -0.5 + 0.5) * canvasContainer.clientHeight;
                
                cube.userData.marker.style.left = x + 'px';
                cube.userData.marker.style.top = y + 'px';
            }
        });
        
        this.controls.update();
        TWEEN.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe3D();
}); 