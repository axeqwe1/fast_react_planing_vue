import { useCaltime } from '@/composables/useCaltime'
import type {
  Job,
  manualEff,
  ExpertEfficiency,
  GenQtyWorkerPayload,
  manualMP,
  MasterData,
  MasterEfficiency,
  MasterLine,
  MasterType,
} from '@/type/types'
import { formatTimeKey, normalizeDate } from '@/utils/formatKey'

let cacheQty: Map<string, number> = new Map<string, number>()
// calcWorker.ts
self.onmessage = (e) => {
  const { days, payload } = e.data as {
    days: Date[]
    payload: GenQtyWorkerPayload
  }

  // ตัวอย่าง logic ที่กิน CPU
  function generateQty(date: Date[]) {
    const newQtyMap = new Map<string, number>()

    for (const d of date) {
      const day = new Date(d)
      const dateStr = formatTimeKey(day).split(' ')[0]
      const qty = getQtyDoneByDayWorker(
        d,
        payload.factory,
        payload.masterLine,
        payload.manualMPData,
        payload.manualEff,
        payload.masterType,
        payload.expertType,
        payload.masterEfficiency,
        payload.planJob,
        payload.jobs,
      )
      newQtyMap.set(dateStr + '_' + payload.factory, Math.round(qty))
    }

    cacheQty = newQtyMap

    // console.log('Updated cache for factory', factory)
  }
  function getQtyDoneByDayWorker(
    date: Date,
    factory: string,
    masterLine: MasterLine[],
    manualMPData: manualMP[],
    manualEff: manualEff[],
    masterType: MasterType[],
    expertType: ExpertEfficiency[],
    masterEfficiency: MasterEfficiency[],
    planJob: MasterData[],
    Job: Job[],
  ) {
    let totalDone = 0
    const pivotStart = new Date(date)
    pivotStart.setHours(8, 0, 0, 0)
    const pivotEnd = new Date(date)
    pivotEnd.setHours(16, 0, 0, 0)

    const manualMPMap = new Map<string, manualMP[]>()
    manualMPData.forEach((item) => {
      if (!manualMPMap.has(item.lineCode)) manualMPMap.set(item.lineCode, [])
      manualMPMap.get(item.lineCode)!.push(item)
    })

    const manualEffMap = new Map<string, manualEff[]>()
    manualEff.forEach((item) => {
      if (!manualEffMap.has(item.lineCode)) manualEffMap.set(item.lineCode, [])
      manualEffMap.get(item.lineCode)!.push(item)
    })
    const expertTypeMap = new Map<string, ExpertEfficiency[]>()
    expertType.forEach((item) => {
      if (!expertTypeMap.has(item.lineCode + '_' + item.typeCode))
        expertTypeMap.set(item.lineCode + '_' + item.typeCode, [])
      expertTypeMap.get(item.lineCode + '_' + item.typeCode)!.push(item)
    })
    const typeMap = new Map<string, MasterType[]>()
    masterType.forEach((item) => {
      if (!typeMap.has(item.typeCode)) typeMap.set(item.typeCode, [])
      typeMap.get(item.typeCode)!.push(item)
    })

    masterLine
      .filter((item) => item.factoryCode == factory)
      .forEach((line) => {
        const jobs = Job.filter((item) => item.line == line.lineCode)

        const filter = jobs.filter((job) => {
          const jobStart = new Date(job.startDate)
          const jobEnd = new Date(job.endDate)
          return (
            (jobStart >= pivotStart && jobStart <= pivotEnd) ||
            (jobEnd >= pivotStart && jobEnd <= pivotEnd) ||
            (jobStart <= pivotStart && jobEnd >= pivotEnd)
          )
        })

        filter
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .forEach((job, index) => {
            const foundEff = manualEffMap
              .get(line.lineCode)
              ?.find(
                (item) =>
                  normalizeDate(pivotStart) >= normalizeDate(new Date(item.startDate)) &&
                  normalizeDate(pivotEnd) <= normalizeDate(new Date(item.endDate)),
              )
            const foundMP = manualMPMap
              .get(line.lineCode)
              ?.find(
                (item) =>
                  normalizeDate(pivotStart) >= normalizeDate(new Date(item.startDate)) &&
                  normalizeDate(pivotEnd) <= normalizeDate(new Date(item.endDate)),
              )

            const type = typeMap.get(job.typeCode)
            const expertEfficiency = expertTypeMap.get(
              line.lineCode + '_' + (type ? type[0]?.typeCode : ''),
            )

            const Manpower = line.capacityMP
            const Efficiency = expertEfficiency
              ? expertEfficiency[0].effPct
              : (masterEfficiency.find((item) => item.lineCode === line.lineCode)?.efficiencyPct ??
                0)

            const EFF = foundEff?.effPct ?? Efficiency
            const MP = foundMP?.capMP ?? Manpower

            const plan = planJob.find((p) => p.sewId === job.sewId)
            if (!plan) return

            const sam = plan.sam
            const jobStart = new Date(job.startDate)
            const jobEnd = new Date(job.endDate)

            let overlapStart =
              index === 0
                ? jobStart < pivotStart
                  ? pivotStart
                  : jobStart
                : jobStart < new Date(filter[index - 1].endDate)
                  ? new Date(filter[index - 1].endDate)
                  : jobStart
            const overlapEnd = jobEnd > pivotEnd ? pivotEnd : jobEnd

            const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / 60000
            const MP_EFF_FACTOR = MP * (EFF / 100)
            totalDone += (overlapMinutes * MP_EFF_FACTOR) / sam
          })
      })

    return totalDone
  }
  generateQty(days)
  // ส่งกลับไปให้ main thread
  postMessage({ cacheQty })
}

export {} // บอก TypeScript ว่านี่คือ module
