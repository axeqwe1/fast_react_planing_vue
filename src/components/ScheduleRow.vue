<template>
  <div class="flex flex-col relative">
    <div class="flex z-0" v-for="(line, i) in lines">
      <div
        class="flex flex-col w-full border-1 border-gray-400 p-2 sticky left-0 max-w-[200px] bg-slate-200 z-8"
      >
        <div class="flex justify-between items-center">
          <span class="font-bold">
            0 <span class="pl-1 font-semibold"> {{ line.name }} </span>
          </span>
          <span class="font-bold">3 <span class="font-bold pl-1"> 0 </span></span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-bold"> 0 <span class="pl-1 font-semibold"> YPT </span> </span>
          <span class="font-bold">3</span>
        </div>
      </div>

      <div
        class="relative h-[70px] w-full border-b-1 border-gray-200 z-0"
        :ref="
          (el) => {
            if (el) setElementContainer(el, line.name)
          }
        "
        @dragover="onDragOver(line.name, $event)"
        @drop="(e) => onDrop(e, line.name)"
      >
        <template v-if="lines.length > 0 && store.timeIndexMap.size > 0">
          <div
            v-for="(job, jIndex) in store.getJobsForLine(line.name)"
            :key="job.line + job.name"
            :style="[store.getJobStyle(job)]"
            v-tooltip.top="'Line: ' + line.name + ' ' + job.name"
            class="schedule-bar z-5 border-r-4"
            draggable="true"
            @dragstart="(e) => onDragStart(e, job)"
            @dragend="onDragEnd"
          >
            <span class="bg-slate-800/50 p-1 rounded-sm">
              {{ job.name }}
            </span>
          </div>
        </template>

        <template v-if="divideLeft">
          <viewCanvas :divide-left="divideLeft" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ScheduleRefs {
  [key: string]: HTMLElement
}

import { useScheduleStore } from '@/stores/scheduleStore'
import type { Job, Line, MasterData } from '@/type/types'
import {
  watch,
  ref,
  onMounted,
  watchEffect,
  nextTick,
  type ComponentPublicInstance,
  computed,
  type Ref,
  onBeforeUnmount,
  type CSSProperties,
  reactive,
} from 'vue'
import { formatTimeKey } from '@/utils/formatKey'
import { useLoadingStore } from '@/stores/LoadingStore'
import { useDraggable, useElementBounding } from '@vueuse/core'
import viewCanvas from '@/components/viewCanvas.vue'
import throttle from 'lodash/throttle'
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'

const draggableEl = ref<Record<string, HTMLElement>>({})

const draggingJob = ref<Job | null>(null)
const dragStartPosition = ref<{ x: number; y: number } | null>(null)
const divideLeft = ref<number[]>()
const dragContext = {
  scrollLeftAtStart: 0,
  containerRect: null as DOMRect | null,
  clientXStart: 0,
}
const insertIndexByLine = ref<Record<string, number>>({})
const { setLoading } = useLoadingStore()
const scheduleRowRefs = ref<ScheduleRefs>({})

const lines = ref<Line[]>([])
const store = useScheduleStore()
const { getRelativeX, getInsertIndexInLine } = useMouseEvent()
const { adjustTimeForIndex, adjustToWorkingHours } = useTime()
const timeIndexReverseMap = computed(() => {
  const rMap = new Map<number, string>()
  for (const [k, v] of store.timeIndexMap.entries()) {
    rMap.set(v, k)
  }
  return rMap
})
// Drag and Drop Handlers
function onDragStart(e: DragEvent, job: Job) {
  if (!e.dataTransfer) return

  // เก็บข้อมูล job ที่กำลังลาก
  draggingJob.value = job

  // เก็บตำแหน่งเริ่มต้น
  dragStartPosition.value = {
    x: e.clientX,
    y: e.clientY,
  }
  const container = draggableEl.value[job.line] || null
  if (container) {
    dragContext.scrollLeftAtStart = container.scrollLeft
    dragContext.containerRect = container.getBoundingClientRect()
    // console.log('Container rect:', dragContext.containerRect)
    // console.log('Scroll left at start:', dragContext.scrollLeftAtStart)
    // console.log('Offset Width', container.offsetWidth)
    // console.log(store.timeIndexMap.size, 'timeIndexMap size')
    // console.log('unitWidth:', container.offsetWidth / store.timeIndexMap.size)
  }
  // กำหนดรูปแบบการลาก
  e.dataTransfer.effectAllowed = 'move'

  // ถ้าต้องการแสดง ghost image ขณะลาก
  const dragImage = document.createElement('div')
  dragImage.textContent = job.name
  dragImage.style.backgroundColor = '#007bff'
  dragImage.style.padding = '4px 12px'
  dragImage.style.color = 'white'
  dragImage.style.borderRadius = '4px'
  // dragImage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
  dragImage.style.fontWeight = 'bold'
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 0, 10) // offset เล็กน้อยเพื่อความสวยงาม
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

