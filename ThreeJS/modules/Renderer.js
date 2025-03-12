import * as THREE from 'three';
import { attachOrbitControls } from './Camera.js';

/**
 * Creates a WebGLRenderer and attaches it to the document
 * @param {THREE.PerspectiveCamera} camera - Camera to attach controls to
 * @returns {THREE.WebGLRenderer} The created renderer
 */
export function setupRenderer(camera) {
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Configure renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Add renderer to document
    document.body.appendChild(renderer.domElement);
    
    // Listen for window resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // If camera is provided, attach orbit controls
    if (camera) {
        attachOrbitControls(camera, renderer);
    }
    
    return renderer;
}