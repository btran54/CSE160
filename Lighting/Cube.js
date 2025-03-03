class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.cubeVerts32 = new Float32Array([
            // Front face: normal = (0, 0, 1)
            0,0,0, 0,0, 0,0,1,    1,1,0, 1,1, 0,0,1,    1,0,0, 1,0, 0,0,1,
            0,0,0, 0,0, 0,0,1,    0,1,0, 0,1, 0,0,1,    1,1,0, 1,1, 0,0,1,
            
            // Right face: normal = (1, 0, 0)
            1,0,0, 0,0, 1,0,0,    1,1,0, 0,1, 1,0,0,    1,1,1, 1,1, 1,0,0,
            1,0,0, 0,0, 1,0,0,    1,1,1, 1,1, 1,0,0,    1,0,1, 1,0, 1,0,0,
            
            // Left face: normal = (-1, 0, 0)
            0,0,0, 1,0, -1,0,0,   0,1,1, 0,1, -1,0,0,   0,1,0, 0,0, -1,0,0,
            0,0,0, 1,0, -1,0,0,   0,0,1, 1,1, -1,0,0,   0,1,1, 0,1, -1,0,0,
            
            // Top face: normal = (0, 1, 0)
            0,1,0, 0,0, 0,1,0,    0,1,1, 0,1, 0,1,0,    1,1,1, 1,1, 0,1,0,
            0,1,0, 0,0, 0,1,0,    1,1,1, 1,1, 0,1,0,    1,1,0, 1,0, 0,1,0,
            
            // Back face: normal = (0, 0, -1)
            0,0,1, 1,0, 0,0,-1,   1,0,1, 0,0, 0,0,-1,   1,1,1, 0,1, 0,0,-1,
            0,0,1, 1,0, 0,0,-1,   1,1,1, 0,1, 0,0,-1,   0,1,1, 1,1, 0,0,-1,
            
            // Bottom face: normal = (0, -1, 0)
            0,0,0, 0,0, 0,-1,0,   1,0,0, 1,0, 0,-1,0,   1,0,1, 1,1, 0,-1,0,
            0,0,0, 0,0, 0,-1,0,   1,0,1, 1,1, 0,-1,0,   0,0,1, 0,1, 0,-1,0
        ]);
    }
  
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        this.renderWithNormals();
    }

    renderWithNormals() {
        if (g_vertexBuffer == null) {
            g_vertexBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        const FSIZE = this.cubeVerts32.BYTES_PER_ELEMENT;
        
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
        gl.enableVertexAttribArray(a_Position);

        if (this.textureNum !== -2) {
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
            gl.enableVertexAttribArray(a_UV);
        } else {
            gl.disableVertexAttribArray(a_UV);
        }
        
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    renderfast() {
        this.render();
    }

    renderfaster() {
        this.render();
    }
}