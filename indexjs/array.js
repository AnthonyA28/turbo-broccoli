
function getValue(array, row, col, cols) {
    return array[row * cols + col];
}

function setValue(array, row, col, cols, value) {
    array[row * cols + col] = value;
}


function extractXY(parseData) {
    const x = parseData.map((item) => item[pltIndexX]); // Index 2 for item 3
    const y = parseData.map((item) => item[pltIndexY]); // Index 3 for item 4

    return { x, y };
}

function getColumnUpToRow(array, colIndex, maxRow, numCols) {
    let result = [];
    
    for (let row = 0; row < maxRow; row++) {
        let value = array[row * numCols + colIndex];
        if (isNaN(value)) break; // Stop when NaN is encountered
        result.push(value);
    }
    
    return new Float64Array(result); // Convert back to Float64Array
}