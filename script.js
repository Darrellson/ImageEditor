let canvas = document.getElementById("imageCanvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let isDrawingRectangle = false;
let startX, startY;
let textX, textY;
let rectangleWidth = 100;
let rectangleHeight = 50;
let rectangleColor = "red";
let textColor = "black";

/**
 * Function to handle file upload and load the image onto the canvas.
 * @param {Event} event - The change event triggered by file upload.
 */
document.getElementById("uploadInput").addEventListener("change", (event) => {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
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

/**
 * Function to enable drawing mode for rectangles.
 */
const drawRectangle = () => {
  isDrawingRectangle = true;
};

/**
 * Function to add text at the selected position on the canvas.
 */
const addText = () => {
  let text = document.getElementById("textInput").value;
  ctx.font = "20px Arial";
  ctx.fillStyle = textColor;
  ctx.fillText(text, textX, textY);
};

/**
 * Event listener for mouse click on the canvas.
 * Handles drawing of rectangles or capturing text position based on current mode.
 * @param {MouseEvent} event - The mouse event object.
 */
canvas.addEventListener("mousedown", (event) => {
  if (isDrawingRectangle) {
    startX = event.offsetX;
    startY = event.offsetY;

    ctx.strokeStyle = rectangleColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, rectangleWidth, rectangleHeight);
    isDrawingRectangle = false;
  } else {
    textX = event.offsetX;
    textY = event.offsetY;
  }
});

/**
 * Function to update the color of the rectangle based on user selection.
 * @param {string} color - The color value selected by the user.
 */
const changeRectangleColor = (color) => {
  rectangleColor = color;
};

/**
 * Function to update the color of the text based on user selection.
 * @param {string} color - The color value selected by the user.
 */
const changeTextColor = (color) => {
  textColor = color;
};

/**
 * Function to save information about the drawn shapes as an object.
 * @returns {Object} An object containing information about the drawn shapes.
 */
const saveInfo = () => {
  let rectangleInfo = {
    type: "rectangle",
    color: rectangleColor,
    position: { x: startX, y: startY },
    width: rectangleWidth,
    height: rectangleHeight,
  };

  let textInfo = {
    type: "text",
    color: textColor,
    position: { x: textX, y: textY },
  };

  return { shapes: [rectangleInfo, textInfo] };
};

let shapesInfo = saveInfo();

console.log(shapesInfo.shapes);