function onDragOver(linename: string, e: DragEvent) {
  e.preventDefault() // สำคัญ! ต้องมีเพื่อให้สามารถ drop ได้
  // throttleDragOver(linename, e)
}

// ฟังก์ชันช่วยสำหรับ debug การคำนวณ
function onDrop(e: DragEvent, lineName: string) {
  const container = draggableEl.value[lineName] || null
  e.preventDefault() // ป้องกันการกระทำเริ่มต้นของ drop
  if (!container) return
  if (!e.currentTarget || !draggingJob.value) return
  const relativeX = getRelativeX(container, e) // ใช้ clientX
  const unitWidth = container.offsetWidth / store.timeIndexMap.size
  const index = Math.floor(relativeX / unitWidth)

  const timeKey = [...store.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]
  if (!timeKey) return

  console.table({
    'Relative X': relativeX.toFixed(2),
    'Unit Width': unitWidth.toFixed(2),
    Index: index,
    'Time Key': timeKey,
  })

  throttledUpdate(lineName, e) // ใช้ฟังก์ชันที่ถูก throttle เพื่ออัปเดตตำแหน่ง

  // === รีเซ็ต state ===
  draggingJob.value = null
  dragStartPosition.value = null
}

function onDragEnd() {
  draggingJob.value = null
  dragStartPosition.value = null
}

watch(
  () => store.Lines, // ✅ ต้องใช้แบบนี้เพื่อติดตาม reactive props
  (newMaster) => {
    lines.value = newMaster
    console.log('Updated lines:', newMaster)
  },
  { immediate: true }, // เรียกทันทีตอน mounted
)
watchEffect(async () => {
  store.getDayIndex(8)
  let arrLeft: number[] = []
  store.weeks.forEach((item, index) => {
    const LEFT = store.getDevideStyle(item.end)
    arrLeft.push(LEFT)
  })
  divideLeft.value = arrLeft
  // console.log('divideLeft:', arrLeft)
  // console.log('store WorkDuration', store.WorkDuration)
  if (divideLeft.value.length > 0) {
    setLoading(false)
  }
})
// รอจน component และ element render เสร็จจริงก่อนใช้ bounding
watch(
  () => ({ ...scheduleRowRefs.value }),
  (refs) => {
    Object.values(refs).forEach((el) => {
      if (el && typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect()
        console.log('✅ Bounding Rect:', rect)
      }
    })
  },
  { immediate: true },
)

