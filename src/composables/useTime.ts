export function useTime() {
  const adjustTimeForIndex = (
    startDate: Date,
    endDate: Date,
    BREAK_DURATION: number,
    workHour: number,
  ) => {
    let startHour = Math.max(8, startDate.getHours())
    let startMinute = Math.floor(startDate.getMinutes() / 15) * 15
    if (startHour === 8 && startMinute === 0) startMinute = 0
    let endHour = Math.min(17, endDate.getHours())
    let endMinute = Math.floor(endDate.getMinutes() / 15) * 15
    if (endHour === 8 + workHour + BREAK_DURATION && endMinute > 0)
      endHour = 8 + workHour + BREAK_DURATION

    return { startHour, startMinute, endHour, endMinute }
  }

  function adjustToWorkingHours(date: Date): Date {
    const WORK_START_HOUR = 8
    const WORK_END_HOUR = 17
    const WORK_DAY_DURATION_MS = (WORK_END_HOUR - WORK_START_HOUR) * 60 * 60 * 1000

    let current = new Date(date)

    // ถ้าเริ่มก่อน 8 โมง → ปรับเป็น 8 โมงเช้า
    if (current.getHours() < WORK_START_HOUR) {
      current.setHours(WORK_START_HOUR, 0, 0, 0)
    }
    // ถ้าเริ่มหลัง 5 โมงเย็น → ไปวันถัดไป 8 โมง
    else if (current.getHours() >= WORK_END_HOUR) {
      current.setDate(current.getDate() + 1)
      current.setHours(WORK_START_HOUR, 0, 0, 0)
    }

    const results = new Date(current)

    return results
  }
  return { adjustTimeForIndex, adjustToWorkingHours }
}
