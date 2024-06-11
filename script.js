const execCmd = (command, value = null) => {
  document.execCommand("styleWithCSS", true);
  document.execCommand(command, false, value);
};

const insertTable = () => {
  const rows = prompt("Enter the number of rows:");
  const cols = prompt("Enter the number of columns:");

  if (rows > 0 && cols > 0) {
    let table = '<table class="table table-bordered">';
    for (let i = 0; i < rows; i++) {
      table += "<tr>";
      for (let j = 0; j < cols; j++) {
        table += "<td>&nbsp;</td>";
      }
      table += "</tr>";
    }
    table += "</table>";
    execCmd("insertHTML", table);
  } else {
    alert("Please enter a valid number of rows and columns.");
  }
};

const toggleHTMLView = () => {
  const editor = document.getElementById("editor");
  const htmlView = document.getElementById("html-view");

  if (htmlView.style.display === "none") {
    htmlView.value = editor.innerHTML;
    htmlView.style.display = "block";
    editor.style.display = "none";
  } else {
    editor.innerHTML = htmlView.value;
    htmlView.style.display = "none";
    editor.style.display = "block";
  }
};
