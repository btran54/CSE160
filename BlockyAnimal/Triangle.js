class Triangle {
    constructor(type='pyramid') {  // Default to pyramid, can be 'pyramid' or 'right'
        this.type = type;
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.rotation = 0;
        this.matrix = new Matrix4();
    }
    
    render() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.type === 'pyramid') {
            this.renderPyramid(rgba);
        }
        
        else if (this.type === 'rightTop') {
            this.renderRightTriangleTop(rgba);
        }

        else if (this.type === 'rightBot'){
            this.renderRightTriangleBot(rgba);
        }

        else if (this.type === 'topFin'){
            this.renderTopFin(rgba);
        }
    }

    renderPyramid(rgba) {
        // Front face (top)
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([
            0.0, 0.5, 0.5,     // bottom front
            0.0, 0.5, -0.5,    // bottom back
            1.0, 0.0, 0.0      // tip point
        ]);

        // Bottom face
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D([
            0.0, -0.5, 0.5,    // bottom front
            0.0, -0.5, -0.5,   // bottom back
            1.0, 0.0, 0.0      // tip point
        ]);

        // Front face
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([
            0.0, 0.5, 0.5,     // top front
            0.0, -0.5, 0.5,    // bottom front
            1.0, 0.0, 0.0      // tip point
        ]);

        // Back face
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3D([
            0.0, 0.5, -0.5,    // top back
            0.0, -0.5, -0.5,   // bottom back
            1.0, 0.0, 0.0      // tip point
        ]);

        // Base (square)
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
        drawTriangle3D([
            0.0, 0.5, 0.5,     // top front
            0.0, -0.5, 0.5,    // bottom front
            0.0, -0.5, -0.5    // bottom back
        ]);
        drawTriangle3D([
            0.0, 0.5, 0.5,     // top front
            0.0, 0.5, -0.5,    // top back
            0.0, -0.5, -0.5    // bottom back
        ]);
    }

    // Top Fin
    renderRightTriangleTop(rgba) {
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,     
            1.0, -1.0, 0.0,    
            1.0, 0.0, 0.0      
        ]);
    
        // Back face
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.2,      
            1.0, -1.0, 0.2,     
            1.0, 0.0, 0.2      
        ]);
    
        // Top and bottom faces
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.2,
            1.0, -1.0, 0.2     
        ]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            1.0, -1.0, 0.0,     
            1.0, -1.0, 0.2     
        ]);
    
        // Right side face
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3D([
            1.0, 0.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 0.0, 0.2
        ]);
        drawTriangle3D([
            1.0, -1.0, 0.0,
            1.0, -1.0, 0.2,
            1.0, 0.0, 0.2
        ]);
    
        // Bottom face
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.2
        ]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.2,
            1.0, 0.0, 0.2
        ]);
    }
    
    // Bottom Fin
    renderRightTriangleBot(rgba) {
        // Front face
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,      
            1.0, 1.0, 0.0,     
            1.0, 0.0, 0.0      
        ]);
    
        // Back face
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.2,      
            1.0, 1.0, 0.2,     
            1.0, 0.0, 0.2      
        ]);
    
        // Top and bottom faces
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.2,
            1.0, 1.0, 0.2      
        ]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            1.0, 1.0, 0.0,     
            1.0, 1.0, 0.2      
        ]);   
    
        // Right side face
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3D([
            1.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 0.0, 0.2
        ]);
        drawTriangle3D([
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.2,
            1.0, 0.0, 0.2
        ]);
    
        // Bottom face
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.2
        ]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.2,
            1.0, 0.0, 0.2
        ]);
    }

    // Top Fins
    renderTopFin(rgba) {
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,       // point
            -1.0, 1.0, 0.0,      // top left
            -1.0, 0.0, 0.0       // left point
        ]);
    
        // Back face
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.2,       // point
            -1.0, 1.0, 0.2,      // top left
            -1.0, 0.0, 0.2       // left point
        ]);
    
        // Top face
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.2,
            -1.0, 1.0, 0.2
        ]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            -1.0, 1.0, 0.0,
            -1.0, 1.0, 0.2
        ]);
    
        // Add left side face (the missing face)
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3D([
            -1.0, 0.0, 0.0,
            -1.0, 1.0, 0.0,
            -1.0, 1.0, 0.2
        ]);
        drawTriangle3D([
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.2,
            -1.0, 1.0, 0.2
        ]);
    }
}

function drawTriangle(vertices) {
    var n = 3; // The number of vertices
    
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
    var n = 3; // The number of vertices
    
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}