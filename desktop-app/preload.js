const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('cw', {
  openExternal: (url) => ipcRenderer.invoke('cw:open-external', url)
})
