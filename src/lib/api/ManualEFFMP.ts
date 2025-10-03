import axios from 'axios'
import { apiService } from '../axios'
import type {
  CreateExpertEfficiencyDTO,
  CreateManualEFFDTO,
  CreateManualMPDTO,
  CreateMasterTypeDTO,
} from '@/type/requestDTO'
import type { manualEff, manualMP } from '@/type/types'

// ManualMP
export const GetManualMpData = async () => {
  try {
    const res = await apiService.get('/api/ManualMP/GetManualMP')
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const GetManualMpDataByLineCode = async (lineCode: string) => {
  try {
    const res = await apiService.get('/api/ManualMP/GetManualMPLineCode?lineCode=' + lineCode)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const CreateManualMP = async (request: CreateManualMPDTO) => {
  try {
    const res = await apiService.post('/api/ManualMP/CreateManualMP', request)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const UpdateManualMP = async (request: manualMP) => {
  try {
    const res = await apiService.put('/api/ManualMP/UpdateManualMP', request)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const ToggleActive = async (id: number) => {
  try {
    const res = await apiService.put('/api/ManualMP/ToggleActive', { id })
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const DeleteManualMP = async (id: number) => {
  try {
    const res = await apiService._delete('/api/ManualMP/DeleteManualMP/' + id)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
// Manual EFF
export const GetManualEffData = async () => {
  try {
    const res = await apiService.get('/api/ManualEff/GetManualEffs')
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const GetManualEffsLineCode = async (lineCode: string) => {
  try {
    const res = await apiService.get('/api/ManualEff/GetManualEffsLineCode?lineCode=' + lineCode)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const CreateManualEff = async (request: CreateManualEFFDTO) => {
  try {
    const res = await apiService.post('/api/ManualEff/CreateManualEff', request)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const UpdateManualEff = async (request: manualEff) => {
  try {
    const res = await apiService.put('/api/ManualEff/UpdateManualEff', request)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const ToggleActiveEFF = async (id: number) => {
  try {
    const res = await apiService.put('/api/ManualEff/ToggleActive', { id })
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const DeleteManualEFF = async (id: number) => {
  try {
    const res = await apiService._delete('/api/ManualEff/DeleteManualEff/' + id)
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
