import * as THREE from 'three';

/**
 * Creates a collection of basic 3D shapes (cubes, spheres, cylinders)
 * @param {THREE.Scene} scene - The scene to add shapes to
 * @returns {Array} Array of created shape meshes
 */
export function createBasicShapes(scene) {
    const shapes = [];
    
    // Create materials with different colors
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.7 }), // Red
        new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.7 }), // Green
        new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.7 }), // Blue
        new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.7 }), // Yellow
        new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.7 })  // Magenta
    ];
    
    // Create cubes
    shapes.push(...createCubes(scene, materials));
    
    // Create spheres
    shapes.push(...createSpheres(scene, materials));
    
    // Create cylinders
    shapes.push(...createCylinders(scene, materials));
    
    return shapes;
}

/**
 * Creates a collection of cubes
 * @param {THREE.Scene} scene - The scene to add cubes to
 * @param {Array} materials - Array of materials to use
 * @returns {Array} Array of created cube meshes
 */
function createCubes(scene, materials) {
    const cubes = [];
    
    for (let i = 0; i < 8; i++) {
        const size = 0.5 + Math.random() * 0.5;
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            materials[i % materials.length]
        );
        
        const angle = (i / 8) * Math.PI * 2;
        const radius = 8;
        cube.position.x = Math.cos(angle) * radius;
        cube.position.z = Math.sin(angle) * radius;
        cube.position.y = size / 2;
        
        cube.castShadow = true;
        cube.receiveShadow = true;
        
        scene.add(cube);
        cubes.push(cube);
    }
    
    return cubes;
}

/**
 * Creates a collection of spheres
 * @param {THREE.Scene} scene - The scene to add spheres to
 * @param {Array} materials - Array of materials to use
 * @returns {Array} Array of created sphere meshes
 */
function createSpheres(scene, materials) {
    const spheres = [];
    
    for (let i = 0; i < 6; i++) {
        const radius = 0.4 + Math.random() * 0.4;
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            materials[(i + 2) % materials.length]
        );
        
        const angle = (i / 6) * Math.PI * 2;
        const distance = 5;
        sphere.position.x = Math.cos(angle) * distance;
        sphere.position.z = Math.sin(angle) * distance;
        sphere.position.y = radius;
        
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        
        scene.add(sphere);
        spheres.push(sphere);
    }
    
    return spheres;
}

/**
 * Creates a collection of cylinders
 * @param {THREE.Scene} scene - The scene to add cylinders to
 * @param {Array} materials - Array of materials to use
 * @returns {Array} Array of created cylinder meshes
 */
function createCylinders(scene, materials) {
    const cylinders = [];
    
    for (let i = 0; i < 6; i++) {
        const radius = 0.3 + Math.random() * 0.3;
        const height = 1 + Math.random() * 1;
        const cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 32),
            materials[(i + 4) % materials.length]
        );
        
        const angle = (i / 6) * Math.PI * 2;
        const distance = 10;
        cylinder.position.x = Math.cos(angle) * distance;
        cylinder.position.z = Math.sin(angle) * distance;
        cylinder.position.y = height / 2;
        
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        
        scene.add(cylinder);
        cylinders.push(cylinder);
    }
    
    return cylinders;
}