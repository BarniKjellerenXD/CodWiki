const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cw', {
  getRuntime: () => ipcRenderer.invoke('cw:runtime'),
  getLibrary: () => ipcRenderer.invoke('cw:get-library'),
  refreshLibrary: () => ipcRenderer.invoke('cw:refresh-library'),
  getUpdate: () => ipcRenderer.invoke('cw:get-update'),
  checkUpdate: () => ipcRenderer.invoke('cw:check-update'),
  onLibraryChanged: (cb) => ipcRenderer.on('cw:library-changed', (e, snapshot) => cb(snapshot)),
  openExternal: (url) => ipcRenderer.invoke('cw:open-external', url),
  getSettings: () => ipcRenderer.invoke('cw:get-settings'),
  saveSettings: (patch) => ipcRenderer.invoke('cw:set-settings', patch),
  onOpenSettings: (cb) => ipcRenderer.on('cw:open-settings', () => cb()),
  onSettingsChanged: (cb) => ipcRenderer.on('cw:settings-changed', (e, s) => cb(s))
})
