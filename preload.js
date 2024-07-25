const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendToSerial: (message) => ipcRenderer.send('send-to-serial', message),
  listPorts: () => ipcRenderer.invoke('list-ports'),
  connectSerialPort: (config) => ipcRenderer.invoke('connect-serial-port', config),
  disconnectSerialPort: () => ipcRenderer.invoke('disconnect-serial-port'),
  chooseLogFolder: (fileName) => ipcRenderer.invoke('choose-log-folder', fileName),
  onSerialData: (callback) => ipcRenderer.on('serial-data', (event, data) => callback(data))
  
});

