import type { Job, Line, MasterData } from '@/type/types'
import { formatTimeKey } from '@/utils/formatKey'
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
    headerWidth: 0,
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
    getJobsForLine(line: string) {
      //   console.log(this.Jobs.filter((job) => job.line === line))
      return this.Jobs.filter((job) => job.line === line)
    },
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

      let left = startOffset * unitWidth
      let width = finalDurationUnits * unitWidth
      return {
        left: left + 'px',
        width: Math.max(width, 1.16) + 'px', // minimum width 10px
        backgroundColor: '#007bff',
        minWidth: '1.16px',
      }
    },
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

      return leftPosition - 42.72
    },
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
            for (let minute = 0; minute < 60; minute += 15) {
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
        this.cacheWeekDay.get(weekKey)?.find((d) => d.toDateString() === day.toDateString()) || day,
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
      const leftPosition = (endOffset - 36) * unitWidth

      return leftPosition
    },
  },
})
