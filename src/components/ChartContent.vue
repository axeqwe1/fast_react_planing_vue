<template>
  <div class="flex flex-col w-fit mt-[60px] containerY" v-if="weeks.length > 0">
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
          <div
            class="flex-1 border-r-1 min-w-[300px] pt-[5px]"
            :style="{ minWidth: `${minWidthHeader}px` }"
            :key="i"
          >
            <span class="">{{ formatDate(item.start) }} - {{ formatDate(item.end) }}</span>
            <div class="flex">
              <span
                v-for="(day, i) in weeksDay"
                :key="day"
                class="flex-1 border border-gray-400 min-w-[30px] text-ellipsis"
                :ref="
                  (el) => {
                    if (el) setMinHeadRef(el, i)
                  }
                "
                >{{ day }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="LoadingRef && weeks.length > 0">
      <div class="text-6xl font-bold">Loading...</div>
    </template>
    <template v-else>
      <ScheduleRow :master="master" />
    </template>
  </div>
  <div class="h-screen flex justify-center items-center w-full" v-if="weeks.length < 1">
    <LoadingComponent />
  </div>
</template>

<script setup lang="ts">
import type { Job, Line, MasterData, MasterHoliday } from '@/type/types'
import { ref, onMounted, watch, watchEffect, nextTick, type ComponentPublicInstance } from 'vue'
import ScheduleRow from './ScheduleRow.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useLoadingStore } from '@/stores/LoadingStore'
import Loading from '@/components/LoadingComponent.vue'
import { storeToRefs } from 'pinia'
import { GetMasterHoliday, GetMasterPlanData } from '@/lib/api/Masterplan'
import { template } from 'lodash'
import LoadingComponent from '@/components/LoadingComponent.vue'
const weeks = ref([] as { start: Date; end: Date }[])
const weeksDay = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
const master = ref([] as MasterData[])
const jobs = ref([] as Job[])
const loadStore = useLoadingStore()
const { isLoading } = storeToRefs(loadStore)
const LoadingRef = ref(isLoading)
const headerRef = ref<HTMLElement | null>(null)
const minHeadRef = ref<HTMLElement[]>([])
const store = useScheduleStore()
const minWidthHeader = ref(store.minWidthHeader || 300)
watchEffect(() => {
  minWidthHeader.value = store.minWidthHeader || 300
  store.headerWidth = headerRef.value?.scrollWidth || 0 // Set header width for the store
})

function setMinHeadRef(el: Element | ComponentPublicInstance, i: number) {
  if (el instanceof HTMLElement) {
    minHeadRef.value[i] = el
  }
}
const fetchMasterPlan = async () => {
  try {
    const res = await GetMasterPlanData()
    const data = res
    console.log(res)
    data.forEach((items: any, index: number) => {
      jobs.value.push({
        id: index, // Assuming each item has a unique id
        line: items.data.line,
        qty: items.data.qty,
        style: items.data.style,
        color: items.data.color,
        typeName: items.data.typeName,
        name: items.data.orderNo,
        startDate: items.data.sewAssembly,
        endDate: items.data.sewFinish,
        duration: items.duration,
      })
    })
    store.setJobs(jobs.value) // Update the store with fetched jobs
    const filterLine = new Set(data.map((item: any) => item.data.line)) // Extract unique lines
    const arrLine = Array.from(filterLine) // Convert Set to Array
    const lineMap = arrLine.map((line: any) => {
      return {
        name: line,
      } as Line
    })
    store.setLine(lineMap) // Update the store with unique lines
    store.setMasters(data.data) // Update the store with master data

    console.log('Fetched jobs:', jobs.value) // Log fetched jobs for debugging
  } catch (err: any) {
    console.error('Error fetching test data:', err)
  }
}
const fetchMasterHoliday = async () => {
  try {
    const res = await GetMasterHoliday()
    res.forEach((item: MasterHoliday) => {
      store.holidays.push(new Date(item.dateHoliday))
    })
  } catch (err: any) {
    console.error(err)
  }
}
onMounted(async () => {
  loadStore.setLoading(true) // Set loading state to true
  await fetchMasterPlan()
  const CAL_WEEK = calculateWeeks(store.Jobs)
  store.setWeeks(CAL_WEEK) // Calculate weeks based on jobs
  weeks.value = store.weeks
  await fetchMasterHoliday()
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
  store.buildHolidayCell()
  loadStore.setLoading(false)
  // Mock data for jobs
})

function calculateWeeks(jobs: Job[]) {
  const minDate = new Date(Math.min(...jobs.map((job) => new Date(job.startDate).getTime())))
  const maxDate = new Date(Math.max(...jobs.map((job) => new Date(job.endDate).getTime())))

  const extendedMaxDate = new Date(maxDate)
  extendedMaxDate.setMonth(extendedMaxDate.getMonth() + 5)

  let startWeek = getStartOfWeek(minDate)

  // console.log(maxDate) // ดีบักเพื่อดูวันที่เริ่มต้นและสิ้นสุด)
  let weeks = []
  while (startWeek <= extendedMaxDate) {
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
