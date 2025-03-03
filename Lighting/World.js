// ColoredPoint.js (c) 2012 matsuda
// Fixed Vertex Shader
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    // Transform the normal to world coordinates
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    // Calculate world position for lighting calculations
    v_VertPos = u_ModelMatrix * a_Position;
  }
`;

// Fixed Fragment Shader
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0; // Ground
  uniform sampler2D u_Sampler1; // Walls
  uniform sampler2D u_Sampler2; // Chest
  uniform sampler2D u_Sampler3; // Sun
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightDir;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_spotlightOn;
  uniform bool u_normalVis;
  uniform vec3 u_lightColor;

  void main() {
    // Get base color/texture
    vec4 baseColor;
    if (u_whichTexture == -3 || u_normalVis) {
        baseColor = vec4((v_Normal+1.0)/2.0, 1.0);
    }
    else if (u_whichTexture == -2) {
        baseColor = u_FragColor;
    }
    else if (u_whichTexture == -1) {
        baseColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) {
        baseColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) {
        baseColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == 2) {
        baseColor = texture2D(u_Sampler2, v_UV);
    }
    else if (u_whichTexture == 3) {
        baseColor = texture2D(u_Sampler3, v_UV);
        // Make the sun always fully bright regardless of lighting
        gl_FragColor = baseColor;
        return;
    }
    else {
        baseColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
    
    // If normal visualization is enabled, return just the normal color
    if (u_normalVis) {
        gl_FragColor = baseColor;
        return;
    }
    
    // If lighting is off, return the base color/texture
    if (!u_lightOn) {
        gl_FragColor = baseColor;
        return;
    }
    
    // Lighting calculations for point light
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // Normalized light direction
    vec3 L = normalize(lightVector);

    // Normal vector
    vec3 N = normalize(v_Normal);

    // N dot L (diffuse)
    float nDotL = max(dot(N, L), 0.0);

    // View direction (for specular)
    vec3 V = normalize(u_cameraPos - vec3(v_VertPos));

    // Reflection vector
    vec3 R = reflect(-L, N);

    // Specular component
    float specular = pow(max(dot(V, R), 0.0), 64.0);
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * u_lightColor;

    // Ambient component
    vec3 ambient = vec3(baseColor) * 0.3;

    // Diffuse component - multiply by light color
    vec3 diffuse = vec3(baseColor) * nDotL * 0.7 * u_lightColor;    
   
    // Attenuation for point light
    float attenuation = 1.0 / (1.0 + 0.1 * r + 0.01 * r * r);
    
    // Combined lighting for point light
    vec3 pointLightColor = ambient + (diffuse + specularColor * specular * 0.5) * attenuation;    

    // Spotlight calculations if enabled
    vec3 finalColor = pointLightColor;
    
    if (u_spotlightOn) {
        vec3 spotLightVector = u_spotlightPos - vec3(v_VertPos);
        float spotDistance = length(spotLightVector);
        vec3 spotL = normalize(spotLightVector);
        
        // Spotlight direction
        vec3 spotDir = normalize(u_spotlightDir);
        
        // Calculate the cosine of the angle between the light vector and spotlight direction
        float spotEffect = dot(spotDir, -spotL);
        
        // Create a spotlight with a cutoff angle (adjust the 0.9 for wider/narrower spot)
        if (spotEffect > 0.7) {
          // Attenuate based on how close to center of spotlight (less falloff)
          float spotIntensity = pow(spotEffect, 4.0);
            
          // Calculate spotlight diffuse
          float spotDiffuse = max(dot(N, spotL), 0.0);
            
          // Calculate spotlight specular
          vec3 spotReflect = reflect(-spotL, N);
          float spotSpecular = pow(max(dot(V, spotReflect), 0.0), 32.0);
            
          // Less distance attenuation
          float spotAttenuation = spotIntensity / (1.0 + 0.05 * spotDistance + 0.005 * spotDistance * spotDistance);
            
          // Stronger contribution to final color
          finalColor += (vec3(1.0, 1.0, 0.8) * spotDiffuse * 1.5 + spotSpecular * vec3(1.0, 1.0, 0.8)) * spotAttenuation;
        }
    }
    
    // Clamp final color to avoid overexposure
    finalColor = min(finalColor, vec3(1.0, 1.0, 1.0));
    
    gl_FragColor = vec4(finalColor, baseColor.a);
  }
`;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let u_lightPos;
let u_spotlightPos;
let u_spotlightDir;
let u_cameraPos;
let u_lightOn;
let u_spotlightOn;
let u_normalVis;
let u_lightColor;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  
  canvas.style.width = '80%';
  canvas.style.height = 'auto';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
  
  window.addEventListener('resize', function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.8;
      gl.viewport(0, 0, canvas.width, canvas.height);
  });

  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return;
  }
  
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
      console.log('Failed to get the storage location of u_spotlightPos');
      return;
  }
  
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  if (!u_spotlightDir) {
      console.log('Failed to get the storage location of u_spotlightDir');
      return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.log('Failed to get the storage location of u_lightOn');
      return;
  }
  
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
      console.log('Failed to get the storage location of u_spotlightOn');
      return;
  }
  
  u_normalVis = gl.getUniformLocation(gl.program, 'u_normalVis');
  if (!u_normalVis) {
      console.log('Failed to get the storage location of u_normalVis');
      return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
      console.log('Failed to get the storage location of u_lightColor');
      return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
      console.log('Failed to get the storage location of the u_Sampler0');
      return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
      console.log('Failed to get the storage location of u_Sampler2');
      return false;
  }
  
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
      console.log('Failed to get the storage location of u_Sampler3');
      return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_normalOn = false;
