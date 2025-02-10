let dataTable; // ✅ Global DataTable instance
let dataIndexTable = 0;
const MAX_ROWS = 200; //
let isUserScrolling = false;

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

    if (rowsToAdd.length > 0) {
        dataTable.rows.add(rowsToAdd).draw(false);

        // ✅ Remove excess rows to keep only 500
        if (dataTable.rows().count() > MAX_ROWS) {
            let excessRows = dataTable.rows().count() - MAX_ROWS;
            dataTable.rows().indexes().slice(0, excessRows).each(function (index) {
                dataTable.row(index).remove();
            });
            dataTable.draw(false);
        }

    } else {
        console.warn("⚠️ No new data added to table.");
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
