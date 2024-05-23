const canvas = new fabric.Canvas("canvas");
canvas.selection = true;
let isDrawing = false;
let origX, origY;
let activeObject;
let selectedColor = "#000000";
const drawTools = document.querySelectorAll(".draw-tool");
const colorPicker = document.getElementById("colorPicker");
const saveButton = document.getElementById("saveButton");

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

saveButton.addEventListener("click", () => {
  const objects = canvas.getObjects();
  let imageInfo = {};
  const rectangles = [];
  const texts = [];
  const overlaps = [];

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
        text: obj.text,
        left: obj.left,
        top: obj.top,
        fill: obj.fill,
        fontSize: obj.fontSize,
        width: obj.width,
      });
    }
  });

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (isOverlapping(objects[i], objects[j])) {
        overlaps.push({
          obj1: objects[i].type === "rect" ? `rect${i}` : `text${i}`,
          obj2: objects[j].type === "rect" ? `rect${j}` : `text${j}`,
        });
      }
    }
  }

  const result = {
    image: imageInfo,
    rectangles: rectangles,
    texts: texts,
    overlaps: overlaps,
  };

  console.log(result);
});

const isOverlapping = (obj1, obj2) => {
  const obj1Bounds = obj1.getBoundingRect();
  const obj2Bounds = obj2.getBoundingRect();

  return !(
    obj1Bounds.left > obj2Bounds.left + obj2Bounds.width ||
    obj1Bounds.left + obj1Bounds.width < obj2Bounds.left ||
    obj1Bounds.top > obj2Bounds.top + obj2Bounds.height ||
    obj1Bounds.top + obj1Bounds.height < obj2Bounds.top
  );
};

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

const addText = (x, y) => {
  const text = new fabric.Textbox("Type here", {
    left: x,
    top: y,
    fill: selectedColor,
    fontSize: 20,
    width: 150,
  });
  canvas.add(text).setActiveObject(text);
  canvas.renderAll();
};

const updateSelectedShapeColor = () => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    if (activeObject.type === "rect" || activeObject.type === "textbox") {
      activeObject.set({ fill: selectedColor, stroke: selectedColor });
      canvas.renderAll();
    }
  }
};
