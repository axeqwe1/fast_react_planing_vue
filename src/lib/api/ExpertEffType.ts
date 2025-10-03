import axios from 'axios'
import { apiService } from '../axios'
import type { CreateExpertEfficiencyDTO, CreateMasterTypeDTO } from '@/type/requestDTO'

export const GetExpertEfficiency = async () => {
  try {
    const res = await apiService.get('/api/ExpertEfficiency/ExpertEfficiency')
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const GetExpertEfficiencyLineCode = async (lineCode: string) => {
  try {
    const res = await apiService.get('/api/ExpertEfficiency/ExpertEfficiency?lineCode=' + lineCode)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const CreateExpertEfficiency = async (data: CreateExpertEfficiencyDTO) => {
  try {
    const res = await apiService.post('/api/ExpertEfficiency/CreateExpertEfficiency', data)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const DeleteExpertEfficiency = async (id: number) => {
  try {
    const res = await apiService._delete(`/api/ExpertEfficiency/DeleteExpertEfficiency/${id}`)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
