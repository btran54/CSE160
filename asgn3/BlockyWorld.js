class BlockyWorld {
    constructor() {
        this.camera = new Camera();
        // Position camera to look down at world
        this.camera.eye = new Vector3([0, 2, 10]);
        this.camera.at = new Vector3([0, 0, -100]);
        this.camera.up = new Vector3([0, 1, 0]);
        
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
        ground.matrix = new Matrix4();  // Initialize new matrix
        ground.matrix.translate(-0.5, -0.5, -0.5); // Center the cube
        ground.matrix.scale(50, 0.1, 50); // Make it wide and flat
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
                    wall.matrix = new Matrix4();
                    wall.matrix.translate(-0.5, -0.5, -0.5); // Center cube
                    wall.matrix.scale(1, height, 1); // Scale to height
                    wall.matrix.translate(x - this.worldSize/2, 0.5, z - this.worldSize/2); // Position in world
                    wall.renderfaster();
                }
            }
        }
    }

    render() {
        // Setup matrices
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

        // Set model matrix to identity initially
        var modelMat = new Matrix4();
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);

        // Set rotation matrix
        var rotateMatrix = new Matrix4();
        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotateMatrix.elements);

        // Clear and render everything
        this.drawSky();
        this.drawGround();
        this.drawWalls();
        
        // Draw test cube
        let testCube = new Cube();
        testCube.color = [1.0, 0.0, 0.0, 1.0]; // Bright red color
        testCube.matrix = new Matrix4();
        testCube.matrix.translate(0, 0, -5); // 5 units in front of camera
        testCube.matrix.scale(1, 1, 1); // Normal size cube
        testCube.renderfaster();
    }
}