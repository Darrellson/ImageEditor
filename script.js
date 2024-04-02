const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color");
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let isDrawing = false;
let textColor = "#000000"; // Initial text color
let currentText = null; // To store the current text object
let selectionRect = null; // To store the selection rectangle

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
  ctx.drawImage(document.getElementById("uploaded-image"), 0, 0);
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
  textColor = colorInput.value; // Update text color when color input changes
  if (currentText) {
    // If there's a current text object, update its color
    ctx.fillStyle = textColor;
    // Update text color
    ctx.fillText(currentText.text, currentText.x, currentText.y);
  }
});

/**
 * Listen for file input change event to upload image.
 */
document.getElementById("upload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = e.target.result;
    document.getElementById("uploaded-image").src = e.target.result;
    document.getElementById("uploaded-image").hidden;
  };
  reader.readAsDataURL(file);
});

/**
 * Save the canvas image data.
 */
const saveImage = () => {
  const imageData = canvas.toDataURL();
  const properties = {
    width: canvas.width,
    height: canvas.height,
    format: "png",
  };
  console.log(JSON.stringify(properties));
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
