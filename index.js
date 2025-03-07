const f64rows = 10000000;
const numIndices = 11;
const f64cols = numIndices;
const float64Array = new Float64Array(f64rows * f64cols).fill(NaN);
let f64IRow = 0;
let storeObj = {};

// Index   Final Value Assigned
// 0   target_pos
// 1   speed
// 2   steps
// 3   HAL_GetTick()
// 4   Force 1 -- HX711_Read()
// 5   Force 2 -- HX711_Read2()
// 6   parse_command_list
// 7   run_command_list
// 8   command_done
// 9   command_list_current_index 
// 10  command_list_index


function portConnected(){
    return document.getElementById("connectButton").innerHTML == "Disconnect"
}


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
    const flowControl = document.getElementById('flowControl').value;
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
        
        storeObj.baudRate = baudRate;
        storeObj.dataBits = dataBits;
        storeObj.stopBits = stopBits;
        storeObj.startBits = startBits;
        storeObj.parity = parity;
        storeObj.flowControl = flowControl;
        storeObj.delimiter = delimiter;

        window.electronAPI.setStore(storeObj);


        document.getElementById('container_port').querySelectorAll('input, select, textarea, button')
            .forEach(element => element.disabled = true);
        toggleContainer('container_port');

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



document.addEventListener("DOMContentLoaded", () => {

    window.electronAPI.getStore().then(store => {
        storeObj = store; 

        document.getElementById('baudRate').value = storeObj.baudRate;
        document.getElementById('dataBits').value = storeObj.dataBits;
        document.getElementById('stopBits').value = storeObj.stopBits;
        document.getElementById('startBits').value = storeObj.startBits;
        document.getElementById('parity').value = storeObj.parity;
        // document.getElementById('flowControl').value = storeObj..flowControl 
        document.getElementById('delimiter').value = storeObj.delimiter;

        // document.getElementById('portSelect').value;

        const flowControlDropdown = document.getElementById('flowControl');
        if (["true", "false"].includes(String(storeObj.flowControl))) {
            flowControlDropdown.value = String(storeObj.flowControl);
        } else {
            console.warn("Invalid flowControl value:", storeObj.flowControl);
        }

        const portSelect = document.getElementById('portSelect');
        const portPath = String(storeObj.portPath); // Ensure it's a string
        let found = false;

        // Loop through all dropdown options
        for (const option of portSelect.options) {
            if (option.value.includes(portPath)) { // ✅ Checks for substring match
                portSelect.value = option.value; // Select the matching option
                found = true;
                console.log("found port on dropdown :", portPath);
                break; // Stop searching after the first match
            }
        }

        // Handle case where no matching option was found
        if (!found) {
            console.log("No matching port found for:", portPath);
        }

        loadTable();
        createPlot();

    }).catch(err => {
        console.error("Error fetching store:", err);
    });

});


