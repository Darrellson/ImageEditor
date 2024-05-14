const canvas = new fabric.Canvas("canvas");
canvas.selection = false;
let rect;
let ellipse;
let line;
let isDown;
let origX;
let origY;
let freeDrawing = true;
const freeDrawBtn = document.getElementById("freeDraw");
let textVal;
let activeObj;
let isRectActive = false;
let isCircleActive = false;
let isArrowActive = false;
let isTextActive = false;
let selectedColor = "#000000"; // default color
const rectangle = document.getElementById("rect");
const circle = document.getElementById("circle");
const arrowSel = document.getElementById("arrow");
const textSel = document.getElementById("text");
const colorPicker = document.getElementById("colorPicker");

/**
 * Event listener for rectangle selection button.
 */
rectangle.addEventListener("click", () => {
  isRectActive = true;
  isCircleActive = false;
  isArrowActive = false;
});

/**
 * Event listener for circle selection button.
 */
circle.addEventListener("click", () => {
  isRectActive = false;
  isCircleActive = true;
  isArrowActive = false;
});

/**
 * Event listener for arrow selection button.
 */
arrowSel.addEventListener("click", () => {
  isRectActive = false;
  isCircleActive = false;
  isArrowActive = true;
});

/**
 * Event listener for text selection button.
 */
textSel.addEventListener("click", () => {
  isTextActive = true;
});

/**
 * Event listener for color picker change.
 * @param {Event} e - The change event.
 */
colorPicker.addEventListener("change", (e) => {
  selectedColor = e.target.value;
});

/**
 * Event listener for image loader input element change.
 * @param {Event} e - The change event.
 */
document.getElementById("imageLoader").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (f) => {
    const data = f.target.result;
    fabric.Image.fromURL(data, (img) => {
      const oImg = img
        .set({
          left: 0,
          top: 0,
          angle: 0,
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        })
        .scale(0.5);
      canvas.add(oImg).renderAll();
      canvas.setActiveObject(oImg);
    });
  };
  reader.readAsDataURL(file);
});

/**
 * Event listener for mouse down on the canvas.
 * @param {Object} o - The mouse event object.
 */
canvas.on("mouse:down", (o) => {
  if (freeDrawing && !isTextActive) {
    isDown = true;
    const pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    if (isRectActive) {
      rect = new fabric.Rect({
        left: origX,
        top: origY,
        width: 1,
        height: 1,
        fill: selectedColor, // Specify the fill color here
        stroke: selectedColor,
        strokeWidth: 2,
      });
      canvas.add(rect);
      activeObj = rect;
    } else if (isCircleActive) {
      ellipse = new fabric.Circle({
        left: origX,
        top: origY,
        radius: 1,
        fill: "", // Keep this empty if you want unfilled circle
        stroke: selectedColor,
        strokeWidth: 2,
      });
      canvas.add(ellipse);
      activeObj = ellipse;
    } else if (isArrowActive) {
      const points = [pointer.x, pointer.y, pointer.x, pointer.y];
      line = new fabric.Line(points, {
        strokeWidth: 2,
        fill: selectedColor, // Specify the fill color here
        stroke: selectedColor,
        type: "arrow",
      });
      canvas.add(line);
      activeObj = line;
    }
  }
});


/**
 * Event listener for mouse move on the canvas.
 * @param {Object} o - The mouse event object.
 */
canvas.on("mouse:move", (o) => {
  if (isDown && freeDrawing && !isTextActive) {
    const pointer = canvas.getPointer(o.e);
    if (isRectActive) {
      rect.set({ width: Math.abs(origX - pointer.x) });
      rect.set({ height: Math.abs(origY - pointer.y) });
    } else if (isCircleActive) {
      const radius = Math.abs(origX - pointer.x) / 2;
      ellipse.set({ radius: radius });
    } else if (isArrowActive) {
      line.set({ x2: pointer.x, y2: pointer.y });
    }
    canvas.renderAll();
  }
});

/**
 * Event listener for mouse up on the canvas.
 * @param {Object} o - The mouse event object.
 */
canvas.on("mouse:up", (o) => {
  if (freeDrawing && !isTextActive) {
    isDown = false;
    if (isRectActive || isCircleActive || isArrowActive) {
      textVal = prompt("Please enter text value..", "");
      if (textVal && textVal.trim() !== "") {
        const text = new fabric.Text(textVal, { left: origX, top: origY });
        canvas.add(text);
      }
    }
  }
});

/**
 * Event listener for free draw button.
 */
freeDrawBtn.addEventListener("click", () => {
  // Toggle free drawing mode
  freeDrawing = !freeDrawing;
  if (freeDrawing) {
    // Enable free drawing
    canvas.isDrawingMode = true;
    // Disable other shape drawing modes
    isRectActive = false;
    isCircleActive = false;
    isArrowActive = false;
  } else {
    // Disable free drawing
    canvas.isDrawingMode = false;
  }
});
