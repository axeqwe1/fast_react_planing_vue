import type { Job, MasterData, MasterEfficiency, MasterLine, MasterHoliday } from '@/type/types'
import { apiService } from '../axios'
import type { CreateMasterSam, CreateMasterWorkDay, UpdatePlanJob } from '@/type/requestDTO'

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
    const API_PATH = 'api/Masterholiday/MasterHoliday'
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const UpdatePlan = async (data: UpdatePlanJob[]) => {
  try {
    const API_PATH = 'api/Masterplan/UpdatePlan'
    const res = await apiService.post(`${API_PATH}`, data)
    console.log(res)
    return res
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
//  MasterLine
export const GetMasterLineData = async () => {
  try {
    const API_PATH = 'api/Masterline/GetMasterLine'
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const CreateMasterLine = async (data: MasterLine) => {
  try {
    const API_PATH = 'api/Masterline/CreateMasterline'
    const res = await apiService.post(`${API_PATH}`, data)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const DeleteMasterLine = async (id: number) => {
  try {
    const API_PATH = `api/Masterline/DeleteMasterLine/${id}`
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
    const API_PATH = `api/Masterefficiency/MasterEfficiency`
    const res = await apiService.get(`${API_PATH}`)

    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const CreateMasterEfficiency = async (data: MasterEfficiency) => {
  try {
    const API_PATH = 'api/Masterefficiency/CreateMasterEfficiency'
    const res = await apiService.post(`${API_PATH}`, data)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const DeleteMasterEfficiency = async (id: number) => {
  try {
    const API_PATH = `api/Masterefficiency/DeleteMasterEfficiency/${id}`
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
    const API_PATH = `api/Masterholiday/CreateMasterHoliday`
    const res = await apiService.post(`${API_PATH}`, data)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

export const DeleteMasterHoliday = async (id: number) => {
  try {
    const API_PATH = `api/Masterholiday/DeleteMasterHoliday/${id}`
    const res = await apiService._delete(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

// GetWorkDay
export const GetWorkDay = async (data: string[]) => {
  try {
    const API_PATH = `api/Masterworkday/GetWorkdayData`
    const res = await apiService.post(API_PATH, data)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const GetWorkDayAll = async () => {
  try {
    const API_PATH = `api/Masterworkday/GetWorkdayDataAll`
    const res = await apiService.get(API_PATH)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const CreateWorkDay = async (data: CreateMasterWorkDay[]) => {
  try {
    const API_PATH = `api/Masterworkday/CreateMasterWorkDay`
    const res = await apiService.post(API_PATH, data)
    return res.data
  } catch (err: any) {
    throw err
  }
}

//

export const GetMasterSAM = async () => {
  try {
    const API_PATH = `api/Mastersam/GetMasterSam`
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const GetMasterSAMView = async () => {
  try {
    const API_PATH = `api/Mastersam/GetMasterSamView`
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const SearchQueryMasterSamViewStyle = async (style: string) => {
  try {
    const API_PATH = `api/Mastersam/SearchQueryMasterSamViewStyle/${style}`
    const res = await apiService.get(`${API_PATH}`)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const CreateMasterSamAPI = async (data: CreateMasterSam) => {
  try {
    const API_PATH = `api/Mastersam/CreateMasterSam`
    const res = await apiService.post(API_PATH, data)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const deleteMasterSAM = async (id: number) => {
  try {
    const API_PATH = `api/Mastersam/DeleteMasterSAM/${id}`
    const res = await apiService._delete(API_PATH)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const GetOrderGNX = async (pageNumber: number, pageSize: number) => {
  try {
    const API_PATH = `api/Masterplan/GetOrderGNX?pageNumber=${pageNumber}&pageSize=${pageSize}`
    const res = await apiService.get(API_PATH)
    return res
  } catch (err: any) {
    throw err
  }
}

export const GetFactoryData = async () => {
  try {
    const API_PATH = `api/Masterfactory/GetFactoryData`
    const res = await apiService.get(API_PATH)

    return res.data
  } catch (err: any) {
    throw err
  }
}

export const GetPlanJob = async () => {
  try {
    const API_PATH = `api/Masterplan/GetPlanJob`
    const res = await apiService.get(API_PATH)

    return res.data
  } catch (err: any) {
    throw err
  }
}
