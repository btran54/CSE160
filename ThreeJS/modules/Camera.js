import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Creates a camera with orbit controls
 * @returns {THREE.PerspectiveCamera} The camera with added controls property
 */
export function setupCamera() {
    // Create camera
    const camera = new THREE.PerspectiveCamera(
        75,                                     // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1,                                    // Near clipping plane
        1000                                    // Far clipping plane
    );
    
    // Set initial position
    camera.position.set(0, 5, 15);
    
    // Create orbit controls (requires renderer to be set up)
    // We'll attach this to the camera after renderer is created
    camera.controls = null;
    
    // Listen for window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    
    return camera;
}

/**
 * Attaches OrbitControls to the camera
 * @param {THREE.PerspectiveCamera} camera - The camera to attach controls to
 * @param {THREE.WebGLRenderer} renderer - The renderer for DOM element
 * @returns {OrbitControls} The created controls
 */
export function attachOrbitControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 1.5;
    
    camera.controls = controls;
    
    return controls;
}