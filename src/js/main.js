/* =============================================
   WorldClock - 渲染进程主逻辑
   ============================================= */

// ---- 全局状态 ----
let timezones = []
let currentEditCardIndex = -1
let meetingPanelOpen = false
let timerInterval = null
let currentTheme = 'auto'
let currentFontSize = 'medium'
let customWorkHours = {}  // { zone: { start: 9, end: 18 } }

// ---- DOM 引用 ----
const clockContainer = document.getElementById('clockContainer')
const modalOverlay = document.getElementById('modalOverlay')
const modalList = document.getElementById('modalList')
const modalSearch = document.getElementById('modalSearch')
const modalClose = document.getElementById('modalClose')
const modalCancel = document.getElementById('modalCancel')
const meetingToggle = document.getElementById('meetingToggle')
const meetingPanel = document.getElementById('meetingPanel')
const meetingContent = document.getElementById('meetingContent')
const meetingArrow = document.querySelector('.meeting-arrow')
const btnAlwaysOnTop = document.getElementById('btnAlwaysOnTop')
const btnMinimize = document.getElementById('btnMinimize')
const btnClose = document.getElementById('btnClose')
const btnTheme = document.getElementById('btnTheme')
const themeIcon = document.getElementById('themeIcon')
const copyMeetingBtn = document.getElementById('copyMeetingTime')
const fontSizeBtns = document.querySelectorAll('.font-size-btn')
const btnWorkHours = document.getElementById('btnWorkHours')
const workHoursOverlay = document.getElementById('workHoursOverlay')
const workHoursBody = document.getElementById('workHoursBody')
const workHoursClose = document.getElementById('workHoursClose')
const workHoursCancel = document.getElementById('workHoursCancel')
const workHoursSave = document.getElementById('workHoursSave')

// ---- 初始化 ----
async function init() {
  // 加载配置
  if (window.electronAPI) {
    timezones = await window.electronAPI.getTimezones()
    const state = await window.electronAPI.getWindowState()
    const config = await window.electronAPI.getConfig()

    if (state.alwaysOnTop) btnAlwaysOnTop.classList.add('active')

    // 主题
    currentTheme = config.theme || 'auto'
    applyTheme(currentTheme)

    // 字体大小
    currentFontSize = config.fontSize || 'medium'
    applyFontSize(currentFontSize)

    // 自定义工作时间
    if (config.workHours) {
      customWorkHours = config.workHours
    }
  } else {
    timezones = [
      { name: '北京(本地)', zone: 'Asia/Shanghai', flag: '🇨🇳' },
      { name: '纽约', zone: 'America/New_York', flag: '🇺🇸' },
      { name: '伦敦', zone: 'Europe/London', flag: '🇬🇧' },
      { name: '东京', zone: 'Asia/Tokyo', flag: '🇯🇵' },
      { name: '悉尼', zone: 'Australia/Sydney', flag: '🇦🇺' },
      { name: '新加坡', zone: 'Asia/Singapore', flag: '🇸🇬' }
    ]
  }

  renderClocks()
  updateMeetingInfo()

  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(renderClocks, 1000)

  bindEvents()
}

// ============================================================
// 主题切换
// ============================================================
function applyTheme(theme) {
  currentTheme = theme
  const html = document.documentElement

  html.classList.remove('light-theme', 'dark-theme')

  if (theme === 'dark') {
    html.classList.add('dark-theme')
    updateThemeIcon(true)
  } else if (theme === 'light') {
    html.classList.add('light-theme')
    updateThemeIcon(false)
  } else {
    // 'auto' — 跟随系统
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      html.classList.add('dark-theme')
    } else {
      html.classList.add('light-theme')
    }
    updateThemeIcon(prefersDark)
  }
}

function toggleTheme() {
  if (currentTheme === 'auto') {
    currentTheme = 'dark'
  } else if (currentTheme === 'dark') {
    currentTheme = 'light'
  } else {
    currentTheme = 'auto'
  }
  applyTheme(currentTheme)
  savePreference('theme', currentTheme)
}

function updateThemeIcon(isDark) {
  if (!themeIcon) return
  if (currentTheme === 'auto') {
    // 自动模式：显示半月亮+太阳
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
  } else if (isDark) {
    // 月亮
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
  } else {
    // 太阳
    themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><g stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g>'
  }
}

// ============================================================
// 字体大小
// ============================================================
function applyFontSize(size) {
  currentFontSize = size
  const html = document.documentElement
  html.classList.remove('font-small', 'font-medium', 'font-large')
  html.classList.add('font-' + size)

  fontSizeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === size)
  })
}

function setFontSize(size) {
  applyFontSize(size)
  savePreference('fontSize', size)
}

