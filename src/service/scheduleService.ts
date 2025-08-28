// 1. สร้าง Centralized Data Service

import { GetMasterHoliday, GetMasterPlanData } from '@/lib/api/Masterplan'

// services/scheduleService.ts
export class ScheduleService {
  private static instance: ScheduleService
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private loadingStates = new Map<string, boolean>()

  static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService()
    }
    return ScheduleService.instance
  }

  async getMasterPlanData(forceRefresh = false): Promise<any> {
    const cacheKey = 'masterPlan'

    // ตรวจสอบ loading state
    if (this.loadingStates.get(cacheKey)) {
      // รอให้ request ที่กำลังทำงานอยู่เสร็จ
      return this.waitForRequest(cacheKey)
    }

    // ตรวจสอบ cache
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    // เริ่ม loading
    this.loadingStates.set(cacheKey, true)

    try {
      const data = await GetMasterPlanData()
      this.setCache(cacheKey, data, 5 * 60 * 1000) // 5 minutes TTL
      return data
    } finally {
      this.loadingStates.set(cacheKey, false)
    }
  }

  async getMasterHolidayData(forceRefresh = false): Promise<any> {
    const cacheKey = 'masterHoliday'

    if (this.loadingStates.get(cacheKey)) {
      return this.waitForRequest(cacheKey)
    }

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    this.loadingStates.set(cacheKey, true)

    try {
      const data = await GetMasterHoliday()
      this.setCache(cacheKey, data, 10 * 60 * 1000) // 10 minutes TTL
      return data
    } finally {
      this.loadingStates.set(cacheKey, false)
    }
  }

  private async waitForRequest(cacheKey: string): Promise<any> {
    // รอให้ request เสร็จแล้วดึงจาก cache
    while (this.loadingStates.get(cacheKey)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return this.getFromCache(cacheKey)
  }

  private setCache(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private getFromCache(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}
