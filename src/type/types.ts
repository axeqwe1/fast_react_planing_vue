export interface Job {
  id: number
  name: string
  startDate: string
  endDate: string
  line: string
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

type WorkCalendarMap = Record<string, number>
// หรือแบบนี้ก็ได้ถ้าอยากใช้ Date object
type WorkCalendarMapDate = Record<string /* ISO Date */, number /* hours */>
