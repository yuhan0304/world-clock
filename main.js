const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// ============================================================
// 简易 JSON 文件存储（替代 electron-store，避免 ESM 兼容问题）
// ============================================================
const CONFIG_PATH = path.join(app.getPath('userData'), 'world-clock-config.json')

const DEFAULT_CONFIG = {
  windowBounds: { x: undefined, y: undefined },
  alwaysOnTop: false,
  theme: 'auto',
  fontSize: 'medium',
  workHours: {},
  timezones: [
    { name: '北京(本地)', zone: 'Asia/Shanghai', flag: '🇨🇳' },
    { name: '纽约', zone: 'America/New_York', flag: '🇺🇸' },
    { name: '伦敦', zone: 'Europe/London', flag: '🇬🇧' },
    { name: '东京', zone: 'Asia/Tokyo', flag: '🇯🇵' },
    { name: '悉尼', zone: 'Australia/Sydney', flag: '🇦🇺' },
    { name: '新加坡', zone: 'Asia/Singapore', flag: '🇸🇬' }
  ]
}

function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

function saveConfig(config) {
  try {
    const dir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (e) {
    console.error('保存配置失败:', e.message)
  }
}

// ============================================================
// 主程序
// ============================================================
let mainWindow = null
let tray = null
const isMac = process.platform === 'darwin'

function createWindow() {
  const config = loadConfig()
  const bounds = config.windowBounds
  const alwaysOnTop = config.alwaysOnTop

  const windowOptions = {
    width: 720,
    height: 500,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: alwaysOnTop,
    skipTaskbar: !isMac,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  }

  if (bounds && bounds.x !== undefined && bounds.y !== undefined) {
    windowOptions.x = bounds.x
    windowOptions.y = bounds.y
  }

  mainWindow = new BrowserWindow(windowOptions)
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 保存窗口位置
  mainWindow.on('move', () => {
    const [x, y] = mainWindow.getPosition()
    const cfg = loadConfig()
    cfg.windowBounds = { x, y }
    saveConfig(cfg)
  })

  // 关闭行为：最小化到托盘
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      if (isMac) {
        app.hide()
      } else {
        mainWindow.hide()
      }
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // ---- IPC 通信 ----
  ipcMain.on('win-toggle-always-on-top', () => {
    if (!mainWindow) return
    const newVal = !mainWindow.isAlwaysOnTop()
    mainWindow.setAlwaysOnTop(newVal)
    const cfg = loadConfig()
    cfg.alwaysOnTop = newVal
    saveConfig(cfg)
  })

  ipcMain.on('win-minimize', () => {
    if (mainWindow) mainWindow.minimize()
  })

  ipcMain.on('win-close', () => {
    if (mainWindow) mainWindow.close()
  })

  ipcMain.handle('get-window-state', () => {
    if (!mainWindow) return { alwaysOnTop: false }
    return { alwaysOnTop: mainWindow.isAlwaysOnTop() }
  })

  ipcMain.handle('get-timezones', () => {
    return loadConfig().timezones
  })

  ipcMain.on('save-timezones', (_, timezones) => {
    const cfg = loadConfig()
    cfg.timezones = timezones
    saveConfig(cfg)
  })

  // ---- 主题与字体 ----
  ipcMain.handle('get-config', () => {
    const cfg = loadConfig()
    return {
      theme: cfg.theme || 'auto',
      fontSize: cfg.fontSize || 'medium',
      workHours: cfg.workHours || {},
      timezones: cfg.timezones,
      alwaysOnTop: cfg.alwaysOnTop
    }
  })

  ipcMain.on('save-config', (_, partial) => {
    const cfg = loadConfig()
    Object.assign(cfg, partial)
    saveConfig(cfg)
  })
}

// ---- 系统托盘 ----
function createTray() {
  const iconPath = path.join(__dirname, 'src', 'assets', 'icons', 'tray-icon.png')
  let trayIcon

  try {
    trayIcon = nativeImage.createFromPath(iconPath)
    if (trayIcon.isEmpty()) throw new Error('empty icon')
  } catch {
    // 创建 16x16 蓝色图标（原生方式）
    const size = 16
    const buf = Buffer.alloc(size * size * 4)
    for (let i = 0; i < size * size; i++) {
      buf[i * 4] = 26
      buf[i * 4 + 1] = 115
      buf[i * 4 + 2] = 232
      buf[i * 4 + 3] = 255
    }
    trayIcon = nativeImage.createFromBuffer(buf, { width: size, height: size })
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('WorldClock - 多时区时钟')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示时钟',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// ---- 托盘图标文件 ----
function ensureTrayIcon() {
  const iconPath = path.join(__dirname, 'src', 'assets', 'icons', 'tray-icon.png')
  if (!fs.existsSync(iconPath)) {
    // 极简 32x32 蓝色 PNG (base64)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAMlJREFUWEft1rENwjAQBdD/FYyAWIAJYAQKOkZgBEZgBDoWYARGYAMK4kiWIjmO7Vj+SzfZ8nufbAkNA38a+BeBQSDj9V4BEAgEkI8AIBAIIB8BQCAQQD4CgEAg+eoFUqT3e6/3+32dwzAMep5nneM4rs65rus6x3H0NE11juu6Osdx/DmP41jnnOe55pwSfddpmmY9z3Pt+wAIBAJ4CwQCAbwFAoEA3gKBQABvgUAggLdAdMDr9VJEnudFRLQsi/b7vYgY7/d+fyAQCCA/AoBAIIB8BACBQAD5CAACgQDy/wIpdyt/9QMZqQAAAABJRU5ErkJggg=='
    fs.writeFileSync(iconPath, Buffer.from(pngBase64, 'base64'))
  }
}

// ---- 启动 ----
app.whenReady().then(() => {
  ensureTrayIcon()
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
})
