class BlockyWorld {
    constructor() {
        this.camera = new Camera();
        // Modify initial camera position for better view
        this.camera.eye = new Vector(0, 3, 10);
        this.camera.at = new Vector(0, 0, -100);
        this.camera.up = new Vector(0, 1, 0);
        
        // World size parameters
        this.worldSize = 32;
        this.worldMap = this.createWorldMap();
    }

    createWorldMap() {
        // Initialize 32x32 array with all zeros
        let map = Array(this.worldSize).fill().map(() => Array(this.worldSize).fill(0));
        
        // Add border walls
        for (let i = 0; i < this.worldSize; i++) {
            for (let j = 0; j < this.worldSize; j++) {
                if (i === 0 || i === this.worldSize - 1 || j === 0 || j === this.worldSize - 1) {
                    map[i][j] = Math.floor(Math.random() * 4) + 1; // Random height 1-4
                }
            }
        }
        return map;
    }

    drawGround() {
        // Create a ground plane using a flattened cube
        let ground = new Cube();
        ground.color = [0.4, 0.8, 0.4, 1.0]; // Light green
        ground.matrix.scale(50, 0.1, 50); // Make it wide and flat
        ground.matrix.translate(-0.5, -2, -0.5); // Center it and lower it
        ground.renderfaster();
    }

    drawSky() {
        // Set clear color to sky blue
        gl.clearColor(0.529, 0.808, 0.922, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawWalls() {
        for (let x = 0; x < this.worldSize; x++) {
            for (let z = 0; z < this.worldSize; z++) {
                const height = this.worldMap[x][z];
                if (height > 0) {
                    let wall = new Cube();
                    wall.color = [0.8, 0.8, 0.8, 1.0];
                    wall.matrix.translate(x - this.worldSize/2, 0, z - this.worldSize/2);
                    wall.matrix.scale(1, height, 1);
                    wall.renderfaster();
                }
            }
        }
    }

    render() {
        this.drawSky();
        this.drawGround();
        this.drawWalls();
    }
}