/*
Brian Tran
btran54@ucsc.edu

Notes to Grader:
- For the Triangle.js class file, I asked an AI assistant to walk me through the steps of creating the rotations for the right triangles.
- I made the helper functions in drawBird.js myself, but they weren't working correctly so I had the AI assistant fix it for me.
- Other than the things mentioned in the two previous points. I did everything myself.
*/

function drawBird() {
    // Helper function to create and configure a shape with rotation
    function createTriangle(x, y, color, rotation) {
        let triangle = new Triangle();
        // Position in WebGL coordinates
        triangle.position = [x/10, y/10];
        triangle.color = color;
        triangle.size = 10;  // Fixed size for all triangles
        triangle.rotation = rotation;
        g_shapesList.push(triangle);
    }

    // Helper function for points
    function createPoint(x, y, color, size) {
        let point = new Point();
        point.position = [x/10, y/10];
        point.color = color;
        point.size = size;
        g_shapesList.push(point);
    }

    // Colors
    const GREEN = [0.4, 0.8, 1.0, 1.0];
    const YELLOW = [1.0, 1.0, 0.0, 1.0];
    const WHITE = [1.0, 1.0, 1.0, 1.0];
    const BLACK = [0.0, 0.0, 0.0, 1.0];
    
    // Body triangles (green) - following the grid pattern exactly
    // Top row
    createTriangle(-1, 1, GREEN, 180);  // Left
    createTriangle(-1, 2, GREEN, 0);    // Middle-left
    createTriangle(0, 3, GREEN, 180);   // Middle-right
    createTriangle(1, 3, GREEN, 180);
    createTriangle(-1, 3, GREEN, 180);
    createTriangle(1, 2, GREEN, 0);     // Right
    createTriangle(1, 1, GREEN, 270);
    createTriangle(-2, 2, GREEN, 90);

    // Upper middle row
    createTriangle(-2, 2, GREEN, 0);    // Left
    createTriangle(-1, 2, GREEN, 180);  // Middle-left
    createTriangle(0, 2, GREEN, 180);
    createTriangle(0, 2, GREEN, 0);     // Middle-right
    createTriangle(-1, 3, GREEN, -180);
    createTriangle(1, 1, GREEN, -270);
    createTriangle(0, 1, GREEN, 0);
    createTriangle(-2, 1, GREEN, 0);
    createTriangle(-2, 2, GREEN, -270);
    createTriangle(-3, 0, GREEN, 0);
    createTriangle(1, 2, GREEN, 180);   // Right

    // Lower middle row
    createTriangle(-3, 1, GREEN, 0);    // Far left
    createTriangle(-2, 1, GREEN, 180);  // Left
    createTriangle(-1, 1, GREEN, 0);    // Middle-left
    createTriangle(0, 1, GREEN, 180);   // Middle-right
    createTriangle(1, 1, GREEN, 0);     // Right

    // Bottom row
    createTriangle(-3, 0, GREEN, 90);  // Tail
    createTriangle(-2, -1, GREEN, 0);
    createTriangle(-2, 0, GREEN, -270);
    createTriangle(-1, -1, GREEN, 0);
    createTriangle(0, 0, GREEN, -270);
    createTriangle(-2, 0, GREEN, 0);    // Left
    createTriangle(-1, 0, GREEN, 180);  // Middle-left
    createTriangle(0, 0, GREEN, 0);     // Middle-right
    createTriangle(0, 0, GREEN, 270);   // Right 0

    // Wing
    createTriangle(-1, 0, YELLOW, 90);
    createTriangle(-1, 0, GREEN, 0);
    createTriangle(-1, 1, YELLOW, 270);

    // Hair
    createTriangle(0, 3, YELLOW, 0);
    createTriangle(-1, 3, YELLOW, 0);

    // Beak (yellow)
    createTriangle(2, 1, YELLOW, 0);

    // Eye
    createTriangle(2, 2, WHITE, 180);
    createPoint(1.75, 1.75, BLACK, 8);

    // Legs (yellow)
    createTriangle(-2, -2, YELLOW, 0);  // Left leg
    createTriangle(0, -2, YELLOW, 0);   // Right leg
    
    // Render all shapes
    renderAllShapes();
}