
let pltIndexX = 3; 
let pltIndexY = 4;
let pltMaxItems = 500;

// let xData = new Array(10).fill(NaN);
// let yData = new Array(10).fill(NaN);
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
        type: 'scatter',
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
        type: 'scatter',
        mode: 'lines+markers'
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



function plotTimer() {

    // while( dataIndex <  f64rows){
    //     let valueX = float64Array[dataIndex * f64cols + pltIndexX];
    //     let valueY = float64Array[dataIndex * f64cols + pltIndexY];
    //     if(isNaN(valueX) || isNaN(valueY)) {
    //         break;
    //     }
    //     xData[dataIndex] = valueX;
    //     yData[dataIndex] = valueY;
    //     dataIndex = dataIndex + 1; 
    // }
    let xData = getColumnUpToRow(float64Array, pltIndexX, f64rows, f64cols);
    let yData = getColumnUpToRow(float64Array, pltIndexY, f64rows, f64cols);


    replacePlotData(xData, yData);

    console.log("Function executed at", new Date().toLocaleTimeString());
}

// Run `plotTimer` every 5 seconds
const intervalId = setInterval(plotTimer, 1000);
