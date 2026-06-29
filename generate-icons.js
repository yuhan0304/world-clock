const fs = require('fs')
const path = require('path')

const ASSETS_DIR = path.join(__dirname, 'src', 'assets', 'icons')

// 最小的蓝色时钟图标 PNG (32x32) - base64
const ICON_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAMlJREFUWEft1rENwjAQBdD/FYyAWIAJYAQKOkZgBEZgBDoWYARGYAMK4kiWIjmO7Vj+SzfZ8nufbAkNA38a+BeBQSDj9V4BEAgEkI8AIBAIIB8BQCAQQD4CgEAg+eoFUqT3e6/3+32dwzAMep5nneM4rs65rus6x3H0NE11juu6Osdx/DmP41jnnOe55pwSfddpmmY9z3Pt+wAIBAJ4CwQCAbwFAoEA3gKBQABvgUAggLdAdMDr9VJEnudFRLQsi/b7vYgY7/d+fyAQCCA/AoBAIIB8BACBQAD5CAACgQDy/wIpdyt/9QMZqQAAAABJRU5ErkJggg=='

function createICO(pngBuffer) {
  // ICO header
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)    // reserved
  header.writeUInt16LE(1, 2)    // type: icon
  header.writeUInt16LE(1, 4)    // count: 1 image

  // Directory entry
  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0)       // width: 32
  entry.writeUInt8(32, 1)       // height: 32
  entry.writeUInt8(0, 2)        // colors
  entry.writeUInt8(0, 3)        // reserved
  entry.writeUInt16LE(1, 4)     // planes
  entry.writeUInt16LE(32, 6)    // bpp
  entry.writeUInt32LE(pngBuffer.length, 8)  // image size
  entry.writeUInt32LE(22, 12)   // offset: header(6) + entry(16) = 22

  return Buffer.concat([header, entry, pngBuffer])
}

function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true })

  const pngData = Buffer.from(ICON_BASE64, 'base64')

  // 1. tray-icon.png (already exists, but ensure it)
  const trayPath = path.join(ASSETS_DIR, 'tray-icon.png')
  fs.writeFileSync(trayPath, pngData)
  console.log('OK tray-icon.png')

  // 2. icon.png (app icon)
  const iconPngPath = path.join(ASSETS_DIR, 'icon.png')
  fs.writeFileSync(iconPngPath, pngData)
  console.log('OK icon.png')

  // 3. icon.ico (Windows)
  const icoData = createICO(pngData)
  const icoPath = path.join(ASSETS_DIR, 'icon.ico')
  fs.writeFileSync(icoPath, icoData)
  console.log('OK icon.ico')

  console.log('Done!')
}

main()
