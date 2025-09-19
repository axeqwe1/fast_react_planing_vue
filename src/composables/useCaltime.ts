import { useMaster } from '@/stores/masterStore'
import { formatDateLocal, formatTimeKey } from '@/utils/formatKey'
import { getShiftRange } from '@/utils/utility'

export function useCaltime() {
  const STORE_MASTER = useMaster()
  function calTime(start: Date, orderNo: string, color: string, lineCode: string) {
    // param startDate orderNo color lineCode
    const Line = STORE_MASTER.masterLine.filter((item) => item.lineCode === lineCode)[0]
    const Manpower = Line.capacityMP
    const Efficiency = STORE_MASTER.masterEfficiency
      .filter((item) => item.lineCode == Line.lineCode)
      .map((item) => item.efficiencyPct)[0]

    const planJob = STORE_MASTER.planJob.filter(
      (item) => item.orderNo == orderNo && item.color == color,
    )[0]

    let endDate = new Date()

    const Sam = planJob.sam

    const qty = planJob.qty
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
      if (safety == 10) {
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

      if (WorkDay) {
        // console.log(formatDateLocal(new Date(WorkDay.workDate)), formatDateLocal(currentDate))
        // console.warn('found workday', currentDate, WorkDay.workHours, WorkDay.isWorkday)
        defaultWorkHour = WorkDay.workHours
        isWorkDay = WorkDay.isWorkday
      } else {
        defaultWorkHour = 0
        isWorkDay = false
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

  return { calTime }
}
