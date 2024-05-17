const canvas = new fabric.Canvas("canvas");
canvas.selection = true; // Enable object selection
let isDrawing = false;
let origX, origY;
let activeObject;
let selectedColor = "#000000"; // default color
const drawTools = document.querySelectorAll(".draw-tool");
const colorPicker = document.getElementById("colorPicker");

/**
 * Event listener for drawing tools click.
 */
drawTools.forEach((tool) => {
  tool.addEventListener("click", (e) => {
    const shape = e.target.getAttribute("data-shape");
    if (!isDrawing && !activeObject) {
      activateDrawing(shape);
    }
  });
});

/**
 * Event listener for color picker change.
 */
colorPicker.addEventListener("change", (e) => {
  selectedColor = e.target.value;
  updateShapesColor();
});

/**
 * Activates drawing mode based on the selected shape.
 * @param {string} shape - The shape to be drawn.
 */
const activateDrawing = (shape) => {
  canvas.off("mouse:down");
  canvas.off("mouse:move");
  canvas.off("mouse:up");

  canvas.on("mouse:down", (o) => {
    isDrawing = true;
    const pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;

    if (shape === "rect") {
      drawRectangle(origX, origY);
    }
  });

  canvas.on("mouse:move", (o) => {
    if (!isDrawing) return;
    const pointer = canvas.getPointer(o.e);

    if (shape === "rect") {
      adjustRectangleSize(pointer);
    }

    canvas.renderAll();
  });

  canvas.on("mouse:up", () => {
    isDrawing = false;
    activeObject = null;
  });
};

/**
 * Draws a rectangle at the given coordinates.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 */
const drawRectangle = (x, y) => {
  const rect = new fabric.Rect({
    left: x,
    top: y,
    width: 1,
    height: 1,
    fill: selectedColor,
    stroke: selectedColor,
    strokeWidth: 2,
    selectable: true,
  });
  canvas.add(rect);
  activeObject = rect;
};

/**
 * Adjusts the size of the rectangle during drawing.
 * @param {object} pointer - The pointer object.
 */
const adjustRectangleSize = (pointer) => {
  const width = Math.abs(origX - pointer.x);
  const height = Math.abs(origY - pointer.y);
  activeObject.set({ width, height });
};

/**
 * Updates the color of all shapes on the canvas.
 */
const updateShapesColor = () => {
  canvas.getObjects().forEach((obj) => {
    if (obj.type === "rect") {
      obj.set({ fill: selectedColor, stroke: selectedColor });
    }
  });
  canvas.renderAll();
};

/**
 * Event listener for image loader input element change.
 */
document.getElementById("imageLoader").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (f) => {
    const data = f.target.result;
    fabric.Image.fromURL(data, (img) => {
      img.set({
        left: 0,
        top: 0,
        selectable: false, // Make the image unselectable
      });
      img.scaleToWidth(canvas.width); // Scale the image to canvas width
      img.scaleToHeight(canvas.height); // Scale the image to canvas height
      canvas.add(img).sendToBack(); // Add image to the canvas and send it to back
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
});
