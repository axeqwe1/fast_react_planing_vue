export interface Job {
  id: number
  sewId: number
  name: string
  qty: number
  splitQty: number
  style: string
  season: string
  color: string
  typeName: string
  startDate: string
  endDate: string
  line: string
  duration: number
  processStatus: string
  progressPct: number
  createDate: Date
  updateDate: Date
  createBy: string
  updateBy: string
}

export interface Line {
  name: string
  lineCode: string
  company: string
  manpower: number
}

// export interface MasterData {
//   Line: string
//   orderNo: string
//   color: string
//   typeName: string
//   style: string
//   programCode: string
//   shipDest: string
//   customer: string
//   season: string
//   manpower: number
//   sam: number
//   sewStart: Date
//   sewAssembly: Date
//   sewFinish: Date
//   shipDate: Date
//   prodCfm: Date
//   qty: number
//   cut: number
//   match: number
//   out: number
//   sew: number
//   qc: number
//   blQty: number
//   blCut: number
//   blMatch: number
//   blOut: number
//   blSew: number
//   blQc: number
//   decoration: string
//   closeOrder: string
//   planningNo: string
//   cutDate: Date
//   sewDate: Date
// }

export interface MasterHoliday {
  holidayDate: string
  holidayName: string
  dayOfWeek: string
  isNational: boolean
  isWeekend: boolean
  holidayId: number
}

export interface MasterLine {
  id: number
  lineCode: string
  lineName: string
  lineType: string
  factoryCode: string
  capacityMP: number
  defaultHours: number
  isActive: boolean
  status: number
  remark: string
  createBy: string
  createDate: Date
  updateBy: string
  updateDate: Date
}

export interface MasterEfficiency {
  id: number
  lineCode: string
  effectiveDate: string
  efficiencyPct: number
  basisNote: string
  status: number
  remark: string
  createBy: string
  createDate: Date | null
  updateBy: string
  updateDate: Date | null
}

export interface MasterSam {
  id: number
  style: string
  season: string
  typeName: string
  programCode: string
  saM_Minutes: number
  effectiveDate: string // JSON Date
  expireDate: string
  status: number
  remark: string
}
export interface MasterSamView {
  style: string
  season: string
}

export type DropMode = 'insert' | 'merge' | 'normal' | 'skip'

export interface DetectDropModeParams {
  targetLineId: string | number
  newStart: Date
  newEnd: Date
  jobs: Job[]
  holidays?: Date[] // optional
}

type WorkCalendarMap = Record<string, number>
// หรือแบบนี้ก็ได้ถ้าอยากใช้ Date object
type WorkCalendarMapDate = Record<string /* ISO Date */, number /* hours */>

export interface User {
  fullname: string
  username: string
  email: string
  factoryId: number
  factoryName: string
  factoryCode: string
  isActive: boolean
}

export interface JobStyleOptions {
  timeIndexMap: Map<string, number>
  containerWidth: number
  isHoliday?: (date: Date) => boolean
  workHour?: number
  breakDuration?: number
  currentDay?: Date
}

export interface OrderGNX {
  orderNo: string
  style: string
  division: string
  season: string
  programCode: string
  color: string
  customer: string
  shipDate: Date
  qty: number
  qtyQCSew: number
  qtyPack: number
  status: string
  statusName: string
  processNameStatus: string
  processStatus: number
  progressPct: number
  qtyBundle: number
  qtyCut: number
  qtyEMB: number
  qtyEmboss: number
  qtyPrint: number
  qtyHeat: number
  qtyPRPad: number
  qtyFusing: number
  qtyBonding: number
  qtyLaserCut: number
  qtyQc: number
  qtyMatch: number
  qtyOut: number
  qtySew: number
}

export interface MasterFactory {
  id: number
  factoryApp: string
  factoryCode: string
  factoryName: string
}

export interface MasterData {
  sewId: number
  color: string
  customer: string
  division: string
  lineCode: string
  orderNo: string
  processNameStatus: string
  processStatus: number
  programCode: string
  progressPct: number
  psrDate: string // ISO date string
  qty: number
  splitQty: number
  qtyBonding: number
  qtyBundle: number
  qtyCut: number
  qtyEMB: number
  qtyEmboss: number
  qtyFusing: number
  qtyHeat: number
  qtyLaserCut: number
  qtyMatch: number
  qtyOut: number
  qtyPRPad: number
  qtyPack: number
  qtyPrint: number
  qtyQCSew: number
  qtyQc: number
  qtySew: number
  sam: number
  season: string
  sewFinish: string
  sewStart: string
  shipDate: string // ISO date string
  status: string
  statusName: string
  style: string
  type: string
  factoryCode: string
}

export interface MasterWorkDay {
  workDate: string
  isWorkday: boolean
  workHours: number
  holidayName: string
}

export interface PlanSchedule {
  seqNo: number
  order: string
  actualStartDateTime: string
  actualEndDateTime: string
  saM_MinPerPc: number
  qty: number
  remainAfterThisDay: number
  maxQtyPossibleToday: number
  qtyDoneToday: number
  cumulativeQty: number
}
