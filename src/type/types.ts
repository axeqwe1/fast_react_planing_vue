export interface Job {
  id: number
  name: string
  qty: number
  style: string
  color: string
  typeName: string
  startDate: string
  endDate: string
  line: string
  duration: number
}

export interface Line {
  name: string
  company: string
}

export interface MasterData {
  Line: string
  orderNo: string
  color: string
  typeName: string
  style: string
  programCode: string
  shipDest: string
  customer: string
  season: string
  manpower: number
  sam: number
  sewStart: Date
  sewAssembly: Date
  sewFinish: Date
  shipDate: Date
  prodCfm: Date
  qty: number
  cut: number
  match: number
  out: number
  sew: number
  qc: number
  blQty: number
  blCut: number
  blMatch: number
  blOut: number
  blSew: number
  blQc: number
  decoration: string
  closeOrder: string
  planningNo: string
  cutDate: Date
  sewDate: Date
}

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