let g_lightOn = true;
let g_spotlightOn = false;
let g_lightPos = [0, 3, 0];
let g_spotlightPos = [0, 3, 0];
let g_spotlightDir = [0, -1, 0];
let g_lightColor = [1.0, 1.0, 1.0];

function createToggleSwitch(containerId, labelText, isChecked, onChangeFunction) {
  const toggleGroup = document.createElement('div');
  toggleGroup.className = 'toggle-group';
  
  const toggleLabel = document.createElement('span');
  toggleLabel.textContent = labelText + ': ';
  toggleLabel.className = 'toggle-label';
  toggleGroup.appendChild(toggleLabel);
  
  const toggleSwitch = document.createElement('label');
  toggleSwitch.className = 'toggle-switch';
  toggleGroup.appendChild(toggleSwitch);
  
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.checked = isChecked;
  toggleInput.onchange = onChangeFunction;
  toggleSwitch.appendChild(toggleInput);
  
  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'toggle-slider';
  toggleSwitch.appendChild(toggleSlider);
  
  const onText = document.createElement('span');
  onText.className = 'toggle-text-right';
  onText.textContent = 'I';
  toggleSlider.appendChild(onText);
  
  const offText = document.createElement('span');
  offText.className = 'toggle-text-left';
  offText.textContent = 'O';
  toggleSlider.appendChild(offText);
  
  document.getElementById(containerId).appendChild(toggleGroup);
  
  return toggleInput;
}

