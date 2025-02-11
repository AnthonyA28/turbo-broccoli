let dataTable; // ✅ Global DataTable instance
let dataIndexTable = 0;
const MAX_ROWS = 200; //
let isUserScrolling = false;




let tableData = {
    type: 'table',
    header: {
        values: ["<b>Item</b>", "<b>Price</b>", "<b>Quantity</b>","<b>Item</b>", "<b>Price</b>", "<b>Quantity</b>","<b>Item</b>", "<b>Price</b>"],
        align: "center",
        line: { width: 1, color: "black" },
        fill: { color: "lightgrey" },
        font: { family: "Arial", size: 14, color: "black" }
    },
    cells: {
        values: [[],[],[],[],[],[],[],[],[],[]
        ],
        align: "center",
        line: { color: "black", width: 1 },
        fill: { color: ["white", "lightblue"] },
        font: { family: "Arial", size: 12, color: "black" }
    }
};

// ✅ Initial Plot
Plotly.newPlot("plotlyTable", [tableData]);


function tableTimer() {
    if (!dataTable) {
        console.error("❌ DataTable is not initialized yet.");
        return; // ✅ Prevent running if DataTables isn't ready
    }

    let exit = false;
    let rowsToAdd = [];

    while (dataIndexTable < f64rows && !exit) {
        let row = [];
        for (let i = 0; i < f64cols; i++) {
            let val = float64Array[dataIndexTable * f64cols + i];
            if (isNaN(val)) {
                exit = true;
                break;
            }
            row.push(val.toFixed(2)); // ✅ Format numbers properly
        }

        if (row.length > 0) {
            rowsToAdd.push(row); // ✅ Ensure correct structure: `[["value1", "value2"]]`
        }

        dataIndexTable++;
    }

    console.log("Rows to add:", rowsToAdd.length); // 🔍 Debugging - Check if data exists


    for(var q = 0; q< rowsToAdd.length; q++){
        for(var i = 0; i < rowsToAdd[q].length; i ++){
            tableData.cells.values[i].push(rowsToAdd[q][i]);        
        }
        Plotly.react("plotlyTable", [tableData]);
    }



}

// ✅ Ensure DataTables is initialized before updates start
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Initializing DataTables...");

    dataTable = $('#myTable').DataTable({
        paging: false,
        searching: false,
        ordering: false,
        info: false,
        scrollY: "600px",
        scrollCollapse: true,
        deferRender: true // ✅ Improves performance
    });

    console.log("✅ DataTable initialized.");

    // ✅ Start updating the table after initialization
    setInterval(tableTimer, 500);
});
