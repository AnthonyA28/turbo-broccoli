const list = document.getElementById("stringList");


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
}

document.getElementById("addCommandBtn").addEventListener("click", addCommand);



function submitCommand(){
    console.log("Submitting command")
    let nextItem = list.firstElementChild; // Gets the last <li> item

    if (nextItem) {
        console.log("Last item:", nextItem.textContent); // Logs the text content of the last item
        list.removeChild(nextItem);
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