document.addEventListener("DOMContentLoaded", () => {
    const resizers = document.querySelectorAll(".resizer");
    let isDragging = false;
    let startX, startWidth, prevColumn, nextColumn;

    function onMouseMove(event) {
        if (!isDragging) return;

        const deltaX = event.clientX - startX;
        const newWidth1 = startWidth + deltaX;
        const newWidth2 = nextColumn.offsetWidth - deltaX;

        if (newWidth1 > 150 && newWidth2 > 150) {
            prevColumn.style.flex = `0 0 ${newWidth1}px`;
            nextColumn.style.flex = `0 0 ${newWidth2}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    resizers.forEach(resizer => {
        resizer.addEventListener("mousedown", (event) => {
            isDragging = true;
            startX = event.clientX;
            prevColumn = resizer.previousElementSibling;
            nextColumn = resizer.nextElementSibling;
            startWidth = prevColumn.offsetWidth;

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    });
});
