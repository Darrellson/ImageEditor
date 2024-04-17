const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const img = new Image();
let isDrawingRectangle = false;
let startX, startY;
let currentX, currentY;
let textX, textY;
let rectangleColor = "black";
let textColor = "black";
let rectangleWidth = 0;
let rectangleHeight = 0;

// Function to handle file upload and load the image onto the canvas
document.getElementById("uploadInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Function to enable drawing mode for rectangles
const drawRectangle = () => {
  isDrawingRectangle = true;
};

/**
 * Displays a text input box to allow the user to input text onto the canvas.
 */
const addText = () => {
  document.getElementById("textInputBox").style.display = "block";
  const inputField = document.getElementById("textInput");
  inputField.focus();
  inputField.addEventListener("blur", () => {
    document.getElementById("textInputBox").style.display = "none";
  });
};

/**
 * Writes the entered text onto the canvas at the specified position.
 */
const writeText = () => {
  const text = document.getElementById("textInput").value.trim();
  if (text !== "") {
    ctx.font = "20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, textX, textY);
  }
};

// Event listener for mouse down on the canvas
canvas.addEventListener("mousedown", (event) => {
  if (isDrawingRectangle) {
    startX = event.offsetX;
    startY = event.offsetY;
    rectangleWidth = 0;
    rectangleHeight = 0;
    ctx.strokeStyle = rectangleColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, rectangleWidth, rectangleHeight);
    isDrawingRectangle = false;
    canvas.style.cursor = "auto";
  } else {
    textX = event.offsetX;
    textY = event.offsetY;
    canvas.style.cursor = "auto";
  }
});

// Event listener for mouse move on the canvas
canvas.addEventListener("mousemove", (event) => {
  if (isDrawingRectangle) {
    currentX = event.offsetX;
    currentY = event.offsetY;
    rectangleWidth = currentX - startX;
    rectangleHeight = currentY - startY;
    draw();
  }
});

// Event listener for mouse up on the canvas
canvas.addEventListener("mouseup", () => {
  isDrawingRectangle = false;
});

// Function to draw the canvas with the image and rectangle
const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);
  ctx.strokeStyle = rectangleColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(startX, startY, rectangleWidth, rectangleHeight);
};

/**
 * Updates the color of the rectangle.
 * @param {string} color - The color to set for the rectangle.
 */
const changeRectangleColor = (color) => {
  rectangleColor = color;
};

/**
 * Updates the color of the text.
 * @param {string} color - The color to set for the text.
 */
const changeTextColor = (color) => {
  textColor = color;
};

/**
 * Saves information about the drawn shapes (e.g., rectangle and text).
 * @returns {Object} An object containing information about the drawn shapes.
 */
const saveInfo = () => {
  const rectangleInfo = {
    type: "rectangle",
    color: rectangleColor,
    position: { x: startX, y: startY },
    width: Math.abs(rectangleWidth),
    height: Math.abs(rectangleHeight),
  };
  const textInfo = {
    type: "text",
    color: textColor,
    position: { x: textX, y: textY },
  };
  return { shapes: [rectangleInfo, textInfo] };
};

// Function to clear the canvas and reload the page
const clearAndReload = () => {
  location.reload();
};

// Log shapes information to the console
const shapesInfo = saveInfo();
console.log(shapesInfo.shapes);
