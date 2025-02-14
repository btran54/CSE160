class Camera {
    constructor() {
        this.eye = new Vector3([0, 3, 10]);  // Higher up and further back
        this.at = new Vector3([0, 0, 0]);    // Looking straight ahead
        this.up = new Vector3([0, 1, 0]);    // Up vector
    }

    forward() {
        var f = new Vector3();
        f.elements = this.at.elements.map((at, i) => at - this.eye.elements[i]);
        f.normalize();
        this.at.elements = this.at.elements.map((at, i) => at + f.elements[i]);
        this.eye.elements = this.eye.elements.map((eye, i) => eye + f.elements[i]);
    }

    back() {
        var f = new Vector3();
        f.elements = this.eye.elements.map((eye, i) => eye - this.at.elements[i]);
        f.normalize();
        this.at.elements = this.at.elements.map((at, i) => at + f.elements[i]);
        this.eye.elements = this.eye.elements.map((eye, i) => eye + f.elements[i]);    
    }

    left() {
        var f = new Vector3();
        f.elements = this.eye.elements.map((eye, i) => eye - this.at.elements[i]);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.elements = this.at.elements.map((at, i) => at + s.elements[i]);
        this.eye.elements = this.eye.elements.map((eye, i) => eye + s.elements[i]);        
    }

    right() {
        var f = new Vector3();
        f.elements = this.eye.elements.map((eye, i) => eye - this.at.elements[i]);
        f.normalize();
        var s = Vector3.cross(this.up, f);
        s.normalize();
        this.at.elements = this.at.elements.map((at, i) => at + s.elements[i]);
        this.eye.elements = this.eye.elements.map((eye, i) => eye + s.elements[i]);        
    }
}