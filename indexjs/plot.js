
let pltIndexX = 5; 
let pltIndexY = 1;
let pltIndexX2 = 5; 
let pltIndexY2 = 2;
const maxPlotPoints = 1000;
const xData = [];
const yData = [];
let dataIndex = 0; 


const layout = {
    showlegend: false, 
    font: { family: "Segoe UI", size: 14, color: "#000000" }, // Default font color for everything else
    margin: { b: 100, l: 100, r: 100, t: 100 },
    width: "100%",
    height: "100%",
    paper_bgcolor: "#FFFFFF",
    plot_bgcolor: "#FFFFFF",
    autosize: true,

    // Primary X-axis (bottom)
    xaxis: {
        title: { text: "X1", font: { color: "#000000" } },
        type: "linear",
        mirror: "false",
        zeroline: false,
        ticks: "inside",
        ticklen: 5,
        tickcolor: "#000000",
        tickfont: { color: "#000000" },  // Ensures tick labels are black
        linecolor: "#000000",
        showgrid: false
    },

    // Secondary X-axis (top) (Red font)
    xaxis2: {
        title: { text: "X2", font: { color: "#FF0000" } }, // Title font in red
        tickfont: { color: "#FF0000" },  // Tick labels in red
        type: "linear",
        mirror: "false",
        overlaying: "x",
        side: "top", // Positions it at the top
        zeroline: false,
        ticks: "inside",
        ticklen: 5,
        tickcolor: "#FF0000",
        linecolor: "#FF0000",
        anchor: "free",
        position: 1.0,
        showgrid: false
    },

    // Primary Y-axis (left)
    yaxis: {
        title: { text: "Y1", font: { color: "#000000" } },
        tickfont: { color: "#000000" }, // Tick labels in black
        type: "linear",
        mirror: "false",
        zeroline: false,
        ticks: "inside",
        ticklen: 5,
        tickcolor: "#000000",
        linecolor: "#000000",
        showgrid: false
    },

    // Secondary Y-axis (right) (Red font)
    yaxis2: {
        title: { text: "Y2", font: { color: "#FF0000" } }, // Title font in red
        tickfont: { color: "#FF0000" },  // Tick labels in red
        type: "linear",
        mirror: "false",
        overlaying: "y",
        side: "right",
        zeroline: false,
        ticks: "inside",
        ticklen: 5,
        tickcolor: "#FF0000",
        linecolor: "#FF0000",
        anchor: "free",
        position: 1.0,
        showgrid: false
    }
};


function updatePlotTitles(){

        const x1Title = document.getElementById('plotx1_dropdown').value;
        const y1Title = document.getElementById('ploty1_dropdown').value;
        const x2Title = document.getElementById('plotx2_dropdown').value;
        const y2Title = document.getElementById('ploty2_dropdown').value;

        const newLayout = {
            "xaxis.title.text": x1Title,
            "yaxis.title.text": y1Title,
            "xaxis2.title.text": x2Title,
            "yaxis2.title.text": y2Title
        };

        Plotly.relayout('plotlyGraph', newLayout);
}

