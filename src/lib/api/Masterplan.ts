import type { Job, MasterData, MasterEfficiency, MasterLine, MasterHoliday } from '@/type/types'
import { apiService } from '../axios'

export const GetMasterPlanData = async () => {
  try {
    const API_PATH = 'api/Masterplan/GetMasterPlanData'
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const GetMasterHoliday = async () => {
  try {
    const API_PATH = 'api/Masterplan/MasterHoliday'
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const UpdatePlan = async (data: Job[]) => {
  try {
    const API_PATH = 'api/Masterplan/UpdatePlan'
    const res = await apiService.post(`${API_PATH}`, data)
    console.log(res)
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
//  MasterLine
export const GetMasterLineData = async () => {
  try {
    const API_PATH = 'api/Masterplan/GetMasterLine'
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const CreateMasterLine = async (data: MasterLine) => {
  try {
    const API_PATH = 'api/Masterplan/CreateMasterline'
    const res = await apiService.post(`${API_PATH}`, data)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const DeleteMasterLine = async (id: number) => {
  try {
    const API_PATH = `api/Masterplan/DeleteMasterLine/${id}`
    const res = await apiService._delete(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
// End Master Line
// MasterEfficiency
export const GetMasterEfficiency = async () => {
  try {
    const API_PATH = `api/Masterplan/MasterEfficiency`
    const res = await apiService.get(`${API_PATH}`)

    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const CreateMasterEfficiency = async (data: MasterEfficiency) => {
  try {
    const API_PATH = 'api/Masterplan/CreateMasterEfficiency'
    const res = await apiService.post(`${API_PATH}`, data)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const DeleteMasterEfficiency = async (id: number) => {
  try {
    const API_PATH = `api/Masterplan/DeleteMasterEfficiency/${id}`
    const res = await apiService._delete(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

// MasterHoiday
export const CreateMasterHoliday = async (data: MasterHoliday) => {
  try {
    const API_PATH = `api/Masterplan/CreateMasterHoliday`
    const res = await apiService.post(`${API_PATH}`, data)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const DeleteMasterHoliday = async (id: number) => {
  try {
    const API_PATH = `api/Masterplan/DeleteMasterHoliday/${id}`
    const res = await apiService._delete(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
