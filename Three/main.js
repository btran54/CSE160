document.addEventListener('DOMContentLoaded', init);

function init() {
  const scene = new THREE.Scene();
  
  // Create perspective camera
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  camera.position.z = 15;
  camera.position.y = 5;
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    'resources/images/skybox/amsterdam.jpg',
    () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.encoding = THREE.sRGBEncoding;
      scene.background = texture;
      scene.environment = texture;
    }
  );
  
  // Create controls to rotate the camera
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Set up GUI
  const gui = new lil.GUI();
  
  // Fog
  const fogColor = 'lightblue';
  scene.fog = new THREE.FogExp2(fogColor, 0.04);
  
  const fogParams = {
    enabled: true,
    thickness: 0.04,
    color: fogColor
  };
  
  const fogFolder = gui.addFolder('Fog');
  
  fogFolder.add(fogParams, 'enabled').name('Enable Fog').onChange(value => {
    scene.fog = value ? new THREE.FogExp2(fogParams.color, fogParams.thickness) : null;
  });
  
  fogFolder.add(fogParams, 'thickness', 0.001, 0.1).name('Fog Thickness').onChange(value => {
    if (scene.fog) {
      scene.fog.density = value;
    }
  });
  
  fogFolder.addColor(fogParams, 'color').name('Fog Color').onChange(value => {
    if (scene.fog) {
      scene.fog.color.set(value);
    }
  });
  
  fogFolder.open();
  
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 3, 1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.bias = -0.0001;
  scene.add(directionalLight);
  
  // Spotlight
  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(0, 10, 0);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.2;
  spotLight.decay = 2;
  spotLight.distance = 50;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(0, 0, 0);
  scene.add(spotLightTarget);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
  
  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLightHelper);
  
  const spotlightFolder = gui.addFolder('Spotlight');
  spotlightFolder.add(spotLight, 'intensity', 0, 2).name('Intensity');
  spotlightFolder.add(spotLight, 'distance', 10, 100).name('Distance');
  spotlightFolder.add(spotLight, 'angle', 0.1, Math.PI / 2).name('Angle').onChange(() => {
    spotLightHelper.update();
  });
  spotlightFolder.add(spotLight, 'penumbra', 0, 1).name('Penumbra');
  
  const spotlightPosition = spotlightFolder.addFolder('Position');
  spotlightPosition.add(spotLight.position, 'x', -20, 20).onChange(() => {
    spotLightHelper.update();
  });
  spotlightPosition.add(spotLight.position, 'y', 0, 20).onChange(() => {
    spotLightHelper.update();
  });
  spotlightPosition.add(spotLight.position, 'z', -20, 20).onChange(() => {
    spotLightHelper.update();
  });
  
  const spotlightTarget = spotlightFolder.addFolder('Target');
  spotlightTarget.add(spotLightTarget.position, 'x', -20, 20).onChange(() => {
    spotLightHelper.update();
  });
  spotlightTarget.add(spotLightTarget.position, 'y', -10, 10).onChange(() => {
    spotLightHelper.update();
  });
  spotlightTarget.add(spotLightTarget.position, 'z', -20, 20).onChange(() => {
    spotLightHelper.update();
  });
  
  spotlightFolder.add(spotLight, 'visible').name('Visible');
  spotlightFolder.open();
  
  // Create a ground plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x999999,
    roughness: 0.8,
    metalness: 0.2,
  });
  const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = -2;
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);
  
  const objects = [];
  
  function createMaterial(hue) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, 0.6),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.5
    });
  }
  
  function avoidZFighting(obj, basePosition) {
    const epsilon = 0.001;
    obj.position.set(
      basePosition.x + (Math.random() - 0.5) * epsilon,
      basePosition.y + (Math.random() - 0.5) * epsilon,
      basePosition.z + (Math.random() - 0.5) * epsilon
    );
  }
  
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  
  const purpleMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color().setHSL(0.75, 0.9, 0.6),
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 2.5
  });
  const purpleCube = new THREE.Mesh(cubeGeometry, purpleMaterial);
  purpleCube.position.set(-8, 0, -3);
  purpleCube.castShadow = true;
  purpleCube.receiveShadow = true;
  scene.add(purpleCube);
  objects.push(purpleCube);
  
  const tealMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color().setHSL(0.5, 0.9, 0.6),
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 2.5
  });
  const tealCube = new THREE.Mesh(cubeGeometry, tealMaterial);
  tealCube.position.set(-6, 0, -3);
  tealCube.castShadow = true;
  tealCube.receiveShadow = true;
  scene.add(tealCube);
  objects.push(tealCube);
  
  const goldMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color().setHSL(0.15, 0.9, 0.6),
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 2.5
  });
  const goldCube = new THREE.Mesh(cubeGeometry, goldMaterial);
  goldCube.position.set(-4, 0, -3);
  goldCube.castShadow = true;
  goldCube.receiveShadow = true;
  scene.add(goldCube);
  objects.push(goldCube);
  
  const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
  
  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(i * 0.3, 0.9, 0.6),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.0
    });
    const sphere = new THREE.Mesh(sphereGeometry, material);
    const basePosition = { x: -8 + i * 2, y: 0, z: 0 };
    avoidZFighting(sphere, basePosition);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    objects.push(sphere);
  }
  
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
  
  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.05 + i * 0.02, 0.9, 0.6),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.5
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, material);
    const basePosition = { x: -8 + i * 2, y: 0, z: 3 };
    avoidZFighting(cylinder, basePosition);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add(cylinder);
    objects.push(cylinder);
  }
  
  const coneGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
  
  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.2, 0.7),
      metalness: 1.0,
      roughness: 0.02,
      envMapIntensity: 2.8
    });
    const cone = new THREE.Mesh(coneGeometry, material);
    const basePosition = { x: -2 + i * 2, y: 0, z: -3 };
    avoidZFighting(cone, basePosition);
    cone.castShadow = true;
    cone.receiveShadow = true;
    scene.add(cone);
    objects.push(cone);
  }
  
  const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
  
  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.1, 0.8, 0.5),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.5
    });
    const torus = new THREE.Mesh(torusGeometry, material);
    const basePosition = { x: -2 + i * 2, y: 0, z: 0 };
    avoidZFighting(torus, basePosition);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
    objects.push(torus);
  }
  
  const octahedronGeometry = new THREE.OctahedronGeometry(0.7);
  
  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.6, 0.6),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.5
    });
    const octahedron = new THREE.Mesh(octahedronGeometry, material);
    const basePosition = { x: -2 + i * 2, y: 0, z: 3 };
    avoidZFighting(octahedron, basePosition);
    octahedron.castShadow = true;
    octahedron.receiveShadow = true;
    scene.add(octahedron);
    objects.push(octahedron);
  }
  
  const dodecahedronGeometry = new THREE.DodecahedronGeometry(0.7);
  
  for (let i = 0; i < 2; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0, 0, 0.8),
      metalness: 1.0,
      roughness: 0.02,
      envMapIntensity: 2.8
    });
    const dodecahedron = new THREE.Mesh(dodecahedronGeometry, material);
    const basePosition = { x: 4 + i * 2, y: 0, z: -3 };
    avoidZFighting(dodecahedron, basePosition);
    dodecahedron.castShadow = true;
    dodecahedron.receiveShadow = true;
    scene.add(dodecahedron);
    objects.push(dodecahedron);
  }
  
  function createToy() {
    const group = new THREE.Group();
    
    const baseCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, 2, 32),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.05, 0.9, 0.6),
        metalness: 1.0,
        roughness: 0.05,
        envMapIntensity: 2.5
      })
    );
    baseCylinder.castShadow = true;
    baseCylinder.receiveShadow = true;
    group.add(baseCylinder);
    
    const topSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, 0.9),
        metalness: 1.0,
        roughness: 0.05,
        envMapIntensity: 2.0
      })
    );
    topSphere.position.y = 1.5;
    topSphere.castShadow = true;
    topSphere.receiveShadow = true;
    group.add(topSphere);
    
    const ringMaterials = [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.15, 0.9, 0.6),
        metalness: 1.0,
        roughness: 0.02,
        envMapIntensity: 2.8
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, 0.8),
        metalness: 1.0,
        roughness: 0.02,
        envMapIntensity: 2.8
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.05, 0.9, 0.6),
        metalness: 1.0,
        roughness: 0.02,
        envMapIntensity: 2.8
      })
    ];
    
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.1, 16, 32),
        ringMaterials[i]
      );
      ring.position.y = i * 0.5 - 0.5;
      ring.rotation.x = Math.PI / 2;
      ring.castShadow = true;
      ring.receiveShadow = true;
      group.add(ring);
    }
    
    group.position.set(6, 0, 1);
    scene.add(group);
    objects.push(group);
  }
  
  createToy();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach((obj, index) => {
      obj.rotation.x += 0.005 * (index % 3 + 1);
      obj.rotation.y += 0.005 * (index % 4 + 1);
    });
    
    spotLightHelper.update();
    
    controls.update();
    
    renderer.render(scene, camera);
  }
  
  animate();
}