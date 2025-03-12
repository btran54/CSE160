import * as THREE from 'three';

/**
 * Creates a textured ground plane
 * @param {THREE.Scene} scene - The scene to add the ground to
 * @param {THREE.LoadingManager} loadingManager - Loading manager for tracking progress
 * @returns {THREE.Mesh} The created ground mesh
 */
export function createGround(scene, loadingManager) {
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    // Load ground texture
    const groundTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    groundTexture.anisotropy = 16;
    
    // Create ground material with texture
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    
    // Create ground geometry and mesh
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    
    // Position and orient ground
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -1; // Position slightly below the objects
    ground.receiveShadow = true;
    
    // Add to scene
    scene.add(ground);
    
    return ground;
}