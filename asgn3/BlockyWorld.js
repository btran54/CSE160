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

        // Pre-create cube instances for reuse
        this.wallCube = new Cube();
        this.wallCube.textureNum = 0;
        
        this.groundCube = new Cube();
        this.groundCube.textureNum = -2;
        this.groundCube.color = [0.45, 0.62, 0.3, 1.0]; // Adjust these values for a nice grass green
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
        console.log("Ground texture number:", this.groundCube.textureNum);
        console.log("Ground color:", this.groundCube.color);
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
                const height = this.worldMap[x][z];
                for (let y = 0; y < height; y++) {
                    this.wallCube.matrix = new Matrix4();
                    this.wallCube.matrix.translate(x - this.worldSize/2, y, z - this.worldSize/2);
                    this.wallCube.renderfaster();
                }
            }
        }
    }
    
    render() {
        const startTime = performance.now();

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

        var modelMat = new Matrix4();
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);

        var rotateMatrix = new Matrix4();
        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotateMatrix.elements);

        // Render world
        this.drawSky();
        this.drawGround();
        this.drawWalls();

        // Calculate and display render time
        const duration = performance.now() - startTime;
        sendTextToHTML("ms: " + Math.floor(duration), "numdot");
    }
}