let dataTable; 
let dataIndexTable = 0;
const MAX_ROWS = 1000; //
let isUserScrolling = false;
let names = [];





const gridOptions = {

    columnDefs: [],
    rowData: [],
    getRowId: params => params.data.id,
    suppressMenuHide: false,
    suppressFilter: true,           
    suppressMovableColumns: false,   
    suppressColumnVirtualisation: false, 
    suppressPaginationPanel: true,  
    suppressRowClickSelection: true,
    suppressCellFocus: true,        
    animateRows: false,             
    suppressAnimationFrame: true,   
    suppressColumnMoveAnimation: true, 
    suppressRowHoverHighlight: true, 


    onGridReady: function (params) {
        gridOptions.api = params.api;
        gridOptions.columnApi = params.columnApi;
    }
};


function toggleColumnByIndex(index, isVisible) {
    const allColumns = gridOptions.columnApi.getAllColumns();
    
    if (index < 0 || index >= allColumns.length) {
        console.error("Invalid column index:", index);
        return;
    }

    const columnField = allColumns[index].colId; // Get the column field from index
    gridOptions.columnApi.setColumnVisible(columnField, isVisible);
}

function loadTable() {
    names = storeObj["column_names"];

    const columnDefs = names.map((name, i) => ({
        headerName: name,   
        field: `col${i}`,
        sortable: false,
        filter: false,
        resizable: true,
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
    }));

    gridOptions.columnDefs = columnDefs; 
    if (gridOptions.api) {
        gridOptions.api.setColumnDefs(columnDefs);
    }

    console.log("Updated Columns:", columnDefs);


    agGrid.createGrid(document.getElementById("myGrid"), gridOptions);
    setInterval(tableTimer, 500);
}


function tableTimer() {
    if(!portConnected) return;
    if (!gridOptions.api) return; 

    let exit = false;
    let rowsToAdd = [];

    while (dataIndexTable < f64rows && !exit) {
        let rowData = { id: dataIndexTable }; 
        for (let i = 0; i < f64cols; i++) {
            let val = float64Array[dataIndexTable * f64cols + i];
            if (isNaN(val)) {
                exit = true;
                break;
            }
            rowData[`col${i}`] = val.toFixed(2); 
        }

        if (Object.keys(rowData).length > 1) { 
            rowsToAdd.push(rowData);
        }

        dataIndexTable++;
    }

    if (rowsToAdd.length > 0) {
        rowsToAdd.forEach((row, index) => {
            row.id = `row-${Date.now()}-${index}`; 
        });

        gridOptions.api.applyTransaction({ add: rowsToAdd, addIndex: 0 });

        
        const rowCount = gridOptions.api.getDisplayedRowCount();
        if (rowCount > MAX_ROWS) {
            let excessRows = Math.floor(MAX_ROWS / 2); 
            let rowsToRemove = [];

            for (let i = 0; i < excessRows; i++) {
                let lastRowNode = gridOptions.api.getDisplayedRowAtIndex(rowCount - 1 - i);
                if (lastRowNode) {
                    rowsToRemove.push(lastRowNode.data);
                }
            }

            if (rowsToRemove.length > 0) {
                gridOptions.api.applyTransaction({ remove: rowsToRemove }); 
            }
        }
    }
}