function setElementContainer(el: Element | ComponentPublicInstance, lineName: string) {
  if (el instanceof HTMLElement) {
    draggableEl.value[lineName] = el
  }
}
const throttleDragOver = throttle((linename: string, e: DragEvent) => {
  const container = draggableEl.value[linename] || null
  if (!e.currentTarget || !draggingJob.value) return
  const target = e.currentTarget as HTMLElement
  target.classList.add('drag-over')

  const filterJobs = store.Jobs.filter((job) => {
    return !(job.id === draggingJob.value?.id) && job.line === linename
  }).map((job) => {
    const startDate = new Date(job.startDate)
    const endDate = new Date(job.endDate)
    const { startHour, startMinute, endHour, endMinute } = adjustTimeForIndex(
      startDate,
      endDate,
      1,
      8,
    )

    startDate.setHours(startHour, startMinute, 0, 0)
    endDate.setHours(endHour, endMinute, 0, 0)

    return {
      ...job,
      startKey: formatTimeKey(startDate),
      endKey: formatTimeKey(endDate),
    }
  })

  const validJobs = filterJobs.filter(
    (job) => store.timeIndexMap.has(job.startKey) && store.timeIndexMap.has(job.endKey),
  )
  const relativeX = getRelativeX(container, e) // ใช้ clientX
  const unitWidth = container.offsetWidth / store.timeIndexMap.size
  const index = Math.floor(relativeX / unitWidth)

  const timeKey = timeIndexReverseMap.value.get(index)
  if (!timeKey) return
  const time = new Date(timeKey)

  const beforeJobs = validJobs
    .filter((job) => {
      const start = new Date(job.startKey)
      return time <= start
    })
    .sort((a, b) => new Date(a.startKey).getTime() - new Date(b.startKey).getTime())
  const afterJobs = validJobs
    .filter((job) => {
      const end = new Date(job.endKey)
      return time >= end
    })
    .sort((a, b) => new Date(a.startKey).getTime() - new Date(b.startKey).getTime())

  // console.table({
  //   beforeJobs: beforeJobs.map((job) => job),
  //   afterJobs: afterJobs.map((job) => job),
  // })
  if (!draggingJob.value) return
  const indexOfAfterJob = [...store.timeIndexMap.entries()].find(
    ([k, v]) => k === afterJobs[afterJobs.length - 1]?.endKey,
  )?.[1]

  if (indexOfAfterJob === undefined) return
  const insertTimeIndex = [...store.timeIndexMap.entries()].find(
    ([k, v]) => v === indexOfAfterJob + 1,
  )?.[0]

  if (!insertTimeIndex) return
  const newStart = new Date(insertTimeIndex)
  const duration =
    new Date(draggingJob.value.endDate).getTime() - new Date(draggingJob.value.startDate).getTime()
  const newEnd = new Date(newStart.getTime() + duration)
  console.log(newStart, newEnd)
  console.log(draggingJob.value)

  draggingJob.value.startDate = formatTimeKey(newStart)
  draggingJob.value.endDate = formatTimeKey(newEnd)
  // if (insertTimeIndex) {
  //   draggingJob.value.endDate = formatTimeKey(newEnd)
  // }
  // draggingJob.value.endDate = formatTimeKey(newEnd)
  draggingJob.value.line = linename
}, 160)
const throttledUpdate = throttle((linename: string, e: DragEvent) => {
  if (!e.currentTarget || !draggingJob.value) return
  const container = draggableEl.value[linename] || null
  const index = getInsertIndexInLine(container, e)
  const timeKey = [...store.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]
  if (!timeKey) return

  insertIndexByLine.value = {
    ...insertIndexByLine.value,
    [linename]: index,
  }

  const newStart = adjustToWorkingHours(new Date(timeKey))

  const duration =
    new Date(draggingJob.value.endDate).getTime() - new Date(draggingJob.value.startDate).getTime()
  const newEnd = adjustToWorkingHours(new Date(newStart.getTime() + duration))
  draggingJob.value.startDate = formatTimeKey(newStart)
  draggingJob.value.endDate = formatTimeKey(newEnd)

  draggingJob.value.line = linename
  console.log(draggingJob.value)
}, 20) // 16ms = ~60fps
</script>

<style scoped>
.week-break-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 43px;
  height: 100%;
  background-color: #4da8da80; /* สีพื้นหลังโปร่งแสง */
}

.schedule-bar {
  position: absolute;
  top: 10px;
  height: 30px;
  color: white;
  text-align: left;
  /*            padding-left: 12px;*/
  line-height: 30px;
  white-space: nowrap;
  min-width: 1px; /* ลด min-width เพื่อรองรับงานสั้นๆ */
  background-color: #007bff;
  overflow: hidden;
  border: 1px solid #000;
  border-right: 2px solid #000; /* กำหนดเส้นขอบด้านขวาให้หนา */
  font-size: 12px; /* ปรับขนาดตัวอักษรให้เล็กลงถ้าจำเป็น */
  font-weight: bold;

  transition:
    left 0.2s ease-out,
    top 0.2s ease-out;
  will-change: left, top;
}

.hour-of-day {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 43px; /* ความกว้างของแต่ละชั่วโมง */
  height: 100%;
  background-color: #f8f9fa; /* สีพื้นหลังของชั่วโมง */
}
</style>
