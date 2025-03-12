import * as THREE from 'three';
import { setupScene } from './modules/Scene.js';
import { setupCamera } from './modules/Camera.js';
import { setupRenderer } from './modules/Renderer.js';
import { setupLights } from './modules/Lights.js';
import { createSkybox } from './modules/Skybox.js';
import { createGround } from './modules/Env.js';
import { createBasicShapes } from './modules/Shapes.js';
import { createTexturedCubes } from './modules/Textures.js';
import { loadModels } from './modules/Models.js';
import { setupEventListeners, keyboard } from './modules/Controls.js';
import { setupLoadingManager } from './modules/Loading.js';

// Global objects
let scene, camera, renderer, controls;
let ground, basicShapes = [], texturedCubes = [];
let lights = {};
let mixers = [];
let loadingManager;

// Initialize the scene
function init() {
    // Create loading manager first (needed for loading textures and models)
    loadingManager = setupLoadingManager();
    
    // Setup basic Three.js components
    scene = setupScene();
    camera = setupCamera();
    renderer = setupRenderer();
    controls = camera.controls;
    
    // Add environment elements
    createSkybox(scene, loadingManager);
    lights = setupLights(scene);
    ground = createGround(scene, loadingManager);
    
    // Add objects
    basicShapes = createBasicShapes(scene);
    texturedCubes = createTexturedCubes(scene, loadingManager);
    
    // Setup models with animation mixers
    loadModels(scene, loadingManager, (newMixers) => {
        mixers = newMixers;
    });
    
    // Add event listeners
    setupEventListeners(camera, controls, lights);
    
    // Start animation loop
    animate(0);
}

// Animation loop
let previousTime = 0;

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const delta = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    
    // Update animations
    mixers.forEach(mixer => mixer.update(delta));
    
    // Handle keyboard controls
    handleKeyboardInput(delta);
    
    // Update orbit controls
    controls.update();
    
    // Animate the objects
    animateObjects(currentTime);
    
    // Animate lights
    animateLights(currentTime);
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle keyboard input
function handleKeyboardInput(delta) {
    const speed = 5 * delta;
    
    if (keyboard['KeyW']) {
        camera.position.z -= speed;
        controls.target.z -= speed;
    }
    if (keyboard['KeyS']) {
        camera.position.z += speed;
        controls.target.z += speed;
    }
    if (keyboard['KeyA']) {
        camera.position.x -= speed;
        controls.target.x -= speed;
    }
    if (keyboard['KeyD']) {
        camera.position.x += speed;
        controls.target.x += speed;
    }
    
    if (keyboard['ArrowUp']) {
        controls.target.y += speed;
    }
    if (keyboard['ArrowDown']) {
        controls.target.y -= speed;
    }
    if (keyboard['ArrowLeft']) {
        const target = new THREE.Vector3().subVectors(controls.target, camera.position);
        const axis = new THREE.Vector3(0, 1, 0);
        target.applyAxisAngle(axis, 0.05);
        controls.target.copy(camera.position).add(target);
    }
    if (keyboard['ArrowRight']) {
        const target = new THREE.Vector3().subVectors(controls.target, camera.position);
        const axis = new THREE.Vector3(0, 1, 0);
        target.applyAxisAngle(axis, -0.05);
        controls.target.copy(camera.position).add(target);
    }
}

// Animate objects
function animateObjects(currentTime) {
    // Animate the shapes
    basicShapes.forEach((shape, i) => {
        shape.rotation.x += 0.005 * (i % 3 + 1);
        shape.rotation.y += 0.01 * (i % 2 + 1);
    });
    
    // Animate the textured cubes
    texturedCubes.forEach((cube, i) => {
        cube.rotation.x += 0.01 * (i + 1);
        cube.rotation.y += 0.02 * (i + 1);
    });
}

// Animate lights
function animateLights(currentTime) {
    const time = currentTime * 0.001;
    
    // Move point light in a circle
    lights.pointLight.position.x = Math.sin(time * 0.5) * 10;
    lights.pointLight.position.z = Math.cos(time * 0.5) * 10;
    lights.pointLightSphere.position.copy(lights.pointLight.position);
    
    // Move spotlight target
    const spotLightTarget = new THREE.Object3D();
    spotLightTarget.position.set(
        Math.sin(time * 0.3) * 10,
        0,
        Math.cos(time * 0.3) * 10
    );
    scene.add(spotLightTarget);
    lights.spotLight.target = spotLightTarget;
    
    // Update spotlight cone visualization
    lights.spotLightCone.position.copy(lights.spotLight.position);
    lights.spotLightCone.lookAt(spotLightTarget.position);
}

// Initialize the scene when the page loads
init();