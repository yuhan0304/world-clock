/* =============================================
   WorldClock - 时区工具模块
   ============================================= */

// 预置常用时区列表
const PRESET_TIMEZONES = [
  { name: '北京', zone: 'Asia/Shanghai', flag: '🇨🇳', offset: '+08:00' },
  { name: '东京', zone: 'Asia/Tokyo', flag: '🇯🇵', offset: '+09:00' },
  { name: '首尔', zone: 'Asia/Seoul', flag: '🇰🇷', offset: '+09:00' },
  { name: '新加坡', zone: 'Asia/Singapore', flag: '🇸🇬', offset: '+08:00' },
  { name: '香港', zone: 'Asia/Hong_Kong', flag: '🇭🇰', offset: '+08:00' },
  { name: '台北', zone: 'Asia/Taipei', flag: '🇹🇼', offset: '+08:00' },
  { name: '孟买', zone: 'Asia/Kolkata', flag: '🇮🇳', offset: '+05:30' },
  { name: '迪拜', zone: 'Asia/Dubai', flag: '🇦🇪', offset: '+04:00' },
  { name: '曼谷', zone: 'Asia/Bangkok', flag: '🇹🇭', offset: '+07:00' },
  { name: '吉隆坡', zone: 'Asia/Kuala_Lumpur', flag: '🇲🇾', offset: '+08:00' },
  { name: '伦敦', zone: 'Europe/London', flag: '🇬🇧', offset: '+00:00' },
  { name: '巴黎', zone: 'Europe/Paris', flag: '🇫🇷', offset: '+01:00' },
  { name: '柏林', zone: 'Europe/Berlin', flag: '🇩🇪', offset: '+01:00' },
  { name: '莫斯科', zone: 'Europe/Moscow', flag: '🇷🇺', offset: '+03:00' },
  { name: '阿姆斯特丹', zone: 'Europe/Amsterdam', flag: '🇳🇱', offset: '+01:00' },
  { name: '斯德哥尔摩', zone: 'Europe/Stockholm', flag: '🇸🇪', offset: '+01:00' },
  { name: '纽约', zone: 'America/New_York', flag: '🇺🇸', offset: '-05:00' },
  { name: '芝加哥', zone: 'America/Chicago', flag: '🇺🇸', offset: '-06:00' },
  { name: '旧金山', zone: 'America/Los_Angeles', flag: '🇺🇸', offset: '-08:00' },
  { name: '多伦多', zone: 'America/Toronto', flag: '🇨🇦', offset: '-05:00' },
  { name: '墨西哥城', zone: 'America/Mexico_City', flag: '🇲🇽', offset: '-06:00' },
  { name: '圣保罗', zone: 'America/Sao_Paulo', flag: '🇧🇷', offset: '-03:00' },
  { name: '悉尼', zone: 'Australia/Sydney', flag: '🇦🇺', offset: '+10:00' },
  { name: '奥克兰', zone: 'Pacific/Auckland', flag: '🇳🇿', offset: '+12:00' },
  { name: '洛杉矶', zone: 'America/Los_Angeles', flag: '🇺🇸', offset: '-08:00' },
]

const WEEKDAY_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * 获取指定时区的当前时间信息
 */
function getTimeInfo(timezone) {
  const now = new Date()

  // 手动计算目标时区时间（基于 UTC 偏移）
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000
  const tzMatch = PRESET_TIMEZONES.find(t => t.zone === timezone)
  let offsetMinutes = 0

  if (tzMatch) {
    const offsetStr = tzMatch.offset
    const sign = offsetStr[0] === '+' ? 1 : -1
    const hours = parseInt(offsetStr.slice(1, 3))
    const mins = parseInt(offsetStr.slice(4, 6))
    offsetMinutes = sign * (hours * 60 + mins)
  }

  const tzTime = new Date(utcNow + offsetMinutes * 60000)

  const hours = tzTime.getHours().toString().padStart(2, '0')
  const minutes = tzTime.getMinutes().toString().padStart(2, '0')
  const seconds = tzTime.getSeconds().toString().padStart(2, '0')

  const year = tzTime.getFullYear()
  const month = (tzTime.getMonth() + 1).toString().padStart(2, '0')
  const day = tzTime.getDate().toString().padStart(2, '0')
  const weekday = WEEKDAY_CN[tzTime.getDay()]
  const weekdayEn = WEEKDAY_EN[tzTime.getDay()]

  return {
    timeString: `${hours}:${minutes}:${seconds}`,
    timeShort: `${hours}:${minutes}`,
    dateString: `${year}-${month}-${day}`,
    weekday,
    weekdayEn,
    hours,
    minutes,
    seconds,
    offset: tzMatch ? tzMatch.offset : '+00:00'
  }
}

/**
 * 获取本地时区名称
 */
function getLocalTimezoneName() {
  const offset = -new Date().getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const mins = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  const offsetStr = `UTC${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  return offsetStr
}

/**
 * 获取当前 UTC 时间
 */
function getUTCTime() {
  const now = new Date()
  return now.toUTCString()
}
