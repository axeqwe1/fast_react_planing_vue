import { CreateExpertEfficiency } from './../lib/api/ExpertEffType'
import type { Job } from './types'

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
  id: string
  sewId: number
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

export interface AddPlanJob {
  startDate: string
  endDate: string
  LineCode: string
  OrderNo: string
  Style: string
  Color: string
  Season: string
  CreateBy: string
}

export interface GetPlanScheduleRequestDTO {
  Order: string
  Color: string
  Line: string
  StartDate: string
  Respect: number
}

export interface ReturnJobPlanRequest {
  SewId: number
}

export interface CreateMasterTypeDTO {
  typeId?: number
  typeName: string
  typeCode: string
  createBy: string
  remark: string
}

export interface changeTypeOrderRequestDTO {
  TypeCode: string
  TypeName: string
  jobList: Job[]
  createBy: string
}

export interface CreateExpertEfficiencyDTO {
  typeCode: string
  lineCode: string
  EffPct: number
}

export interface CreateManualMPDTO {
  id?: number
  LineCode: string
  CapMP: number
  StartDate: string | null
  EndDate: string | null
}
export interface CreateManualEFFDTO {
  id?: number
  LineCode: string
  EffPct: number
  StartDate: string | null
  EndDate: string | null
}
