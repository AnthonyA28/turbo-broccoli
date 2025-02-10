var f64rows = 1000;
let numIndices = 10;
var f64cols = numIndices;
var float64Array = new Float64Array(f64rows * f64cols).fill(NaN);

let f64IRow = 0;



document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM fully loaded.");

    function toggleContainer(containerId) {
        if (containerId === "toggle-all") {
            // ✅ Toggle all containers
            document.querySelectorAll(".container").forEach(container => {
                container.classList.toggle("hidden");
            });
        } else {
            // ✅ Toggle a specific container
            const container = document.getElementById(containerId);
            if (container) {
                container.classList.toggle("hidden");
            } else {
                console.warn(`Container with id "${containerId}" not found.`);
            }
        }
    }

    // ✅ Listen for "toggle-container" events from the main process
    window.electronAPI.receive('toggle-container', (containerId) => {
        console.log(`Toggling ${containerId}`);
        toggleContainer(containerId);
    });
});






parseData = []

// Define the number of rows and columns


// Create a Float64Array (1GB of memory if rows * cols = 10M elements)


// Helper function for 2D access


let addData = false
window.electronAPI.onSerialData((data) => {
    const outputText = document.getElementById('outputText');

    // Ensure the text area exists before modifying it
    if (!outputText) {
        console.error("Element with ID 'outputText' not found.");
        return;
    }

    // Append raw data to the text area
    if(addData){
        outputText.value += `${data}\n`;
        outputText.scrollTop = outputText.scrollHeight;
    }

    // Parse the incoming data string
    try {
        // Remove brackets and split by ";"
        const parsedData = data.replace(/[\[\]]/g, '').split(';').map(num => parseFloat(num.trim()));
        console.log(parsedData.length)
        if (parsedData.length != numIndices) {
            return;
        }

        for(let i = 0; i < numIndices; i ++ ) {
            setValue(float64Array, f64IRow, i, f64cols, parsedData[i]); // Set value at row 2, column 3
        }
        f64IRow += 1; 
        if(f64IRow>=float64Array.length){
            f64IRow = 0;
        }
        
        parseData.push(parsedData);
        // if (parseData.length > pltMaxItems) {
            // parseData = reduceData(parseData);
            // const { x, y } = extractXY(parseData);
            // replacePlotData(x,y);
        // }


        // if (parsedData.length > pltIndexX) {
            // const xValue = parsedData[pltIndexX];  // 3rd index
            // const yValue = parsedData[pltIndexY];  // 4th index

            // console.log(`Parsed X: ${xValue}, Y: ${yValue}`);

            // Update the Plotly graph
            // updatePlot(xValue, yValue);

            // renderTable(parseData)

        // } else {
        //     console.warn("Invalid data format received:", data);
        // }
    } catch (error) {
        console.error("Error parsing serial data:", error);
    }
});




    async function populatePorts() {
        const portSelect = document.getElementById('portSelect');
        portSelect.innerHTML = '<option value="">Select a port...</option>'; // Clear existing options

        try {
            const ports = await window.electronAPI.listPorts();
            ports.forEach(port => {
                const option = document.createElement('option');
                option.value = port.path;
                option.text = port.path + " (" + port.manufacturer + ") "// + port.serialNumber + "  )";
                portSelect.add(option);
            });
        } catch (error) {
            console.error('Error populating ports:', error);
        }
    }

    // Add event listener for the refresh button
    document.getElementById('refreshPorts').addEventListener('click', populatePorts);

    // Initial population of ports
    populatePorts();




    async function connectDisconnect() {


        if( document.getElementById("connectButton").innerHTML == "Disconnect"){
            //Disconnecting
            const disconnectSucessful = await electronAPI.disconnectSerialPort();
            if(disconnectSucessful){
                const section = document.getElementById('hiddenSection');
                section.classList.remove('locked');
                document.getElementById("connectButton").innerHTML = "Connect";
            }
            return;
        }


        const portName = document.getElementById('portSelect').value;
        console.log("portName: " + portName)
        if (portName == ""){
            alert("Please select a valid port from the dropdown.");
        }


        const baudRate = parseInt(document.getElementById('baudRate').value);
        const dataBits = parseInt(document.getElementById('dataBits').value);
        const stopBits = parseInt(document.getElementById('stopBits').value);
        const startBits = parseInt(document.getElementById('startBits').value);
        const parity = document.getElementById('parity').value;
        const flowControl = document.getElementById('flowControl').value === 'true';
        const delimiter = document.getElementById('delimiter').value;


        console.log('Delimiter:', JSON.stringify(delimiter));

        const connectionSucessful = await electronAPI.connectSerialPort({
            path: portName,
            baudRate,
            dataBits,
            startBits,
            stopBits,
            parity,
            flowControl,
            delimiter: delimiter
        });

        console.log(status);

        if (connectionSucessful) {
            const section = document.getElementById('hiddenSection');
            section.classList.add('locked');
            document.getElementById("connectButton").innerHTML = "Disconnect"
        }

        
    }



    async function chooseFolder(){
        const logDataCheckbox = document.getElementById('logDataCheckbox');
        const isLoggingEnabled = logDataCheckbox.checked;
        if(!isLoggingEnabled){
            window.electronAPI.chooseLogFolder("");
            return;
        }
        const fileName = document.getElementById('fileName').value ;
        await window.electronAPI.chooseLogFolder(fileName);
    }


    async function initFileName(){
        console.log("initiFileName");

        function getCurrentDateTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            return `${year}-${month}-${day}--${hours}-${minutes}-${seconds}`;
        }

        // Set the value of the textbox to the current date and time
        document.getElementById('fileName').value =  getCurrentDateTime() + ".csv";

    }

    initFileName();




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