function addActionsForHtmlUI() {
  if (!document.getElementById('toggles-container')) {
    const togglesContainer = document.createElement('div');
    togglesContainer.id = 'toggles-container';
    togglesContainer.className = 'control-panel';
    document.querySelector('.canvas-container').appendChild(togglesContainer);
  }
  
  const normalToggle = createToggleSwitch('toggles-container', 'Normal', g_normalOn, function() {
    g_normalOn = this.checked;
  });
  
  const lightToggle = createToggleSwitch('toggles-container', 'Light', g_lightOn, function() {
    g_lightOn = this.checked;
  });
  
  const spotlightToggle = createToggleSwitch('toggles-container', 'Spotlight', g_spotlightOn, function() {
    g_spotlightOn = this.checked;
  });

  console.log("Initial toggle states:");
  console.log("Normal: " + g_normalOn);
  console.log("Light: " + g_lightOn);
  console.log("Spotlight: " + g_spotlightOn);

  const animateLightToggle = createToggleSwitch('toggles-container', 'Animate Light', true, function() {
    document.getElementById('animateLight').checked = this.checked;
  });
  
  window.g_toggles = {
    normalToggle,
    lightToggle,
    spotlightToggle,
    animateLightToggle
  };
  
  document.getElementById('lightSlideX').addEventListener('input', function() {
    g_lightPos[0] = this.value/50;
    g_spotlightPos[0] = g_lightPos[0];
  });
  
  document.getElementById('lightSlideY').addEventListener('input', function() {
    g_lightPos[1] = this.value/50;
    g_spotlightPos[1] = g_lightPos[1];
  });
  
  document.getElementById('lightSlideZ').addEventListener('input', function() {
    g_lightPos[2] = this.value/50;
    g_spotlightPos[2] = g_lightPos[2];
  });

  document.getElementById('spotDirX').addEventListener('input', function() {
    g_spotlightDir[0] = this.value/100;
    normalizeSpotlightDirection();
    
    if (g_spotlightOn) {
      console.log("Spotlight direction updated: ", g_spotlightDir);
    }
  });
  
  document.getElementById('spotDirY').addEventListener('input', function() {
    g_spotlightDir[1] = this.value/100;
    normalizeSpotlightDirection();
    
    if (g_spotlightOn) {
      console.log("Spotlight direction updated: ", g_spotlightDir);
    }
  });
  
  document.getElementById('spotDirZ').addEventListener('input', function() {
    g_spotlightDir[2] = this.value/100;
    normalizeSpotlightDirection();
    
    if (g_spotlightOn) {
      console.log("Spotlight direction updated: ", g_spotlightDir);
    }
  });
    
  document.getElementById('lightR').addEventListener('input', function() {
    g_lightColor[0] = this.value/100;
    updateColorPreview();
  });
  
  document.getElementById('lightG').addEventListener('input', function() {
    g_lightColor[1] = this.value/100;
    updateColorPreview();
  });
  
  document.getElementById('lightB').addEventListener('input', function() {
    g_lightColor[2] = this.value/100;
    updateColorPreview();
  });

  const colorPreviewContainer = document.createElement('div');
  colorPreviewContainer.className = 'toggle-group';
  colorPreviewContainer.style.marginLeft = '15px';
  document.getElementById('toggles-container').appendChild(colorPreviewContainer);

  const colorPreviewLabel = document.createElement('span');
  colorPreviewLabel.textContent = 'Light Color: ';
  colorPreviewLabel.className = 'toggle-label';
  colorPreviewContainer.appendChild(colorPreviewLabel);

  const colorPreviewBox = document.createElement('div');
  colorPreviewBox.id = 'color-preview';
  colorPreviewBox.style.width = '60px';
  colorPreviewBox.style.height = '30px';
  colorPreviewBox.style.border = '1px solid #ccc';
  colorPreviewBox.style.borderRadius = '4px';
  colorPreviewBox.style.backgroundColor = `rgb(${g_lightColor[0] * 255}, ${g_lightColor[1] * 255}, ${g_lightColor[2] * 255})`;
  colorPreviewContainer.appendChild(colorPreviewBox);

  document.getElementById('lightR').addEventListener('input', function() {
    g_lightColor[0] = this.value/100;
    updateColorPreview();
  });

  document.getElementById('lightG').addEventListener('input', function() {
    g_lightColor[1] = this.value/100;
    updateColorPreview();
  });

  document.getElementById('lightB').addEventListener('input', function() {
    g_lightColor[2] = this.value/100;
    updateColorPreview();
  });

  
  const animateLightCheckbox = document.createElement('input');
  animateLightCheckbox.type = 'checkbox';
  animateLightCheckbox.id = 'animateLight';
  animateLightCheckbox.checked = true;
  animateLightCheckbox.style.display = 'none';
  document.body.appendChild(animateLightCheckbox);
}

function updateColorPreview() {
  const r = Math.round(g_lightColor[0] * 255);
  const g = Math.round(g_lightColor[1] * 255);
  const b = Math.round(g_lightColor[2] * 255);
  const colorPreview = document.getElementById('color-preview');
  colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    
  colorPreview.innerHTML = '';
  
  colorPreview.title = `RGB: ${r}, ${g}, ${b}`;
}

function getContrastTextColor(r, g, b) {
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return brightness > 0.5 ? '#000000' : '#FFFFFF';
}

function normalizeSpotlightDirection() {
  let len = Math.sqrt(
    g_spotlightDir[0]*g_spotlightDir[0] + 
    g_spotlightDir[1]*g_spotlightDir[1] + 
    g_spotlightDir[2]*g_spotlightDir[2]
  );
  
  if (len < 0.0001) {
    g_spotlightDir[0] = 0;
    g_spotlightDir[1] = -1;
    g_spotlightDir[2] = 0;
    return;
  }
  
  g_spotlightDir[0] /= len;
  g_spotlightDir[1] /= len;
  g_spotlightDir[2] /= len;
}

