class Triangle {
    constructor(type='pyramid') {
        this.type = type;
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.rotation = 0;
        this.matrix = new Matrix4();
    }
    
    calculateNormal(v1, v2, v3) {
        let edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        let edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
        
        let normal = [
            edge1[1] * edge2[2] - edge1[2] * edge2[1],
            edge1[2] * edge2[0] - edge1[0] * edge2[2],
            edge1[0] * edge2[1] - edge1[1] * edge2[0]
        ];
        
        let length = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
        if (length > 0) {
            normal[0] /= length;
            normal[1] /= length;
            normal[2] /= length;
        }
        
        return normal;
    }
}

function drawTriangle(vertices) {
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(a_Position);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer = null;

function initTriangle3D() {
    var g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(a_Position);
}

function drawTriangle3D(vertices) {
    var n = vertices.length / 3;

    if (g_vertexBuffer == null) {
        initTriangle3D();
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
    var n = 3;
    
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(a_Position);
    
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    g_vertexBuffer = null;
}

function drawTriangle3DUVNormal(vertices, uv, normals) {
    var n = vertices.length/3;
    
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(a_Position);
    
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    var normalBuffer = gl.createBuffer();
    if (!normalBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    g_vertexBuffer = null;
}