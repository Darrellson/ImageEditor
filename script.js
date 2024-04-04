const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color");
const uploadInput = document.getElementById("upload");
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let isDrawing = false;
let textColor = "#000000";
let currentText = null;
let selectionRect = null;

/**
 * Start the selection action by adding event listeners to the canvas.
 */
const startSelection = () => {
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
};

/**
 * Handle mouse down event to initiate selection.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleMouseDown = (event) => {
  startX = event.offsetX;
  startY = event.offsetY;
  isDrawing = true;
};

/**
 * Handle mouse move event to update selection rectangle.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleMouseMove = (event) => {
  if (!isDrawing) return;
  endX = event.offsetX;
  endY = event.offsetY;
  drawSelectionRect();
};

/**
 * Handle mouse up event to end selection action.
 */
const handleMouseUp = () => {
  isDrawing = false;
  selectionRect = {
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
  };
};

/**
 * Draw the selection rectangle on the canvas.
 */
const drawSelectionRect = () => {
  const width = endX - startX;
  const height = endY - startY;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (document.getElementById("uploaded-image").complete) {
    ctx.drawImage(
      document.getElementById("uploaded-image"),
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
  ctx.fillStyle = "#000000"; // Set black color for the background
  ctx.fillRect(startX, startY, width, height); // Fill the selection area with black
  ctx.strokeStyle = "#FF0000";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, width, height);
};

startSelection();

/**
 * Handle click event to add text on the canvas.
 */
canvas.addEventListener("click", () => {
  const text = prompt("Enter text:");
  if (!text) return;
  ctx.fillStyle = textColor;
  ctx.font = "30px Arial";
  ctx.fillText(
    text,
    selectionRect.x + selectionRect.width / 2,
    selectionRect.y + selectionRect.height / 2
  );
  currentText = { text, x: selectionRect.x, y: selectionRect.y };
});

/**
 * Listen for color input change event to update text color.
 */
colorInput.addEventListener("change", () => {
  textColor = colorInput.value;
  if (currentText) {
    ctx.fillStyle = textColor;
    ctx.fillText(currentText.text, currentText.x, currentText.y);
  }
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
    };
    img.src = e.target.result;
    document.getElementById("uploaded-image").src = e.target.result;
    document.getElementById("uploaded-image").hidden;
  };
  reader.readAsDataURL(file);
});

/**
 * Save the canvas image data and other information.
 */
const saveImage = () => {
  const imageData = canvas.toDataURL();
  const rectInfo = {
    rectangle: {
      color: "#000000",
      width: selectionRect.width,
      height: selectionRect.height,
      x: selectionRect.x,
      y: selectionRect.y,
    },
    text: {
      color: textColor,
      width: currentText ? ctx.measureText(currentText.text).width : null,
      height: 30,
      x: currentText ? currentText.x : null,
      y: currentText ? currentText.y : null,
    },
  };
  console.log(JSON.stringify(rectInfo));
};

const canvasInfo = {
  canvasWidth: canvas.width,
  canvasHeight: canvas.height,
  contextProperties: {
    fillStyle: ctx.fillStyle,
    strokeStyle: ctx.strokeStyle,
    lineWidth: ctx.lineWidth,
  },
};

console.log(canvasInfo);
