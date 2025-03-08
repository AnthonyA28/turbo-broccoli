//C:\Users\antho\AppData\Roaming\ElectroLink

const { app, BrowserWindow, Menu, dialog, ipcMain, powerSaveBlocker } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs');


let mainWindow;
let currentPort = null;
let currentParser = null;
let unEscapedDelimiter = "\n";
const blocker = powerSaveBlocker.start('prevent-app-suspension');
let numIndices; // defined in index.js

let store; // Declare store globally

var commandList = [];


async function setupStore() {
    const { default: Store } = await import('electron-store');
    
    store = new Store({
        cwd: process.cwd(), // Save store in the current working directory
        name: 'store' // Optional: change the name of the store file
    });

    console.log('Store initialized at:', path.join(process.cwd(), 'store.json'));

    // Optional: If you want to merge data from an existing store.json file
    const storeFilePath = path.join(process.cwd(), 'store.json');
    if (fs.existsSync(storeFilePath)) {
        console.log(`Store file found: ${storeFilePath}`);
        try {
            const storeData = fs.readFileSync(storeFilePath, 'utf8');
            console.log('Store file content:', storeData);
            const parsedData = JSON.parse(storeData);
            Object.entries(parsedData).forEach(([key, value]) => {
                console.log("Setting " + key + " to " + value);
                store.set(key, value);
            });
        } catch (error) {
            console.error('Error reading store file:', error);
        }
    } else {
        console.log(`Store file not found in the current directory. Creating a new store...`);
        try {
            fs.writeFileSync(storeFilePath, JSON.stringify(store.store, null, 2));
            console.log('New store file created:', storeFilePath);
        } catch (error) {
            console.error('Error creating store file:', error);
        }
    }
}


// Request data from the renderer
async function requestRendererData() {
    if (mainWindow) {
        const result = await mainWindow.webContents.executeJavaScript(`window.fetchData()`);
        numIndices = result.numIndices;
        console.log("Data received from index.js:", result);
        console.log(numIndices);
        return result;
    }
}


// called immediately
async function init() {
    await setupStore();  // Ensure store is initialized

    // Wait until mainWindow is ready
    while (!mainWindow) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Poll every 100ms
    }

    await requestRendererData();  // Now it's safe to call
} init();


ipcMain.handle('get-store', async () => {
    return JSON.parse(JSON.stringify(store.store)); // Ensures serialization
});

