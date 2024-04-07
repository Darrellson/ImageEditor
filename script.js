const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color");
const rectColorInput = document.getElementById("rectColor");
const uploadInput = document.getElementById("upload");
const saveButton = document.getElementById("saveButton");

let imageLoaded = false;
let selectedX = 0;
let selectedY = 0;
let endX = 0;
let endY = 0;
let isDrawingRectangle = false;
let isAddingText = false;
let textObjects = [];
const rectangles = []; // Array to store rectangle objects {x, y, width, height, color}

/**
 * Initialize canvas and set up event listeners.
 */
const initializeCanvas = () => {
  canvas.addEventListener("mousedown", handleCanvasMouseDown);
  canvas.addEventListener("mouseup", handleCanvasMouseUp);
};

/**
 * Handle mouse down event on canvas to select position.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleCanvasMouseDown = (event) => {
  if (imageLoaded) {
    selectedX = event.offsetX;
    selectedY = event.offsetY;
    enableDrawingFeatures();
  }
};

/**
 * Handle mouse up event on canvas.
 */
const handleCanvasMouseUp = (event) => {
  endX = event.offsetX;
  endY = event.offsetY;
};

/**
 * Enable drawing features after position is selected.
 */
const enableDrawingFeatures = () => {
  if (!imageLoaded) return;

  canvas.removeEventListener("mousedown", handleCanvasMouseDown);

  document
    .getElementById("drawButton")
    .addEventListener("click", startDrawingRectangle);
  document
    .getElementById("textButton")
    .addEventListener("click", startAddingText);
};

/**
 * Start drawing a rectangle on canvas.
 */
const startDrawingRectangle = () => {
  isDrawingRectangle = true;
  isAddingText = false;
  canvas.addEventListener("mousemove", handleDrawingMouseMove);
  canvas.addEventListener("mouseup", stopDrawingRectangle);
};

/**
 * Handle mouse move event to draw rectangle.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleDrawingMouseMove = (event) => {
  if (isDrawingRectangle) {
    drawCanvas();
    drawRectangle(selectedX, selectedY, event.offsetX, event.offsetY);
  }
};

/**
 * Stop drawing the rectangle.
 */
const stopDrawingRectangle = () => {
  isDrawingRectangle = false;
  canvas.removeEventListener("mousemove", handleDrawingMouseMove);

  // After stopping drawing, add the rectangle to the list
  const width = Math.abs(endX - selectedX);
  const height = Math.abs(endY - selectedY);
  rectangles.push({
    x: selectedX,
    y: selectedY,
    width,
    height,
    color: rectColorInput.value,
  });

  // Redraw canvas to include the new rectangle
  drawCanvas();
};
/**
 * Draw rectangle on canvas.
 * @param {number} startX - Starting X coordinate.
 * @param {number} startY - Starting Y coordinate.
 * @param {number} endX - Ending X coordinate.
 * @param {number} endY - Ending Y coordinate.
 */
const drawRectangle = (startX, startY, endX, endY) => {
  const width = endX - startX;
  const height = endY - startY;

  ctx.fillStyle = rectColorInput.value;
  ctx.fillRect(startX, startY, width, height);
};

/**
 * Start adding text on canvas.
 */
const startAddingText = () => {
  isAddingText = true;
  isDrawingRectangle = false;
  canvas.addEventListener("click", handleAddingTextClick);
};

/**
 * Handle click event to add text on canvas.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleAddingTextClick = (event) => {
  if (isAddingText) {
    const text = prompt("Enter text:");
    if (text) {
      const x = event.offsetX;
      const y = event.offsetY;

      textObjects.push({ text, x, y, color: colorInput.value });
      drawCanvas();
    }
  }
};

/**
 * Draw all shapes and text on the canvas.
 */
const drawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    document.getElementById("uploaded-image"),
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawAllRectangles();
  drawAllText();
};
/**
 * Draw all text objects on the canvas.
 */
const drawAllText = () => {
  textObjects.forEach((textObject) => {
    ctx.fillStyle = textObject.color;
    ctx.font = "30px Arial";
    ctx.fillText(textObject.text, textObject.x, textObject.y);
  });
};

/**
 * Draw all rectangles on the canvas.
 */
const drawAllRectangles = () => {
  rectangles.forEach((rect) => {
    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  });
};

/**
 * Listen for color input change event to update rectangle color.
 */
rectColorInput.addEventListener("input", () => {
  drawAllRectangles(); // Redraw only the rectangles to update their colors
});

/**
 * Listen for color input change event to update text color.
 */
colorInput.addEventListener("input", () => {
  drawAllText(); // Redraw only the text to update their colors
});

/**
 * Listen for file input change event to upload image.
 */
uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      imageLoaded = true;
      initializeCanvas();
    };
    img.src = e.target.result;
    document.getElementById("uploaded-image").src = e.target.result;
    document.getElementById("uploaded-image").hidden = true;
  };

  reader.readAsDataURL(file);
});

const saveImage = () => {
  const rectInfo = {
    rectangles: rectangles.map((rect) => ({
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
      color: rect.color,
    })),
    textObjects: textObjects.map((textObj) => ({
      text: textObj.text,
      x: textObj.x,
      y: textObj.y,
      color: textObj.color,
    })),
  };

  console.log(JSON.stringify(rectInfo));
};

saveButton.addEventListener("click", saveImage);
