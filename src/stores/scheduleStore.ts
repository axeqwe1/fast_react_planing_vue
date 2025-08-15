import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'
import type { Job, Line, MasterData } from '@/type/types'
import { isSameDay } from '@/utils/detectDropMode'
import { formatTimeKey } from '@/utils/formatKey'
import { get } from 'lodash'
import { time } from 'motion-v'
import { defineStore } from 'pinia'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    Lines: [] as Line[],
    Jobs: [] as Job[],
    Masters: [] as MasterData[],
    jobStyle: {
      left: '0px',
      top: '0px',
    } as Partial<CSSStyleDeclaration>,
    weeks: [] as { start: Date; end: Date }[],
    timeIndexMap: new Map<string, number>(),
    WorkDuration: new Map<string, number>(), // ใช้สำหรับเก็บข้อมูลการทำงาน
    cacheWeekDay: new Map<string, Date[]>(), // ใช้สำหรับเก็บวันในแต่ละสัปดาห์
    jobStyleCache: new Map<number, Partial<CSSStyleDeclaration>>(), // cache job styles
    divideCache: [] as number[], // cache divide styles
    headerWidth: 0,
    holidays: [] as Date[], // วันหยุดทั้งหมด
    workHours: { start: '08:00', end: '17:00' }, // ชั่วโมงทำงาน
    minWidthHeader: 300,
  }),
  actions: {
    setLine(line: Line[]) {
      this.Lines = line
    },
    setJobs(jobs: Job[]) {
      this.Jobs = jobs
    },
    setMasters(masters: MasterData[]) {
      this.Masters = masters
    },
    setWeeks(weeks: { start: Date; end: Date }[]) {
      this.weeks = weeks
    },

    computeDivideStyle() {
      this.divideCache = []
      this.weeks.forEach((week) => {
        const style = this.getDevideStyle(week.end)
        this.divideCache.push(style)
      })
      console.log(this.getDivideCache(), 'divide cache computed')
    },

    computeAllJobStyles() {
      this.Jobs.forEach((job) => {
        this.jobStyleCache.set(job.id, this.getJobStyle(job))
      })
      console.log('Computed')
    },

    getJobStyleFromCache(job: Job) {
      return this.jobStyleCache.get(job.id) || {}
    },

    getDivideCache() {
      return this.divideCache
    },

    getJobsForLine(line: string) {
      //   console.log(this.Jobs.filter((job) => job.line === line))
      return this.Jobs.filter((job) => job.line === line)
    },
    // determine style for job bar
    getJobStyle(job: Job) {
      let workHour = 8
      const BREAK_DURATION = 1 // ชั่วโมงพัก
      let timeIndexMap = this.timeIndexMap
      const startDate = new Date(job.startDate)
      const endDate = new Date(job.endDate)
      //   const endDate = new Date(startDate.getTime()) // clone เพื่อไม่แก้ต้นฉบับ
      //   endDate.setHours(startDate.getHours() + workHour)

      // adjust hour and minute
      let startHour = Math.max(8, startDate.getHours())
      // let startMinute = Math.floor(startDate.getMinutes() / 1) * 1
      let startMinute = Math.floor(startDate.getMinutes())
      if (startHour === 8 && startMinute === 0) startMinute = 0
      let endHour = Math.min(17, endDate.getHours())
      let endMinute = Math.floor(endDate.getMinutes())
      if (endHour === 8 + workHour + BREAK_DURATION && endMinute > 0)
        endHour = 8 + workHour + BREAK_DURATION

      // ปรับเวลาให้ตรงกับช่วงเวลาที่มีใน timeIndexMap
      startDate.setHours(startHour, startMinute, 0, 0)
      endDate.setHours(endHour, endMinute, 0, 0)
      // determine key datetime

      const startKey = formatTimeKey(startDate)
      const endKey = formatTimeKey(endDate)

      if (!timeIndexMap.has(startKey) || !timeIndexMap.has(endKey)) {
        // console.warn('Not found:', startKey, endKey)
        return { display: 'none' }
      }

      let startOffset = timeIndexMap.get(startKey)
      let endOffset = timeIndexMap.get(endKey)
      let totalUnit = timeIndexMap.size // ✅ Map ใช้ `.size` แทน `.length`
      if (startOffset === undefined || endOffset === undefined) {
        // console.warn(`No time index found for keys: ${startKey}, ${endKey}`)
        return { display: 'none' }
      }

      // ปรับปรุงการหา containerWidth
      let containerElement = (document.querySelector('.week-header') as HTMLElement) || null
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
        let isStartDay = currentDate.toISOString() === startDate.toISOString()
        let isEndDay = currentDate.toISOString() === endDate.toISOString()

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
      let finalDurationUnits = Math.max(totalMinutes / 1, totalDurationUnits)

      let left = startOffset * unitWidth
      // let width = finalDurationUnits * unitWidth // 15 min
      const width = (endOffset - startOffset + 1) * unitWidth // 1 min
      return {
        left: left + 'px',
        width: Math.max(width, 1.16) + 'px', // minimum width 10px
        backgroundColor: '#007bff',
        minWidth: '1.16px',
      }
    },
    //determine style to divide line
    getDevideStyle(endDate: Date) {
      const END_DATE = new Date(endDate)
      // แก้เวลาเป็นเวลาเลิกงาน (เช่น 17:00)
      END_DATE.setHours(17, 0, 0, 0)

      const datePart = END_DATE.toISOString().split('T')[0]
      const timePart = END_DATE.toTimeString().split(' ')[0].substring(0, 5) // "HH:mm:00"
      const key = `${datePart} ${timePart}`

      const timeIndexMap = this.timeIndexMap.get(key)

      let endOffset = timeIndexMap
      if (timeIndexMap === undefined || endOffset == undefined) {
        console.warn(`No time index found for key: ${key}`)
        endOffset = 0 // Default to 0 if not found
      }
      const totalUnits = this.timeIndexMap.size // ✅ Map ใช้ `.size` แทน `.length`
      let containerWidth = document.querySelector('.week-header')?.scrollWidth || 1000

      const unitWidth = containerWidth / totalUnits

      const leftPosition = (endOffset + 1) * unitWidth

      return leftPosition
    },
    // Important create timeindex
    getDayIndex(workHour: number) {
      const timeIndexMap = new Map<string, number>()
      let totalUnits = 0
      const BREAK_DURATION = 1
      let actWorkHour = workHour || 8

      console.log(this.weeks.length, 'weeks length', this.weeks)
      this.weeks.forEach((week, index) => {
        let current = new Date(week.start)
        let end = new Date(week.end)

        const startHour = 8
        const endHour = startHour + BREAK_DURATION + actWorkHour

        while (current <= end) {
          let dateKey = current.toISOString().split('T')[0]

          for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 1) {
              if (hour === 17 && minute > 0) break
              let timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
              let key = `${dateKey} ${timeKey}`

              if (!timeIndexMap.has(key)) {
                timeIndexMap.set(key, totalUnits++)
              }
            }
          }
          current.setDate(current.getDate() + 1)
        }
        this.timeIndexMap = timeIndexMap
      })
    },
    cacheWorkDuration() {
      const WORK_HOUR = 8
      this.weeks.forEach((week) => {
        const weekKey = formatTimeKey(week.start)
        let date = []
        for (let d = new Date(week.start); d <= week.end; d.setDate(d.getDate() + 1)) {
          // console.log(weekKey, new Date(d))
          d.setHours(0, 0, 0, 0) // Set time to midnight for consistency
          date.push(new Date(d))
        }
        this.cacheWeekDay.set(weekKey, date)
        this.Lines.forEach((line) => {
          for (let i = 0; i <= this.cacheWeekDay.size; i++) {
            this.WorkDuration.set(`${weekKey}${line.name}`, WORK_HOUR)
          }
        })
        // console.log(
        //   `Work duration cached for week starting ${week.start.toISOString()}:`,
        //   this.cacheWeekDay,
        // )
        // End statement
      })
    },
    getDayDuration(day: Date, line: string) {
      const dateKey = new Date(day).toISOString()
      return 8
    },
    getDurationStyle(weekKey: string, day: Date) {
      const endDate = new Date(
        this.cacheWeekDay.get(weekKey)?.find((d) => d.toISOString() === day.toISOString()) || day,
      )

      endDate.setHours(17, 0, 0, 0)
      const key = formatTimeKey(endDate)

      const timeIndexMap = this.timeIndexMap
      let endOffset = timeIndexMap.get(key)
      if (endOffset === undefined) {
        endOffset = 0 // Default to 0 if not found
      }
      const totalUnits = timeIndexMap.size // ✅ Map ใช้ `.size` แทน `.length`

      let containerWidth = document.querySelector('.week-header')?.scrollWidth || 1000
      const unitWidth = containerWidth / totalUnits
      const leftPosition = endOffset * unitWidth

      return leftPosition
    },

    moveJob(
      jobId: number,
      targetLineId: string,
      container: HTMLElement,
      e: MouseEvent,
      newStart: Date,
      dropMode: string,
    ) {
      let job = findJobById(jobId)
      if (!job) return

      // 1. ปรับวันหยุดถ้า mode = skip หรือ newStart ตกวันหยุด
      if (dropMode === 'skip' || this.isHoliday(newStart)) {
        newStart = this.getNextWorkingDay(newStart)
      }

      let duration = this.getDuration(job.startDate, job.endDate)
      let newEnd = this.addTime(newStart, duration)
      switch (dropMode) {
        case 'insert':
          this.insertAndPushJobs(targetLineId, container, e, newStart, newEnd, jobId)
          break
        case 'merge':
          this.pushJobForward(targetLineId, container, e, newStart, newEnd, jobId)
          break
        case 'normal':
        default:
          this.updateJob(jobId, targetLineId, formatTimeKey(newStart), formatTimeKey(newEnd))
          break
      }
      this.computeAllJobStyles()
    },
    insertAndPushJobs(
      lineId: string,
      container: HTMLElement,
      e: MouseEvent,
      start: Date,
      end: Date,
      movingJobId: number,
    ) {
      const { adjustTimeForIndex, adjustToWorkingHours } = useTime()
      const { getRelativeX, getInsertIndexInLine } = useMouseEvent()
      // update job ที่ลากมาก่อน
      const startAdj = adjustToWorkingHours(start)
      const endAdj = adjustToWorkingHours(end)

      // ปรับเวลาให้ตรงกับช่วงเวลาที่มีใน timeIndexMap
      let startDate = formatTimeKey(startAdj)
      let endDate = formatTimeKey(endAdj)
      // this.updateJob(movingJobId, lineId, startDate, endDate)
      const index = getInsertIndexInLine(container, e)
      const timeKey = [...this.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]
      if (!timeKey) return
      console.log(timeKey, 'timeIndex compare start', startDate, 'end', endDate)

      const newStart = new Date(timeKey)
      const dur = this.getDuration(newStart, endDate)
      const newEnd = new Date(newStart.getTime() + dur)

      console.log(newStart, newEnd)
      // chain push
      let jobinLine = this.Jobs.filter((j) => j.line === lineId && j.id !== movingJobId).sort(
        (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime(),
      )

      this.updateJob(movingJobId, lineId, startDate, endDate)

      this.moveAndShift(lineId, movingJobId, startDate, endDate)
    },
    moveAndShift(lineId: string, movingJobId: number, pivotStart: string, pivotEnd: string) {
      let pivotStartDate = toDate(pivotStart)
      let pivotEndDate = toDate(pivotEnd)

      const jobs = this.getJobsForLine(lineId).sort(
        (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime(),
      )

      // Check Left
      const jobLeft = jobs.filter(
        (j) => toDate(j.startDate) < pivotStartDate && j.id !== movingJobId,
      )
      // console.log('jobLeft', jobLeft, 'pivotStartDate', pivotStartDate)
      for (let j of jobLeft) {
        const jobStart = toDate(j.startDate)
        const jobEnd = toDate(j.endDate)
        if (jobEnd > pivotStartDate) {
          // ถ้า job นั้นชนกับ job ที่กำลังลาก
          const duration = this.getDuration(pivotStartDate, pivotEndDate)
          const newStart = new Date(j.endDate)
          const newEnd = this.addTime(newStart, duration)
          pivotStartDate = newStart // อัปเดต pivotStartDate เพื่อไม่ให้ชนกันอีก
          pivotEndDate = newEnd // อัปเดต pivotEndDate เพื่อไม่ให้ชนกันอีก
          this.updateJob(movingJobId, lineId, formatTimeKey(newStart), formatTimeKey(newEnd))
        }
      }
      // Check Right
      const jobRight = jobs.filter(
        (j) => toDate(j.startDate) >= pivotStartDate && j.id !== movingJobId,
      )
      // 1) Chain push ทางขวา
      for (let job of jobRight) {
        const jobStart = toDate(job.startDate)
        const jobEnd = toDate(job.endDate)

        if (jobStart < pivotEndDate) {
          // มีการชน
          const offset = pivotEndDate.getTime() - jobStart.getTime()
          console.log('Offset:', offset, 'Job Start:', jobStart, 'Pivot End:', pivotEndDate)
          if (offset > 0) {
            const newStart = new Date(jobStart.getTime() + offset)
            const newEnd = this.addTime(newStart, this.getDuration(job.startDate, job.endDate))
            this.updateJob(job.id, lineId, formatTimeKey(newStart), formatTimeKey(newEnd))

            // อัปเดต pivot เป็น job ที่เพิ่งเลื่อน
            pivotStartDate = newStart
            pivotEndDate = newEnd
          }
        }
      }
    },
    pushJobForward(
      lineId: string,
      container: HTMLElement,
      e: MouseEvent,
      start: Date,
      end: Date,
      movingJobId: number,
    ) {
      const { adjustTimeForIndex, adjustToWorkingHours } = useTime()
      const { getRelativeX, getInsertIndexInLine } = useMouseEvent()
      // update job ที่ลากมาก่อน
      const startAdj = adjustToWorkingHours(start)
      const endAdj = adjustToWorkingHours(end)

      // ปรับเวลาให้ตรงกับช่วงเวลาที่มีใน timeIndexMap
      let startDate = formatTimeKey(startAdj)
      let endDate = formatTimeKey(endAdj)
      // this.updateJob(movingJobId, lineId, startDate, endDate)
      const index = getInsertIndexInLine(container, e)
      const timeKey = [...this.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]
      if (!timeKey) return
      console.log(timeKey, 'timeIndex compare start', startDate, 'end', endDate)

      const newStart = new Date(timeKey)
      const dur = this.getDuration(newStart, endDate)
      const newEnd = new Date(newStart.getTime() + dur)

      console.log(newStart, newEnd)

      this.updateJob(movingJobId, lineId, formatTimeKey(newStart), formatTimeKey(newEnd))

      this.moveAndShift(lineId, movingJobId, formatTimeKey(newStart), formatTimeKey(newEnd))
    },
    // Helper Functuion
    isHoliday(date: Date): boolean {
      return this.holidays.some((h) => isSameDay(h, date))
    },
    getNextWorkingDay(date: Date) {
      let next = addDays(date, 1)
      console.log('getNextWorkingDay called with:', date, 'next:', next)
      while (this.isHoliday(next)) {
        next = addDays(next, 1)
      }
      return setTime(next, this.workHours.start) // เริ่มทำงานตอนเช้า
    },
    updateJob(jobId: string | number, lineId: string, start: string, end: string) {
      let job = findJobById(jobId)
      job.line = lineId
      job.startDate = start
      job.endDate = end

      console.log(job, 'job updated in store')
    },

    getDuration(start: Date | string, end: Date | string): number {
      const startDate = toDate(start)
      const endDate = toDate(end)

      const duration = new Date(endDate.getTime() - startDate.getTime()).getTime()

      return duration
    },

    addTime(start: Date, duration: number): Date {
      const newEnd = new Date(start.getTime() + duration) // duration in minutes
      if (newEnd.getHours() > 17 || (newEnd.getHours() === 17 && newEnd.getMinutes() > 0)) {
        newEnd.setDate(newEnd.getDate() + 1) // ถ้าเลยเวลาเลิกงาน ให้ข้ามไปวันถัดไป
        newEnd.setHours(8, 0, 0, 0) // ตั้งเวลาเริ่มงานใหม่เป็น 08:00
      } else if (newEnd.getHours() < 8 || (newEnd.getHours() === 8 && newEnd.getMinutes() > 0)) {
        newEnd.setHours(8, 0, 0, 0) // ตั้งเวลาเริ่มงานใหม่เป็น 08:00
      }
      return newEnd
    },
  },
})

function findJobById(jobId: string | number): Job {
  const store = useScheduleStore()
  return store.Jobs.filter((job) => job.id === jobId)[0]
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

function setTime(date: Date | string, day: string): Date {
  const [hour, minute] = day.split(':').map(Number)
  const newDate = new Date(date)
  newDate.setHours(hour, minute, 0, 0)
  return newDate
}

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}
