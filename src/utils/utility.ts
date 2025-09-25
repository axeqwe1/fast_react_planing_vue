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

export function getJobStyles(
  job: Job,
  {
    timeIndexMap,
    containerWidth,

    workHour = 8,
    breakDuration = 0,
    currentDay = new Date(),
  }: JobStyleOptions,
) {
  const startDate = new Date(job.startDate)
  const endDate = new Date(job.endDate)
  console.log('getJobStyles')
  // adjust hour and minute
  let startHour = Math.max(8, startDate.getHours())
  let startMinute = Math.floor(startDate.getMinutes())
  if (startHour === 8 && startMinute === 0) startMinute = 0
  let endHour = Math.min(16, endDate.getHours())
  let endMinute = Math.floor(endDate.getMinutes())
  if (endHour === 8 + workHour + breakDuration && endMinute > 0)
    endHour = 8 + workHour + breakDuration

  startDate.setHours(startHour, startMinute, 0, 0)
  endDate.setHours(endHour, endMinute, 0, 0)

  const startKey = formatTimeKey(startDate)
  const endKey = formatTimeKey(endDate)

  let bgColor = '#007bff'
  if (new Date(startKey) < currentDay && new Date(endKey) < currentDay) {
    bgColor = '#FF3333'
  }
  if (!timeIndexMap.has(startKey) || !timeIndexMap.has(endKey)) {
    return { display: 'none' }
  }

  let startOffset = timeIndexMap.get(startKey)
  let endOffset = timeIndexMap.get(endKey)
  let totalUnit = timeIndexMap.size
  if (startOffset === undefined || endOffset === undefined) {
    return { display: 'none' }
  }

  // ป้องกัน containerWidth < 500
  if (containerWidth < 500) containerWidth = 1200

  let unitWidth = containerWidth / totalUnit

  // คำนวณ totalMinutes
  let totalMinutes = 0
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  let finalDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  while (currentDate <= finalDate) {
    let isStartDay = currentDate.toISOString() === startDate.toISOString()
    let isEndDay = currentDate.toISOString() === endDate.toISOString()

    let dayStart, dayEnd

    if (isStartDay && isEndDay) {
      dayStart = new Date(startDate)
      dayEnd = new Date(endDate)
    } else if (isStartDay) {
      dayStart = new Date(startDate)
      dayEnd = new Date(currentDate)
      dayEnd.setHours(16, 0, 0, 0)
    } else if (isEndDay) {
      dayStart = new Date(currentDate)
      dayStart.setHours(8, 0, 0, 0)
      dayEnd = new Date(endDate)
    } else {
      dayStart = new Date(currentDate)
      dayStart.setHours(8, 0, 0, 0)
      dayEnd = new Date(currentDate)
      dayEnd.setHours(16, 0, 0, 0)
    }

    let workStart = new Date(currentDate)
    workStart.setHours(8, 0, 0, 0)
    let workEnd = new Date(currentDate)
    workEnd.setHours(16, 0, 0, 0)

    dayStart = new Date(Math.max(dayStart.getTime(), workStart.getTime()))
    dayEnd = new Date(Math.min(dayEnd.getTime(), workEnd.getTime()))

    if (dayStart < dayEnd) {
      let minutesInDay = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60)
      totalMinutes += minutesInDay
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  let totalDurationUnits = Math.max(1, endOffset - startOffset + 1)
  let finalDurationUnits = Math.max(totalMinutes, totalDurationUnits)

  let left = startOffset * unitWidth
  const width = (endOffset - startOffset + 1) * unitWidth

  return {
    left: left + 'px',
    width: Math.max(width, 1.16) + 'px',
    backgroundColor: bgColor,
    minWidth: '1.16px',
  }
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

// export function timeStringToDate(date: Date, timeString: string): Date {
//   const result = new Date(date)
//   const [h, m, s] = timeString.split(':').map(Number)
//   result.setHours(h, m, s)
//   return result
// }
