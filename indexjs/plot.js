
let pltIndexX = 3; 
let pltIndexY = 4;
let pltMaxItems = 500;



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

    const layout = {
        title: 'Real-Time Serial Data',
        showlegend: false, // Hides legend
        font: { family: "Segoe UI", size: 14, color: "#000000" }, // Global font settings
        // margin: { b: 80, l: 80, r: 230, t: 30 }, // Margins for better spacing
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

    // Ensure x and y are arrays and have the same length
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
        console.error("Invalid input: x and y must be arrays of the same length.");
        return;
    }

    // Replace all data in the graph
    Plotly.react('plotlyGraph', [{
        x: x, // New x values
        y: y, // New y values
        type: 'scatter', // Type of plot
        mode: 'lines+markers' // Display lines and markers
    }], {
        title: 'Updated Plot', // Optional: Update the title
        xaxis: { title: 'X Axis' }, // Optional: Update x-axis title
        yaxis: { title: 'Y Axis' } // Optional: Update y-axis title
    });
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
