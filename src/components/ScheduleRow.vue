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
        @dragover="onDragOver"
        @drop="(e) => onDrop(e, line.name)"
      >
        <template v-if="lines.length > 0 && store.timeIndexMap.size > 0">
          <div
            v-for="job in store.getJobsForLine(line.name)"
            :key="job.line + job.name"
            :style="[store.getJobStyle(job), createJobDraggable(job).state?.dragStyle]"
            v-tooltip.top="'Line: ' + line.name + ' ' + job.name"
            class="schedule-bar z-5 border-r-4"
            draggable="true"
            @dragstart="(e) => onDragStart(e, job)"
            @dragend="onDragEnd"
            :ref="
              (el) => {
                const jobRef = createJobDraggable(job).ref
                if (jobRef && isHTMLElement(el)) {
                  jobRef.value = el
                }
              }
            "
          >
            <span class="bg-slate-800/50 p-1 rounded-sm">
              {{ job.name }}
            </span>
          </div>
        </template>
        <template
          v-if="store.WorkDuration.size > 0 && store.weeks.length > 0"
          v-for="week in store.weeks"
        >
          <div
            v-for="(day, index) in store.cacheWeekDay.get(formatTimeKey(week.start))"
            :key="index"
            class="hour-of-day flex flex-row-reverse items-end px-2 border-r-1 border-gray-300 z-3"
            :style="{ left: `${store.getDurationStyle(formatTimeKey(week.start), day)}px` }"
          >
            <div class="">
              {{ store.getDayDuration(day, line.name) }}
            </div>
          </div>
          <!-- <div
            v-if="store.WorkDuration.has(`${formatTimeKey(week.start)}${line.name}`)"
            class="hour-of-day z-5"
          >
            {{ store.WorkDuration.get(`${formatTimeKey(week.start)}${line.name}`) }}
          </div> -->
        </template>
        <div
          class="week-break-background border-r-3 border-r-red-700 z-4"
          v-for="i in divideLeft"
          :style="{ left: i + 'px' }"
        ></div>
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
} from 'vue'
import { formatTimeKey } from '@/utils/formatKey'
import { useLoadingStore } from '@/stores/LoadingStore'
import { useDraggable, useElementBounding } from '@vueuse/core'

// สร้าง Map เก็บ ref สำหรับแต่ละ job
const jobRefs = new Map<string, Ref<HTMLElement | null>>()
const jobStates = new Map<string, any>()
const draggableEl = ref<HTMLElement | null>(null)
const draggingJob = ref<Job | null>(null)
const dragStartPosition = ref<{ x: number; y: number } | null>(null)
const divideLeft = ref<number[]>()

const scheduleRowRefs = ref<ScheduleRefs>({})

const lines = ref<Line[]>([])
const store = useScheduleStore()

function onDragStart(e: DragEvent, job: Job) {
  if (!e.dataTransfer) return

  // เก็บข้อมูล job ที่กำลังลาก
  draggingJob.value = job

  // เก็บตำแหน่งเริ่มต้น
  dragStartPosition.value = {
    x: e.clientX,
    y: e.clientY,
  }

  // กำหนดรูปแบบการลาก
  e.dataTransfer.effectAllowed = 'move'

  // ถ้าต้องการแสดง ghost image ขณะลาก
  const dragImage = document.createElement('div')
  dragImage.textContent = job.name
  dragImage.style.backgroundColor = '#007bff'
  dragImage.style.padding = '5px'
  dragImage.style.color = 'white'
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 0, 0)
  setTimeout(() => document.body.removeChild(dragImage), 0)

  console.log('Started dragging:', job.name)
}

function onDragOver(e: DragEvent) {
  if (!e.currentTarget || !draggingJob.value) return
  e.preventDefault() // สำคัญ! ต้องมีเพื่อให้สามารถ drop ได้

  // แสดงตำแหน่งขณะลาก
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  console.log('Dragging at position:', x)
}

