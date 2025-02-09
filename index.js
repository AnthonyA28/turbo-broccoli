const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portName = 'COM10'; // Replace with your port name

const port = new SerialPort({
  path: portName,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data) => {
  console.log(`Received data: ${data}`);
});

port.on('open', () => {
  console.log('Serial port opened');
});

port.on('error', (err) => {
  console.error('Error: ', err.message);
});





let pltIndexX = 3; 
let pltIndexY = 4;
let pltMaxItems = 1000;

parseData = []



// Function to render the table dynamically
function renderTable(data) {
    const table = document.getElementById("dynamicTable");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    // Clear existing content
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Create table headers (if data has rows)
    if (data.length > 0) {
        const headerRow = document.createElement("tr");
        // Use the first row to determine the number of columns
        for (let i = 0; i < data[0].length; i++) {
            const th = document.createElement("th");
            th.textContent = `Column ${i + 1}`; // Generic column names (e.g., Column 1, Column 2)
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
    }

    // Create table rows
    data.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell; // Add cell data
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}


function createPlot() {
    const data = [{
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Serial Data'
    }];

    const layout = {
        title: 'Real-Time Serial Data',
        xaxis: { title: 'X Value' },
        yaxis: { title: 'Y Value' }
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
function extractXY(parseData) {
    const x = parseData.map((item) => item[pltIndexX]); // Index 2 for item 3
    const y = parseData.map((item) => item[pltIndexY]); // Index 3 for item 4

    return { x, y };
}


window.electronAPI.onSerialData((data) => {
    const outputText = document.getElementById('outputText');

    // Ensure the text area exists before modifying it
    if (!outputText) {
        console.error("Element with ID 'outputText' not found.");
        return;
    }

    // Append raw data to the text area
    outputText.value += `${data}\n`;
    outputText.scrollTop = outputText.scrollHeight;

    // Parse the incoming data string
    try {
        // Remove brackets and split by ";"
        const parsedData = data.replace(/[\[\]]/g, '').split(';').map(num => parseFloat(num.trim()));

        parseData.push(parsedData);
        if (parseData.length > pltMaxItems) {
            parseData = reduceData(parseData);
            const { x, y } = extractXY(parseData);
            replacePlotData(x,y);
        }


        if (parsedData.length > pltIndexX) {
            const xValue = parsedData[pltIndexX];  // 3rd index
            const yValue = parsedData[pltIndexY];  // 4th index

            console.log(`Parsed X: ${xValue}, Y: ${yValue}`);

            // Update the Plotly graph
            updatePlot(xValue, yValue);

            renderTable(parseData)

        } else {
            console.warn("Invalid data format received:", data);
        }
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