// Handle disconnecting from the serial port
ipcMain.handle('disconnect-serial-port', async () => {
    if (currentPort) {
        try {
            // Close the serial port
            await new Promise((resolve, reject) => {
                currentPort.close(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Optionally, remove the parser if needed
            if (currentParser) {
                currentPort.unpipe(currentParser);
            }

            // Reset the port and parser variables
            currentPort = null;
            currentParser = null;

            console.log('Serial port disconnected');
            return true; // Successfully disconnected
        } catch (err) {
            console.error('Failed to disconnect:', err.message);
            return false; // Disconnection failed
        }
    } else {
        console.log('No serial port to disconnect');
        return false; // No port was open
    }
});


ipcMain.handle('set-store', async(event, newStoreObj) => {
    const existingStore = store.store; // Get current store values
    const updatedStore = { ...existingStore, ...newStoreObj }; // Merge new data
    store.set(updatedStore);
})


ipcMain.handle('set-newCommandList', async (event, newCommandList) => {
    commandList = newCommandList;
    console.log("commandList: " + commandList);
})

ipcMain.handle('send-next-command', async (event, nextCommand) => {
    console.log("sending next command : " + nextCommand);
    console.log("commandList  ", commandList)

    nextCommand = nextCommand + ";"
    
    currentPort.write(nextCommand + '\n', (err) => {  // Ensure a newline character is sent
    if (err) {
      console.error('Error on write: ', err.nextCommand);
    }
    console.log('Message written: ', nextCommand);
  });

    commandList.pop()
    console.log("commandList after pop  ", commandList)

})


ipcMain.handle('choose-log-folder', async (event, fileName) => {
        
        if(fileName == ""){
          return; 
        }
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return 'No folder selected';
        }

        const folderPath = result.filePaths[0];
        store.set("folderPath", folderPath);

        let filePath = path.join(folderPath, fileName);
        store.set("fileName", fileName);
        
        const dataFileName = "data_" + fileName
        let dataFilePath = path.join(folderPath, dataFileName);
        store.set("dataFileName", dataFileName);

        try {
            // Create a text file with the specified name
            fs.writeFileSync(filePath, '');
            console.log(`File created successfully at ${filePath}`);

            
        } catch (error) {
            filePath = "";
            console.log(`Error creating file: ${error.message}`);
        }

        try {
            // Create a text file with the specified name
            fs.writeFileSync(dataFilePath, '');
            console.log(`File created successfully at ${dataFilePath}`);
        } catch (error) {
            dataFilePath = "";
            console.log(`Error creating file: ${error.message}`);
        }

});


ipcMain.handle('connect-serial-port', async (event, config) => {
    const { path, baudRate, dataBits,startBits,  stopBits, parity, flowControl, delimiter } = config;
    
    console.log("main.js delimiter: " +  JSON.stringify(delimiter) )

    unEscapedDelimiter = delimiter
        .replace(/\\n/g, '\n')  // Replace escaped newline with actual newline
        .replace(/\\r/g, '\r')  // Replace escaped carriage return with actual carriage return
        .replace(/\\t/g, '\t')  // Replace escaped tab with actual tab
        .replace(/\\\\/g, '\\'); // Replace double backslashes with a single backslash
    
    console.log("unEscapedDelimiter: " +  JSON.stringify(unEscapedDelimiter) )

    try {
      currentPort = new SerialPort(config);
      currentParser = currentPort.pipe(new ReadlineParser({ delimiter: unEscapedDelimiter }));

      currentPort.on('open', () => {
        console.log('Serial port opened');
        store.set("portPath", currentPort.path);
      });

      currentPort.on('error', (err) => {
        console.error('Error: ', err.message);
      });

      // Read data from the serial port and send it to the renderer process
      currentParser.on('data', (data) => {
        console.log(`Received data: ${data}`);

        const parsedData = data.replace(/[\[\]]/g, '').split(';').map(num => parseFloat(num.trim()));

        if (parsedData.length != numIndices) {
            return;
        }


        parsedData[0] = parsedData[0]/store.get("steps_per_micron");
        parsedData[1] = parsedData[1]/store.get("steps_per_micron");
        parsedData[2] = parsedData[2]/store.get("steps_per_micron");
        parsedData[3] = parsedData[3]/store.get("ticks_per_second");
        parsedData[4] = (parsedData[4]-store.get("force_base_line1"))*store.get("force_slope1");
        parsedData[5] = (parsedData[5]-store.get("force_base_line2"))*store.get("force_slope2");

        logData(data, parsedData);
          
        mainWindow.webContents.send('serial-data', parsedData);

      });

        return true;
    } catch (err) {
      console.error('Failed to connect: ', err.message);
      event.reply('serial-port-status', 'error');
      return false;
    }

});

async function logData(data, parsedData){


    const filePath = path.join(store.get("folderPath"), store.get("fileName"));
    const dataFilePath = path.join(store.get("folderPath"), store.get("dataFileName"));
    if(filePath != ""){
        try {

            // Create a text file with the specified name 
            const toWrite = data + unEscapedDelimiter;
            fs.appendFileSync(filePath, toWrite);
            

        } catch (error) {
            console.log("Failed to log " + data);
        }
    }
    if(dataFilePath != ""){
        try {

            if (parsedData.length == numIndices) {
                fs.appendFileSync(dataFilePath, parsedData.join(",") + "\n");
                // console.log("logged data: " + parsedData );
                
            }

            
            

        } catch (error) {
            console.log("Failed to log " + parsedData );
        }
    }



}

ipcMain.on('send-to-serial', (event, message) => {
    currentPort.write(message + '\n', (err) => {  // Ensure a newline character is sent
    if (err) {
      console.error('Error on write: ', err.message);
    }
    console.log('Message written: ', message);
    });
});




function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'), 
    webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    enableRemoteModule: false,
    nodeIntegration: false,
    sandbox: false, // Disable sandbox if needed
    enableBlinkFeatures: "WebGL2" // Force WebGL2 if supported

    }
  });

  mainWindow.loadFile('index.html');


    const customMenu = Menu.buildFromTemplate([
        {
            label: "View",
            submenu: [

                { label: "toggle port info", click: () => mainWindow.webContents.send('toggle-container', 'container_port') },
                { label: "toggle commands", click: () => mainWindow.webContents.send('toggle-container', 'container_commands') },
                { label: "toggle graph", click: () => mainWindow.webContents.send('toggle-container', 'container_graph') },
                { label: "toggle container 3", click: () => mainWindow.webContents.send('toggle-container', 'container3') },
                { label: "toggle table", click: () => mainWindow.webContents.send('toggle-container', 'container_table') },
                { type: "separator" }, // Optional: adds a line separator
                {
                    label: "Zoom In",
                    accelerator: "Ctrl+Plus", // Standard shortcut for zooming in
                    click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 1)
                },
                {
                    label: "Zoom Out",
                    accelerator: "Ctrl+-", // Standard shortcut for zooming out
                    click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 1)
                },
                {
                    label: "Reset Zoom",
                    accelerator: "Ctrl+0", // Reset zoom to default
                    click: () => mainWindow.webContents.setZoomLevel(0)
                },
                { type: 'separator' },
                { 
                    label: "Toggle Developer Tools", 
                    accelerator: "Ctrl+Shift+I", // Shortcut to open DevTools
                    click: () => mainWindow.webContents.toggleDevTools()
                }
            ]
        },
    ]);

    Menu.setApplicationMenu(customMenu);


    // Send an initialize message after the window is ready
    mainWindow.webContents.on('did-finish-load', () => {
      console.log("Finished loading");
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// Called by populatePorts()
async function _listPorts() {
    try {
        const ports = await SerialPort.list();
        
        return ports;
    } catch (err) {
        console.error('Error listing COM ports:', err.message);
        return [];
    }
}


// IPC handler to send list of ports to renderer process
ipcMain.handle('list-ports', async () => {
  return await _listPorts();
});



app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-renderer-process-reuse');
// app.disableHardwareAcceleration();


app.on('minimize', (event) => {
    event.preventDefault();
    if (mainWindow) {
        mainWindow.hide(); // Hide the window instead of minimizing
    }
});

app.on('activate', () => {
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.show();
});


app.on('ready', () => {
    if (process.platform === 'win32') {
        app.setAppUserModelId('my-app-id'); // Fixes taskbar icon on Windows
    }
});

app.on('quit', () => {
    if (powerSaveBlocker.isStarted(blocker)) {
        powerSaveBlocker.stop(blocker);
    }
});


app.commandLine.appendSwitch('ignore-gpu-blacklist'); // Force GPU use
app.commandLine.appendSwitch('enable-webgl'); // Enable WebGL explicitly
app.commandLine.appendSwitch('disable-software-rasterizer'); // Force GPU rendering
