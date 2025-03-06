const list = document.getElementById("stringList");


const commandAutoComplete = [
"submit_commandList", "start_commandList", "stop", "set_pos", "set_speed", "move_to"
];

const input = document.getElementById("commandInput");
const autocompleteList = document.getElementById("autocompleteCommands");

input.addEventListener("input", function () {
    let query = this.value.toLowerCase();
    autocompleteList.innerHTML = ""; // Clear previous suggestions

    if (!query) return; // Stop if input is empty

    commandAutoComplete
      .filter(cmd => cmd.startsWith(query)) // Match only commands that start with input
      .forEach(match => {
        const itemDiv = document.createElement("div");
        itemDiv.textContent = match;
        itemDiv.addEventListener("click", function () {
          input.value = match; // Fill input with selected command
          autocompleteList.innerHTML = ""; // Clear suggestions
        });
        autocompleteList.appendChild(itemDiv);
      });
});



document.getElementById("commandInput").addEventListener("keydown", function(event) {
    const input = document.getElementById("commandInput");
    const autocompleteList = document.getElementById("autocompleteCommands");

    // Enter key triggers button click
    if (event.key === "Enter") {  
        event.preventDefault();  // Prevent form submission
        document.getElementById("submitCommandBtn").click(); // Trigger button click
    }

});



function listUpdated(){
    const listItems = document.querySelectorAll("#stringList li"); 
    const stringList = Array.from(listItems).map(item => item.textContent.trim());
    const cleanedStrings = stringList.map(str => str.replace("❌", "").trim());
    window.electronAPI.setCommandList(cleanedStrings);
}

function addCommand() {
    let inputValue = document.getElementById("commandInput").value;
    if (!inputValue.trim()) return; // Don't add empty items

    const newItem = document.createElement("li");
    newItem.style.display = "flex";  // Use flexbox for alignment
    newItem.style.justifyContent = "space-between"; // Pushes items apart
    newItem.style.alignItems = "center"; // Aligns items in the center
    newItem.style.padding = "5px"; // Add padding for better spacing
    newItem.style.borderBottom = "1px solid #ddd"; // Optional styling

    // Create a span to hold the command text
    const textSpan = document.createElement("span");
    textSpan.textContent = inputValue;

    // Create a delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.border = "none";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.color = "red";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.fontSize = "8px";

    // Add click event to remove the item
    deleteBtn.addEventListener("click", function () {
        newItem.remove();
    });

    // Make the list item draggable
    newItem.draggable = true;
    newItem.addEventListener("dragstart", function (event) {
        draggedItem = event.target;
        event.target.style.opacity = "0.5";
    });

    newItem.addEventListener("dragend", function (event) {
        event.target.style.opacity = "1";
        draggedItem = null;
    });

    // Append text and delete button to the list item
    newItem.appendChild(textSpan);
    newItem.appendChild(deleteBtn);

    // Append the list item to the list
    list.appendChild(newItem);
    document.getElementById("commandInput").value = ""; // Clear input field

    listUpdated();
}

document.getElementById("addCommandBtn").addEventListener("click", addCommand);



function transformCommand(commandString) {
    const parts = commandString.split(' '); // Split by space
    if (parts.length !== 2) {
        console.error("Invalid command format");
        return null;
    }

    const command = parts[0]; // First part is the command
    let number = parseFloat(parts[1]); // Convert the second part to a number

    if (isNaN(number)) {
        console.error("Invalid number in command");
        return null;
    }

    number *= storeObj["steps_per_micron"]; 

    return `${command} ${number}`; // Return new formatted string
}


function submitCommand(){

    if(list.childElementCount == 0){

        let command = document.getElementById("commandInput").value;
        command = transformCommand(command)
        if (!command.trim() || command == null) return;

        window.electronAPI.sendNextCommand(command);
        return;
    }

    console.log("Submitting command")
    let nextItem = list.firstElementChild; // Gets the last <li> item

    if (nextItem) {
        console.log("Last item:", nextItem.textContent); // Logs the text content of the last item
        list.removeChild(nextItem);
        const command = nextItem.textContent.replace("❌", "").trim();
        window.electronAPI.sendNextCommand(command);
    } else {
        console.log("The list is empty.");
    }

}

document.getElementById("submitCommandBtn").addEventListener("click", submitCommand);


let draggedItem = null;

list.addEventListener("dragstart", function(event) {
    draggedItem = event.target;
    event.target.style.opacity = "0.5";
});

list.addEventListener("dragover", function(event) {
    event.preventDefault();
    const afterElement = getDragAfterElement(list, event.clientY);
    if (afterElement == null) {
        list.appendChild(draggedItem);
    } else {
        list.insertBefore(draggedItem, afterElement);
    }
});

list.addEventListener("dragend", function(event) {
    event.target.style.opacity = "1";
    draggedItem = null;
    listUpdated();
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}





function setupControls(){
    pressed_direction = ""
    isPressed = false; 
    function pressed() {
        if(isPressed){
            console.log("moving to " + pressed_direction); // Replace this with your desired action
            var distance = parseFloat(document.getElementById('slide-input').value)*storeObj["steps_per_micron"];
            if(distance < 1) {
                distance = 1;
            }
            if(pressed_direction == "left"){
                distance = distance * -1; 
            }
            var command = "slide " + distance.toFixed(0) + ";";
            console.log(command); 
            window.electronAPI.sendToSerial(command);
        }
    }
    setInterval(pressed, 1000);

    document.getElementById('move-left').addEventListener('mousedown', function(){
        isPressed = true; 
        pressed_direction = "left";
        console.log("move-left");
        var speed = parseFloat(document.getElementById('slide-input').value*storeObj["steps_per_micron"]);
        var command = "set_speed " + speed.toFixed(0) + ";";
        window.electronAPI.sendToSerial(command);
    });
    document.getElementById('move-right').addEventListener('mousedown', function(){
        isPressed = true; 
        pressed_direction = "right";
        console.log("move-right");
        var speed = parseFloat(document.getElementById('slide-input').value*storeObj["steps_per_micron"]);
        var command = "set_speed " + speed.toFixed(0) + ";";
        window.electronAPI.sendToSerial(command);
    });
    document.addEventListener("mouseup", function() {
        if (isPressed) {
            window.electronAPI.sendToSerial('stop;');
            console.log("Button Released!");
            isPressed = false;
        }
    });
    document.getElementById('stop').addEventListener('click', function(){
        var command = "stop;";
        window.electronAPI.sendToSerial(command);
    });

}
setupControls();