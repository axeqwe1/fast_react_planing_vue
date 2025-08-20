import type { Job } from '@/type/types'
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
