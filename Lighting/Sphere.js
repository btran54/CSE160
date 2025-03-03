function sin(x) {
    return Math.sin(x);
}

function cos(x) {
    return Math.cos(x);
}

class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.resolution = 20;
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

        this.generateSphere();
    }

    generateSphere() {
        var thetaStep = Math.PI / this.resolution;
        var phiStep = 2 * Math.PI / this.resolution;
        
        for (var t = 0; t < Math.PI; t += thetaStep) {
            for (var p = 0; p < 2 * Math.PI; p += phiStep) {
                var p1 = this.sphereVertex(t, p);
                var p2 = this.sphereVertex(t + thetaStep, p);
                var p3 = this.sphereVertex(t, p + phiStep);
                var p4 = this.sphereVertex(t + thetaStep, p + phiStep);
                
                var uv1 = [p / (2 * Math.PI), t / Math.PI];
                var uv2 = [p / (2 * Math.PI), (t + thetaStep) / Math.PI];
                var uv3 = [(p + phiStep) / (2 * Math.PI), t / Math.PI];
                var uv4 = [(p + phiStep) / (2 * Math.PI), (t + thetaStep) / Math.PI];
                
                var n1 = [p1[0], p1[1], p1[2]];
                var n2 = [p2[0], p2[1], p2[2]];
                var n3 = [p3[0], p3[1], p3[2]];
                var n4 = [p4[0], p4[1], p4[2]];
                
                this.drawTriangle(p1, p2, p4, uv1, uv2, uv4, n1, n2, n4);
                this.drawTriangle(p1, p4, p3, uv1, uv4, uv3, n1, n4, n3);
            }
        }
    }
    
    sphereVertex(theta, phi) {
        return [
            sin(theta) * cos(phi),  // x
            cos(theta),             // y
            sin(theta) * sin(phi)   // z
        ];
    }
    
    drawTriangle(v1, v2, v3, uv1, uv2, uv3, n1, n2, n3) {
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            ...v1, ...v2, ...v3
        ]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            ...uv1, ...uv2, ...uv3
        ]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            ...n1, ...n2, ...n3
        ]), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
        
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}