// ============================================================
// 配置持久化辅助
// ============================================================
function savePreference(key, value) {
  if (window.electronAPI) {
    window.electronAPI.saveConfig({ [key]: value })
  }
}

// ---- 渲染时钟卡片 ----
function renderClocks() {
  clockContainer.innerHTML = ''

  timezones.forEach((tz, index) => {
    const info = getTimeInfo(tz.zone)
    const isLocal = index === 0

    const card = document.createElement('div')
    card.className = `clock-card${isLocal ? ' local' : ''}`
    card.dataset.index = index

    card.innerHTML = `
      <div class="card-header">
        <div class="card-flag-name">
          <span class="card-flag">${tz.flag}</span>
          <span class="card-name">${tz.name}</span>
        </div>
        ${!isLocal ? '<button class="card-edit" data-index="' + index + '">✎</button>' : ''}
      </div>
      <div class="card-time">${info.timeShort}</div>
      <div class="card-date">
        <span>${info.dateString}</span>
        <span class="card-weekday">${info.weekday}</span>
      </div>
      <div class="card-offset">${info.offset} · ${tz.zone}</div>
    `

    clockContainer.appendChild(card)

    if (!isLocal) {
      const editBtn = card.querySelector('.card-edit')
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        currentEditCardIndex = index
        openModal(index)
      })
    }
  })
}

// ---- 弹窗：时区选择 ----
function openModal(editIndex) {
  modalOverlay.style.display = 'flex'
  currentEditCardIndex = editIndex
  renderModalList('')
  modalSearch.value = ''
  modalSearch.focus()
}

function closeModal() {
  modalOverlay.style.display = 'none'
  currentEditCardIndex = -1
}

function renderModalList(query) {
  const currentZone = currentEditCardIndex >= 0 ? timezones[currentEditCardIndex].zone : ''
  const usedZones = timezones.map(t => t.zone)

  let list = PRESET_TIMEZONES
  if (query) {
    const q = query.toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.zone.toLowerCase().includes(q)
    )
  }

  modalList.innerHTML = ''

  list.forEach(tz => {
    const isCurrent = tz.zone === currentZone
    const isUsed = usedZones.includes(tz.zone) && !isCurrent

    const item = document.createElement('div')
    item.className = 'modal-item'
    if (isUsed) item.style.opacity = '0.4'

    item.innerHTML = `
      <div class="modal-item-info">
        <span class="modal-item-flag">${tz.flag}</span>
        <div>
          <div class="modal-item-name">${tz.name} ${isCurrent ? '(当前)' : ''}</div>
          <div class="modal-item-zone">${tz.zone} (${tz.offset})</div>
        </div>
      </div>
      ${isCurrent ? '<span class="modal-item-check">✓</span>' : ''}
    `

    if (!isUsed || isCurrent) {
      item.addEventListener('click', () => {
        if (currentEditCardIndex >= 0) {
          const oldZone = timezones[currentEditCardIndex].zone
          timezones[currentEditCardIndex] = {
            name: tz.name,
            zone: tz.zone,
            flag: tz.flag
          }
          // 清除旧时区的自定义工作时间
          if (customWorkHours[oldZone] && oldZone !== tz.zone) {
            delete customWorkHours[oldZone]
            savePreference('workHours', customWorkHours)
          }
          if (window.electronAPI) {
            window.electronAPI.saveTimezones(timezones)
          }
          renderClocks()
          updateMeetingInfo()
        }
        closeModal()
      })
    }

    modalList.appendChild(item)
  })
}

