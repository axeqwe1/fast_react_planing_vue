export interface CreateMasterWorkDay {
  workDate: string
  workHour: number
}

export interface CreateMasterSam {
  style: string
  season: string
  typeName: string
  SAM_Minutes: number
}

export interface UpdatePlanJob {
  id: number
  name: string
  qty: number
  style: string
  season: string
  color: string
  typeName: string
  startDate: string
  endDate: string
  line: string
  duration: number
  updateBy: string
  updateDate: Date
}
