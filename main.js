const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs');

let mainWindow;
let globalFilePath = '';

// Add these variables at the top of your file to keep track of the port
let currentPort = null;
let currentParser = null;
let unEscapedDelimiter = "\n";

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


ipcMain.handle('choose-log-folder', async (event, fileName) => {
        // If the fileName is invalid we should reset globalFilePath so we dont try to save; . 
        if(fileName == ""){
          globalFilePath = "";
          return; 
        }
        // Open folder picker dialog
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return 'No folder selected';
        }

        const folderPath = result.filePaths[0];
        console.log("Trying to create a log file with name " + fileName);
        
        globalFilePath = path.join(folderPath, fileName);

        try {
            // Create a text file with the specified name
            fs.writeFileSync(globalFilePath, '');
            return `File created successfully at ${globalFilePath}`;
        } catch (error) {
            globalFilePath = "";
            return `Error creating file: ${error.message}`;
        }
    });


ipcMain.handle('connect-serial-port', async (event, config) => {
    const { path, baudRate, dataBits, stopBits, parity, flowControl, delimiter } = config;
    
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
      });

      currentPort.on('error', (err) => {
        console.error('Error: ', err.message);
      });

      // Read data from the serial port and send it to the renderer process
      currentParser.on('data', (data) => {
        console.log(`Received data: ${data}`);
        logData(data);
        mainWindow.webContents.send('serial-data', data);
      });

        return true;
    } catch (err) {
      console.error('Failed to connect: ', err.message);
      event.reply('serial-port-status', 'error');
      return false;
    }
});

async function logData(data){
  if(globalFilePath != ""){
    try {
        // Create a text file with the specified name 
        const toWrite = data + unEscapedDelimiter;
        fs.appendFileSync(globalFilePath, toWrite);
        console.log("Successfully  logged " + data );
    } catch (error) {
        console.log("Failed to log " + data );
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
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


