// DrawRectangle.js
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
    }
  
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
  
    // Draw a blue rectangle
    ctx.fillStyle = 'black'; // Set a blue color
    ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

    document.getElementById('operation').addEventListener('change', handleDrawEvent);

    //let v1 = new Vector3([2.25, 2.25, 0]);
    //drawVector(v1, "red");
}

function drawVector(v, color) {
    let [x, y] = [v.elements[0], v.elements[1]];

    const scale = 20;
    x *= scale;
    y *= scale;

    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + x, 200 - y);
    ctx.stroke();
}

function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x1 = parseFloat(document.getElementById('x-coord').value);
    let y1 = parseFloat(document.getElementById('y-coord').value);

    let x2 = parseFloat(document.getElementById('x2-coord').value);
    let y2 = parseFloat(document.getElementById('y2-coord').value);

    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x1 = parseFloat(document.getElementById('x-coord').value);
    let y1 = parseFloat(document.getElementById('y-coord').value);

    let x2 = parseFloat(document.getElementById('x2-coord').value);
    let y2 = parseFloat(document.getElementById('y2-coord').value);

    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    let operation = document.getElementById('operation').value;
    let scalar = parseFloat(document.getElementById('scalar').value);

    if (operation === 'add' || operation === 'sub') {
        let v3 = new Vector3(v1.elements);

        if (operation === 'add') {
            v3.add(v2);
        }

        else {
            v3.sub(v2);
        }

        drawVector(v3, "green");
    }

    else if (operation === 'mul' || operation === 'div') {
        let v3 = new Vector3(v1.elements);
        let v4 = new Vector3(v2.elements);
        
        if (operation === 'mul') {
            v3.mul(scalar);
            v4.mul(scalar);
        }

        else {
            v3.div(scalar);
            v4.div(scalar);            
        }

        drawVector(v3, "green");
        drawVector(v4, "green");
    }

    if (operation === 'magnitude') {
        let mag1 = v1.magnitude();
        let mag2 = v2.magnitude();

        console.log("Magnitude of v1: ", mag1);
        console.log("Magnitude of v2: ", mag2);
    }

    else if (operation === 'normalize') {
        let v1Norm = new Vector3(v1.elements);
        let v2Norm = new Vector3(v2.elements);

        v1Norm.normalize();
        v2Norm.normalize();

        drawVector(v1Norm, "green");
        drawVector(v2Norm, "green");
    }

    if (operation === 'angle') {
        let angle = angleBetween(v1, v2);
        console.log("Angle between vectors: ", angle, "degrees");
    }

    else if (operation === 'area') {
        let area = areaTriangle(v1, v2);
        console.log("Area of Triangle: ", area);
    }
}

function angleBetween(v1, v2) {
    let dotProduct = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();

    if (mag1 === 0 || mag2 === 0) {
        return 0;
    }

    let cosAngle = dotProduct / (mag1 * mag2);
    cosAngle = Math.max(-1, Math.min(1, cosAngle));

    return Math.acos(cosAngle) * 180 / Math.PI;
}

function areaTriangle(v1, v2) {
    let cross = Vector3.cross(v1, v2);
    let areaParallelogram = cross.magnitude();

    return areaParallelogram * 0.5;
}