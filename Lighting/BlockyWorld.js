class BlockyWorld {
    constructor() {
        this.camera = new Camera();
        this.camera.eye = new Vector3([0, 2, 10]);
        this.camera.at = new Vector3([0, 0, -100]);
        this.camera.up = new Vector3([0, 1, 0]);
        
        this.worldSize = 31;
        
        this.wallCube = new Cube();
        this.wallCube.textureNum = 0;
        
        this.groundCube = new Cube();
        this.groundCube.textureNum = 1;
    
        this.chestCube = new Cube();
        this.chestCube.textureNum = 2;      
        this.centerX = Math.floor(this.worldSize / 2);
        this.centerZ = Math.floor(this.worldSize / 2);
    
        this.gameState = 'playing';
        this.gameEndText = '';
        this.gameEndColor = '';
    
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.className = 'reset-button';
        resetButton.onclick = () => this.resetGame();
        document.querySelector('.canvas-container').appendChild(resetButton);
    
        canvas.addEventListener('mousedown', (e) => {
            if (e.shiftKey && e.button === 0) {
                this.checkChestInteraction();
            }
        });
    
        // FOV control
        this.fov = 60;
        document.getElementById('zoomIn').onclick = () => {
            this.fov = Math.max(this.fov - 5, 30);
        };
        document.getElementById('zoomOut').onclick = () => {
            this.fov = Math.min(this.fov + 5, 90);
        };
    
        this.worldMap = this.createMazeMap();
    }
    
    resetGame() {
        this.gameState = 'playing';
        this.gameEndText = '';
        this.gameEndColor = '';
        
        this.camera.eye = new Vector3([0, 2, 10]);
        this.camera.at = new Vector3([0, 0, -100]);
        this.camera.up = new Vector3([0, 1, 0]);
        
        this.fov = 60;
        
        this.worldMap = this.createMazeMap();
        
        const textOverlay = document.getElementById('gameEndText');
        if (textOverlay) {
            textOverlay.remove();
        }
        
        if (!gl) {
            gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
            connectVariablesToGLSL();
            initTextures();
        }
    }

    checkChestInteraction() {
        console.log("Checking chest interaction");
        if (this.gameState !== 'playing') return;
    
        // Calculate distance to chest
        const playerX = this.camera.eye.elements[0];
        const playerZ = this.camera.eye.elements[2];
        const chestX = this.centerX - this.worldSize/2;
        const chestZ = this.centerZ - this.worldSize/2;
    
        const distance = Math.sqrt(
            Math.pow(playerX - chestX, 2) + 
            Math.pow(playerZ - chestZ, 2)
        );
    
        console.log("Distance to chest:", distance);
    
        if (distance <= 1.5) { // Within ~1 cube distance
            console.log("Within range!");
            // 50/50 chance of winning or dying
            if (Math.random() < 0.5) {
                console.log("Won!");
                this.gameState = 'won';
                this.gameEndColor = '#8B8000';
                this.gameEndText = 'You Won!';
            } else {
                console.log("Died!");
                this.gameState = 'died';
                this.gameEndColor = '#FF0000';
                this.gameEndText = 'You Died';
            }
        }
    }

    createMazeMap() {
        let map = Array(this.worldSize).fill().map(() => Array(this.worldSize).fill(1));
        
        const startX = 1;
        const startY = 1;
        this.generateMaze(map, startX, startY);
        
        map[1][0] = 0;
        
        // Create an empty 5x5 area in the center
        for(let x = -2; x <= 2; x++) {
            for(let z = -2; z <= 2; z++) {
                const goalX = this.centerX + x;
                const goalZ = this.centerZ + z;
                if (goalX >= 0 && goalX < this.worldSize && 
                    goalZ >= 0 && goalZ < this.worldSize) {
                    map[goalX][goalZ] = 0;
                }
            }
        }
        
        return map;
    }

    generateMaze(map, x, y) {
        map[x][y] = 0;
        
        const directions = [
            [0, 2],
            [2, 0],
            [0, -2],
            [-2, 0]
        ];
        
        // Shuffle directions for randomness
        this.shuffleArray(directions);
        
        for (let [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            const wallX = x + dx/2;
            const wallY = y + dy/2;
            
            if (newX > 0 && newX < this.worldSize - 2 && 
                newY > 0 && newY < this.worldSize - 1 && 
                map[newX][newY] === 1 && 
                map[newX+1][newY] === 1) {
                
                // Carve path through wall
                map[wallX][wallY] = 0;
                
                // For vertical paths, carve adjacent vertical path
                if (dx !== 0) {
                    map[wallX][wallY] = 0;
                }
                
                this.generateMaze(map, newX, newY);
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    drawGround() {
        this.groundCube.matrix = new Matrix4();
        if (g_normalOn) this.groundCube.textureNum = 3;
        this.groundCube.matrix.translate(0, -1, 0);
        this.groundCube.matrix.scale(100, 0.1, 100);
        this.groundCube.matrix.translate(-0.5, 0, -0.5);
        this.groundCube.renderfaster();
    }

    drawSky() {
        gl.clearColor(0.529, 0.808, 0.922, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawWalls() {
        for (let x = 0; x < this.worldSize; x++) {
            for (let z = 0; z < this.worldSize; z++) {
                const cellType = this.worldMap[x][z];
                if (cellType === 1) {  // Wall
                    this.wallCube.matrix = new Matrix4();
                    this.wallCube.matrix.translate(x - this.worldSize/2, 0, z - this.worldSize/2);
                    this.wallCube.renderfaster();
                    
                    this.wallCube.matrix = new Matrix4();
                    this.wallCube.matrix.translate(x - this.worldSize/2, 1, z - this.worldSize/2);
                    this.wallCube.renderfaster();

                    this.wallCube.matrix = new Matrix4();
                    this.wallCube.matrix.translate(x - this.worldSize/2, 2, z - this.worldSize/2);
                    this.wallCube.renderfaster();
                }
            }
        }
    }

    drawChest() {
        this.chestCube.matrix = new Matrix4();
        this.chestCube.matrix.translate(this.centerX - this.worldSize/2, 0, this.centerZ - this.worldSize/2);
        this.chestCube.renderfaster();
    }

    render() {
        if (this.gameState !== 'playing') {
            const originalGl = gl;
            
            gl.clearColor(
                this.gameState === 'died' ? 0.0 : 0.545,
                this.gameState === 'died' ? 0.0 : 0.545,
                0.0,
                1.0
            );
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.flush();
    
            let textOverlay = document.getElementById('gameEndText');
            if (!textOverlay) {
                textOverlay = document.createElement('div');
                textOverlay.id = 'gameEndText';
                const canvasRect = canvas.getBoundingClientRect();
                textOverlay.style.position = 'absolute';
                textOverlay.style.width = canvasRect.width + 'px';
                textOverlay.style.left = canvasRect.left + 'px';
                textOverlay.style.top = canvasRect.top + 'px';
                textOverlay.style.height = canvasRect.height + 'px';
                textOverlay.style.display = 'flex';
                textOverlay.style.justifyContent = 'center';
                textOverlay.style.alignItems = 'center';
                textOverlay.style.fontSize = '72px';
                textOverlay.style.fontWeight = 'bold';
                textOverlay.style.fontFamily = 'Arial';
                textOverlay.style.pointerEvents = 'none';
                document.body.appendChild(textOverlay);
            }
        
            textOverlay.style.color = this.gameState === 'died' ? '#FF0000' : '#0000FF';
            textOverlay.textContent = this.gameEndText;
            return;
        }
        
        else {
            const textOverlay = document.getElementById('gameEndText');
            if (textOverlay) {
                textOverlay.remove();
            }
        }
    
        const startTime = performance.now();
    
        // Set up projection matrix
        var projMat = new Matrix4();
        projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 500);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    
        // Set up view matrix
        var viewMat = new Matrix4();
        viewMat.setLookAt(
            this.camera.eye.elements[0], this.camera.eye.elements[1], this.camera.eye.elements[2],
            this.camera.at.elements[0], this.camera.at.elements[1], this.camera.at.elements[2],
            this.camera.up.elements[0], this.camera.up.elements[1], this.camera.up.elements[2]
        );
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    
        // Set up model matrix
        var modelMat = new Matrix4();
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);
    
        // Set up global rotation matrix
        var rotateMatrix = new Matrix4();
        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotateMatrix.elements);
        
        // Pass lighting parameters
        gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
        gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
        gl.uniform3f(u_spotlightDir, g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]);
        gl.uniform3f(u_cameraPos, this.camera.eye.elements[0], this.camera.eye.elements[1], this.camera.eye.elements[2]);
        gl.uniform1i(u_lightOn, g_lightOn);
        gl.uniform1i(u_spotlightOn, g_spotlightOn);
        gl.uniform1i(u_normalVis, g_normalOn);
    
        // Draw the scene
        this.drawSky();
        this.drawGround();
        this.drawWalls();
        this.drawChest();
        
        // Draw the sun
        var sun = new Cube();
        sun.textureNum = 3; // Use the sun texture
        sun.matrix = new Matrix4();
        
        // Position the sun based on the current light position
        const sunScale = 5.0; // Make it large
        const sunDistance = 50.0; // Place it far away
        
        // Calculate sun position based on a point on a large sphere around the world
        const sunX = sunDistance * Math.cos(g_seconds * 0.1);
        const sunY = sunDistance * Math.abs(Math.sin(g_seconds * 0.1)) + 20;
        const sunZ = sunDistance * Math.sin(g_seconds * 0.1);
        
        sun.matrix.translate(sunX, sunY, sunZ);
        sun.matrix.scale(sunScale, sunScale, sunScale);
        sun.matrix.translate(-0.5, -0.5, -0.5);
        sun.render();
        
        // Draw a small cube to represent the point light
        if (g_lightOn) {
            var lightCube = new Cube();
            lightCube.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1];
            lightCube.matrix = new Matrix4();
            lightCube.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
            lightCube.matrix.scale(0.2, 0.2, 0.2);
            lightCube.matrix.translate(-0.5, -0.5, -0.5);
            lightCube.render();
        }
        
        // Draw a small cube to represent the spotlight if enabled
        if (g_spotlightOn) {
            var spotlightCube = new Cube();
            spotlightCube.color = [0, 1, 1, 1]; // Cyan for spotlight
            spotlightCube.matrix = new Matrix4();
            spotlightCube.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
            spotlightCube.matrix.scale(0.15, 0.15, 0.15);
            spotlightCube.matrix.translate(-0.5, -0.5, -0.5);
            spotlightCube.render();
        }
        
        // Draw test spheres for light reflection
        var sphere = new Sphere();
        sphere.color = [0.8, 0.2, 0.2, 1.0];
        sphere.matrix = new Matrix4();
        sphere.matrix.translate(-2, 0.5, -3);
        sphere.render();
        
        var sphere2 = new Sphere();
        sphere2.color = [0.2, 0.8, 0.2, 1.0];
        sphere2.matrix = new Matrix4();
        sphere2.matrix.translate(2, 0.5, -3);
        sphere2.render();
    
        const duration = performance.now() - startTime;
        sendTextToHTML("ms: " + Math.floor(duration), "numdot");
    }
}