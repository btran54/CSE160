// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
} `

// In FSHADER_SOURCE, add a new sampler and case:
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0; // Ground
  uniform sampler2D u_Sampler1; // Walls
  uniform sampler2D u_Sampler2; // Chest
  uniform int u_whichTexture;

  void main() {
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else {
        gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  } `

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

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

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
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
                  u_Sampler2, textureUnit);
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

    if (elapsed >= 1000) {
        g_currentFPS = (g_frameCount * 1000) / elapsed;
        document.getElementById('fpsDisplay').textContent = `FPS: ${g_currentFPS.toFixed(1)}`;
        g_frameCount = 0;
        g_lastFPSUpdate = now;
    }

    g_blockyWorld.render();
    requestAnimationFrame(tick);
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
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
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
  projMat.setPersepctive(60, canvas.width / canvas.height, 0.1, 100);
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

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " | ms: " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElem = document.getElementById(htmlID);

  if (!htmlID) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElem.innerHTML = text;
}

