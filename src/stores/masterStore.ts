import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  ExpertEfficiency,
  manualMP,
  MasterData,
  MasterEfficiency,
  MasterFactory,
  MasterHoliday,
  MasterLine,
  MasterSam,
  MasterSamView,
  MasterType,
  MasterWorkDay,
  manualEff,
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
import { GetMasterType } from '@/lib/api/Mastertype'
import { GetExpertEfficiency } from '@/lib/api/ExpertEffType'
import { GetManualEffData, GetManualMpData } from '@/lib/api/ManualEFFMP'
import { get } from 'lodash'

export const useMaster = defineStore('master', {
  state: () => ({
    masterLine: [] as MasterLine[],
    masterEfficiency: [] as MasterEfficiency[],
    masterHoliday: [] as MasterHoliday[],
    masterSam: [] as MasterSam[],
    masterSamView: [] as MasterSamView[],
    masterFactory: [] as MasterFactory[],
    masterWorkDay: [] as MasterWorkDay[],
    masterType: [] as MasterType[],

    planJob: [] as MasterData[],
    allJob: [] as MasterData[],
    currentFactory: 'ALL' as string,
    expertType: [] as ExpertEfficiency[],

    manualMPData: [] as manualMP[],
    manualEff: [] as manualEff[],
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
    async getMasterType() {
      const fetchData = async () => {
        const res = await GetMasterType()
        console.log(res.data)
        this.masterType = res.data
      }
      await fetchData()
    },
    async getExpertEfficiency() {
      const fetchData = async () => {
        const res = await GetExpertEfficiency()
        this.expertType = res.data
        console.log(this.expertType)
      }
      await fetchData()
    },
    async getManualMP() {
      const fetchData = async () => {
        const res = await GetManualMpData()
        console.log(res)
        this.manualMPData = res.data
      }
      await fetchData()
    },
    async getManualEFF() {
      const fetchData = async () => {
        const res = await GetManualEffData()
        console.log(res)
        this.manualEff = res.data
      }
      await fetchData()
    },
    getPlanJob() {
      const fetchData = async () => {
        const res = await GetPlanJob()
        console.log(res)
        this.planJob = res.map((item: any) => {
          return {
            ...item,
            qty: item.splitQty ? item.splitQty : item.qty,
          }
        })
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
