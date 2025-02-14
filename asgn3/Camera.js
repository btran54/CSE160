class Camera {
    constructor() {
        this.eye = new Vector3([0, 2, 10]);
        this.at = new Vector3([0, 2, 0]);
        this.up = new Vector3([0, 1, 0]);
        this.moveStep = 0.2;
        this.rotateStep = 3;
        this.collisionRadius = 0.5;
    }

    checkCollision(newX, newZ, worldMap) {
        const gridX = Math.floor(newX + worldMap.length/2);
        const gridZ = Math.floor(newZ + worldMap.length/2);
        
        for(let dx = -1; dx <= 1; dx++) {
            for(let dz = -1; dz <= 1; dz++) {
                const checkX = gridX + dx;
                const checkZ = gridZ + dz;
                
                if (checkX >= 0 && checkX < worldMap.length && 
                    checkZ >= 0 && checkZ < worldMap.length) {
                    if (worldMap[checkX][checkZ] > 0) {
                        const wallCenterX = checkX - worldMap.length/2 + 0.5;
                        const wallCenterZ = checkZ - worldMap.length/2 + 0.5;
                        
                        const dx = newX - wallCenterX;
                        const dz = newZ - wallCenterZ;
                        const distance = Math.sqrt(dx*dx + dz*dz);
                        
                        if (distance < this.collisionRadius + 0.5) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    forward(worldMap) {
        let forward = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            0,
            this.at.elements[2] - this.eye.elements[2]
        ]);
        
        let length = Math.sqrt(
            forward.elements[0] * forward.elements[0] + 
            forward.elements[2] * forward.elements[2]
        );
        forward.elements[0] /= length;
        forward.elements[2] /= length;

        const newX = this.eye.elements[0] + forward.elements[0] * this.moveStep;
        const newZ = this.eye.elements[2] + forward.elements[2] * this.moveStep;

        if (!this.checkCollision(newX, newZ, worldMap)) {
            this.eye.elements[0] = newX;
            this.eye.elements[2] = newZ;
            this.at.elements[0] += forward.elements[0] * this.moveStep;
            this.at.elements[2] += forward.elements[2] * this.moveStep;
        }
    }

    back(worldMap) {
        let forward = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            0,
            this.at.elements[2] - this.eye.elements[2]
        ]);
        
        let length = Math.sqrt(
            forward.elements[0] * forward.elements[0] + 
            forward.elements[2] * forward.elements[2]
        );
        forward.elements[0] /= length;
        forward.elements[2] /= length;

        const newX = this.eye.elements[0] - forward.elements[0] * this.moveStep;
        const newZ = this.eye.elements[2] - forward.elements[2] * this.moveStep;

        if (!this.checkCollision(newX, newZ, worldMap)) {
            this.eye.elements[0] = newX;
            this.eye.elements[2] = newZ;
            this.at.elements[0] -= forward.elements[0] * this.moveStep;
            this.at.elements[2] -= forward.elements[2] * this.moveStep;
        }
    }

    left(worldMap) {
        let forward = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            0,
            this.at.elements[2] - this.eye.elements[2]
        ]);
        
        let up = this.up;
        let left = new Vector3([
            forward.elements[2],
            0,
            -forward.elements[0]
        ]);
        
        let length = Math.sqrt(
            left.elements[0] * left.elements[0] + 
            left.elements[2] * left.elements[2]
        );
        left.elements[0] /= length;
        left.elements[2] /= length;

        const newX = this.eye.elements[0] + left.elements[0] * this.moveStep;
        const newZ = this.eye.elements[2] + left.elements[2] * this.moveStep;

        if (!this.checkCollision(newX, newZ, worldMap)) {
            this.eye.elements[0] = newX;
            this.eye.elements[2] = newZ;
            this.at.elements[0] += left.elements[0] * this.moveStep;
            this.at.elements[2] += left.elements[2] * this.moveStep;
        }
    }

    right(worldMap) {
        let forward = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            0,
            this.at.elements[2] - this.eye.elements[2]
        ]);
        
        let up = this.up;
        let right = new Vector3([
            -forward.elements[2],
            0,
            forward.elements[0]
        ]);
        
        let length = Math.sqrt(
            right.elements[0] * right.elements[0] + 
            right.elements[2] * right.elements[2]
        );
        right.elements[0] /= length;
        right.elements[2] /= length;

        const newX = this.eye.elements[0] + right.elements[0] * this.moveStep;
        const newZ = this.eye.elements[2] + right.elements[2] * this.moveStep;

        if (!this.checkCollision(newX, newZ, worldMap)) {
            this.eye.elements[0] = newX;
            this.eye.elements[2] = newZ;
            this.at.elements[0] += right.elements[0] * this.moveStep;
            this.at.elements[2] += right.elements[2] * this.moveStep;
        }
    }

    rotateLeft() {
        let angle = this.rotateStep * Math.PI / 180;
        let dx = this.at.elements[0] - this.eye.elements[0];
        let dz = this.at.elements[2] - this.eye.elements[2];
        
        let newDx = dx * Math.cos(angle) - dz * Math.sin(angle);
        let newDz = dx * Math.sin(angle) + dz * Math.cos(angle);
        
        this.at.elements[0] = this.eye.elements[0] + newDx;
        this.at.elements[2] = this.eye.elements[2] + newDz;
    }

    rotateRight() {
        let angle = -this.rotateStep * Math.PI / 180;
        let dx = this.at.elements[0] - this.eye.elements[0];
        let dz = this.at.elements[2] - this.eye.elements[2];
        
        let newDx = dx * Math.cos(angle) - dz * Math.sin(angle);
        let newDz = dx * Math.sin(angle) + dz * Math.cos(angle);
        
        this.at.elements[0] = this.eye.elements[0] + newDx;
        this.at.elements[2] = this.eye.elements[2] + newDz;
    }
}