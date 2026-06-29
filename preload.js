const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  toggleAlwaysOnTop: () => ipcRenderer.send('win-toggle-always-on-top'),
  minimize: () => ipcRenderer.send('win-minimize'),
  close: () => ipcRenderer.send('win-close'),

  // 窗口状态
  getWindowState: () => ipcRenderer.invoke('get-window-state'),

  // 时区配置
  getTimezones: () => ipcRenderer.invoke('get-timezones'),
  saveTimezones: (timezones) => ipcRenderer.send('save-timezones', timezones),

  // 通用配置（主题、字体等）
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (partial) => ipcRenderer.send('save-config', partial)
})
