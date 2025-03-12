import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Loads 3D models into the scene
 * @param {THREE.Scene} scene - The scene to add models to
 * @param {THREE.LoadingManager} loadingManager - Loading manager for tracking progress
 * @param {Function} onMixersCreated - Callback function with created animation mixers
 */
export function loadModels(scene, loadingManager, onMixersCreated) {
    const objLoader = new OBJLoader(loadingManager);
    const mtlLoader = new MTLLoader(loadingManager);
    const gltfLoader = new GLTFLoader(loadingManager);
    
    // Array to store animation mixers
    const mixers = [];
    
    // Load example models
    loadWindmill(scene, objLoader, mtlLoader);
    loadFlamingo(scene, gltfLoader, mixers);
    loadHorse(scene, gltfLoader, mixers);
    
    // Return mixers via callback
    if (onMixersCreated && typeof onMixersCreated === 'function') {
        onMixersCreated(mixers);
    }
}

/**
 * Loads a windmill OBJ model with materials
 * @param {THREE.Scene} scene - The scene to add the model to
 * @param {OBJLoader} objLoader - OBJ loader
 * @param {MTLLoader} mtlLoader - MTL loader
 */
function loadWindmill(scene, objLoader, mtlLoader) {
    mtlLoader.load('https://threejsfundamentals.org/threejs/resources/models/windmill/windmill-fixed.mtl', (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        
        objLoader.load('https://threejsfundamentals.org/threejs/resources/models/windmill/windmill.obj', (object) => {
            // Position and scale
            object.position.set(-5, -1, 5);
            object.scale.set(0.01, 0.01, 0.01);
            
            // Enable shadows
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(object);
        });
    });
}

/**
 * Loads a flamingo GLTF model with animation
 * @param {THREE.Scene} scene - The scene to add the model to
 * @param {GLTFLoader} gltfLoader - GLTF loader
 * @param {Array} mixers - Array to store animation mixers
 */
function loadFlamingo(scene, gltfLoader, mixers) {
    gltfLoader.load('https://threejsfundamentals.org/threejs/resources/models/animals/Flamingo.glb', (gltf) => {
        const model = gltf.scene;
        
        // Position and scale
        model.position.set(0, 0, 0);
        model.scale.set(0.02, 0.02, 0.02);
        
        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(model);
        
        // Create animation mixer
        if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const animation = gltf.animations[0];
            const action = mixer.clipAction(animation);
            action.play();
            mixers.push(mixer);
        }
    });
}

/**
 * Loads a horse GLTF model with animation
 * @param {THREE.Scene} scene - The scene to add the model to
 * @param {GLTFLoader} gltfLoader - GLTF loader
 * @param {Array} mixers - Array to store animation mixers
 */
function loadHorse(scene, gltfLoader, mixers) {
    gltfLoader.load('https://threejsfundamentals.org/threejs/resources/models/animals/Horse.glb', (gltf) => {
        const model = gltf.scene;
        
        // Position and scale
        model.position.set(5, -1, 5);
        model.scale.set(0.02, 0.02, 0.02);
        
        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(model);
        
        // Create animation mixer
        if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const animation = gltf.animations[0];
            const action = mixer.clipAction(animation);
            action.play();
            mixers.push(mixer);
        }
    });
}