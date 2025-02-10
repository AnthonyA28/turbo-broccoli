
let isUserScrolling = false;

function renderTable(data) {
    if (!addData){
        return;
    }
    const table = document.getElementById("dynamicTable");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    // Clear existing content
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Create table headers (if data has rows)
    if (data.length > 0) {
        const headerRow = document.createElement("tr");
        // Use the first row to determine the number of columns
        for (let i = 0; i < data[0].length; i++) {
            const th = document.createElement("th");
            th.textContent = `Column ${i + 1}`; // Generic column names (e.g., Column 1, Column 2)
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
    }

    // Create table rows
    data.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell; // Add cell data
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // Scroll to the bottom if the user is not interacting with the table
    scrollToBottomIfNotInteracting(table);
}

function scrollToBottomIfNotInteracting(table) {
    const tableContainer = table.parentElement;

    if (!isUserScrolling && !tableContainer.matches(':hover')) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
    }
}

// Add event listeners to track user scrolling
const tableContainer = document.querySelector('.table-container');
tableContainer.addEventListener('scroll', () => {
    isUserScrolling = true;
    clearTimeout(tableContainer.scrollTimeout);
    tableContainer.scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
    }, 100); // Reset after 1 second of inactivity
});

tableContainer.addEventListener('wheel', () => {
    isUserScrolling = true;
    clearTimeout(tableContainer.scrollTimeout);
    tableContainer.scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
    }, 100); // Reset after 1 second of inactivity
});
