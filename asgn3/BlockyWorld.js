class BlockyWorld {
    constructor() {
        this.camera = new Camera();
        // Position camera to look down at world
        this.camera.eye = new Vector3([0, 2, 10]);
        this.camera.at = new Vector3([0, 0, -100]);
        this.camera.up = new Vector3([0, 1, 0]);
        
        // World size parameters (use odd number for maze generation)
        this.worldSize = 31;
        
        // Pre-create cube instances for reuse
        this.wallCube = new Cube();
        this.wallCube.textureNum = 0;
        
        this.groundCube = new Cube();
        this.groundCube.textureNum = 1;

        // Create the maze map
        this.worldMap = this.createMazeMap();
    }

    createMazeMap() {
        // Initialize array with walls (1 represents wall, 0 represents path)
        let map = Array(this.worldSize).fill().map(() => Array(this.worldSize).fill(1));
        
        // Start maze generation from the entrance
        const startX = 1;
        const startY = 1;
        this.generateMaze(map, startX, startY);
        
        // Create entrance
        map[1][0] = 0;
        map[2][0] = 0; // Make entrance 2 blocks wide
        
        // Mark the center as the goal
        const centerX = Math.floor(this.worldSize / 2);
        const centerY = Math.floor(this.worldSize / 2);
        map[centerX][centerY] = 2;
        map[centerX+1][centerY] = 2; // Make goal area 2 blocks wide
        
        return map;
    }

    generateMaze(map, x, y) {
        // Mark current cell and adjacent cell as path
        map[x][y] = 0;
        map[x+1][y] = 0; // Make horizontal path 2 blocks wide
        
        // Define possible directions (right, down, left, up)
        const directions = [
            [0, 2],  // right
            [2, 0],  // down
            [0, -2], // left
            [-2, 0]  // up
        ];
        
        // Shuffle directions for randomness
        this.shuffleArray(directions);
        
        // Try each direction
        for (let [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            const wallX = x + dx/2;
            const wallY = y + dy/2;
            
            // Check if new position and adjacent position are within bounds and unvisited
            if (newX > 0 && newX < this.worldSize - 2 && // Adjusted bound check
                newY > 0 && newY < this.worldSize - 1 && 
                map[newX][newY] === 1 && 
                map[newX+1][newY] === 1) { // Check adjacent cell too
                    
                // Carve path through wall
                map[wallX][wallY] = 0;
                map[wallX+1][wallY] = 0; // Make horizontal path 2 blocks wide
                
                // For vertical paths, carve adjacent vertical path
                if (dx !== 0) {
                    map[wallX][wallY] = 0;
                    map[wallX+1][wallY] = 0;
                }
                
                // Continue maze generation from new position
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
                }
                else if (cellType === 2) {  // Goal
                    this.wallCube.matrix = new Matrix4();
                    this.wallCube.matrix.translate(x - this.worldSize/2, 0, z - this.worldSize/2);
                    this.wallCube.matrix.scale(1, 2, 1);
                    const originalColor = this.wallCube.color;
                    this.wallCube.color = [1.0, 0.84, 0.0, 1.0];
                    this.wallCube.renderfaster();
                    this.wallCube.color = originalColor;
                }
            }
        }
    }

    render() {
        const startTime = performance.now();

        var projMat = new Matrix4();
        projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 500);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

        var viewMat = new Matrix4();
        viewMat.setLookAt(
            this.camera.eye.elements[0], this.camera.eye.elements[1], this.camera.eye.elements[2],
            this.camera.at.elements[0], this.camera.at.elements[1], this.camera.at.elements[2],
            this.camera.up.elements[0], this.camera.up.elements[1], this.camera.up.elements[2]
        );
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

        var modelMat = new Matrix4();
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);

        var rotateMatrix = new Matrix4();
        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotateMatrix.elements);

        this.drawSky();
        this.drawGround();
        this.drawWalls();

        const duration = performance.now() - startTime;
        sendTextToHTML("ms: " + Math.floor(duration), "numdot");
    }
}