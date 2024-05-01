/**
 * Initialize canvas and set up event listeners.
 */
let canvas,
  context,
  dragging = false,
  dragStartLocation,
  snapshot;

let shapes = [];

const init = () => {
  // Get canvas element and 2d rendering context
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // Set up event listeners for mouse actions
  canvas.addEventListener("mousedown", dragStart, false);
  canvas.addEventListener("mousemove", drag, false);
  canvas.addEventListener("mouseup", dragStop, false);

  // Get DOM elements related to canvas properties
  let lineWidth = document.getElementById("lineWidth");
  let fillColor = document.getElementById("fillColor");
  let strokeColor = document.getElementById("strokeColor");
  let canvasColor = document.getElementById("backgroundColor");
  let clearCanvas = document.getElementById("clearCanvas");
  let textInput = document.getElementById("textInput");

  // Initialize canvas properties based on input values
  context.lineWidth = lineWidth.value;
  context.fillStyle = fillColor.value;
  context.strokeStyle = strokeColor.value;

  // Add event listeners to update canvas properties
  lineWidth.addEventListener("input", changeLineWidth, false);
  fillColor.addEventListener("input", changeFillStyle, false);
  strokeColor.addEventListener("input", changeStrokeStyle, false);
  canvasColor.addEventListener("input", changeBackgroundColor, false);
  clearCanvas.addEventListener("click", eraseCanvas, false);
  textInput.addEventListener("input", writeCanvas, false);

  // Add event listener to handle image upload
  document
    .getElementById("uploadImageBtn")
    .addEventListener("click", handleImageUpload);
};

/**
 * Handle image upload and draw the image on the canvas.
 */
const handleImageUpload = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Clear canvas and draw the uploaded image
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click(); // Open the file dialog
};

/**
 * Get canvas coordinates based on mouse event.
 */
const getCanvasCoordinates = (event) => {
  let x = event.clientX - canvas.getBoundingClientRect().left;
  let y = event.clientY - canvas.getBoundingClientRect().top;
  return { x: x, y: y };
};

/**
 * Take a snapshot of the canvas state.
 */
