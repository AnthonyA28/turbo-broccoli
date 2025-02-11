let dataTable; // ✅ Global DataTable instance
let dataIndexTable = 0;
const MAX_ROWS = 1000000; //
let isUserScrolling = false;



// ✅ Define Columns Dynamically
const columnDefs = Array.from({ length: f64cols }, (_, i) => ({
    headerName: `Column ${i + 1}`,
    field: `col${i}`,
    sortable: false,
    filter: false,
    resizable: true, 
    // menuTabs: []
}));


const gridOptions = {

    columnDefs: columnDefs,
    rowData: [],
    getRowId: params => params.data.id, // ✅ Make sure every row has an `id`
    
    suppressMenuHide: false,
    // 🚀 UI Optimizations
    suppressFilter: true,           // ✅ Disables filtering
    // suppressSorting: true,          // ✅ Disables sorting
    suppressMovableColumns: false,   // ✅ Prevents column dragging
    suppressColumnVirtualisation: false, // ✅ Only virtualize if needed (for performance)
    suppressPaginationPanel: true,  // ✅ Hides pagination
    suppressRowClickSelection: true,// ✅ Disables row selection
    suppressCellFocus: true,        // ✅ Prevents cell focus highlighting
    animateRows: false,             // ✅ Disables row animations (for performance)
    suppressAnimationFrame: true,   // ✅ Forces immediate updates
    suppressColumnMoveAnimation: true, // ✅ Disables column movement animation
    suppressRowHoverHighlight: true, // ✅ Removes hover effects



    onGridReady: function (params) {
        gridOptions.api = params.api;
        gridOptions.columnApi = params.columnApi;
        console.log("✅ AG Grid is ready.");
    }
};


// ✅ Initialize the Grid
document.addEventListener("DOMContentLoaded", function () {
    agGrid.createGrid(document.getElementById("myGrid"), gridOptions);
    setInterval(tableTimer, 500); 
});

function tableTimer() {
    if (!gridOptions.api) return; // ✅ Ensure grid is ready

    let exit = false;
    let rowsToAdd = [];

    while (dataIndexTable < f64rows && !exit) {
        let rowData = { id: dataIndexTable }; // ✅ Assign a unique ID
        for (let i = 0; i < f64cols; i++) {
            let val = float64Array[dataIndexTable * f64cols + i];
            if (isNaN(val)) {
                exit = true;
                break;
            }
            rowData[`col${i}`] = val.toFixed(2); // ✅ Format numbers properly
        }

        if (Object.keys(rowData).length > 1) { // ✅ Ensure row has valid data
            rowsToAdd.push(rowData);
        }

        dataIndexTable++;
    }

    console.log("Rows to add:", rowsToAdd.length); // 🔍 Debugging - Check if data exists

   if (rowsToAdd.length > 0) {
        rowsToAdd.forEach((row, index) => {
            row.id = `row-${Date.now()}-${index}`; // ✅ Assigns a unique timestamp-based ID
        });

        gridOptions.api.applyTransaction({ add: rowsToAdd, addIndex: 0 });

        // ✅ Keep only `MAX_ROWS` rows by removing the oldest row (from the bottom)
        const rowCount = gridOptions.api.getDisplayedRowCount();
        if (rowCount > MAX_ROWS) {
            let lastRowNode = gridOptions.api.getDisplayedRowAtIndex(rowCount - 1);
            if (lastRowNode) {
                gridOptions.api.applyTransaction({ remove: [lastRowNode.data] }); // ✅ Uses ID-based removal
            }
        }


    }

}



