const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cw', {
  getRuntime: () => ipcRenderer.invoke('cw:runtime'),
  openExternal: (url) => ipcRenderer.invoke('cw:open-external', url),
  getSettings: () => ipcRenderer.invoke('cw:get-settings'),
  saveSettings: (patch) => ipcRenderer.invoke('cw:set-settings', patch),
  onOpenSettings: (cb) => ipcRenderer.on('cw:open-settings', () => cb()),
  onSettingsChanged: (cb) => ipcRenderer.on('cw:settings-changed', (e, s) => cb(s))
})
