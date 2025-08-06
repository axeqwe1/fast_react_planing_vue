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
