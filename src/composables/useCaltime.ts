import { GetManualEffsLineCode, GetManualMpDataByLineCode } from '../lib/api/ManualEFFMP'
import { type ExpertEfficiency } from './../type/types'
import { useMaster } from '../stores/masterStore'
import { useScheduleStore } from '../stores/scheduleStore'
import type {
  Job,
  manualEff,
  manualMP,
  MasterData,
  MasterEfficiency,
  MasterLine,
  MasterType,
} from '../type/types'
import { formatDateLocal, formatTimeKey, normalizeDate } from '../utils/formatKey'
import { getShiftRange } from '../utils/utility'
import { ref } from 'vue'

export function useCaltime() {
  const STORE_MASTER = useMaster()
  const store = useScheduleStore()
  const manualEffCache = ref(new Map<string, any[]>())
  const manualMpCache = ref(new Map<string, any[]>())
  function getManualEffStyle() {
    STORE_MASTER.styleManualEFF = manualEffCache.value || []
  }
  function getManualMpStyle() {
    STORE_MASTER.styleManualMP = manualMpCache.value || []
  }
  function deleteCacheMPStyle(lineCode: string, id: any) {
    const arr = manualEffCache.value.get(lineCode)
    if (arr) {
      // filter array ใหม่ แล้ว set กลับไป Map
      manualEffCache.value.set(
        lineCode,
        arr.filter((item) => item.id !== id),
      )
    }
  }

  function deleteCacheEFFStyle(lineCode: string, id: any) {
    const arr = manualEffCache.value.get(lineCode)
    if (arr) {
      // filter array ใหม่ แล้ว set กลับไป Map
      manualEffCache.value.set(
        lineCode,
        arr.filter((item) => item.id !== id),
      )
    }
  }
  function computeManualStyle(lineCode: string) {
    const manualEffList = STORE_MASTER.manualEff.filter((m) => m.lineCode === lineCode)
    const manualMPList = STORE_MASTER.manualMPData.filter((m) => m.lineCode === lineCode)
    const stylesEff: any[] = []
    const stylesMp: any[] = []
    const timeIndexMap = store.timeIndexMap
    const totalUnits = timeIndexMap.size
    const containerWidth = document.querySelector('.week-header')?.scrollWidth || 1000
    const unitWidth = containerWidth / totalUnits

    manualEffList.forEach((eff) => {
      const start = new Date(eff.startDate)
      const end = new Date(eff.endDate)
      start.setDate(start.getDate() + 1)
      end.setDate(end.getDate() + 1)
      if (start.getHours() < 8) {
        start.setHours(8, 0, 0, 0)
      }
      if (start.getHours() > 16) {
        start.setHours(16, 0, 0, 0)
      }
      if (end.getHours() < 8) {
        end.setHours(16, 0, 0, 0)
      }
      if (end.getHours() > 16) {
        end.setHours(16, 0, 0, 0)
      }
      // start.setHours(16, 0, 0, 0)
      // end.setDate(end.getDate() + 1)
      // end.setHours(16, 0, 0, 0)

      // คำนวณ offset จาก map เดิม
      const startKey = formatTimeKey(start)
      const endKey = formatTimeKey(end)
      console.log(startKey, endKey)
      const startOffset = timeIndexMap.get(startKey) ?? 0
      const endOffset = timeIndexMap.get(endKey) ?? startOffset + 1
      console.log(startOffset, endOffset)
      const left = (startOffset + 1) * unitWidth - unitWidth * 8 * 60
      const width = (endOffset - startOffset) * unitWidth

      stylesEff.push({
        id: eff.id,
        text: `${eff.effPct ?? ''}%`, // 🟡 เพิ่มข้อมูล text ที่อยากโชว์
        left: `${left}px`,
        width: `${width}px`,
        background: 'rgba(255, 193, 7, 0.1)', // เหลืองโปร่งใส
        position: 'absolute',
        bottom: '0',
        height: '50%',
        border: '1px solid #ffa000',
      })
    })
    manualMPList.forEach((eff) => {
      const start = new Date(eff.startDate)
      const end = new Date(eff.endDate)
      start.setHours(16, 0, 0, 0)
      end.setHours(16, 0, 0, 0)

      // คำนวณ offset จาก map เดิม
      const startKey = formatTimeKey(start)
      const endKey = formatTimeKey(end)
      console.log(startKey, endKey)
      const startOffset = timeIndexMap.get(startKey) ?? 0
      const endOffset = timeIndexMap.get(endKey) ?? startOffset + 1
      console.log(startOffset, endOffset)
      const left = (startOffset + 1) * unitWidth - unitWidth * 8 * 60
      const width = (endOffset - startOffset) * unitWidth

      stylesMp.push({
        id: eff.id,
        text: `${eff.capMP ?? ''}`, // 🟡 เพิ่มข้อมูล text ที่อยากโชว์
        left: `${left}px`,
        width: `${width}px`,
        background: 'rgba(11, 130, 111, 0.1)', // เหลืองโปร่งใส
        position: 'absolute',
        top: '0',
        height: '50%',
        border: '1px solid rgba(11, 130, 111)',
      })
    })

    manualEffCache.value.set(lineCode, stylesEff)
    manualMpCache.value.set(lineCode, stylesMp)
  }
  function calTime(start: Date, orderNo: string, color: string, lineCode: string, sewId?: number) {
    const Line = STORE_MASTER.masterLine.filter((item) => item.lineCode === lineCode)[0]
    let ManualMP: manualMP[] = STORE_MASTER.manualMPData.filter(
      (item) => item.lineCode === lineCode,
    )
    let ManualEff: manualEff[] = STORE_MASTER.manualEff.filter((item) => item.lineCode === lineCode)

    const planJob =
      sewId == null
        ? STORE_MASTER.planJob.filter((item) => item.orderNo == orderNo && item.color == color)[0]
        : STORE_MASTER.planJob.filter((item) => item.sewId == sewId)[0]

    let endDate = new Date()
    console.log(planJob)
    const type = STORE_MASTER.masterType.find((item) => item.typeCode === planJob.typeCode)

    const expertEfficiency = STORE_MASTER.expertType.find(
      (item) => item.lineCode === lineCode && item.typeCode === type?.typeCode,
    )
    console.log(expertEfficiency)
    const Sam = planJob.sam
    const Manpower = Line.capacityMP
    const Efficiency = expertEfficiency
      ? expertEfficiency.effPct
      : (STORE_MASTER.masterEfficiency.find((item) => item.lineCode === Line.lineCode)
          ?.efficiencyPct ?? 0)
    console.log(sewId)
    const qty =
      planJob.processStatus == 1
        ? planJob.qtyBal
        : planJob.splitQty
          ? planJob.splitQty
          : planJob.qty
    const order = orderNo
    const MINUTE_PER_HOUR = 60

    console.table({
      Manpower,
      Efficiency: Efficiency,
      Sam,
      Quantity: qty,
      order,
    })

    const startDate = new Date(start)
    let currentDate = new Date(startDate)

    let remainMinute = qty * Sam
    let safety = 0
    // ✅ เก็บ DECIMAL ไม่ round
    let CUMULATIVE_QTY = 0

    while (remainMinute > 0) {
      safety++
      if (safety == 2000) {
        break
      }
      const shiftStart = '08:00:00'
      let foundEff: manualEff | undefined
      let foundMP: manualMP | undefined
      if (ManualEff && ManualEff.length > 0) {
        console.log('--- ManualEff Loop ---')
        for (const item of ManualEff) {
          const cond =
            normalizeDate(currentDate) >= normalizeDate(new Date(item.startDate)) &&
            normalizeDate(currentDate) <= normalizeDate(new Date(item.endDate))
          console.log(
            `Check Eff: current=${normalizeDate(currentDate)} <= end=${normalizeDate(new Date(item.endDate))} → ${cond}`,
            item,
          )
          if (cond) {
            foundEff = item
            console.log('✅ Found EFF item:', item)
            break
          }
        }
      }

      if (ManualMP && ManualMP.length > 0) {
        console.log('--- ManualMP Loop ---')
        for (const item of ManualMP) {
          const cond =
            normalizeDate(currentDate) >= normalizeDate(new Date(item.startDate)) &&
            normalizeDate(currentDate) <= normalizeDate(new Date(item.endDate))
          console.log(
            `Check MP: current=${normalizeDate(currentDate)} <= end=${normalizeDate(new Date(item.endDate))} → ${cond}`,
            item,
          )
          if (cond) {
            foundMP = item
            console.log('✅ Found MP item:', item)
            break
          }
        }
      }

      const EFF = foundEff?.effPct ?? Efficiency
      const MP = foundMP?.capMP ?? Manpower

      let defaultWorkHour = 8
      let isWorkDay = true
      const WorkDay = STORE_MASTER.masterWorkDay.filter((item) => {
        return (
          formatDateLocal(new Date(item.workDate)).split(' ')[0] ==
          formatDateLocal(currentDate).split(' ')[0]
        )
      })[0]

      if (WorkDay) {
        defaultWorkHour = WorkDay.workHours
        isWorkDay = WorkDay.isWorkday
      } else {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek === 0) {
          defaultWorkHour = 0
          isWorkDay = false
        } else {
          defaultWorkHour = 8
          isWorkDay = true
        }
      }

      const workMinute = defaultWorkHour * MINUTE_PER_HOUR
      let LastEndDateTime = currentDate
      if (workMinute <= 0 && !isWorkDay) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
      let actualStart
      const shift = getShiftRange(currentDate, shiftStart, workMinute)

      if (remainMinute > 0 && currentDate.toDateString() !== startDate.toDateString()) {
        LastEndDateTime = shift.start
      }

      if (LastEndDateTime.getTime() > shift.start.getTime()) {
        actualStart = LastEndDateTime
      } else {
        actualStart = shift.start
      }

      if (actualStart >= shift.end) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      const avaliableMinutes = (shift.end.getTime() - actualStart.getTime()) / 60000

      let AllocatedWorkMin = 0
      const MP_EFF_FACTOR = MP * (EFF / 100)
      const CAP_MIN_TODAY = avaliableMinutes * MP_EFF_FACTOR

      if (remainMinute < CAP_MIN_TODAY) {
        AllocatedWorkMin = remainMinute
      } else {
        AllocatedWorkMin = CAP_MIN_TODAY
      }

      let actualEnd: Date
      if (AllocatedWorkMin === CAP_MIN_TODAY) {
        actualEnd = shift.end
      } else {
        const CLOCK_MIN_USED = MP_EFF_FACTOR > 0 ? AllocatedWorkMin / MP_EFF_FACTOR : 0
        actualEnd = new Date(actualStart)
        actualEnd.setMinutes(actualEnd.getMinutes() + CLOCK_MIN_USED)
      }

      remainMinute = remainMinute - AllocatedWorkMin
      LastEndDateTime = actualEnd

      // ✅ สะสม DECIMAL ไม่ round
      const producedQty = AllocatedWorkMin / Sam
      CUMULATIVE_QTY += producedQty

      console.table({
        date: formatDateLocal(currentDate),
        remainMinute: remainMinute.toFixed(2),
        CAP_MIN_TODAY: CAP_MIN_TODAY.toFixed(2),
        AllocatedWorkMin: AllocatedWorkMin.toFixed(2),
        producedQty: producedQty.toFixed(4),
        CUMULATIVE_QTY: CUMULATIVE_QTY.toFixed(4),
      })

      endDate = LastEndDateTime
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // ✅ Round เพียงครั้งเดียวตอนท้าย
    console.log(`=== FINAL RESULT ===`)
    console.log(`CUMULATIVE_QTY (decimal): ${CUMULATIVE_QTY.toFixed(4)}`)
    console.log(`CUMULATIVE_QTY (rounded): ${Math.round(CUMULATIVE_QTY)}`)
    console.log(`Expected qty: ${qty}`)
    console.log(`End Date: ${endDate}`)

    return endDate
  }

  function strip(startDate: Date, Job: Job[], lineCode: string) {
    let pivotStart = startDate
    let strip: Job[] = []

    const findIndex = Job.findIndex((job) => Math.min(new Date(job.startDate).getTime()))
    console.log('findIndex', findIndex)
    Job.sort((a, b) =>
      Math.min(new Date(a.startDate).getTime() - Math.min(new Date(b.startDate).getTime())),
    ).forEach((job, index) => {
      console.log('-----------------')
      console.log('INDEX : ', index)
      if (index === 0) {
        job.startDate = formatTimeKey(pivotStart)
        job.endDate = formatTimeKey(calTime(pivotStart, job.name, job.color, lineCode, job.sewId))
      } else {
        job.startDate = formatTimeKey(new Date(Job[index - 1].endDate))
        job.endDate = formatTimeKey(
          calTime(new Date(Job[index - 1].endDate), job.name, job.color, lineCode, job.sewId),
        )
      }
      strip.push(job)
    })
    strip.forEach((job, index) => {
      store.insertAndPushJobs(lineCode, new Date(job.startDate), job.id)
      // store.moveAndShift(lineCode, job.id, job.startDate, job.endDate)

      store.jobStyleCache.set(job.id, store.getJobStyle(job))
    })
    console.log(strip)
  }

  function getQtyDoneByDay(date: Date, factory: string) {
    const masterLine = STORE_MASTER.masterLine
    const factoryList = STORE_MASTER.masterFactory
    let totalDone = 0
    const pivotStart = new Date(date)
    pivotStart.setHours(8, 0, 0, 0)
    const pivotEnd = new Date(date)
    pivotEnd.setHours(16, 0, 0, 0)

    masterLine
      .filter((item) => item.factoryCode == factory)
      .forEach((line) => {
        const jobs = store.getJobsForLine(line.lineCode)

        let ManualMP: manualMP[] = STORE_MASTER.manualMPData.filter(
          (item) => item.lineCode === line.lineCode,
        )
        let ManualEff: manualEff[] = STORE_MASTER.manualEff.filter(
          (item) => item.lineCode === line.lineCode,
        )

        const filter = jobs.filter((job) => {
          const jobStart = new Date(job.startDate)
          const jobEnd = new Date(job.endDate)
          return (
            (jobStart.getTime() >= pivotStart.getTime() &&
              jobStart.getTime() <= pivotEnd.getTime()) ||
            (jobEnd.getTime() >= pivotStart.getTime() && jobEnd.getTime() <= pivotEnd.getTime()) ||
            (jobStart.getTime() <= pivotStart.getTime() && jobEnd.getTime() >= pivotEnd.getTime())
          )
        })

        filter
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .forEach((job, index) => {
            let foundEff: manualEff | undefined
            let foundMP: manualMP | undefined
            if (ManualEff && ManualEff.length > 0) {
              console.log('--- ManualEff Loop ---')
              for (const item of ManualEff) {
                const cond =
                  normalizeDate(pivotStart) >= normalizeDate(new Date(item.startDate)) &&
                  normalizeDate(pivotEnd) <= normalizeDate(new Date(item.endDate))
                if (cond) {
                  foundEff = item
                  console.log('✅ Found EFF item:', item)
                  break
                }
              }
            }

            if (ManualMP && ManualMP.length > 0) {
              console.log('--- ManualMP Loop ---')
              for (const item of ManualMP) {
                const cond =
                  normalizeDate(pivotStart) >= normalizeDate(new Date(item.startDate)) &&
                  normalizeDate(pivotEnd) <= normalizeDate(new Date(item.endDate))
                if (cond) {
                  foundMP = item
                  console.log('✅ Found MP item:', item)
                  break
                }
              }
            }
            const type = STORE_MASTER.masterType.find((item) => item.typeCode === job.typeCode)
            const expertEfficiency = STORE_MASTER.expertType.find(
              (item) => item.lineCode === line.lineCode && item.typeCode === type?.typeCode,
            )
            const Manpower = line.capacityMP
            const Efficiency = expertEfficiency
              ? expertEfficiency.effPct
              : (STORE_MASTER.masterEfficiency.find((item) => item.lineCode === line.lineCode)
                  ?.efficiencyPct ?? 0)

            const EFF = foundEff?.effPct ?? Efficiency
            const MP = foundMP?.capMP ?? Manpower

            const planJob = STORE_MASTER.planJob.find((p) => p.sewId === job.sewId)
            if (planJob) {
              const sam = planJob.sam
              const jobStart = new Date(job.startDate)
              const jobEnd = new Date(job.endDate)

              let overlapStart: Date, overlapEnd: Date
              if (index == 0) {
                overlapStart = jobStart < pivotStart ? pivotStart : jobStart
              } else {
                overlapStart =
                  jobStart < new Date(filter[index - 1].endDate)
                    ? new Date(filter[index - 1].endDate)
                    : jobStart
              }
              overlapEnd = jobEnd > pivotEnd ? pivotEnd : jobEnd

              const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / 60000
              const MP_EFF_FACTOR = MP * (EFF / 100)
              const CAP_MIN_TODAY = overlapMinutes * MP_EFF_FACTOR
              const producedQty = CAP_MIN_TODAY / sam
              totalDone += producedQty
            }
          })
      })
    return totalDone
  }

  function CacheDayOfWeek(week: { start: Date; end: Date }[]) {
    const days: Date[] = []

    week.forEach((WD) => {
      const startDate = new Date(WD.start)
      const endDate = new Date(WD.end)

      const current = startDate
      while (current <= endDate) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
    })
    return days
  }
  return {
    calTime,
    getManualEffStyle,
    getManualMpStyle,
    computeManualStyle,
    strip,
    getQtyDoneByDay,
    CacheDayOfWeek,
    deleteCacheMPStyle,
    deleteCacheEFFStyle,
  }
}
