import * as THREE from 'three';

/**
 * Creates a skybox using a cubemap
 * @param {THREE.Scene} scene - The scene to add the skybox to
 * @param {THREE.LoadingManager} loadingManager - Loading manager for tracking progress
 */
export function createSkybox(scene, loadingManager) {
    const loader = new THREE.CubeTextureLoader(loadingManager);
    
    const skyboxTexture = loader.load([
        'https://threejsfundamentals.org/threejs/resources/images/skybox/px.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/skybox/nx.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/skybox/py.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/skybox/ny.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/skybox/pz.jpg',
        'https://threejsfundamentals.org/threejs/resources/images/skybox/nz.jpg',
    ]);
    
    scene.background = skyboxTexture;
    
    return skyboxTexture;
}