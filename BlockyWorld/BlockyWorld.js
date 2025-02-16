class BlockyWorld {
    constructor() {
        this.camera = new Camera();
        // Position camera to look down at world
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

        // FOV control
        this.fov = 60; // Default FOV

        // Add zoom controls
        document.getElementById('zoomIn').onclick = () => {
            this.fov = Math.max(this.fov - 5, 30); // Minimum FOV of 30
        };
        document.getElementById('zoomOut').onclick = () => {
            this.fov = Math.min(this.fov + 5, 90); // Maximum FOV of 90
        };

        this.worldMap = this.createMazeMap();
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
        const startTime = performance.now();

        // Main view rendering with FOV
        var projMat = new Matrix4();
        projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 500);
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
        this.drawChest();

        const duration = performance.now() - startTime;
        sendTextToHTML("ms: " + Math.floor(duration), "numdot");
    }
}