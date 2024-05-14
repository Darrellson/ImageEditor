const canvas = new fabric.Canvas("canvas");
canvas.selection = true; // Enable object selection
let isDrawing = false;
let origX, origY;
let activeObject;
let selectedColor = "#000000"; // default color

const drawTools = document.querySelectorAll(".draw-tool");
const colorPicker = document.getElementById("colorPicker");

// Event listeners for drawing tools
drawTools.forEach(tool => {
    tool.addEventListener("click", (e) => {
        const shape = e.target.getAttribute("data-shape");
        activateDrawing(shape);
    });
});

// Event listener for color picker change
colorPicker.addEventListener("change", (e) => {
    selectedColor = e.target.value;
    updateShapesColor();
});

// Function to activate drawing mode based on selected shape
function activateDrawing(shape) {
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    
    canvas.on("mouse:down", (o) => {
        isDrawing = true;
        const pointer = canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;

        switch (shape) {
            case "rect":
                drawRectangle(origX, origY);
                break;
            case "circle":
                drawCircle(origX, origY);
                break;
            case "arrow":
                drawArrow(origX, origY);
                break;
            case "text":
                addText(origX, origY);
                break;
        }
    });

    canvas.on("mouse:move", (o) => {
        if (!isDrawing) return;
        const pointer = canvas.getPointer(o.e);

        switch (shape) {
            case "rect":
                adjustRectangleSize(pointer);
                break;
            case "circle":
                adjustCircleSize(pointer);
                break;
            case "arrow":
                adjustArrow(pointer);
                break;
        }

        canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
        isDrawing = false;
    });
}

// Functions for drawing shapes
function drawRectangle(x, y) {
    const rect = new fabric.Rect({
        left: x,
        top: y,
        width: 1,
        height: 1,
        fill: selectedColor,
        stroke: selectedColor,
        strokeWidth: 2,
        selectable: true // Make the shape selectable
    });
    canvas.add(rect);
    activeObject = rect;
}

function drawCircle(x, y) {
    const circle = new fabric.Circle({
        left: x,
        top: y,
        radius: 1,
        fill: selectedColor, // Fill the circle with selected color
        stroke: selectedColor,
        strokeWidth: 2,
        selectable: true // Make the shape selectable
    });
    canvas.add(circle);
    activeObject = circle;
}

function drawArrow(x, y) {
    const points = [x, y, x, y];
    const arrow = new fabric.Line(points, {
        strokeWidth: 2,
        fill: selectedColor,
        stroke: selectedColor,
        type: "arrow",
        selectable: true // Make the shape selectable
    });
    canvas.add(arrow);
    activeObject = arrow;
}

// Functions for adjusting shape size during drawing
function adjustRectangleSize(pointer) {
    const width = Math.abs(origX - pointer.x);
    const height = Math.abs(origY - pointer.y);
    activeObject.set({ width, height });
}

function adjustCircleSize(pointer) {
    const radius = Math.abs(origX - pointer.x) / 2;
    activeObject.set({ radius });
}

function adjustArrow(pointer) {
    activeObject.set({ x2: pointer.x, y2: pointer.y });
}

// Function to add text
function addText(x, y) {
    const textVal = prompt("Please enter text value..", "");
    if (textVal && textVal.trim() !== "") {
        const text = new fabric.Text(textVal, { left: x, top: y, selectable: true }); // Make the text selectable
        canvas.add(text);
    }
}

// Function to update the color of all shapes on the canvas
function updateShapesColor() {
    canvas.getObjects().forEach(obj => {
        if (obj.type === "rect" || obj.type === "circle" || obj.type === "line") {
            obj.set({ fill: selectedColor, stroke: selectedColor });
        }
    });
    canvas.renderAll();
}

// Event listener for image loader input element change
document.getElementById("imageLoader").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (f) => {
        const data = f.target.result;
        fabric.Image.fromURL(data, (img) => {
            const oImg = img.set({
                left: 0,
                top: 0,
                angle: 0,
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height,
                selectable: true // Make the image selectable
            }).scale(0.5);
            canvas.add(oImg).renderAll();
            canvas.setActiveObject(oImg);
        });
    };
    reader.readAsDataURL(file);
});
