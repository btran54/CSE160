import * as THREE from 'three';

/**
 * Sets up all lights in the scene
 * @param {THREE.Scene} scene - The scene to add lights to
 * @returns {Object} Object containing all created lights
 */
export function setupLights(scene) {
    // Object to store all lights
    const lights = {};
    
    // 1. Directional Light (like sun)
    lights.directionalLight = createDirectionalLight();
    scene.add(lights.directionalLight);
    
    // 2. Ambient Light (general scene illumination)
    lights.ambientLight = createAmbientLight();
    scene.add(lights.ambientLight);
    
    // 3. Point Light (like a light bulb)
    const pointLightObjects = createPointLight();
    lights.pointLight = pointLightObjects.light;
    lights.pointLightSphere = pointLightObjects.sphere;
    scene.add(lights.pointLight);
    scene.add(lights.pointLightSphere);
    
    // 4. Spot Light (like a flashlight)
    const spotLightObjects = createSpotLight();
    lights.spotLight = spotLightObjects.light;
    lights.spotLightCone = spotLightObjects.cone;
    scene.add(lights.spotLight);
    scene.add(lights.spotLightCone);
    
    return lights;
}

/**
 * Creates a directional light with shadows
 * @returns {THREE.DirectionalLight} The created light
 */
function createDirectionalLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    
    // Configure shadows
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.top = 20;
    light.shadow.camera.bottom = -20;
    
    return light;
}

/**
 * Creates an ambient light
 * @returns {THREE.AmbientLight} The created light
 */
function createAmbientLight() {
    return new THREE.AmbientLight(0x404040, 0.5);
}

/**
 * Creates a point light with visual indicator
 * @returns {Object} Object with the light and its visual sphere
 */
function createPointLight() {
    // Create light
    const light = new THREE.PointLight(0xff9000, 1, 50);
    light.position.set(-5, 5, -5);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    
    // Create visual indicator (sphere)
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff9000 })
    );
    sphere.position.copy(light.position);
    
    return { light, sphere };
}

/**
 * Creates a spot light with visual indicator
 * @returns {Object} Object with the light and its visual cone
 */
function createSpotLight() {
    // Create light
    const light = new THREE.SpotLight(0x0088ff, 1);
    light.position.set(5, 5, 0);
    light.angle = Math.PI / 6;
    light.penumbra = 0.2;
    light.decay = 2;
    light.distance = 50;
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    
    // Create visual indicator (cone)
    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 16),
        new THREE.MeshBasicMaterial({ 
            color: 0x0088ff, 
            transparent: true, 
            opacity: 0.5 
        })
    );
    cone.position.copy(light.position);
    cone.rotation.x = Math.PI;
    
    return { light, cone };
}