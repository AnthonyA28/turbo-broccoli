function addCommand() {
    let inputValue = document.getElementById("commandInput").value;
    console.log(inputValue);


    let newItemText = inputValue;
    if (!newItemText.trim()) return; // Don't add empty items

    
    const newItem = document.createElement("li");
    newItem.textContent = newItemText;
    newItem.draggable = true;

    newItem.addEventListener("dragstart", function(event) {
        draggedItem = event.target;
        event.target.style.opacity = "0.5";
    });

    newItem.addEventListener("dragend", function(event) {
        event.target.style.opacity = "1";
        draggedItem = null;
    });

    document.getElementById("stringList").appendChild(newItem);
    document.getElementById("newItemText").value = ""; // Clear input field

    
}

document.getElementById("addCommandBtn").addEventListener("click", addCommand);


const list = document.getElementById("stringList");

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