<template>
  <div class="flex flex-col w-fit mt-[60px]">
    <div class="flex w-full sticky top-[60px] bg-white z-6">
      <div
        class="flex flex-col border-b-1 justify-between p-[5px] top-0 h-[56px] min-w-[200px] sticky border-r-1 left-0 bg-slate-100 z-6"
      >
        <span>Capacity = 60,000 / hour</span>
        <span>WIP. 0</span>
      </div>

      <div class="flex week-header" ref="headerRef">
        <div
          class="flex items-center font-bold w-full sticky top-0 z-5 text-center"
          v-for="(item, i) in weeks"
        >
          <div class="flex-1 border-r-1 min-w-[300px] pt-[5px]">
            <span class="">{{ formatDate(item.start) }} - {{ formatDate(item.end) }}</span>
            <div class="flex">
              <span
                v-for="(day, i) in weeksDay"
                :key="day"
                class="flex-1 border border-gray-400 min-w-[30px] text-ellipsis"
                >{{ day }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <ScheduleRow :master="master" />
  </div>
</template>

<script setup lang="ts">
import type { Job, Line, MasterData } from '@/type/types'
import { ref, onMounted, watch, watchEffect, nextTick } from 'vue'
import ScheduleRow from './ScheduleRow.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useLoadingStore } from '@/stores/LoadingStore'
import Loading from '@/components/LoadingComponent.vue'
import { storeToRefs } from 'pinia'
import { GetMasterPlanData } from '@/lib/api/Masterplan'
const weeks = ref([] as { start: Date; end: Date }[])
const weeksDay = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
const master = ref([] as MasterData[])
const jobs = ref([] as Job[])
const loadStore = useLoadingStore()
const { isLoading } = storeToRefs(loadStore)
const LoadingRef = ref(isLoading)
const headerRef = ref<HTMLElement | null>(null)
const store = useScheduleStore()
const fetchTest = async () => {
  try {
    const res = await GetMasterPlanData()
    const data = res
    console.log(res)
    data.forEach((items: any) => {
      jobs.value.push({
        line: items.line,
        name: items.orderNo,
        startDate: items.sewAssembly,
        endDate: items.sewFinish,
      })
    })
    store.setJobs(jobs.value) // Update the store with fetched jobs
    const filterLine = new Set(data.map((item: any) => item.line)) // Extract unique lines
    const arrLine = Array.from(filterLine) // Convert Set to Array
    const lineMap = arrLine.map((line: any) => {
      return {
        name: line,
      } as Line
    })
    store.setLine(lineMap) // Update the store with unique lines
    store.setMasters(data) // Update the store with master data
    console.log('Fetched jobs:', jobs.value) // Log fetched jobs for debugging
  } catch (err: any) {
    console.error('Error fetching test data:', err)
  }
}

onMounted(async () => {
  loadStore.setLoading(true) // Set loading state to true
  await fetchTest()
  const CAL_WEEK = calculateWeeks(store.Jobs)
  store.setWeeks(CAL_WEEK) // Calculate weeks based on jobs
  weeks.value = store.weeks
  await nextTick(() => {
    if (headerRef.value) {
      store.headerWidth = headerRef.value.scrollWidth
      console.log(headerRef.value.scrollWidth)
    }
  })
  store.headerWidth = headerRef.value?.scrollWidth || 0 // Set header width for the store
  if (store.weeks.length > 0) {
    // if want to cache durationwork must have weeks data
    store.cacheWorkDuration()
  }
  loadStore.setLoading(false)
  // Mock data for jobs
})

function calculateWeeks(jobs: Job[]) {
  const minDate = new Date(Math.min(...jobs.map((job) => new Date(job.startDate).getTime())))
  const maxDate = new Date(Math.max(...jobs.map((job) => new Date(job.endDate).getTime())))

  let startWeek = getStartOfWeek(minDate)
  // console.log(maxDate) // ดีบักเพื่อดูวันที่เริ่มต้นและสิ้นสุด)
  let weeks = []
  while (startWeek <= maxDate) {
    weeks.push({ start: new Date(startWeek), end: getEndOfWeek(startWeek) })
    startWeek.setDate(startWeek.getDate() + 7)
  }
  weeks.push({ start: new Date(startWeek), end: getEndOfWeek(startWeek) })
  // console.log('Weeks calculated:', weeks) // ดีบักเพื่อดูช่วงเวลา
  return weeks
}

function getStartOfWeek(date: any) {
  let d = new Date(date)
  let day = d.getDay()
  let diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getEndOfWeek(startOfWeek: any) {
  let endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  return endOfWeek
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
</script>

<style scoped></style>
