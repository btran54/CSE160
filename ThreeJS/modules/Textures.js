import * as THREE from 'three';

/**
 * Creates cubes with different texturing techniques
 * @param {THREE.Scene} scene - The scene to add the cubes to
 * @param {THREE.LoadingManager} loadingManager - Loading manager for tracking progress
 * @returns {Array} Array of created cube meshes
 */
export function createTexturedCubes(scene, loadingManager) {
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const cubes = [];
    
    // Create a single-textured cube with normal map
    cubes.push(createSingleTextureCube(scene, textureLoader));
    
    // Create a multi-textured cube (different texture on each face)
    cubes.push(createMultiTextureCube(scene, textureLoader));
    
    return cubes;
}

/**
 * Creates a cube with a single texture and normal map
 * @param {THREE.Scene} scene - The scene to add the cube to
 * @param {THREE.TextureLoader} textureLoader - Texture loader
 * @returns {THREE.Mesh} The created cube
 */
function createSingleTextureCube(scene, textureLoader) {
    // Load textures
    const brickTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg');
    const brickNormalMap = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/wall-normal.jpg');
    
    // Create material with textures
    const material = new THREE.MeshStandardMaterial({
        map: brickTexture,
        normalMap: brickNormalMap,
        roughness: 0.7,
        metalness: 0.2
    });
    
    // Create cube
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    cube.position.set(-3, 0.5, -3);
    cube.castShadow = true;
    cube.receiveShadow = true;
    
    // Add to scene
    scene.add(cube);
    
    return cube;
}

/**
 * Creates a cube with different textures on each face
 * @param {THREE.Scene} scene - The scene to add the cube to
 * @param {THREE.TextureLoader} textureLoader - Texture loader
 * @returns {THREE.Mesh} The created cube
 */
function createMultiTextureCube(scene, textureLoader) {
    // URLs for the 6 different textures (one per face)
    const textureURLs = [
        'https://threejsfundamentals.org/threejs/resources/images/flower-1.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/flower-2.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/flower-3.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/flower-4.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/flower-5.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/flower-6.jpg'
    ];
    
    // Create materials from textures
    const materials = textureURLs.map(url => {
        const texture = textureLoader.load(url);
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.2
        });
    });
    
    // Create cube with array of materials
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
    cube.position.set(3, 0.5, -3);
    cube.castShadow = true;
    cube.receiveShadow = true;
    
    // Add to scene
    scene.add(cube);
    
    return cube;
}