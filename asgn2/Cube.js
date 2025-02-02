class Cube {
    constructor() {
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
  
    render() {
        var rgba = this.color;

        // Reset the model matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        // Front of Cube - brightest
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);

        // Right and Left sides - slightly darker
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        // Right
        drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);
        drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);
        // Left
        drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 1, 0]);
        drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);

        // Top, Back, and Bottom - darkest
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        // Top
        drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);
        // Back
        drawTriangle3D([0, 0, 1, 1, 1, 1, 1, 0, 1]);
        drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);
        // Bottom
        drawTriangle3D([0, 0, 0, 1, 0, 1, 0, 0, 1]);
        drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);

    }
}