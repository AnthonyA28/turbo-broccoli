
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


// Function to handle dropdown selection
function plotDropDownChanged(event) {
    const selectedIndex = event.target.selectedIndex;
    console.log(`Dropdown ${event.target.id} selected value: ${event.target.value}, index: ${selectedIndex}`);

    const extracted = event.target.id.replace("plot", "").replace("_dropdown", "");
    console.log("Replacing " + extracted + " to " +  selectedIndex);

    let updatePlot = false; 
    if(extracted == "x1"){
        pltIndexX = selectedIndex;
        updatePlot = true; 
    }else if(extracted == "y1"){
        pltIndexY = selectedIndex;
        updatePlot= true; 
    }

    if(updatePlot){
        let xData = Array.from(getColumnUpToRow(float64Array, pltIndexX, dataIndex-1, f64cols));
        let yData = Array.from(getColumnUpToRow(float64Array, pltIndexY, dataIndex-1, f64cols));
        xData = movingAverageDownsample(xData, maxPlotPoints/2);
        yData = movingAverageDownsample(yData, maxPlotPoints/2);
        replacePlotData(xData, yData)
    }
}

// Get all dropdowns by class
document.querySelectorAll('.plot_dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', plotDropDownChanged);
});

function set_dropdown_options(){
    let dropdown_names = storeObj["column_names"]; // Assuming this is an array of strings
    console.log(dropdown_names)

    const plotx1_dropdown = document.getElementById('plotx1_dropdown');
    const ploty1_dropdown = document.getElementById('ploty1_dropdown');
    const plotx2_dropdown = document.getElementById('plotx2_dropdown');
    const ploty2_dropdown = document.getElementById('ploty2_dropdown');

    dropdown_names.forEach(name => {
        let option1 = document.createElement('option');
        option1.value = name;
        option1.text = name;
        plotx1_dropdown.appendChild(option1);

        let option2 = document.createElement('option');
        option2.value = name;
        option2.text = name;
        ploty1_dropdown.appendChild(option2);

        let option3 = document.createElement('option');
        option3.value = name;
        option3.text = name;
        plotx2_dropdown.appendChild(option3);

        let option4 = document.createElement('option');
        option4.value = name;
        option4.text = name;
        ploty2_dropdown.appendChild(option4);
    });

    

    if (plotx1_dropdown.options.length > pltIndexX) plotx1_dropdown.selectedIndex = pltIndexX;
    if (ploty1_dropdown.options.length > pltIndexY) ploty1_dropdown.selectedIndex = pltIndexY;
    // if (plotx2_dropdown.options.length > defaultIndex) plotx2_dropdown.selectedIndex = defaultIndex;
    // if (ploty2_dropdown.options.length > defaultIndex) ploty2_dropdown.selectedIndex = defaultIndex;

}


function createPlot() {
    set_dropdown_options();
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
    if(!portConnected) return;
    
    let  moreX = []
    let  moreY = []
    while( dataIndex <  f64rows){
        let valueX = float64Array[dataIndex * f64cols + pltIndexX];
        let valueY = float64Array[dataIndex * f64cols + pltIndexY];
        if(isNaN(valueX) || isNaN(valueY)) {
            // dataIndex = dataIndex - 1; 
            break;
        }
        moreX.push(valueX);
        moreY.push(valueY);
        dataIndex = dataIndex + 1; 
    }
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

const intervalId = setInterval(plotTimer, 300);
