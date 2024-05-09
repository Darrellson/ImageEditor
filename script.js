/**
 * Initialize canvas and set up event listeners.
 */
let canvas,
  context,
  dragging = false,
  dragStartLocation;

let drawnObjects = []; // Array to store information about drawn objects
let selectedObjectIndex = -1; // Index of the currently selected object
let imageUploaded; // Variable to hold the uploaded image

const init = () => {
  // Get canvas element and 2d rendering context
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // Set up event listeners for mouse actions
  canvas.addEventListener("mousedown", dragStart, false);
  canvas.addEventListener("mousemove", drag, false);
  canvas.addEventListener("mouseup", dragStop, false);
  canvas.addEventListener("click", handleClick, false); // Add click event listener

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

// Initialize canvas drawing app after the window has loaded
window.addEventListener("load", init);

// Function to handle mouse click event
const handleClick = (event) => {
  let clickPosition = getCanvasCoordinates(event);
  // Iterate through drawn objects to check if any object is clicked
  for (let i = drawnObjects.length - 1; i >= 0; i--) {
    if (isPointInsideObject(clickPosition, drawnObjects[i])) {
      // If clicked on an object, deselect previously selected object
      if (selectedObjectIndex !== -1) {
        drawnObjects[selectedObjectIndex].isSelected = false;
      }
      // Select the clicked object and redraw
      selectedObjectIndex = i;
      drawnObjects[selectedObjectIndex].isSelected = true;
      redrawObjects();
      break;
    }
  }
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
 * Handle mouse down event to start dragging.
 */
const dragStart = (event) => {
  dragging = true;
  dragStartLocation = getCanvasCoordinates(event);
};

/**
 * Handle mouse move event during dragging.
 */
const drag = (event) => {
  if (dragging) {
    let position = getCanvasCoordinates(event);
    draw(position);
  }
};

/**
 * Handle mouse up event to stop dragging.
 */
const dragStop = (event) => {
  if (dragging) {
    let position = getCanvasCoordinates(event);
    let obj = {
      shape: document.querySelector('input[type="radio"][name="shape"]:checked')
        .value,
      lineWidth: parseInt(document.getElementById("lineWidth").value),
      fillColor: document.getElementById("fillColor").value,
      strokeColor: document.getElementById("strokeColor").value,
      isSelected: false, // Initially not selected
      fill: document.getElementById("fillBox").checked,
      start: dragStartLocation,
      end: position,
      center: {
        x: (dragStartLocation.x + position.x) / 2,
        y: (dragStartLocation.y + position.y) / 2,
      },
      radius:
        Math.sqrt(
          Math.pow(position.x - dragStartLocation.x, 2) +
            Math.pow(position.y - dragStartLocation.y, 2)
        ) / 2,
      width: Math.abs(position.x - dragStartLocation.x),
      height: Math.abs(position.y - dragStartLocation.y),
      radiusX: Math.abs((position.x - dragStartLocation.x) / 2),
      radiusY: Math.abs((position.y - dragStartLocation.y) / 2),
      rotation: 0,
      sides: parseInt(document.getElementById("polygonSides").value),
      points: [], // Will be populated for polygon
    };
    // Populate points for polygon
    if (obj.shape === "polygon") {
      obj.points = calculatePolygonPoints(
        obj.center,
        obj.sides,
        obj.radius,
        obj.rotation
      );
    }
    // Add object to drawnObjects array
    drawnObjects.push(obj);
    redrawObjects(); // Redraw canvas with newly added object
    dragging = false;
  }
};

// Function to draw shapes
const draw = (position) => {
  let shape = document.querySelector(
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
  if (shape === "line") {
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
  } else if (shape === "circle") {
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
  } else if (shape === "ellipse") {
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
  } else if (shape === "rect") {
    let w = position.x - dragStartLocation.x;
    let h = position.y - dragStartLocation.y;
    context.rect(dragStartLocation.x, dragStartLocation.y, w, h);
  } else if (shape === "polygon") {
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
};

/**
 * Draw shapes after drawing on uploaded image objects.
 */
const drawOnImage = (position) => {
  // Redraw the uploaded image
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(imageUploaded, 0, 0, canvas.width, canvas.height);
  
  // Redraw existing objects on top of the image
  redrawObjects();
  
  // Draw new shape based on user input
  let shape = document.querySelector(
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
  if (shape === "line") {
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
  } else if (shape === "circle") {
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
  } else if (shape === "ellipse") {
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
  } else if (shape === "rect") {
    let w = position.x - dragStartLocation.x;
    let h = position.y - dragStartLocation.y;
    context.rect(dragStartLocation.x, dragStartLocation.y, w, h);
  } else if (shape === "polygon") {
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
};

const redrawObjects = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the uploaded image if it exists
  if (imageUploaded) {
    context.drawImage(imageUploaded, 0, 0, canvas.width, canvas.height);
  }
  // Draw all objects from the drawnObjects array
  drawnObjects.forEach((obj, index) => {
    context.beginPath();
    context.lineWidth = obj.lineWidth;
    context.strokeStyle = obj.isSelected ? "gray" : obj.strokeColor;
    context.fillStyle = obj.isSelected ? "gray" : obj.fillColor;
    // Draw based on object type
    if (obj.shape === "line") {
      context.moveTo(obj.start.x, obj.start.y);
      context.lineTo(obj.end.x, obj.end.y);
    } else if (obj.shape === "circle") {
      context.arc(obj.center.x, obj.center.y, obj.radius, 0, 2 * Math.PI);
    } else if (obj.shape === "ellipse") {
      context.ellipse(
        obj.center.x,
        obj.center.y,
        obj.radiusX,
        obj.radiusY,
        obj.rotation,
        0,
        2 * Math.PI
      );
    } else if (obj.shape === "rect") {
      context.rect(obj.start.x, obj.start.y, obj.width, obj.height);
    } else if (obj.shape === "polygon") {
      drawPolygon(
        obj.center,
        obj.sides,
        obj.rotation * (Math.PI / 180),
        obj.radius
      );
    }
    if (obj.fill) {
      context.fill();
    } else {
      context.stroke();
    }
  });
};

// Function to check if a point falls within the bounds of a shape
const isPointInsideObject = (point, obj) => {
  // Check based on object type
  if (obj.shape === "line") {
    // For line, calculate distance from point to line
    let dist =
      Math.abs(
        (obj.end.y - obj.start.y) * point.x -
          (obj.end.x - obj.start.x) * point.y +
          obj.end.x * obj.start.y -
          obj.end.y * obj.start.x
      ) /
      Math.sqrt(
        Math.pow(obj.end.y - obj.start.y, 2) +
          Math.pow(obj.end.x - obj.start.x, 2)
      );
    return dist < context.lineWidth / 2;
  } else if (obj.shape === "circle") {
    // For circle, check if distance from point to center is less than radius
    let dist = Math.sqrt(
      Math.pow(point.x - obj.center.x, 2) + Math.pow(point.y - obj.center.y, 2)
    );
    return dist < obj.radius;
  } else if (obj.shape === "ellipse") {
    // For ellipse, check if distance from point to center is less than radius in both axes
    let dx = point.x - obj.center.x;
    let dy = point.y - obj.center.y;
    return (
      (dx * dx) / (obj.radiusX * obj.radiusX) +
        (dy * dy) / (obj.radiusY * obj.radiusY) <=
      1
    );
  } else if (obj.shape === "rect") {
    // For rectangle, check if point falls within bounding box
    return (
      point.x >= obj.start.x &&
      point.x <= obj.start.x + obj.width &&
      point.y >= obj.start.y &&
      point.y <= obj.start.y + obj.height
    );
  } else if (obj.shape === "polygon") {
    // For polygon, use point-in-polygon algorithm
    return isPointInsidePolygon(point, obj.points);
  }
  return false;
};

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

// Initialize canvas drawing app after the window has loaded
window.addEventListener("load", init);