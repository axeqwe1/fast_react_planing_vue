import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MasterLine } from '@/type/types'
import { GetMasterLineData } from '@/lib/api/Masterplan'

export const useMaster = defineStore('master', {
  state: () => ({
    masterLine: [] as MasterLine[],
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
  },
})
