const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  min: () => ipcRenderer.send('min'),
  max: () => ipcRenderer.send('max'),
  close: () => ipcRenderer.send('close'),
  dirname: () => ipcRenderer.invoke('dirname')
})