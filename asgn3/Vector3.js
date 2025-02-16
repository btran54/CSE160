class Vector3 {
    constructor(elements) {
        this.elements = elements;
    }

    normalize() {
        const length = Math.sqrt(
            this.elements[0] * this.elements[0] +
            this.elements[1] * this.elements[1] +
            this.elements[2] * this.elements[2]
        );
        
        if (length > 0) {
            this.elements[0] /= length;
            this.elements[1] /= length;
            this.elements[2] /= length;
        }
        
        return this;
    }

    // Add two vectors
    add(v) {
        return new Vector3([
            this.elements[0] + v.elements[0],
            this.elements[1] + v.elements[1],
            this.elements[2] + v.elements[2]
        ]);
    }

    // Subtract vector v from this vector
    subtract(v) {
        return new Vector3([
            this.elements[0] - v.elements[0],
            this.elements[1] - v.elements[1],
            this.elements[2] - v.elements[2]
        ]);
    }

    // Scale vector by scalar s
    scale(s) {
        return new Vector3([
            this.elements[0] * s,
            this.elements[1] * s,
            this.elements[2] * s
        ]);
    }
}