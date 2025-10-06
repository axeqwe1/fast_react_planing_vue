import { GetManualEffsLineCode, GetManualMpDataByLineCode } from '@/lib/api/ManualEFFMP'
import { type ExpertEfficiency } from './../type/types'
import { useMaster } from '@/stores/masterStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import type { Job, manualEff, manualMP } from '@/type/types'
import { formatDateLocal, formatTimeKey } from '@/utils/formatKey'
import { getShiftRange } from '@/utils/utility'

export function useCaltime() {
  const STORE_MASTER = useMaster()
  const store = useScheduleStore()
  function calTime(start: Date, orderNo: string, color: string, lineCode: string, sewId?: number) {
    // param startDate orderNo color lineCode

    const Line = STORE_MASTER.masterLine.filter((item) => item.lineCode === lineCode)[0]
    let ManualMP: manualMP[] = STORE_MASTER.manualMPData.filter(
      (item) => item.lineCode === lineCode,
    )
    let ManualEff: manualEff[] = STORE_MASTER.manualEff.filter((item) => item.lineCode === lineCode)

    const planJob =
      sewId == null
        ? STORE_MASTER.planJob.filter((item) => item.orderNo == orderNo && item.color == color)[0]
        : STORE_MASTER.planJob.filter(
            (item) => item.orderNo == orderNo && item.color == color && item.sewId == sewId,
          )[0]

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
    const qty = planJob.splitQty ? planJob.splitQty : planJob.qty
    const order = orderNo
    const MINUTE_PER_HOUR = 60

    // Efficiency is Percent
    console.table({
      Manpower,
      Efficiency: Efficiency,
      Sam,
      Quantity: qty,
      order,
    })

    const startDate = new Date(start)
    let currentDate = new Date(startDate) // ใช้ clone

    let remainMinute = qty * Sam
    let safety = 0
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
          const cond = normalizeDate(currentDate) <= normalizeDate(new Date(item.endDate))
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
          const cond = normalizeDate(currentDate) <= normalizeDate(new Date(item.endDate))
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

      console.table({
        ManualMP: ManualMP,
        ManualEff: ManualEff,
        Manpower: MP,
        Efficiency: EFF,
      })
      // const timeStart = startDate.toISOString().split('T')[1].split('.')[0]
      // console.log(timeStart)
      let defaultWorkHour = 8
      let isWorkDay = true
      const WorkDay = STORE_MASTER.masterWorkDay.filter((item) => {
        return (
          formatDateLocal(new Date(item.workDate)).split(' ')[0] ==
          formatDateLocal(currentDate).split(' ')[0]
        )
      })[0]
      // console.log(
      //   STORE_MASTER.masterWorkDay.filter((item) => {
      //     // console.log(formatDateLocal(currentDate).split(' ')[0])
      //     return (
      //       formatDateLocal(new Date(item.workDate)).split(' ')[0] ==
      //       formatDateLocal(currentDate).split(' ')[0]
      //     )
      //   }),
      // )
      if (WorkDay) {
        // console.log(formatDateLocal(new Date(WorkDay.workDate)), formatDateLocal(currentDate))
        // console.warn('found workday', currentDate, WorkDay.workHours, WorkDay.isWorkday)
        defaultWorkHour = WorkDay.workHours
        isWorkDay = WorkDay.isWorkday
      } else {
        const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, ... 6 = Saturday
        if (dayOfWeek === 0) {
          defaultWorkHour = 0
          isWorkDay = false
        } else {
          defaultWorkHour = 8
          isWorkDay = true
        }
      }
      //   const WorkDate = WorkDay.workDate
      //   const WorkHour = WorkDay.workHours
      //   const isWorkDay = WorkDay.isWorkday

      //   const totalMin = Manpower * WorkHour * MINUTE_PER_HOUR
      //   const totalSam = totalMin / Sam
      //   const sumTotal = totalSam * (Efficiency / 100)
      //   const targetQty = qty / sumTotal

      //   console.log(Math.ceil(sumTotal * 1000) / 1000) // ปัดเป็น 2 ทศนิยม
      //   console.log(targetQty)

      //   if (isWork == null) {
      //     isWork = false
      //   }
      const workMinute = defaultWorkHour * MINUTE_PER_HOUR
      let LastEndDateTime = currentDate
      if (workMinute <= 0 && !isWorkDay) {
        // console.warn('Not found', WorkDay.workDate)
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
      let actualStart
      const shift = getShiftRange(currentDate, shiftStart, workMinute)
      //   console.log('Compare Time', currentDate, ' ', shift.start, ' ', LastEndDateTime)

      // ถ้าวันใหม่ต้อง reset กลับไป shift.start
      if (remainMinute > 0 && currentDate.toDateString() !== startDate.toDateString()) {
        LastEndDateTime = shift.start
        // console.warn('is change')
      }

      if (LastEndDateTime.getTime() > shift.start.getTime()) {
        actualStart = LastEndDateTime
      } else {
        actualStart = shift.start
        // console.warn('is shift')
      }

      if (actualStart >= shift.end) {
        // ข้ามไปวันถัดไป
        // console.warn('Jump Day')
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      const avaliableMinutes = (shift.end.getTime() - actualStart.getTime()) / 60000
      //   console.log(avaliableMinutes)

      let AllocatedWorkMin = 0
      const MP_EFF_FACTOR = MP * (EFF / 100)
      const CAP_MIN_TODAY = avaliableMinutes * MP_EFF_FACTOR
      //   console.log(CAP_MIN_TODAY)

      if (remainMinute < CAP_MIN_TODAY) {
        AllocatedWorkMin = remainMinute
      } else {
        AllocatedWorkMin = CAP_MIN_TODAY
      }

      // Actual End
      let actualEnd: Date
      if (AllocatedWorkMin === CAP_MIN_TODAY) {
        // ถ้าเต็มวัน → จบตรงเวลาเลิกงานพอดี
        actualEnd = shift.end
        // console.warn('shift end')
      } else {
        // ถ้าไม่เต็มวัน → คำนวณตามนาทีจริง
        const CLOCK_MIN_USED = MP_EFF_FACTOR > 0 ? AllocatedWorkMin / MP_EFF_FACTOR : 0
        actualEnd = new Date(actualStart)
        actualEnd.setMinutes(actualEnd.getMinutes() + CLOCK_MIN_USED)
      }

      // set RemaningMinute
      remainMinute = remainMinute - AllocatedWorkMin
      LastEndDateTime = actualEnd

      const producedQty = AllocatedWorkMin / Sam

      CUMULATIVE_QTY += Math.round(AllocatedWorkMin / Sam)
      const QtyRemainAfterThisDay = Math.round(qty - CUMULATIVE_QTY)
      // console.log('Actual START IS : ', actualStart)
      // console.log('Actual End IS : ', LastEndDateTime)
      // console.log('Cumulative', CUMULATIVE_QTY)
      // console.log('QtyRemainAfterThisDay', QtyRemainAfterThisDay)
      // console.table({
      //   date: formatDateLocal(currentDate),
      //   remainMinute,
      //   CAP_MIN_TODAY,
      //   AllocatedWorkMin,
      //   producedQty: AllocatedWorkMin / Sam,
      //   CUMULATIVE_QTY,
      // })
      endDate = LastEndDateTime
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return endDate
  }

  function splitTime(
    start: Date,
    orderNo: string,
    color: string,
    lineCode: string,
    splitqty: number,
    sewId?: number,
  ) {
    // param startDate orderNo color lineCode
    const Line = STORE_MASTER.masterLine.filter((item) => item.lineCode === lineCode)[0]
    const Manpower = Line.capacityMP
    const Efficiency = STORE_MASTER.masterEfficiency
      .filter((item) => item.lineCode == Line.lineCode)
      .map((item) => item.efficiencyPct)[0]
    console.log(sewId)
    const planJob =
      sewId == null
        ? STORE_MASTER.planJob.filter((item) => item.orderNo == orderNo && item.color == color)[0]
        : STORE_MASTER.planJob.filter(
            (item) => item.orderNo == orderNo && item.color == color && item.sewId == sewId,
          )[0]
    let endDate = new Date()
    console.log(planJob)
    const Sam = planJob.sam

    const qty = splitqty
    const order = planJob.orderNo
    const MINUTE_PER_HOUR = 60

    // Efficiency is Percent
    console.table({
      Manpower,
      Efficiency: Efficiency,
      Sam,
      Quantity: qty,
      order,
    })

    const startDate = new Date(start)
    let currentDate = new Date(startDate) // ใช้ clone

    let remainMinute = qty * Sam
    let safety = 0
    let CUMULATIVE_QTY = 0

    while (remainMinute > 0) {
      safety++
      if (safety == 2000) {
        break
      }
      const shiftStart = '08:00:00'
      // const timeStart = startDate.toISOString().split('T')[1].split('.')[0]
      // console.log(timeStart)
      let defaultWorkHour = 8
      let isWorkDay = true
      const WorkDay = STORE_MASTER.masterWorkDay.filter((item) => {
        return (
          formatDateLocal(new Date(item.workDate)).split(' ')[0] ==
          formatDateLocal(currentDate).split(' ')[0]
        )
      })[0]
      // console.log(
      //   STORE_MASTER.masterWorkDay.filter((item) => {
      //     console.log(formatDateLocal(currentDate).split(' ')[0])
      //     return (
      //       formatDateLocal(new Date(item.workDate)).split(' ')[0] ==
      //       formatDateLocal(currentDate).split(' ')[0]
      //     )
      //   }),
      // )
      if (WorkDay) {
        // console.log(formatDateLocal(new Date(WorkDay.workDate)), formatDateLocal(currentDate))
        // console.warn('found workday', currentDate, WorkDay.workHours, WorkDay.isWorkday)
        defaultWorkHour = WorkDay.workHours
        isWorkDay = WorkDay.isWorkday
      } else {
        const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, ... 6 = Saturday
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
        // console.warn('Not found', WorkDay.workDate)
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
      let actualStart
      const shift = getShiftRange(currentDate, shiftStart, workMinute)
      //   console.log('Compare Time', currentDate, ' ', shift.start, ' ', LastEndDateTime)

      // ถ้าวันใหม่ต้อง reset กลับไป shift.start
      if (remainMinute > 0 && currentDate.toDateString() !== startDate.toDateString()) {
        LastEndDateTime = shift.start
        // console.warn('is change')
      }

      if (LastEndDateTime.getTime() > shift.start.getTime()) {
        actualStart = LastEndDateTime
      } else {
        actualStart = shift.start
        // console.warn('is shift')
      }

      if (actualStart >= shift.end) {
        // ข้ามไปวันถัดไป
        // console.warn('Jump Day')
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      const avaliableMinutes = (shift.end.getTime() - actualStart.getTime()) / 60000
      //   console.log(avaliableMinutes)

      let AllocatedWorkMin = 0
      const MP_EFF_FACTOR = Manpower * (Efficiency / 100)
      const CAP_MIN_TODAY = avaliableMinutes * MP_EFF_FACTOR
      //   console.log(CAP_MIN_TODAY)

      if (remainMinute < CAP_MIN_TODAY) {
        AllocatedWorkMin = remainMinute
      } else {
        AllocatedWorkMin = CAP_MIN_TODAY
      }

      // Actual End
      let actualEnd: Date
      if (AllocatedWorkMin === CAP_MIN_TODAY) {
        // ถ้าเต็มวัน → จบตรงเวลาเลิกงานพอดี
        actualEnd = shift.end
        // console.warn('shift end')
      } else {
        // ถ้าไม่เต็มวัน → คำนวณตามนาทีจริง
        const CLOCK_MIN_USED = MP_EFF_FACTOR > 0 ? AllocatedWorkMin / MP_EFF_FACTOR : 0
        actualEnd = new Date(actualStart)
        actualEnd.setMinutes(actualEnd.getMinutes() + CLOCK_MIN_USED)
      }

      // set RemaningMinute
      remainMinute = remainMinute - AllocatedWorkMin
      LastEndDateTime = actualEnd

      // const producedQty = AllocatedWorkMin / Sam

      CUMULATIVE_QTY += Math.round(AllocatedWorkMin / Sam)
      // const QtyRemainAfterThisDay = Math.round(qty - CUMULATIVE_QTY)
      // console.log('Actual START IS : ', actualStart)
      // console.log('Actual End IS : ', LastEndDateTime)
      // console.log('Cumulative', CUMULATIVE_QTY)
      // console.log('QtyRemainAfterThisDay', QtyRemainAfterThisDay)
      // console.table({
      //   date: formatDateLocal(currentDate),
      //   remainMinute,
      //   CAP_MIN_TODAY,
      //   AllocatedWorkMin,
      //   producedQty: AllocatedWorkMin / Sam,
      //   CUMULATIVE_QTY,
      // })
      endDate = LastEndDateTime
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return endDate
  }
  return { calTime }
}

function normalizeDate(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
