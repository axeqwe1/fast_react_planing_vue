import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  MasterData,
  MasterEfficiency,
  MasterFactory,
  MasterHoliday,
  MasterLine,
  MasterSam,
  MasterSamView,
  MasterWorkDay,
} from '@/type/types'
import {
  GetAllJob,
  GetFactoryData,
  GetMasterEfficiency,
  GetMasterHoliday,
  GetMasterLineData,
  GetMasterSAM,
  GetMasterSAMView,
  GetPlanJob,
  GetWorkDay,
  GetWorkDayAll,
} from '@/lib/api/Masterplan'

export const useMaster = defineStore('master', {
  state: () => ({
    masterLine: [] as MasterLine[],
    masterEfficiency: [] as MasterEfficiency[],
    masterHoliday: [] as MasterHoliday[],
    masterSam: [] as MasterSam[],
    masterSamView: [] as MasterSamView[],
    masterFactory: [] as MasterFactory[],
    masterWorkDay: [] as MasterWorkDay[],
    planJob: [] as MasterData[],
    allJob: [] as MasterData[],
    currentFactory: 'ALL' as string,
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
    getMasterFactory() {
      const fetchData = async () => {
        const res = await GetFactoryData()
        console.log(res)
        this.masterFactory = res
      }
      fetchData()
    },
    getMasterWorkDay() {
      const fetchData = async () => {
        const res = await GetWorkDayAll()
        console.log(res)
        this.masterWorkDay = res
      }
      fetchData()
    },
    getPlanJob() {
      const fetchData = async () => {
        const res = await GetPlanJob()
        console.log(res)
        this.planJob = res
      }
      fetchData()
    },
    GetAllJob() {
      const fetchData = async () => {
        const res = await GetAllJob()
        console.log(res)
        this.allJob = res.data
      }
      fetchData()
    },
  },
})
