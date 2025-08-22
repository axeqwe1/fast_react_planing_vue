import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MasterEfficiency, MasterHoliday, MasterLine } from '@/type/types'
import { GetMasterEfficiency, GetMasterHoliday, GetMasterLineData } from '@/lib/api/Masterplan'

export const useMaster = defineStore('master', {
  state: () => ({
    masterLine: [] as MasterLine[],
    masterEfficiency: [] as MasterEfficiency[],
    masterHoliday: [] as MasterHoliday[],
  }),
  actions: {
    getMasterLine() {
      const fetchData = async () => {
        const res = await GetMasterLineData()
        this.masterLine = res
        console.log(this.masterLine)
      }
      fetchData()
    },
    getMasterEfficiency() {
      const fetchData = async () => {
        const res = await GetMasterEfficiency()
        this.masterEfficiency = res
        console.log(this.masterEfficiency)
      }
      fetchData()
    },
    GetMasterHoliday() {
      const fetchData = async () => {
        const res = await GetMasterHoliday()
        this.masterHoliday = res
        console.log(this.masterHoliday)
      }
      fetchData()
    },
  },
})
