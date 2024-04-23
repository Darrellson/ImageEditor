const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
let rectangles = [];
let texts = [];
const img = new Image();
let isDrawing = false;
let startX, startY;
let currentX, currentY;
let clickX, clickY;
let rectangleColor = "black";
let rectangleFillColor = "transparent";
let textColor = "black";
let textInputActive = false;

// Event listener for file upload
document.getElementById("uploadInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        drawCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

/**
 * Draw the canvas with the loaded image, existing rectangles, and texts.
 * This function is called whenever changes are made to the canvas.
 */
const drawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  rectangles.forEach((rect) => {
    ctx.strokeStyle = rect.color;
    ctx.lineWidth = 3;
    ctx.fillStyle = rect.fillColor;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  });
  texts.forEach((text) => {
    ctx.fillStyle = text.color;
    ctx.font = `${text.size}px Arial`;
    ctx.fillText(text.content, text.x, text.y);
  });
};

/**
 * Update the color properties of existing rectangles with the current rectangle color.
 */
const updateRectangles = () => {
  rectangles.forEach((rect) => {
    rect.color = rectangleColor;
    rect.fillColor = rectangleFillColor;
  });
};

/**
 * Update the color property of existing texts with the current text color.
 */
const updateTexts = () => {
  texts.forEach((text) => {
    text.color = textColor;
  });
};

/**
 * Initiate rectangle drawing mode when the drawRectangle button is clicked.
 */
const drawRectangle = () => {
  isDrawing = true;
};

/**
 * Event listener for mouse down event on the canvas.
 * Starts drawing a rectangle if rectangle drawing mode is active.
 */
canvas.addEventListener("mousedown", (event) => {
  if (textInputActive || !isDrawing) return;
  startX = event.offsetX;
  startY = event.offsetY;
  isDrawing = true;
});

/**
 * Event listener for mouse move event on the canvas.
 * Draws the canvas with the image, rectangles, and texts as the mouse moves.
 */
canvas.addEventListener("mousemove", (event) => {
  if (isDrawing && !textInputActive) {
    currentX = event.offsetX;
    currentY = event.offsetY;
    drawCanvas();
  }
});

/**
 * Event listener for mouse up event on the canvas.
 * Saves the drawn rectangle when rectangle drawing is completed.
 */
canvas.addEventListener("mouseup", () => {
  if (isDrawing && !textInputActive) {
    isDrawing = false;
    saveRectangle();
  }
});

/**
 * Function to save the drawn rectangle with its properties.
 */
const saveRectangle = () => {
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const newRect = {
    x: x,
    y: y,
    width: width,
    height: height,
    color: rectangleColor,
    fillColor: rectangleFillColor,
  };
  rectangles.push(newRect);
  drawCanvas();
};

/**
 * Activate text input mode when adding text to the canvas.
 */
const addText = () => {
  textInputActive = true;
  document.getElementById("textInputBox").style.display = "block";
  canvas.addEventListener(
    "click",
    (event) => {
      clickX = event.offsetX;
      clickY = event.offsetY;
    },
    { once: true }
  );
};

/**
 * Function to write text on the canvas at the specified position.
 */
const writeText = () => {
  const textInput = document.getElementById("textInput");
  const textContent = textInput.value.trim();
  if (textContent) {
    const newText = {
      content: textContent,
      x: clickX,
      y: clickY,
      color: textColor,
      size: 24,
    };
    texts.push(newText);
    textInput.value = "";
    textInputActive = false;
    document.getElementById("textInputBox").style.display = "none";
    drawCanvas();
  }
};

/**
 * Event listener for changing rectangle border color.
 * Updates the rectangle color and redraws the canvas.
 */
const changeRectangleColor = (color) => {
  rectangleColor = color;
  updateRectangles();
  drawCanvas();
};

/**
 * Event listener for changing rectangle background color.
 * Updates the rectangle fill color and redraws the canvas.
 */
const changeRectangleFillColor = (color) => {
  rectangleFillColor = color;
  updateRectangles();
  drawCanvas();
};

/**
 * Event listener for changing text color.
 * Updates the text color and redraws the canvas.
 */
const changeTextColor = (color) => {
  textColor = color;
  updateTexts();
  drawCanvas();
};

/**
 * Function to clear canvas and reload the page.
 */
const clearAndReload = () => {
  window.location.reload();
};

/**
 * Function to save detailed information about rectangles and texts in an object.
 * Returns an object containing information about all rectangles and texts on the canvas.
 */
const saveInfo = () => {
  const info = {
    rectangles: [],
    texts: [],
  };
  rectangles.forEach((rect) => {
    const rectInfo = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      borderColor: rect.color,
      fillColor: rect.fillColor,
    };
    info.rectangles.push(rectInfo);
  });
  texts.forEach((text) => {
    const textInfo = {
      content: text.content,
      x: text.x,
      y: text.y,
      color: text.color,
      fontSize: text.size,
    };
    info.texts.push(textInfo);
  });
  return info;
};

// Example usage of saveInfo()
const savedData = saveInfo();
console.log(savedData);
