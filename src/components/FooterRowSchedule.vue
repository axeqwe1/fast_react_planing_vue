<template>
  <div class="flex border-b-1 border-gray-500 w-full sticky top-[56px] z-5">
    <div
      class="flex flex-col justify-center w-full border-1 border-gray-400 p-2 sticky left-0 max-w-[200px] bg-slate-200 z-8"
    >
      <div class="flex justify-between items-center text-md">
        <span class="font-bold"> Summary : Qty Today </span>
      </div>
      <div class="flex justify-between items-center text-sm"></div>
    </div>

    <div class="relative h-[40px] border-b-1 border-gray-200 bg-white">
      <div
        class="absolute text-center text-xs bg-base-200 h-full"
        v-for="(d, i) in days"
        :style="[getDayStyle(d)]"
      >
        {{ cacheQtyDoneByDay ? getCache(d) : '0' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCaltime } from '@/composables/useCaltime'
import { useMaster } from '@/stores/masterStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { type GenQtyWorkerPayload } from '@/type/types'
import { formatTimeKey, normalizeDate } from '@/utils/formatKey'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRaw,
  watch,
  type CSSProperties,
  type StyleValue,
} from 'vue'

const {
  getManualEffStyle,
  getManualMpStyle,
  computeManualStyle,
  strip,
  getQtyDoneByDay,
  CacheDayOfWeek,
} = useCaltime()
const store = useScheduleStore()
const STORE_MASTER = useMaster()

const cacheQtyDoneByDay = ref<Map<string, number>>()
const cacheStyle = ref<Map<string, Partial<CSSStyleDeclaration>>>()
const weeks = ref([] as { start: Date; end: Date }[])
const days = ref<Date[]>([])

// ✅ import worker ผ่าน Vite syntax
const worker = new Worker(new URL('@/worker/worker.ts', import.meta.url), {
  type: 'module',
})
const getDayStyle = (day: Date): StyleValue => {
  const base = cacheStyle.value?.get(day.toISOString().split('T')[0]) ?? {}
  return {
    ...base,
    width: store.minWidthHeader / 7 + 'px',
  } as StyleValue
}
function generateQty(date: Date[]) {
  const newStyleMap = new Map<string, Partial<CSSStyleDeclaration>>()

  for (const d of date) {
    const day = new Date(d)
    const dateStr = formatTimeKey(day).split(' ')[0]

    newStyleMap.set(dateStr, {
      left: store.getDurationStyle(formatTimeKey(date[0]), d) + 'px',
    })
  }

  cacheStyle.value = newStyleMap

  console.log('Updated cache for factory', STORE_MASTER.currentFactory)
}

function getCache(d: Date) {
  const key = d.toISOString().split('T')[0] + '_' + STORE_MASTER.currentFactory

  return cacheQtyDoneByDay.value?.get(key)
}
onMounted(async () => {
  weeks.value = store.weeks

  console.log(weeks.value)
})
watch(weeks, (newVal) => {
  days.value = CacheDayOfWeek(newVal)
})
watch(
  days,
  (newDays) => {
    const payloadData = {
      days: toRaw(newDays),
      factory: toRaw(STORE_MASTER.currentFactory),
      masterLine: toRaw(STORE_MASTER.masterLine),
      masterFactory: toRaw(STORE_MASTER.masterFactory),
      manualMPData: toRaw(STORE_MASTER.manualMPData),
      manualEff: toRaw(STORE_MASTER.manualEff),
      masterType: toRaw(STORE_MASTER.masterType),
      expertType: toRaw(STORE_MASTER.expertType),
      masterEfficiency: toRaw(STORE_MASTER.masterEfficiency),
      planJob: toRaw(STORE_MASTER.planJob),
      jobs: toRaw(store.Jobs),
    }
    worker.postMessage({ days: toRaw(days.value), payload: payloadData })
    generateQty(days.value)
  },

  { immediate: true },
)
watch(
  () => STORE_MASTER.currentFactory,
  (newVal) => {
    if (!days.value.length) return
    console.log(STORE_MASTER.currentFactory)
    const payloadData = {
      days: toRaw(days.value),
      factory: newVal,
      masterLine: toRaw(STORE_MASTER.masterLine),
      masterFactory: toRaw(STORE_MASTER.masterFactory),
      manualMPData: toRaw(STORE_MASTER.manualMPData),
      manualEff: toRaw(STORE_MASTER.manualEff),
      masterType: toRaw(STORE_MASTER.masterType),
      expertType: toRaw(STORE_MASTER.expertType),
      masterEfficiency: toRaw(STORE_MASTER.masterEfficiency),
      planJob: toRaw(STORE_MASTER.planJob),
      jobs: toRaw(store.Jobs),
    }

    worker.postMessage({ days: toRaw(days.value), payload: payloadData })
    generateQty(days.value)
  },
)

// เมื่อได้รับข้อความจาก worker
worker.onmessage = (event) => {
  const newCache = event.data.cacheQty
  console.log(cacheQtyDoneByDay.value)
  console.log('cacheQty from worker:', event.data.cacheQty)

  const oldCache = cacheQtyDoneByDay.value
  let oldCacheDifferent = false
  if (oldCache instanceof Map) {
    for (const [key, value] of newCache) {
      if (oldCache.get(key) !== value) {
        // ต่างกัน → update
        oldCacheDifferent = true
        break
      }
    }
  } else {
    oldCacheDifferent = true
  }
  if (!oldCacheDifferent) return
  console.log('cache success *******************************')
  cacheQtyDoneByDay.value = event.data.cacheQty
}
// ส่งข้อมูลไปให้ worker ทำงาน
</script>

<style scoped></style>