// ============================================================
// 会议助手（增强版）
// ============================================================
function updateMeetingInfo() {
  if (!meetingPanelOpen) return

// ---- 各国家/地区的默认工作时间 ----
const DEFAULT_WORK_HOURS = {
  'Asia/Shanghai':       { start: 9,  end: 18 },
  'Asia/Tokyo':          { start: 9,  end: 18 },
  'Asia/Seoul':          { start: 9,  end: 18 },
  'Asia/Singapore':      { start: 9,  end: 18 },
  'Asia/Hong_Kong':      { start: 9,  end: 18 },
  'Asia/Taipei':         { start: 9,  end: 18 },
  'Asia/Kolkata':        { start: 10, end: 19 },
  'Asia/Dubai':          { start: 9,  end: 18 },
  'Asia/Bangkok':        { start: 8,  end: 17 },
  'Asia/Kuala_Lumpur':   { start: 9,  end: 18 },
  'Europe/London':       { start: 9,  end: 17 },
  'Europe/Paris':        { start: 9,  end: 18 },
  'Europe/Berlin':       { start: 9,  end: 18 },
  'Europe/Moscow':       { start: 9,  end: 18 },
  'Europe/Amsterdam':    { start: 9,  end: 18 },
  'Europe/Stockholm':    { start: 9,  end: 17 },
  'America/New_York':    { start: 9,  end: 17 },
  'America/Chicago':     { start: 8,  end: 17 },
  'America/Los_Angeles': { start: 9,  end: 17 },
  'America/Toronto':     { start: 9,  end: 17 },
  'America/Mexico_City': { start: 9,  end: 18 },
  'America/Sao_Paulo':   { start: 8,  end: 18 },
  'Australia/Sydney':    { start: 9,  end: 17 },
  'Pacific/Auckland':    { start: 9,  end: 17 }
}

function getWorkHours(zone) {
  if (customWorkHours && customWorkHours[zone]) return customWorkHours[zone]
  return DEFAULT_WORK_HOURS[zone] || { start: 9, end: 18 }
}

  // 计算各时区当前时间及工作区间
  const timeRows = timezones.map(tz => {
    const info = getTimeInfo(tz.zone)
    const hour = parseInt(info.hours)
    const wh = getWorkHours(tz.zone)

    const isWork = hour >= wh.start && hour < wh.end

    // 将每个时区的工作时间映射到北京时间 0-24 刻度
    const beijingInfo = getTimeInfo('Asia/Shanghai')
    const bjHour = parseInt(beijingInfo.hours)
    const diff = hour - bjHour // 时差

    const wStartBJ = ((wh.start - diff) + 24) % 24
    const wEndBJ = ((wh.end - diff) + 24) % 24

    return {
      name: tz.flag + ' ' + tz.name,
      zone: tz.zone,
      currentHour: hour,
      isWork,
      workStart: wh.start,
      workEnd: wh.end,
      wStartBJ,
      wEndBJ
    }
  })

  // 寻找共同重叠区间（以北京时间为基准）
  const allOverlapHours = []
  for (let h = 0; h < 24; h++) {
    const allInWork = timeRows.every(row => {
      const localH = (h + (row.currentHour - parseInt(getTimeInfo('Asia/Shanghai').hours)) + 24) % 24
      const wh = getWorkHours(row.zone)
      return localH >= wh.start && localH < wh.end
    })
    if (allInWork) allOverlapHours.push(h)
  }

  // 合并连续区间
  const merged = []
  let start = -1
  for (let i = 0; i <= allOverlapHours.length; i++) {
    if (i < allOverlapHours.length && (start === -1 || allOverlapHours[i] === allOverlapHours[i-1] + 1)) {
      if (start === -1) start = allOverlapHours[i]
    } else {
      if (start !== -1) {
        merged.push({ start, end: allOverlapHours[i-1] })
        start = -1
      }
    }
  }

  // ---- 渲染 ----
  let html = ''

  if (merged.length > 0) {
    html += '<div class="meeting-recommend">✅ 推荐会议时间</div>'
    merged.forEach(range => {
      const s = range.start.toString().padStart(2, '0') + ':00'
      const e = (range.end + 1).toString().padStart(2, '0') + ':00'
      html += `<div class="meeting-time-range">所有时区均在工作时间内：<strong>${s} ~ ${e}</strong> (北京时间)</div>`
    })
  } else {
    html += '<div class="meeting-no-overlap">⚠️ 当前没有所有时区共同的工作时间重叠区间</div>'
    html += '<div class="meeting-tip">💡 建议：调整时区配置或考虑非重叠时段的异步沟通</div>'
  }

  // 每个时区的时间条
  html += '<div class="meeting-timeline">'
  timeRows.forEach(row => {
    const wh = getWorkHours(row.zone)
    const hour = row.currentHour
    const isWork = hour >= wh.start && hour < wh.end

    // 工作时间条占比
    const workPercent = ((wh.end - wh.start) / 24) * 100
    const workLeft = (wh.start / 24) * 100

    // 当前时间指示器
    const nowPercent = (hour / 24) * 100

    html += `
      <div class="meeting-row">
        <span class="meeting-row-label">${row.name}</span>
        <div class="meeting-bar-bg">
          <div class="meeting-bar" style="width:${workPercent}%;margin-left:${workLeft}%;background:${isWork ? 'var(--primary)' : 'var(--border)'};"></div>
          <div class="meeting-now-indicator" style="left:${nowPercent}%;"></div>
        </div>
      </div>
    `
  })

  // 时间刻度
  html += '<div class="meeting-row-labels">'
  for (let h = 0; h <= 24; h += 3) {
    html += `<span>${h.toString().padStart(2, '0')}:00</span>`
  }
  html += '</div></div>'

  meetingContent.innerHTML = html
}

