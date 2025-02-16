// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  } `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform変数

  void main() {
    gl_FragColor = u_FragColor;
  } `

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
    }

    canvas.addEventListener('mousedown', function(ev) {
        if (ev.shiftKey) {
            g_RBMode = true;
            g_RBStartTime = performance.now();
        }
    });

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
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

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

const ON = 1;
const OFF = 0;

let g_globalAngle = 0;
let g_xAngle = 0;
let g_yAngle = 0;

let g_stripe1 = 0;
let g_masterAnim = false;

let g_tailAnim = true;
let g_tailAngle = 0;

let g_bodySegment1Anim = true;
let g_bodySegmentAngle = 0;

let g_bodySegmentAngle2 = 0;
let g_bodySegment2Anim = true;

// Poke Anim
let g_RBMode = false;
let g_RBStartTime = 0;
let g_RBDuration = 5000;

function addActionsForHtmlUI() {
    // ON/OFF Button Events
    document.getElementById('entireAnimOn').onclick = function() {g_masterAnim = true; g_startTime = performance.now()/1000.0;};
    document.getElementById('entireAnimOff').onclick = function() {g_masterAnim = false;};

    // Body Segment 1 Events
    document.getElementById('bodySegmentSlide').addEventListener('mousemove', function() {g_bodySegmentAngle = this.value; renderAllShapes();});
    document.getElementById('bodySegment1AnimOn').onclick = function() { g_bodySegment1Anim = true; };
    document.getElementById('bodySegment1AnimOff').onclick = function() { g_bodySegment1Anim = false; };

    // Body Segment 2 Events
    document.getElementById('bodySegmentSlide2').addEventListener('mousemove', function() {g_bodySegmentAngle2 = this.value; renderAllShapes();});
    document.getElementById('bodySegment2AnimOn').onclick = function() { g_bodySegment2Anim = true; };
    document.getElementById('bodySegment2AnimOff').onclick = function() { g_bodySegment2Anim = false; };
    
    // Tail Slider Events
    document.getElementById('tailSlide').addEventListener('mousemove', function() {g_tailAngle = this.value; renderAllShapes();});
    document.getElementById('tailAnimOn').onclick = function() { g_tailAnim = true; };
    document.getElementById('tailAnimOff').onclick = function() { g_tailAnim = false; };
      
    // Angle Slider Events
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});

    // Reset Button Events
    document.getElementById('resetButton').onclick = function() {
    // Reset slider values
    document.getElementById('angleSlide').value = 0;
    document.getElementById('tailSlide').value = 0;
    document.getElementById('bodySegmentSlide').value = 0;
    document.getElementById('bodySegmentSlide2').value = 0;
    
    // Reset animation states
    g_masterAnim = false;
    g_tailAnim = true;
    g_bodySegment1Anim = true;
    g_bodySegment2Anim = true;
    
    // Reset angles
    g_globalAngle = 0;
    g_tailAngle = 0;
    g_bodySegmentAngle = 0;
    g_bodySegmentAngle2 = 0;
    
    // Update the scene
    renderAllShapes();
    };
}

function setupCircularControl() {
    let canvas = document.getElementById('angleControl');
    let ctx = canvas.getContext('2d');
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    let radius = Math.min(centerX, centerY) - 10;
    let isDragging = false;
    let controlPoint = { x: centerX, y: centerY };

    function drawControl() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Draw control point
        ctx.beginPath();
        ctx.arc(controlPoint.x, controlPoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
    }

    canvas.onmousedown = function(ev) {
        let rect = canvas.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        
        let distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distance <= radius) {
            isDragging = true;
            controlPoint.x = x;
            controlPoint.y = y;
            
            g_yAngle = ((x - centerX) / radius) * 180;
            g_xAngle = ((y - centerY) / radius) * 180;
            
            renderAllShapes();
            drawControl();
        }
    }

    canvas.onmousemove = function(ev) {
        if (isDragging) {
            let rect = canvas.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;
            
            let distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            if (distance > radius) {
                let angle = Math.atan2(y - centerY, x - centerX);
                x = centerX + radius * Math.cos(angle);
                y = centerY + radius * Math.sin(angle);
            }
            
            controlPoint.x = x;
            controlPoint.y = y;
            
            g_yAngle = ((x - centerX) / radius) * 180;  
            g_xAngle = ((y - centerY) / radius) * 180;
            
            renderAllShapes();
            drawControl();
        }
    }

    canvas.onmouseup = function(ev) {
        isDragging = false;
    }

    canvas.onmouseleave = function(ev) {
        isDragging = false;
    }

    drawControl();
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    setupCircularControl();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.5, 1.0, 1.0);

    // renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
let g_frameCount = 0;
let g_lastFPSUpdate = performance.now();
let g_currentFPS = 0;

function tick() {
    // Calculate FPS
    g_frameCount++;
    const now = performance.now();
    const elapsed = now - g_lastFPSUpdate;

    // Update FPS display every second
    if (elapsed >= 1000) {
        g_currentFPS = (g_frameCount * 1000) / elapsed;
        document.getElementById('fpsDisplay').textContent = `FPS: ${g_currentFPS.toFixed(1)}`;
        
        // Log warning if FPS drops below 10
        if (g_currentFPS < 10) {
            console.warn(`Low FPS detected: ${g_currentFPS.toFixed(1)}`);
        }
        
        // Reset counters
        g_frameCount = 0;
        g_lastFPSUpdate = now;
    }

    // Your existing tick code
    if (g_masterAnim) {
        g_seconds = performance.now()/1000.0 - g_startTime;
        g_stripe1 = Math.sin(g_seconds) * 20;
    }
    renderAllShapes();
    requestAnimationFrame(tick);
}

function renderAllShapes() {
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);

    globalRotMat.rotate(g_yAngle, 0, 1, 0);
    globalRotMat.rotate(-g_xAngle, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawFish();

    var duration = performance.now() - startTime;
}

function sendTextToHTML(text, htmlID) {
    var htmlElem = document.getElementById(htmlID);

    if (!htmlElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElem.innerHTML = text;
}

function drawFish() {

    function getRainbowColor() {
        if (!g_RBMode) {
            return [1.0, 0.5, 0.0, 1.0]; // Default
        }
        
        let currentTime = performance.now();
        let elapsed = currentTime - g_RBStartTime;
        
        if (elapsed > g_RBDuration) {
            g_isRainbowMode = false;
            return [1.0, 0.5, 0.0, 1.0]; // Return to orange
        }
        
        let phase = (elapsed / g_RBDuration) * Math.PI * 2;
        let r = Math.sin(phase) * 0.5 + 0.5;
        let g = Math.sin(phase + 2.094) * 0.5 + 0.5;
        let b = Math.sin(phase + 4.189) * 0.5 + 0.5;
        
        return [r, g, b, 1.0];
    }

    // scale = (width, height, depth)
    // rotate = (angle, x, y, z)
    // rotate the body using the angle and y-coord

    var angleRad = g_stripe1 * (Math.PI / 180.0);

    var bodyRotMat = new Matrix4();
    bodyRotMat.rotate(g_stripe1 * 0.8, 0, 1, 0);

    var bodyRotMat2 = new Matrix4();
    bodyRotMat2.rotate(g_stripe1 * 0.5, 0, 1, 0);

    var headRotMat = new Matrix4();
    headRotMat.rotate(g_stripe1 * 0.4, 0, 1, 0);

    var tailRotMat = new Matrix4();
    tailRotMat.rotate(g_stripe1 * 0.7, 0, 1, 0);

    var bounceOffset = Math.sin(g_seconds * 1 * Math.PI) * 0.05;

    // Draw orange body segment 1
    var body = new Cube();
    body.color = getRainbowColor();
    body.matrix = new Matrix4(bodyRotMat);
    if (g_bodySegment1Anim) {
        body.matrix.rotate(g_stripe1 * 0.4, 0, 1, 0);
    }
    body.matrix.rotate(g_bodySegmentAngle, 0, 1, 0);
    body.matrix.translate(-.301, -.201, 0.001);
    body.matrix.scale(0.25, 0.4, 0.4);
    body.render();

    // Draw white body-stripe 1
    var str1 = new Cube();
    str1.color = [1.0, 1.0, 1.0, 1.0];
    str1.matrix = new Matrix4(bodyRotMat);
    if (g_bodySegment1Anim) {
        str1.matrix.rotate(g_stripe1 * 0.4, 0, 1, 0);
    }
    str1.matrix.rotate(g_bodySegmentAngle, 0, 1, 0);
    str1.matrix.translate(-.4, -.2, 0);
    str1.matrix.scale(0.1, 0.4, 0.4);
    str1.render();

    // Draw orange body segment 2
    var body2 = new Cube();
    body2.color = getRainbowColor();;
    body2.matrix = new Matrix4(bodyRotMat2);
    if (g_bodySegment2Anim) {
        body2.matrix.rotate(g_stripe1 * 0.25, 0, 1, 0);
    }
    body2.matrix.rotate(g_bodySegmentAngle2, 0, 1, 0);
    body2.matrix.translate(0.051, -.201, 0.001);
    body2.matrix.scale(0.25, 0.4, 0.4);
    body2.render();

    // Draw white body-stripe 2
    var str2 = new Cube();
    str2.color = [1.0, 1.0, 1.0, 1.0];
    str2.matrix = new Matrix4(bodyRotMat2);
    if (g_bodySegment2Anim) {
        str2.matrix.rotate(g_stripe1 * 0.25, 0, 1, 0);
    }
    str2.matrix.rotate(g_bodySegmentAngle2, 0, 1, 0);
    str2.matrix.translate(-0.05, -.2, 0);
    str2.matrix.scale(0.1, 0.4, 0.4);
    str2.render();

    // Draw white body-stripe 3
    var str3 = new Cube();
    str3.color = [1.0, 1.0, 1.0, 1.0];
    str3.matrix = new Matrix4(headRotMat);
    if (g_bodySegment2Anim) {
        str3.matrix.rotate(g_stripe1 * 0.2, 0, 1, 0);
    }
    str3.matrix.rotate(g_bodySegmentAngle2, 0, 1, 0);
    str3.matrix.translate(0.3, -.2, 0);
    str3.matrix.scale(0.1, 0.4, 0.4);
    str3.render();

    // Head
    var head = new Triangle('pyramid');
    head.color = getRainbowColor();
    head.matrix = new Matrix4(headRotMat);
    if (g_bodySegment2Anim) {
        head.matrix.rotate(g_stripe1 * 0.2, 0, 1, 0);
    }
    head.matrix.rotate(g_bodySegmentAngle2, 0, 1, 0);
    head.matrix.translate(0.4, 0, .2);
    head.matrix.scale(0.3, 0.4, 0.4);
    head.render();

    // Eye
    var eye = new Cube();
    eye.color = [0.0, 0.0, 0.0, 1.0];
    eye.matrix = new Matrix4(headRotMat);
    if (g_bodySegment2Anim) {
        eye.matrix.rotate(g_stripe1 * 0.2, 0, 1, 0);
    }
    eye.matrix.rotate(g_bodySegmentAngle2, 0, 1, 0);
    eye.matrix.translate(0.53, 0.0, 0.08);
    eye.matrix.scale(0.05, 0.05, 0.25);
    eye.render();

    // Top tail
    var finTop = new Triangle('rightTop');
    finTop.color = getRainbowColor();;
    finTop.matrix = new Matrix4(bodyRotMat);
    if (g_bodySegment1Anim) {
        finTop.matrix.rotate(g_stripe1 * 0.4, 0, 1, 0);
    }
    finTop.matrix.rotate(g_bodySegmentAngle, 0, 1, 0);
    finTop.matrix.translate(-0.601, 0.201, 0.001);
    if (g_tailAnim) {
        finTop.matrix.rotate(g_stripe1 * 0.5, 0, 1, 0);
    }
    finTop.matrix.rotate(g_tailAngle, 0, 1, 0);
    finTop.matrix.scale(0.2, 0.2, 2);
    finTop.render();

    // Bottom tail
    var finBot = new Triangle('rightBot');
    finBot.color = getRainbowColor();;
    finBot.matrix = new Matrix4(bodyRotMat);
    if (g_bodySegment1Anim) {
        finBot.matrix.rotate(g_stripe1 * 0.4, 0, 1, 0);
    }
    finBot.matrix.rotate(g_bodySegmentAngle, 0, 1, 0);
    finBot.matrix.translate(-0.601, -0.201, 0.001);
    if (g_tailAnim) {
        finBot.matrix.rotate(g_stripe1 * 0.5, 0, 1, 0);
    }
    finBot.matrix.rotate(g_tailAngle, 0, 1, 0);
    finBot.matrix.scale(0.2, 0.2, 2);
    finBot.render();
    // Top fins
    var bodyFin1 = new Triangle('topFin');
    bodyFin1.color = getRainbowColor();;
    bodyFin1.matrix = new Matrix4(bodyRotMat);
    bodyFin1.matrix.translate(-0.17, 0.2, 0.15);
    bodyFin1.matrix.rotate(g_stripe1 * 0.7, 1, 0, 0);  // Swaying motion
    bodyFin1.matrix.scale(0.13, 0.13, 0.5);
    bodyFin1.render();
    
    var bodyFin2 = new Triangle('topFin');
    bodyFin2.color = getRainbowColor();;
    bodyFin2.matrix = new Matrix4(bodyRotMat2);
    bodyFin2.matrix.translate(-0.04, 0.2, 0.15);
    bodyFin2.matrix.rotate(g_stripe1 * 0.7, 1, 0, 0);  // Swaying motion
    bodyFin2.matrix.scale(0.13, 0.13, 0.5);
    bodyFin2.render();
    
    var bodyFin3 = new Triangle('topFin');
    bodyFin3.color = getRainbowColor();;
    bodyFin3.matrix = new Matrix4(bodyRotMat2);
    bodyFin3.matrix.translate(0.08, 0.2, 0.15);
    bodyFin3.matrix.rotate(g_stripe1 * 0.7, 1, 0, 0);  // Swaying motion
    bodyFin3.matrix.scale(0.13, 0.13, 0.5);
    bodyFin3.render();

    // Bubbles
    var bubble = new Cube();
    bubble.color = [1.0, 1.0, 1.0, 1.0];
    bubble.matrix = new Matrix4();
    bubble.matrix.translate(0.7, 0.2 + bounceOffset, 0.1);
    bubble.matrix.scale(0.05, 0.05, 0.05);
    bubble.render();

    var bubble = new Cube();
    bubble.color = [1.0, 1.0, 1.0, 1.0];
    bubble.matrix = new Matrix4();
    bubble.matrix.translate(0.6, 0.4 + bounceOffset, 0.1);
    bubble.matrix.scale(0.07, 0.07, 0.07);
    bubble.render();

    var bubble = new Cube();
    bubble.color = [1.0, 1.0, 1.0, 1.0];
    bubble.matrix = new Matrix4();
    bubble.matrix.translate(0.7, 0.6 + bounceOffset, 0.1);
    bubble.matrix.scale(0.09, 0.09, 0.09);
    bubble.render();

    var bubble = new Cube();
    bubble.color = [1.0, 1.0, 1.0, 1.0];
    bubble.matrix = new Matrix4();
    bubble.matrix.translate(0.6, 0.8 + bounceOffset, 0.1);
    bubble.matrix.scale(0.1, 0.1, 0.1);
    bubble.render();
}