function initTextures() {
  var wallImage = new Image();
  if (!wallImage) {
      console.log('Failed to create the wall image object');
      return false;
  }
  wallImage.crossOrigin = 'anonymous';
  wallImage.onload = function() { sendImageToTexture(wallImage, 0); };
  wallImage.onerror = function() {
      console.log('Failed to load wall texture image');
  };
  wallImage.src = 'cobblestone.jpg';

  var grassImage = new Image();
  if (!grassImage) {
      console.log('Failed to create the grass image object');
      return false;
  }
  grassImage.crossOrigin = 'anonymous';
  grassImage.onload = function() { sendImageToTexture(grassImage, 1); };
  grassImage.onerror = function() {
      console.log('Failed to load grass texture image');
  };
  grassImage.src = 'grass.jpg';

  var chestImage = new Image();
  if (!chestImage) {
      console.log('Failed to create the chest image object');
      return false;
  }
  chestImage.crossOrigin = 'anonymous';
  chestImage.onload = function() { sendImageToTexture(chestImage, 2); };
  chestImage.onerror = function() {
      console.log('Failed to load chest texture image');
  };
  chestImage.src = 'chest.jpg';

  // Sun texture
  var sunImage = new Image();
  if (!sunImage) {
      console.log('Failed to create the sun image object');
      return false;
  }
  sunImage.crossOrigin = 'anonymous';
  sunImage.onload = function() { sendImageToTexture(sunImage, 3); };
  sunImage.onerror = function() {
      console.log('Failed to load sun texture image');
      let canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      let ctx = canvas.getContext('2d');
      
      let gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 0, 1)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      
      sendImageToTexture(canvas, 3);
  };
  sunImage.src = 'sun.jpg';

  return true;
}

function sendImageToTexture(image, textureUnit) {
  var texture = gl.createTexture();
  if (!texture) {
      console.log('Failed to create the texture object');
      return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  
  switch(textureUnit) {
      case 0:
          gl.activeTexture(gl.TEXTURE0);
          break;
      case 1:
          gl.activeTexture(gl.TEXTURE1);
          break;
      case 2:
          gl.activeTexture(gl.TEXTURE2);
          break;
      case 3:
          gl.activeTexture(gl.TEXTURE3);
          break;
  }
  
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(textureUnit === 0 ? u_Sampler0 : 
                  textureUnit === 1 ? u_Sampler1 : 
                  textureUnit === 2 ? u_Sampler2 :
                  u_Sampler3, textureUnit);
      console.log(`Texture ${textureUnit} loaded successfully`);
  } catch (e) {
      console.error(`Error loading texture ${textureUnit}:`, e);
  }
}

let g_blockyWorld;
let g_isLeftMouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  
  g_blockyWorld = new BlockyWorld();
  document.onkeydown = keydown;
  canvas.onmousedown = function(ev) { mousedown(ev); };
  canvas.onmouseup = function(ev) { mouseup(ev); };
  canvas.onmousemove = function(ev) { mousemove(ev); };

  addActionsForHtmlUI();
  initTextures(gl, 0);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

function keydown(ev) {
  switch(ev.code) {
      case 'KeyW':
          g_blockyWorld.camera.forward(g_blockyWorld.worldMap);
          break;
      case 'KeyS':
          g_blockyWorld.camera.back(g_blockyWorld.worldMap);
          break;
      case 'KeyA':
          g_blockyWorld.camera.left(g_blockyWorld.worldMap);
          break;
      case 'KeyD':
          g_blockyWorld.camera.right(g_blockyWorld.worldMap);
          break;
      case 'KeyQ':
          g_blockyWorld.camera.rotateRight();
          break;
      case 'KeyE':
          g_blockyWorld.camera.rotateLeft();
          break;
  }
}

function mousedown(ev) {
  if (ev.button === 0) { // Left mouse button
      g_isLeftMouseDown = true;
  }
}

function mouseup(ev) {
  if (ev.button === 0) { // Left mouse button
      g_isLeftMouseDown = false;
      g_lastMouseX = null;
      g_lastMouseY = null;
  }
}