function plotDropDownChanged(event) {
    const selectedIndex = event.target.selectedIndex;
    console.log(`Dropdown ${event.target.id} selected value: ${event.target.value}, index: ${selectedIndex}`);

    const extracted = event.target.id.replace("plot", "").replace("_dropdown", "");
    console.log("Replacing " + extracted + " to " +  selectedIndex);

    let updatePlot = false; 
    if(extracted == "x1"){
        pltIndexX = selectedIndex;
        updatePlot = true; 
    } else if(extracted == "y1"){
        pltIndexY = selectedIndex;
        updatePlot = true; 
    } else if(extracted == "x2"){
        pltIndexX2 = selectedIndex;  // Added for second line
        updatePlot = true;
    } else if(extracted == "y2"){
        pltIndexY2 = selectedIndex;  // Added for second line
        updatePlot = true;
    }

    if(updatePlot){
        let xData1 = Array.from(getColumnUpToRow(float64Array, pltIndexX, dataIndex-1, f64cols));
        let yData1 = Array.from(getColumnUpToRow(float64Array, pltIndexY, dataIndex-1, f64cols));
        let xData2 = Array.from(getColumnUpToRow(float64Array, pltIndexX2, dataIndex-1, f64cols));
        let yData2 = Array.from(getColumnUpToRow(float64Array, pltIndexY2, dataIndex-1, f64cols));

        xData1 = movingAverageDownsample(xData1, maxPlotPoints / 2);
        yData1 = movingAverageDownsample(yData1, maxPlotPoints / 2);
        xData2 = movingAverageDownsample(xData2, maxPlotPoints / 2);
        yData2 = movingAverageDownsample(yData2, maxPlotPoints / 2);

        replacePlotData(xData1, yData1, xData2, yData2);
        updatePlotTitles();


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
    if (plotx2_dropdown.options.length > pltIndexX2) plotx2_dropdown.selectedIndex = pltIndexX2;
    if (ploty2_dropdown.options.length > pltIndexY2) ploty2_dropdown.selectedIndex = pltIndexY2;


}


function createPlot() {
    set_dropdown_options();

    const data = [
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'Line 1',
            line: { color: "#000000", width: 2 },
            marker: { color: "#000000", size: 6 },
            xaxis: 'x',
            yaxis: 'y'
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'Line 2',
            line: { color: "#FF0000", width: 2 },
            marker: { color: "#FF0000", size: 6 },
            xaxis: 'x2',
            yaxis: 'y2'
        }
    ];

    Plotly.newPlot('plotlyGraph', data, layout);
    updatePlotTitles();
    
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

function replacePlotData(x1, y1, x2, y2) {
    if (!x1 || !y1 || x1.length === 0 || y1.length === 0 ||
        !x2 || !y2 || x2.length === 0 || y2.length === 0) {
        console.error("Invalid data: x1, y1, x2, and y2 must be non-empty arrays.");
        return;
    }

    const graphDiv = document.getElementById('plotlyGraph');

    if (!graphDiv) {
        console.error("Plotly graph container not found.");
        return;
    }

    // Update plot with two lines (one using primary axes, the other using secondary axes)
    Plotly.react('plotlyGraph', [
        {
            x: x1,
            y: y1,
            type: 'scatter',
            mode: 'lines',
            name: 'Line 1',
            line: { color: "#000000", width: 2 }, // Black line
            marker: { color: "#000000", size: 6 },
            xaxis: 'x',  // Use primary X-axis (bottom)
            yaxis: 'y'   // Use primary Y-axis (left)
        },
        {
            x: x2,
            y: y2,
            type: 'scatter',
            mode: 'lines',
            name: 'Line 2',
            line: { color: "#FF0000", width: 2 }, // Red line
            marker: { color: "#FF0000", size: 6 },
            xaxis: 'x2',  // Use secondary X-axis (top)
            yaxis: 'y2'   // Use secondary Y-axis (right)
        }
    ], layout);
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

    const step = arr.length / n; // Use float step to distribute points more evenly
    const result = [];

    for (let i = 0; i < n; i++) {
        const start = Math.round(i * step);
        const end = Math.round((i + 1) * step);
        
        if (start >= arr.length) break; // Safety check

        // Compute the average over this range
        const slice = arr.slice(start, end);
        const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;

        result.push(avg);
    }

    return result;
}



function plotTimer() {
    if (!portConnected) return;
    
    let moreX1 = [];
    let moreY1 = [];
    let moreX2 = [];
    let moreY2 = [];

    while (dataIndex < f64rows) {
        let valueX1 = float64Array[dataIndex * f64cols + pltIndexX];
        let valueY1 = float64Array[dataIndex * f64cols + pltIndexY];
        let valueX2 = float64Array[dataIndex * f64cols + pltIndexX2];
        let valueY2 = float64Array[dataIndex * f64cols + pltIndexY2];

        if (isNaN(valueX1) || isNaN(valueY1) || isNaN(valueX2) || isNaN(valueY2)) {
            break;
        }

        moreX1.push(valueX1);
        moreY1.push(valueY1);
        moreX2.push(valueX2);
        moreY2.push(valueY2);

        dataIndex = dataIndex + 1;
    }

    const graphDiv = document.getElementById('plotlyGraph');

    if (graphDiv.data[0].x.length > maxPlotPoints) {
        let xData1 = Array.from(getColumnUpToRow(float64Array, pltIndexX, dataIndex - 1, f64cols));
        let yData1 = Array.from(getColumnUpToRow(float64Array, pltIndexY, dataIndex - 1, f64cols));
        let xData2 = Array.from(getColumnUpToRow(float64Array, pltIndexX2, dataIndex - 1, f64cols));
        let yData2 = Array.from(getColumnUpToRow(float64Array, pltIndexY2, dataIndex - 1, f64cols));

        xData1 = movingAverageDownsample(xData1, maxPlotPoints / 2);
        yData1 = movingAverageDownsample(yData1, maxPlotPoints / 2);
        xData2 = movingAverageDownsample(xData2, maxPlotPoints / 2);
        yData2 = movingAverageDownsample(yData2, maxPlotPoints / 2);

        replacePlotData(xData1, yData1, xData2, yData2);
    }

    // Extend traces for both lines dynamically
    Plotly.extendTraces(graphDiv, {
        x: [moreX1, moreX2], 
        y: [moreY1, moreY2]
    }, [0, 1]);
}


const intervalId = setInterval(plotTimer, 300);
