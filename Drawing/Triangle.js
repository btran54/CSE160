class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.rotation = 0;
    }
    
    render() {
        var xy = this.position;
        var rgba = this.color;
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        var d = this.size/100;  // Size scaling factor
        
        // Calculate vertices based on rotation
        let vertices;
        switch(this.rotation) {
            case 0:
                vertices = [
                    xy[0], xy[1],
                    xy[0] + d, xy[1],
                    xy[0], xy[1] + d 
                ];
                break;
            case 90:
                vertices = [
                    xy[0], xy[1],
                    xy[0], xy[1] + d,
                    xy[0] - d, xy[1]
                ];
                break;
            case 180:
                vertices = [
                    xy[0], xy[1],
                    xy[0] - d, xy[1],
                    xy[0], xy[1] - d
                ];
                break;
            case 270:
                vertices = [
                    xy[0], xy[1],
                    xy[0], xy[1] - d,
                    xy[0] + d, xy[1]
                ];
                break;
            case -90:
                vertices = [
                    xy[0], xy[1],
                    xy[0], xy[1] + d,
                    xy[0] + d, xy[1]
                ];
                break;
            case -180:
                vertices = [
                    xy[0], xy[1],
                    xy[0] + d, xy[1],
                    xy[0], xy[1] - d
                ];
                break;
            case -270:
                vertices = [
                    xy[0], xy[1],
                    xy[0], xy[1] - d, 
                    xy[0] - d, xy[1]
                ];
                break;
        }
        
        drawTriangle(vertices);
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