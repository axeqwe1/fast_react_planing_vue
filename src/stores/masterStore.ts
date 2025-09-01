import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  MasterEfficiency,
  MasterHoliday,
  MasterLine,
  MasterSam,
  MasterSamView,
} from '@/type/types'
import {
  GetMasterEfficiency,
  GetMasterHoliday,
  GetMasterLineData,
  GetMasterSAM,
  GetMasterSAMView,
} from '@/lib/api/Masterplan'

export const useMaster = defineStore('master', {
  state: () => ({
    masterLine: [] as MasterLine[],
    masterEfficiency: [] as MasterEfficiency[],
    masterHoliday: [] as MasterHoliday[],
    masterSam: [] as MasterSam[],
    masterSamView: [] as MasterSamView[],
  }),
  actions: {
    getMasterLine() {
      const fetchData = async () => {
        const res = await GetMasterLineData()
        this.masterLine = res
        // console.log(this.masterLine)
      }
      fetchData()
    },
    getMasterEfficiency() {
      const fetchData = async () => {
        const res = await GetMasterEfficiency()
        this.masterEfficiency = res
        // console.log(this.masterEfficiency)
      }
      fetchData()
    },
    GetMasterHoliday() {
      const fetchData = async () => {
        const res = await GetMasterHoliday()
        this.masterHoliday = res
        // console.log(this.masterHoliday)
      }
      fetchData()
    },
    GetMasterSAM() {
      const fetchData = async () => {
        const res = await GetMasterSAM()
        if (res.sam != null) {
          this.masterSam = res.sam
          // console.log(this.masterSam)
        }
      }
      fetchData()
    },
    getMasterSAMView() {
      const fetchData = async () => {
        const res = await GetMasterSAMView()
        this.masterSamView = res
        // console.log(this.masterSam)
      }
      fetchData()
    },
  },
})
