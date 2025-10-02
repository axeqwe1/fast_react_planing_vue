import axios from 'axios'
import { apiService } from '../axios'
import type { CreateMasterTypeDTO } from '@/type/requestDTO'

export const GetMasterType = async () => {
  try {
    const res = await apiService.get('/api/Mastertype/MasterType')
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const CreateMasterType = async (data: CreateMasterTypeDTO) => {
  try {
    const res = await apiService.post('/api/Mastertype/CreateMasterType', data)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const DeleteMasterType = async (id: number) => {
  try {
    const res = await apiService._delete(`/api/Mastertype/DeleteMasterType/${id}`)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
