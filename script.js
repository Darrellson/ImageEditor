const canvas = new fabric.Canvas("canvas");
canvas.selection = true;
let isDrawing = false;
let origX, origY;
let activeObject;
let selectedColor = "#000000";
const drawTools = document.querySelectorAll(".draw-tool");
const colorPicker = document.getElementById("colorPicker");
const saveButton = document.getElementById("saveButton");

/**
 * Enable drawing tools and setup event listeners.
 */
const enableDrawingTools = () => {
  drawTools.forEach((tool) => {
    tool.addEventListener("click", (e) => {
      const shape = e.target.getAttribute("data-shape");
      if (shape === "rect" || shape === "text") {
        activateDrawing(shape);
      }
    });
  });

  colorPicker.addEventListener("change", (e) => {
    selectedColor = e.target.value;
    updateSelectedShapeColor();
  });
};

/**
 * Event listener for loading an image onto the canvas.
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
        selectable: false,
        hoverCursor: "default",
      });
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;
      if (canvasAspect > imgAspect) {
        img.scaleToWidth(canvas.width);
      } else {
        img.scaleToHeight(canvas.height);
      }
      canvas.add(img).sendToBack();
      canvas.renderAll();

      enableDrawingTools();
    });
  };
  reader.readAsDataURL(file);
});

/**
 * Event listener for saving canvas content.
 */
saveButton.addEventListener("click", () => {
  const objects = canvas.getObjects();
  let imageInfo = {};
  const rectangles = [];
  const texts = [];

  objects.forEach((obj, index) => {
    if (obj.type === "image") {
      const imageDataUrl = canvas.toDataURL({ format: "png" });
      imageInfo = {
        width: obj.width * obj.scaleX,
        height: obj.height * obj.scaleY,
        left: obj.left,
        top: obj.top,
        dataUrl: imageDataUrl,
      };
    } else if (obj.type === "rect") {
      rectangles.push({
        id: `rect${index}`,
        zIndex: index,
        width: obj.width * obj.scaleX,
        height: obj.height * obj.scaleY,
        left: obj.left,
        top: obj.top,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        angle: obj.angle,
        isSpind: obj.angle !== 0,
      });
    } else if (obj.type === "textbox") {
      texts.push({
        id: `text${index}`,
        zIndex: index,
        text: obj.text,
        left: obj.left,
        top: obj.top,
        fill: obj.fill,
        fontSize: obj.fontSize,
        width: obj.width,
      });
    }
  });

  const result = {
    image: imageInfo,
    rectangles: rectangles,
    texts: texts,
  };

  console.log(result);
});

/**
 * Activate drawing mode for a specific shape.
 * @param {string} shape - The shape to activate drawing mode for.
 */
const activateDrawing = (shape) => {
  canvas.isDrawingMode = false;
  canvas.off("mouse:down");
  canvas.off("mouse:move");
  canvas.off("mouse:up");
  isDrawing = true;

  canvas.defaultCursor = "crosshair";

  canvas.on("mouse:down", (o) => {
    if (!isDrawing) return;

    const pointer = canvas.getPointer(o.e);
    origX = Math.max(0, Math.min(pointer.x, canvas.width));
    origY = Math.max(0, Math.min(pointer.y, canvas.height));

    if (shape === "rect") {
      drawRectangle(origX, origY);
    } else if (shape === "text") {
      addText(origX, origY);
    }
  });

  canvas.on("mouse:move", (o) => {
    if (!isDrawing || !activeObject) return;
    const pointer = canvas.getPointer(o.e);

    if (shape === "rect") {
      adjustRectangleSize(pointer);
    }

    canvas.renderAll();
  });

  canvas.on("mouse:up", () => {
    isDrawing = false;
    activeObject = null;
    canvas.defaultCursor = "default";
  });
};

/**
 * Draw a rectangle on the canvas.
 * @param {number} x - The x-coordinate of the starting point.
 * @param {number} y - The y-coordinate of the starting point.
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
    angle: 0,
  });
  canvas.add(rect);
  activeObject = rect;
};

/**
 * Adjust the size of the active rectangle while drawing.
 * @param {fabric.Point} pointer - The current mouse pointer position.
 */
const adjustRectangleSize = (pointer) => {
  let width = Math.abs(origX - pointer.x);
  let height = Math.abs(origY - pointer.y);

  if (pointer.x < origX) {
    activeObject.set({ left: Math.max(0, origX - width) });
  } else {
    activeObject.set({ left: origX });
    width = Math.min(width, canvas.width - origX);
  }

  if (pointer.y < origY) {
    activeObject.set({ top: Math.max(0, origY - height) });
  } else {
    activeObject.set({ top: origY });
    height = Math.min(height, canvas.height - origY);
  }

  activeObject.set({ width, height });
};

/**
 * Add a text box to the canvas.
 * @param {number} x - The x-coordinate of the starting point.
 * @param {number} y - The y-coordinate of the starting point.
 */
const addText = (x, y) => {
  const text = new fabric.Textbox("Type here", {
    left: x,
    top: y,
    fill: selectedColor,
    fontSize: 20,
    width: 150,
  });
  canvas.add(text).setActiveObject;
};

/**
 * Update the color of the selected shape with the currently selected color.
 */
const updateSelectedShapeColor = () => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    if (activeObject.type === "rect" || activeObject.type === "textbox") {
      activeObject.set({ fill: selectedColor, stroke: selectedColor });
      canvas.renderAll();
    }
  }
};
