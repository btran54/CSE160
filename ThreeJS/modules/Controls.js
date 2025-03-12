import * as THREE from 'three';

// Object to track keyboard state
export const keyboard = {};

/**
 * Sets up event listeners for user input
 * @param {THREE.PerspectiveCamera} camera - The camera to control
 * @param {OrbitControls} controls - The orbit controls
 * @param {Object} lights - Object containing scene lights
 */
export function setupEventListeners(camera, controls, lights) {
    // Window resize event
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    
    // Keyboard events
    window.addEventListener('keydown', (e) => {
        keyboard[e.code] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keyboard[e.code] = false;
        
        // Toggle lights with Space key
        if (e.code === 'Space') {
            lights.pointLight.visible = !lights.pointLight.visible;
            lights.pointLightSphere.visible = lights.pointLight.visible;
            
            lights.spotLight.visible = !lights.spotLight.visible;
            lights.spotLightCone.visible = lights.spotLight.visible;
        }
    });
}