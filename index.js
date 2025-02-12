const f64rows = 10000000;
const numIndices = 10;
const f64cols = numIndices;
const float64Array = new Float64Array(f64rows * f64cols).fill(NaN);
let f64IRow = 0;


window.fetchData = async function () {
    console.log("Renderer: Fetching data...");
    
    const data = {
        numIndices: numIndices
    };

    console.log("Renderer: Sending data to main", data);
    return data; // This gets returned to `main.js`
};


window.electronAPI.onSerialData((data) => {
    // data.length == f64cols confirmed prior to this function. 
    for(let i = 0; i < data.length; i ++ ) {
        setValue(float64Array, f64IRow, i, f64cols, data[i]); 
    }
    f64IRow += 1; 
    if(f64IRow>=f64rows){
        //TODO
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


