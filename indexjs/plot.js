
let pltIndexX = 3; 
let pltIndexY = 4;
const maxPlotPoints = 10000;
const xData = [];
const yData = [];
let dataIndex = 0; 


const layout = {
        // title: 'Real-Time Serial Data',
        showlegend: false, // Hides legend
        font: { family: "Segoe UI", size: 14, color: "#000000" }, // Global font settings
        margin: { b: 100, l: 100, r: 30, t: 30 }, // Margins for better spacing
        width: "100%", // Fit to parent element width
        height: "100%", // Fit to parent element height
        paper_bgcolor: "#FFFFFF", // White background
        plot_bgcolor: "#FFFFFF", // White plot area
        autosize: true, // Enable automatic resizing
        xaxis: {
            title: { text: "X", font: { color: "#000000" }, standoff: 0 },
            type: "linear",
            mirror: "ticks",
            zeroline: false, // Removes zero line
            ticks: "inside",
            ticklen: 5,
            tickcolor: "#000000",
            linecolor: "#000000",
            showgrid: false, // No grid lines
            minor: { showgrid: false, ticks: "inside", ticklen: 2, tickcolor: "#000000" }
        },
        yaxis: {
            title: { text: "Y", font: { color: "#000000" }, standoff: 0 },
            range: [null, null], // Auto-scale
            type: "linear",
            mirror: "ticks",
            zeroline: false,
            ticks: "inside",
            ticklen: 5,
            tickcolor: "#000000",
            linecolor: "#000000",
            showgrid: false,
            minor: { showgrid: false, ticks: "inside", ticklen: 2, tickcolor: "#000000" }
        },
    };

function createPlot() {
    const data = [{
        x: [],
        y: [],
        type: 'scattergl',
        mode: 'lines+markers',
        name: 'Serial Data',
        line: { color: "#000000", width: 2 }, // Black lines for better visibility
        marker: { color: "#000000", size: 6 } // Black markers with a moderate size
    }];

    

    Plotly.newPlot('plotlyGraph', data, layout);
}

// Run this function once at the beginning
createPlot()

function updatePlot(x, y) {
    const graphDiv = document.getElementById('plotlyGraph');

    // Ensure the Plotly graph exists
    if (!graphDiv || !graphDiv.data || graphDiv.data.length === 0) {
        console.error("Plotly graph not initialized.");
        return;
    }

    // Extend the trace with new (x, y) values
    Plotly.extendTraces('plotlyGraph', { x: [[x]], y: [[y]] }, [0]);

}

function replacePlotData(x, y) {

    if (!x || !y || x.length === 0 || y.length === 0) {
        console.error("Invalid data: x and y must be non-empty arrays.");
        return;
    }


    const graphDiv = document.getElementById('plotlyGraph');

    // Ensure the Plotly graph exists
    if (!graphDiv) {
        console.error("Plotly graph container not found.");
        return;
    }



    // Replace all data in the graph
    Plotly.react('plotlyGraph', [{
        x: x,
        y: y,
        type: 'scattergl',
        mode: 'lines+markers',
        line: { color: "#000000", width: 2 }, // Black lines for better visibility
        marker: { color: "#000000", size: 6 } // Black markers with a moderate size
    }], layout); // Use existing layout
    }


    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const outputText = document.getElementById('outputText');

    sendButton.addEventListener('click', () => {
      const message = messageInput.value;
      window.electronAPI.sendToSerial(message);
    });

        // Add event listener for the Enter key on the message input
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default form submission behavior
            sendButton.click(); // Simulate a click on the Send button
        }
    });


function reduceData(parseData) {
    return parseData.filter((item, index) => index % 2 === 0); 
}

window.addEventListener('resize', () => {
    Plotly.relayout('plotlyGraph', {
        width: document.getElementById('plotlyGraph').clientWidth,
        height: document.getElementById('plotlyGraph').clientHeight
    });
});



function movingAverageDownsample(arr, n) {
    if (arr.length <= n) return Array.from(arr); // No need to downsample

    const step = Math.floor(arr.length / n); // Compute step size
    const result = [];

    for (let i = 0; i < n; i++) {
        const start = i * step;
        const end = Math.min(start + step, arr.length);

        // Compute the average over this range
        const avg = arr.slice(start, end).reduce((sum, val) => sum + val, 0) / (end - start);
        result.push(avg);
    }

    return result;
}

function plotTimer() {

    let  moreX = []
    let  moreY = []
    while( dataIndex <  f64rows){
        let valueX = float64Array[dataIndex * f64cols + pltIndexX];
        let valueY = float64Array[dataIndex * f64cols + pltIndexY];
        if(isNaN(valueX) || isNaN(valueY)) {
            // dataIndex = dataIndex - 1; 
            break;
        }
        // xData[dataIndex] = valueX;
        // yData[dataIndex] = valueY;
        moreX.push(valueX);
        moreY.push(valueY);
        dataIndex = dataIndex + 1; 
    }
    // let xData = getColumnUpToRow(float64Array, pltIndexX, f64rows, f64cols);
    // let yData = getColumnUpToRow(float64Array, pltIndexY, f64rows, f64cols);


    // replacePlotData(xData, yData);
    const graphDiv = document.getElementById('plotlyGraph');

    if(graphDiv.data[0].x.length > maxPlotPoints){
        let xData = Array.from(getColumnUpToRow(float64Array, pltIndexX, dataIndex-1, f64cols));
        let yData = Array.from(getColumnUpToRow(float64Array, pltIndexY, dataIndex-1, f64cols));
        xData = movingAverageDownsample(xData, maxPlotPoints/2);
        yData = movingAverageDownsample(yData, maxPlotPoints/2);


        replacePlotData(xData, yData)
    }


    Plotly.extendTraces(graphDiv, {
        x: [moreX], 
        y: [moreY]
    }, [0]);

}

// Run `plotTimer` every 5 seconds
const intervalId = setInterval(plotTimer, 300);
