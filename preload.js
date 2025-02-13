const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendToSerial: (message) => ipcRenderer.send('send-to-serial', message),
    listPorts: () => ipcRenderer.invoke('list-ports'),
    connectSerialPort: (config) => ipcRenderer.invoke('connect-serial-port', config),
    disconnectSerialPort: () => ipcRenderer.invoke('disconnect-serial-port'),
    chooseLogFolder: (fileName) => ipcRenderer.invoke('choose-log-folder', fileName),
    setCommandList: (newCommandList) => ipcRenderer.invoke('set-newCommandList', newCommandList),
    sendNextCommand: (nextCommand) => ipcRenderer.invoke('send-next-command', nextCommand),
    
    onSerialData: (callback) => ipcRenderer.on('serial-data', (event, data) => callback(data)),

    sendDataToMain: (data) => ipcRenderer.send('send-data-to-main', data),
    onRequestData: (callback) => ipcRenderer.on('request-data-from-main', (_, data) => callback(data)),


    getStore: () => ipcRenderer.invoke('get-store'),
    setStore: (newStoreObj) => ipcRenderer.invoke('set-store', newStoreObj),

    // ✅ Add `receive` to listen for events from main.js
    receive: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
});