function onDrop(e: DragEvent, lineName: string) {
  e.preventDefault()
  if (!e.currentTarget || !draggingJob.value) return

  // ดึงระยะ X ที่ drop ภายใน cell
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const dropX = e.clientX - rect.left

  // === CONFIG ===
  const PIXELS_PER_INTERVAL = 43
  const INTERVAL_MINUTES = 15

  // const WEEKS_LENGHTH = store.weeks.length
  // const TOTAL_DAY_PER_WEEK = 7
  // const WORK_HOUR = 8
  // const BREAK_DURATION = 1
  // const ACT_WORK = 8
  // const START_WORK_HOUR = 8 // เริ่มงาน 8:00 น.
  // const WORK_TOTAL_HOUR_PER_DAY = WORK_HOUR + BREAK_DURATION + ACT_WORK - START_WORK_HOUR
  // const INTERVEALS_MINUTES = 60 / 15 // ใน 1 ชมแบ่งช่วงละ 15 นาที
  // const TOTAL_LOOP_CAL_INTERVEALS_MINUTES_PER_DAY = WORK_TOTAL_HOUR_PER_DAY * INTERVEALS_MINUTES + 1
  // const SUM_TOTAL_LOOP = TOTAL_LOOP_CAL_INTERVEALS_MINUTES_PER_DAY * TOTAL_DAY_PER_WEEK
  // const SUM_TOTAL_LOOPWEEK = SUM_TOTAL_LOOP * WEEKS_LENGHTH
  // console.log(SUM_TOTAL_LOOPWEEK)
  // const realX = (SUM_TOTAL_LOOPWEEK / dropX) * dropX
  // console.log('Real X:', realX, 'test ', SUM_TOTAL_LOOPWEEK / dropX)
  // store.timeIndexMap.forEach((value, key) => {
  //   if (value == realX) {
  //     console.log('Found matching time index:', key)
  //   }
  // })

  const TOTAL_WORK_INTERVALS_PER_DAY = 15 // จำนวนช่วงเวลาจริงใน 1 วัน (36+1)
  const PIXELS_PER_HOURS = PIXELS_PER_INTERVAL / 4 // 4 ช่วงเวลาใน 1 ชั่วโมง
  // === คำนวณตำแหน่งเวลาตามความยาว dropX ===

  const totalTimeIndex = Math.floor(dropX / PIXELS_PER_HOURS)
  console.log('Total time index:', totalTimeIndex)
  // **สำคัญ:** การคำนวณ dayOffset ต้องใช้ PIXELS_PER_DAY ที่ถูกต้อง
  const dayOffset = Math.floor(dropX / PIXELS_PER_INTERVAL)
  const xInDay = dropX % PIXELS_PER_INTERVAL
  const intervalsInDay = Math.floor(xInDay / 1.194)
  const hour = 8 + Math.floor(intervalsInDay / 4)
  const minute = (intervalsInDay % 4) * 15 // 15 นาทีต่อช่วง
  console.log('dayOffset:', dayOffset)
  console.log('xInDay:', xInDay)
  console.log('intervalsInDay:', intervalsInDay)
  console.log('hour:', hour)
  console.log('minute:', minute)

  // **สำคัญ:** การคำนวณ intervalInDay ต้องใช้ TOTAL_WORK_INTERVALS_PER_DAY
  const intervalInDay = totalTimeIndex % TOTAL_WORK_INTERVALS_PER_DAY

  // === สร้างเวลาเริ่มต้น (base) จาก store.weeks[0].start
  const baseDate = new Date(store.weeks[0].start)
  baseDate.setHours(8, 0, 0, 0)

  // === คำนวณเวลาจาก offset
  const droppedDate = new Date(baseDate)
  droppedDate.setDate(baseDate.getDate() + dayOffset)
  droppedDate.setHours(hour, minute, 0, 0) // ตั้งเวลาเป็นชั่วโมงและนาทีที่คำนวณได้

  // === แปลงเป็น key string
  const key = formatTimeKey(droppedDate) // เช่น "2025-02-06 10:30"
  const timeIndex = store.timeIndexMap.get(key)

  if (timeIndex === undefined) {
    console.warn('ไม่พบเวลาใน timeIndexMap:', key)
    return
  }

  console.log('Dropped at:', key)
  console.log('Mapped timeIndex:', timeIndex)

  // === อัปเดต job
  draggingJob.value.line = lineName
  // สมมุติว่าเก็บเวลาเป็น string
  draggingJob.value.startDate = key
  // หรือถ้าใช้ index: draggingJob.value.timeIndex = timeIndex

  // === รีเซ็ต state
  draggingJob.value = null
  dragStartPosition.value = null
}

function onDragEnd() {
  draggingJob.value = null
  dragStartPosition.value = null
}

const { isDragging, style } = useDraggable(draggableEl, {
  initialValue: { x: 0, y: 0 },
  // ล็อคแกน Y เพื่อให้เลื่อนได้แค่แนวนอน
  axis: 'x',
  // เพิ่ม event handlers
  onStart: () => {
    console.log('Started dragging')
  },
  onEnd: () => {
    console.log('Ended dragging')
    // คำนวณตำแหน่งใหม่
  },
})

const { setLoading } = useLoadingStore()
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

// ฟังก์ชันสร้าง ref และ state สำหรับ job
function createJobDraggable(job: Job) {
  const jobKey = `${job.line}-${job.name}`
  if (!jobRefs.has(jobKey)) {
    const el = ref<HTMLElement | null>(null)
    jobRefs.set(jobKey, el)

    const { isDragging, x } = useDraggable(el, {
      initialValue: { x: 0, y: 0 },
      axis: 'x',
      onStart: () => {
        console.log('Started dragging:', job.name)
      },
      onEnd: () => {
        console.log('Ended dragging, position:', x.value)
      },
    })

    jobStates.set(jobKey, {
      isDragging,
      dragStyle: computed(() => ({
        transform: isDragging.value ? `translate(${x.value}px, 0px)` : undefined,
      })),
    })
  }

  return {
    ref: jobRefs.get(jobKey),
    state: jobStates.get(jobKey),
  }
}
function isHTMLElement(el: Element | ComponentPublicInstance | null): el is HTMLElement {
  return el instanceof HTMLElement
}

function formatDatetime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}
</script>

<style scoped>
.week-break-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 43px;
  height: 100%;
  background-color: rgb(77, 168, 218, 0.5); /* สีพื้นหลังโปร่งแสง */
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
  min-width: 10px; /* ลด min-width เพื่อรองรับงานสั้นๆ */
  background-color: #007bff;
  overflow: hidden;
  border: 1px solid #000;
  border-right: 2px solid #000; /* กำหนดเส้นขอบด้านขวาให้หนา */
  font-size: 12px; /* ปรับขนาดตัวอักษรให้เล็กลงถ้าจำเป็น */
  font-weight: bold;
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