const takeSnapShot = () => {
  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Restore canvas state from the snapshot.
 */
const restoreSnapShot = () => {
  context.putImageData(snapshot, 0, 0);
};

/**
 * Handle mouse down event to start dragging.
 */
const dragStart = (event) => {
  dragging = true;
  dragStartLocation = getCanvasCoordinates(event);

  // Check if the mouse is clicked on any shape
  let clickedShape = shapes.find(shape => {
    if (shape.type === "line") {
      return (
        isPointOnLine(
          dragStartLocation,
          shape.start,
          shape.end,
          context.lineWidth
        )
      );
    } else if (shape.type === "circle") {
      let radius = Math.sqrt(
        (shape.start.x - shape.end.x) ** 2 +
          (shape.start.y - shape.end.y) ** 2
      );
      return isPointInCircle(dragStartLocation, shape.start, radius);
    } else if (shape.type === "ellipse") {
      // Assuming you have an isPointInEllipse function
      // return isPointInEllipse(dragStartLocation, shape.start, shape.end);
    } else if (shape.type === "rect") {
      // Assuming you have an isPointInRect function
      // return isPointInRect(dragStartLocation, shape.start, shape.end);
    }
    // Add similar checks for other shape types
  });

  if (clickedShape) {
    // If clicked on a shape, set draggingShape to that shape
    draggingShape = clickedShape;
    // Set the offset from the top-left corner of the shape to the mouse position
    dragOffset = {
      x: dragStartLocation.x - clickedShape.start.x,
      y: dragStartLocation.y - clickedShape.start.y
    };
  } else {
    // If not clicked on any shape, take a snapshot of the canvas state
    takeSnapShot();
  }
};

/**
 * Handle mouse move event during dragging.
 */
const drag = (event) => {
  if (dragging) {
    if (draggingShape) {
      // If dragging a shape, update its position
      let position = getCanvasCoordinates(event);
      draggingShape.start.x = position.x - dragOffset.x;
      draggingShape.start.y = position.y - dragOffset.y;
      redrawCanvas();
      redrawShapes();
    } else {
      // If not dragging a shape, restore the canvas state and draw the shape being dragged
      restoreSnapShot();
      let position = getCanvasCoordinates(event);
      draw(position);
    }
  }
};

/**
 * Handle mouse up event to stop dragging.
 */
const dragStop = () => {
  dragging = false;
  if (draggingShape) {
    // If dragging a shape, clear draggingShape to stop dragging it
    draggingShape = null;
  } else {
    // If not dragging a shape, save the drawn shape to the shapes array
    let position = getCanvasCoordinates(event);
    draw(position);
    // Clear the snapshot
    snapshot = null;
  }
};


/**
 * Draw shapes based on selected shape and properties.
 */
const draw = (position) => {
  let shapeType = document.querySelector(
    'input[type="radio"][name="shape"]:checked'
  ).value;
  let polygonSides = document.getElementById("polygonSides").value;
  let polygonAngle = calculateAngle(dragStartLocation, position);
  let lineCap = document.querySelector(
    'input[type="radio"][name="lineCap"]:checked'
  ).value;
  let fillBox = document.getElementById("fillBox");
  let xor = document.getElementById("xor");

  context.lineCap = lineCap;

  context.beginPath();
  if (shapeType === "line") {
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
  } else if (shapeType === "circle") {
    let radius = Math.sqrt(
      (dragStartLocation.x - position.x) ** 2 +
        (dragStartLocation.y - position.y) ** 2
    );
    context.arc(
      dragStartLocation.x,
      dragStartLocation.y,
      radius,
      0,
      2 * Math.PI
    );
  } else if (shapeType === "ellipse") {
    let w = position.x - dragStartLocation.x;
    let h = position.y - dragStartLocation.y;
    context.ellipse(
      dragStartLocation.x,
      dragStartLocation.y,
      Math.abs(w),
      Math.abs(h),
      0,
      0,
      2 * Math.PI
    );
  } else if (shapeType === "rect") {
    let w = position.x - dragStartLocation.x;
    let h = position.y - dragStartLocation.y;
    context.rect(dragStartLocation.x, dragStartLocation.y, w, h);
  } else if (shapeType === "polygon") {
    drawPolygon(position, polygonSides, polygonAngle * (Math.PI / 180));
  }

  if (xor.checked) {
    context.globalCompositeOperation = "xor";
  } else {
    context.globalCompositeOperation = "source-over";
  }

  if (fillBox.checked) {
    context.fillStyle = document.getElementById("fillColor").value;
    context.fill();
  } else {
    context.strokeStyle = document.getElementById("strokeColor").value;
    context.stroke();
  }

  // Save drawn shape to the shapes array
  shapes.push({
    type: shapeType,
    start: { x: dragStartLocation.x, y: dragStartLocation.y },
    end: { x: position.x, y: position.y },
    fill: fillBox.checked,
    fillColor: context.fillStyle,
    strokeColor: context.strokeStyle,
    lineCap: lineCap,
  });
};

/**
 * Draw all shapes stored in the shapes array.
 */
const redrawShapes = () => {
  shapes.forEach((shape) => {
    context.beginPath();
    if (shape.type === "line") {
      context.moveTo(shape.start.x, shape.start.y);
      context.lineTo(shape.end.x, shape.end.y);
    } else if (shape.type === "circle") {
      let radius = Math.sqrt(
        (shape.start.x - shape.end.x) ** 2 + (shape.start.y - shape.end.y) ** 2
      );
      context.arc(shape.start.x, shape.start.y, radius, 0, 2 * Math.PI);
    } else if (shape.type === "ellipse") {
      let w = shape.end.x - shape.start.x;
      let h = shape.end.y - shape.start.y;
      context.ellipse(
        shape.start.x,
        shape.start.y,
        Math.abs(w),
        Math.abs(h),
        0,
        0,
        2 * Math.PI
      );
    } else if (shape.type === "rect") {
      let w = shape.end.x - shape.start.x;
      let h = shape.end.y - shape.start.y;
      context.rect(shape.start.x, shape.start.y, w, h);
    } else if (shape.type === "polygon") {
      
    }

    context.lineCap = shape.lineCap;

    if (shape.fill) {
      context.fillStyle = shape.fillColor;
      context.fill();
    } else {
      context.strokeStyle = shape.strokeColor;
      context.stroke();
    }
  });
};

/**
 * Function to check if a point is on a line segment.
 */
const isPointOnLine = (point, start, end, lineWidth) => {
  // Implementation depends on your requirements
};

/**
 * Function to check if a point is inside a circle.
 */
const isPointInCircle = (point, center, radius) => {
  // Implementation depends on your requirements
};

/**
 * Function to check if a point is inside an ellipse.
 */
const isPointInEllipse = (point, center, radius) => {
  // Implementation depends on your requirements
};

/**
 * Function to check if a point is inside a rectangle.
 */
const isPointInRect = (point, topLeft, bottomRight) => {
  // Implementation depends on your requirements
};

// Redraw both canvas and shapes
const redrawCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  redrawShapes();
};

// Initialize canvas drawing app after the window has loaded
window.addEventListener("load", init);

/**
 * Calculate angle between two points.
 */
const calculateAngle = (start, current) => {
  let angle = Math.atan2(current.y - start.y, current.x - start.x);
  return angle * (180 / Math.PI);
};

/**
 * Update line width based on input value.
 */
const changeLineWidth = () => {
  context.lineWidth = parseInt(document.getElementById("lineWidth").value);
};

/**
 * Update fill style based on input value.
 */
const changeFillStyle = () => {
  context.fillStyle = document.getElementById("fillColor").value;
};

/**
 * Update stroke style based on input value.
 */
const changeStrokeStyle = () => {
  context.strokeStyle = document.getElementById("strokeColor").value;
};

/**
 * Change canvas background color.
 */
const changeBackgroundColor = () => {
  context.fillStyle = document.getElementById("backgroundColor").value;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

/**
 * Clear the canvas.
 */
const eraseCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Write text on the canvas at clicked position.
 */
const writeCanvas = () => {
  let text = document.getElementById("textInput").value;
  context.font = "24px Arial";

  // Add event listener to handle mouse click for text positioning
  canvas.addEventListener(
    "click",
    function (event) {
      let canvasPosition = getCanvasCoordinates(event);

      // Draw the text on the canvas at the clicked position
      context.fillText(text, canvasPosition.x, canvasPosition.y);
    },
    { once: true }
  ); // { once: true } ensures the event listener triggers only once
};

/**
 * Save current canvas state.
 */
const saveCanvasState = () => {
  let canvasState = {
    shape: document.querySelector('input[type="radio"][name="shape"]:checked')
      .value,
    lineWidth: context.lineWidth,
    fillColor: context.fillStyle,
    strokeColor: context.strokeStyle,
    textInput: document.getElementById("textInput").value,
  };

  // Log canvas state as JSON object to console
  console.log(JSON.stringify(canvasState, null, 2));
};

// Initialize canvas drawing app after the window has loaded
window.addEventListener("load", init);
