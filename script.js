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

  objects.forEach((obj) => {
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
        width: obj.width * obj.scaleX,
        height: obj.height * obj.scaleY,
        left: obj.left,
        top: obj.top,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
      });
    } else if (obj.type === "textbox") {
      texts.push({
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
    origX = pointer.x;
    origY = pointer.y;

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
  });
  canvas.add(rect);
  activeObject = rect;
};

const adjustRectangleSize = (pointer) => {
  const width = Math.abs(origX - pointer.x);
  const height = Math.abs(origY - pointer.y);
  if (pointer.x < origX) {
    activeObject.set({ left: pointer.x });
  }
  if (pointer.y < origY) {
    activeObject.set({ top: pointer.y });
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
