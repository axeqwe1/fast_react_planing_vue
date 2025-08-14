import type { DetectDropModeParams, DropMode } from '@/type/types'

export function detectDropMode({
  targetLineId,
  newStart,
  jobs,
  holidays = [],
}: DetectDropModeParams): DropMode {
  // 1. Check holiday
  const isHoliday = holidays.some((h) => isSameDay(h, newStart))
  if (isHoliday) {
    return 'skip'
  }

  // 2. Filter jobs in target line and sort by startDate
  const lineJobs = jobs
    .filter((j) => j.line === targetLineId)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  for (let i = 0; i < lineJobs.length; i++) {
    const job = lineJobs[i]
    const jobStart = new Date(job.startDate)
    const jobEnd = new Date(job.endDate)

    // ถ้าทับช่วงเวลา job อื่น
    if (newStart >= jobStart && newStart <= jobEnd) {
      return 'insert'
    }

    // ถ้า newStart ตรงกับ endDate พอดี → ต่อท้าย
    if (newStart.getTime() === jobEnd.getTime()) {
      return 'merge'
    }
  }

  // 3. ถ้าไม่เข้ากรณีไหนเลย → normal
  return 'normal'
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
