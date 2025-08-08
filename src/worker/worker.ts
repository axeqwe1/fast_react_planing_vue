import type { Job } from '@/type/types'
import { formatTimeKey } from '@/utils/formatKey'

// worker.ts
self.onmessage = (e) => {
  const { jobs, timeIndexMaps, containerWidths } = e.data
  const results = jobs.map((job: Job) => {
    // คำนวณเหมือนใน getJobStyle
    let workHour = 8
    const BREAK_DURATION = 1 // ชั่วโมงพัก
    let timeIndexMap = timeIndexMaps
    const startDate = new Date(job.startDate)
    const endDate = new Date(job.endDate)
    //   const endDate = new Date(startDate.getTime()) // clone เพื่อไม่แก้ต้นฉบับ
    //   endDate.setHours(startDate.getHours() + workHour)

    // adjust hour and minute
    let startHour = Math.max(8, startDate.getHours())
    let startMinute = Math.floor(startDate.getMinutes() / 15) * 15
    if (startHour === 8 && startMinute === 0) startMinute = 0
    let endHour = Math.min(17, endDate.getHours())
    let endMinute = Math.floor(endDate.getMinutes() / 15) * 15
    if (endHour === 8 + workHour + BREAK_DURATION && endMinute > 0)
      endHour = 8 + workHour + BREAK_DURATION

    // ปรับเวลาให้ตรงกับช่วงเวลาที่มีใน timeIndexMap
    startDate.setHours(startHour, startMinute, 0, 0)
    endDate.setHours(endHour, endMinute, 0, 0)
    // determine key datetime

    const startKey = formatTimeKey(startDate)
    const endKey = formatTimeKey(endDate)

    if (!timeIndexMap.has(startKey) || !timeIndexMap.has(endKey)) {
      console.warn('Not found:', startKey, endKey)
      return { display: 'none' }
    }

    let startOffset = timeIndexMap.get(startKey)
    let endOffset = timeIndexMap.get(endKey)
    let totalUnit = timeIndexMap.size // ✅ Map ใช้ `.size` แทน `.length`
    if (startOffset === undefined || endOffset === undefined) {
      console.warn(`No time index found for keys: ${startKey}, ${endKey}`)
      return { display: 'none' }
    }

    // ปรับปรุงการหา containerWidth
    let containerElement = containerWidths
    let containerWidth = 1000 // default value

    if (containerElement) {
      containerWidth = containerElement.scrollWidth || containerElement.offsetWidth || 1000
    }

    // ถ้า containerWidth ยังเล็กเกินไป ให้ใช้ค่าที่เหมาะสม
    if (containerWidth < 500) {
      containerWidth = 1200 // หรือค่าที่เหมาะสมกับ UI ของคุณ
    }

    let unitWidth = containerWidth / totalUnit
    // วิธีการคำนวณ totalMinutes ที่ปรับปรุงแล้ว
    let totalMinutes = 0
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    let finalDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    while (currentDate <= finalDate) {
      let isStartDay = currentDate.toDateString() === startDate.toDateString()
      let isEndDay = currentDate.toDateString() === endDate.toDateString()

      let dayStart, dayEnd

      if (isStartDay && isEndDay) {
        // Same day
        dayStart = new Date(startDate)
        dayEnd = new Date(endDate)
      } else if (isStartDay) {
        // Start day
        dayStart = new Date(startDate)
        dayEnd = new Date(currentDate)
        dayEnd.setHours(17, 0, 0, 0)
      } else if (isEndDay) {
        // End day
        dayStart = new Date(currentDate)
        dayStart.setHours(8, 0, 0, 0)
        dayEnd = new Date(endDate)
      } else {
        // Middle day
        dayStart = new Date(currentDate)
        dayStart.setHours(8, 0, 0, 0)
        dayEnd = new Date(currentDate)
        dayEnd.setHours(17, 0, 0, 0)
      }

      // ตรวจสอบว่าอยู่ในช่วงเวลาทำงาน
      let workStart = new Date(currentDate)
      workStart.setHours(8, 0, 0, 0)
      let workEnd = new Date(currentDate)
      workEnd.setHours(17, 0, 0, 0)

      dayStart = new Date(Math.max(dayStart.getTime(), workStart.getTime()))
      dayEnd = new Date(Math.min(dayEnd.getTime(), workEnd.getTime()))

      if (dayStart < dayEnd) {
        let minutesInDay = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60)
        totalMinutes += minutesInDay
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Alternative method: ใช้ offset แทนการคำนวณ minutes
    let totalDurationUnits = Math.max(1, endOffset - startOffset + 1)

    // ใช้วิธีที่ให้ผลลพธ์มากกว่า
    let finalDurationUnits = Math.max(totalMinutes / 15, totalDurationUnits)

    let leftPos = startOffset * unitWidth
    let widthPos = finalDurationUnits * unitWidth
    return { style: { left: leftPos, width: widthPos } }
  })
  self.postMessage(results)
}
