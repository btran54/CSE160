class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        // Combined vertices and UV coordinates (x,y,z, u,v for each vertex)
        this.cubeVerts32 = new Float32Array([
            // Front
            0,0,0, 0,0,    1,1,0, 1,1,    1,0,0, 1,0,
            0,0,0, 0,0,    0,1,0, 0,1,    1,1,0, 1,1,
            // Right
            1,0,0, 0,0,    1,1,0, 0,1,    1,1,1, 1,1,
            1,0,0, 0,0,    1,1,1, 1,1,    1,0,1, 1,0,
            // Left
            0,0,0, 1,0,    0,1,1, 0,1,    0,1,0, 0,0,
            0,0,0, 1,0,    0,0,1, 1,1,    0,1,1, 0,1,
            // Top
            0,1,0, 0,0,    0,1,1, 0,1,    1,1,1, 1,1,
            0,1,0, 0,0,    1,1,1, 1,1,    1,1,0, 1,0,
            // Back
            0,0,1, 1,0,    1,0,1, 0,0,    1,1,1, 0,1,
            0,0,1, 1,0,    1,1,1, 0,1,    0,1,1, 1,1,
            // Bottom
            0,0,0, 0,0,    1,0,0, 1,0,    1,0,1, 1,1,
            0,0,0, 0,0,    1,0,1, 1,1,    0,0,1, 0,1
        ]);
    }
  
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of Cube
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        // Right
        drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);

        // Left
        drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 0,0]);
        drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 1,1, 0,1]);

        // Top
        drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

        // Back
        drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0,0,1, 1,1,1, 0,1,1], [1,0, 0,1, 1,1]);

        // Bottom
        drawTriangle3DUV([0,0,0, 1,0,0, 1,0,1], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, 1,0,1, 0,0,1], [0,0, 1,1, 0,1]);
    }

    // Update the renderfast() method in Cube.js
    renderfast() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            g_vertexBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        const FSIZE = this.cubeVerts32.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);

        // Only enable UV coordinates if we're using a texture
        if (this.textureNum !== -2) {
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
            gl.enableVertexAttribArray(a_UV);
        } else {
            gl.disableVertexAttribArray(a_UV);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    renderfaster() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        console.log("Sending color to shader:", rgba);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        if (g_vertexBuffer == null) {
            g_vertexBuffer = gl.createBuffer();
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
    
        const FSIZE = this.cubeVerts32.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);
    
        if (this.textureNum !== -2) {
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
            gl.enableVertexAttribArray(a_UV);
        } else {
            gl.disableVertexAttribArray(a_UV);
        }
    
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}