function mousemove(ev) {
  if (!g_isLeftMouseDown) return;

  if (g_lastMouseX === null) {
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
      return;
  }

  let newX = ev.clientX;
  let newY = ev.clientY;

  let deltaX = newX - g_lastMouseX;
  let deltaY = newY - g_lastMouseY;

  g_lastMouseX = newX;
  g_lastMouseY = newY;

  g_blockyWorld.camera.mouseRotate(deltaX, deltaY);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
let g_frameCount = 0;
let g_lastFPSUpdate = performance.now();
let g_currentFPS = 0;

function tick() {
    g_frameCount++;
    const now = performance.now();
    const elapsed = now - g_lastFPSUpdate;
    
    g_seconds = performance.now()/1000.0 - g_startTime;
    updateAnimationAngles();
    
    if (elapsed >= 1000) {
        g_currentFPS = (g_frameCount * 1000) / elapsed;
        document.getElementById('fpsDisplay').textContent = `FPS: ${g_currentFPS.toFixed(1)}`;
        g_frameCount = 0;
        g_lastFPSUpdate = now;
    }

    g_blockyWorld.render();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  // Animate light in a circle
  if (document.getElementById('animateLight') && document.getElementById('animateLight').checked) {
    g_lightPos[0] = 5 * Math.cos(g_seconds);
    g_lightPos[2] = 5 * Math.sin(g_seconds);
    
    // Update slider values to match the animated position
    if (document.getElementById('lightSlideX')) {
      document.getElementById('lightSlideX').value = g_lightPos[0] * 10;
    }
    if (document.getElementById('lightSlideZ')) {
      document.getElementById('lightSlideZ').value = g_lightPos[2] * 10;
    }
  }
  
  // Always set spotlight position to match light position
  // Using direct assignment rather than .slice()
  g_spotlightPos[0] = g_lightPos[0];
  g_spotlightPos[1] = g_lightPos[1];
  g_spotlightPos[2] = g_lightPos[2];
}

var g_shapesList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  }
  else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
];

function drawMap() {
    var body = new Cube();
    for (x = 0; x < 32; x++) {
        for (y = 0; y < 32; y++) {
            if (x < 1 || x == 31 || y == 0 || y == 31) {
                body.color = [0.8, 1, 1, 1];
                body.matrix.translate(0, -0.75, 0);
                body.matrix.scale(0.4, 0.4, 0.4)
                body.matrix.translate(x-16, 0, y-16);
                body.renderfaster();
            }
        }
    }
}

function renderAllShapes() {
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_blockyWorld.camera.eye.elements[0], 
    g_blockyWorld.camera.eye.elements[1], 
    g_blockyWorld.camera.eye.elements[2],
    g_blockyWorld.camera.at.elements[0], 
    g_blockyWorld.camera.at.elements[1], 
    g_blockyWorld.camera.at.elements[2],
    g_blockyWorld.camera.up.elements[0], 
    g_blockyWorld.camera.up.elements[1], 
    g_blockyWorld.camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(0, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Pass lighting parameters to the shaders
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform3f(u_spotlightDir, g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]);
  gl.uniform3f(u_cameraPos, g_blockyWorld.camera.eye.elements[0], g_blockyWorld.camera.eye.elements[1], g_blockyWorld.camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform1i(u_normalVis, g_normalOn);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Point light
  var light = new Cube();
  light.textureNum = 3;
  light.matrix = new Matrix4();
  light.matrix.translate(g_lightPos[0], g_lightPos[1] + 5, g_lightPos[2]);
  // Adjust size
  light.matrix.scale(1, 1, 1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();
    
  // Spotlight
  console.log("Spotlight state: " + g_spotlightOn);
  console.log("Spotlight position:", g_spotlightPos);
  console.log("Spotlight direction:", g_spotlightDir);

  if (g_lightOn) {
    var lightCube = new Cube();
    lightCube.textureNum = 3;
    lightCube.matrix = new Matrix4();
    lightCube.matrix.translate(g_lightPos[0], g_lightPos[1] + 5, g_lightPos[2]);
    lightCube.matrix.scale(0, 0, 0);
    lightCube.matrix.translate(-0.5, -0.5, -0.5);
    lightCube.render();
  }

  // Draw a test sphere for light reflection
  var sphere = new Sphere();
  sphere.color = [0.8, 0.2, 0.2, 1.0];
  sphere.matrix = new Matrix4();
  sphere.matrix.translate(-2, 0.5, -3);
  sphere.render();
  
  // Draw a second sphere
  var sphere2 = new Sphere();
  sphere2.color = [0.2, 0.8, 0.2, 1.0];
  sphere2.matrix = new Matrix4();
  sphere2.matrix.translate(2, 0.5, -3);
  sphere2.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " | ms: " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElem = document.getElementById(htmlID);

  if (!htmlElem) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElem.innerHTML = text;
}