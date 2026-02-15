const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-get-version'),
  getPath: (name) => ipcRenderer.invoke('app-get-path', name),
  
  // Startup settings
  setStartup: (enable) => ipcRenderer.invoke('set-startup', enable),
  
  // Dialogs
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Platform info
  platform: process.platform,
  
  // Check if running in Electron
  isElectron: true,
});