// ============================================================
// 自定义工作时间管理
// ============================================================
const HOUR_OPTIONS = []
for (let i = 0; i < 24; i++) {
  HOUR_OPTIONS.push(i)
}

function openWorkHoursModal() {
  workHoursBody.innerHTML = ''

  timezones.forEach(tz => {
    const wh = getWorkHours(tz.zone)
    const row = document.createElement('div')
    row.className = 'work-hours-row'

    row.innerHTML = `
      <div class="work-hours-label">
        <span>${tz.flag}</span>
        <span>${tz.name}</span>
      </div>
      <div class="work-hours-selects">
        <select class="wh-start" data-zone="${tz.zone}">
          ${HOUR_OPTIONS.map(h =>
            `<option value="${h}" ${h === wh.start ? 'selected' : ''}>${h.toString().padStart(2, '0')}:00</option>`
          ).join('')}
        </select>
        <span class="work-hours-sep">至</span>
        <select class="wh-end" data-zone="${tz.zone}">
          ${HOUR_OPTIONS.map(h =>
            `<option value="${h}" ${h === wh.end ? 'selected' : ''}>${h.toString().padStart(2, '0')}:00</option>`
          ).join('')}
        </select>
      </div>
    `

    workHoursBody.appendChild(row)
  })

  workHoursOverlay.style.display = 'flex'
}

function saveWorkHours() {
  const newHours = {}
  document.querySelectorAll('.wh-start').forEach(sel => {
    const zone = sel.dataset.zone
    const start = parseInt(sel.value)
    const end = parseInt(document.querySelector(`.wh-end[data-zone="${zone}"]`).value)
    if (start !== 9 || end !== 18) {
      newHours[zone] = { start, end }
    }
  })

  // 合并默认值：只保存非默认的配置
  customWorkHours = { ...newHours }
  savePreference('workHours', customWorkHours)
  workHoursOverlay.style.display = 'none'

  if (meetingPanelOpen) updateMeetingInfo()
}

// ---- 复制当前时间 ----
function copyMeetingSchedule() {
  const info = timezones.map(tz => {
    const t = getTimeInfo(tz.zone)
    return `${tz.flag} ${tz.name}: ${t.dateString} ${t.timeShort}`
  }).join('\n')

  const text = `📅 各时区当前时间\n${'-'.repeat(20)}\n${info}`

  navigator.clipboard.writeText(text).then(() => {
    copyMeetingBtn.textContent = '✓ 已复制'
    setTimeout(() => {
      copyMeetingBtn.textContent = '复制当前时间'
    }, 2000)
  })
}

// ---- 绑定事件 ----
function bindEvents() {
  if (window.electronAPI) {
    btnTheme.addEventListener('click', toggleTheme)

    btnAlwaysOnTop.addEventListener('click', () => {
      window.electronAPI.toggleAlwaysOnTop()
      btnAlwaysOnTop.classList.toggle('active')
    })

    btnMinimize.addEventListener('click', () => {
      window.electronAPI.minimize()
    })

    btnClose.addEventListener('click', () => {
      window.electronAPI.close()
    })
  }

  // 会议助手切换
  meetingToggle.addEventListener('click', () => {
    meetingPanelOpen = !meetingPanelOpen
    meetingPanel.classList.toggle('open', meetingPanelOpen)
    meetingArrow.classList.toggle('open', meetingPanelOpen)
    if (meetingPanelOpen) updateMeetingInfo()
  })

  // 弹窗
  modalClose.addEventListener('click', closeModal)
  modalCancel.addEventListener('click', closeModal)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal()
  })

  modalSearch.addEventListener('input', (e) => {
    renderModalList(e.target.value)
  })

  // 复制
  copyMeetingBtn.addEventListener('click', copyMeetingSchedule)

  // 字体大小
  fontSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFontSize(btn.dataset.size)
    })
  })

  // 工作时间自定义
  if (btnWorkHours) {
    btnWorkHours.addEventListener('click', openWorkHoursModal)
  }
  if (workHoursClose) workHoursClose.addEventListener('click', () => { workHoursOverlay.style.display = 'none' })
  if (workHoursCancel) workHoursCancel.addEventListener('click', () => { workHoursOverlay.style.display = 'none' })
  if (workHoursSave) workHoursSave.addEventListener('click', saveWorkHours)
  if (workHoursOverlay) {
    workHoursOverlay.addEventListener('click', (e) => {
      if (e.target === workHoursOverlay) workHoursOverlay.style.display = 'none'
    })
  }

  // 监听系统主题变化（auto 模式）
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (currentTheme === 'auto') {
      applyTheme('auto')
    }
  })
}

// ---- 启动 ----
document.addEventListener('DOMContentLoaded', init)
