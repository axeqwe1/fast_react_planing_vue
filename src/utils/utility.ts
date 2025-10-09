import type { Job, JobStyleOptions, Line } from '@/type/types'
import { formatTimeKey } from './formatKey'

export function buildWorkDurationCache(
  weeks: { start: Date; end: Date }[],
  lines: Line[],
  WORK_HOUR = 8,
) {
  const cacheWeekDay = new Map()
  const WorkDuration = new Map()
  for (const week of weeks) {
    const weekKey = formatTimeKey(week.start)
    let date: Date[] = []
    for (let d = new Date(week.start); d <= week.end; d.setDate(d.getDate() + 1)) {
      d.setHours(0, 0, 0, 0)
      date.push(new Date(d))
    }
    cacheWeekDay.set(weekKey, date)
    for (const line of lines) {
      WorkDuration.set(`${weekKey}${line.name}`, WORK_HOUR)
    }
  }
  return { cacheWeekDay, WorkDuration }
}

export function getShiftRange(currentDate: Date, shiftStart: string, workMinutes: number) {
  const [h, m, s] = shiftStart.split(':').map(Number)
  const start = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    h,
    m,
    s,
  )
  const end = new Date(start.getTime() + workMinutes * 60000)
  return { start, end }
}

export const localToISO = (date: Date) => {
  if (!date) return null
  const tzOffset = date.getTimezoneOffset() * 60000 // offset in ms
  const localISO = new Date(date.getTime() - tzOffset).toISOString().slice(0, 19)
  return localISO // e.g. "2025-09-30T00:00:00"
}
// export function timeStringToDate(date: Date, timeString: string): Date {
//   const result = new Date(date)
//   const [h, m, s] = timeString.split(':').map(Number)
//   result.setHours(h, m, s)
//   return result
// }
