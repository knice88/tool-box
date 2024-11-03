// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')
const { webUtils } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    sendRequest: (method, url, headers, data) => ipcRenderer.invoke('send-request', method, url, headers, data),
    webUtils: webUtils,
    startHttpServer: () => ipcRenderer.invoke('start-http-server'),
    stopHttpServer: () => ipcRenderer.invoke('stop-http-server'),
    createDownLink: (filePath) => ipcRenderer.invoke('create-downlink', filePath),
    getServerInfo: () => ipcRenderer.invoke('get-server-info'),
})