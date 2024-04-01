const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color");
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let isDrawing = false;
let textColor = "#000000"; // Initial text color

/**
 * Start the crop action by adding event listeners to the canvas.
 */
const startCrop = () => {
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
};

/**
 * Handle mouse down event to initiate drawing.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleMouseDown = (event) => {
  startX = event.offsetX;
  startY = event.offsetY;
  isDrawing = true;
};

/**
 * Handle mouse move event to update drawing position.
 * @param {MouseEvent} event - The mouse event object.
 */
const handleMouseMove = (event) => {
  if (!isDrawing) return;
  endX = event.offsetX;
  endY = event.offsetY;
  drawCropBox();
};

/**
 * Handle mouse up event to end drawing action.
 */
const handleMouseUp = () => {
  isDrawing = false;
};

/**
 * Draw a crop box on the canvas.
 */
const drawCropBox = () => {
  const width = endX - startX;
  const height = endY - startY;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(document.getElementById("uploaded-image"), 0, 0);
  ctx.strokeStyle = "#FF0000";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, width, height);
};

/**
 * Handle click event to add text on the canvas.
 */
canvas.addEventListener("click", () => {
  const text = prompt("Enter text:");
  if (!text) return;
  ctx.fillStyle = textColor; // Use current text color
  ctx.font = "30px Arial";
  ctx.fillText(text, startX, startY);
});

/**
 * Listen for color input change event to update text color.
 */
colorInput.addEventListener("change", () => {
  textColor = colorInput.value; // Update text color when color input changes
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
