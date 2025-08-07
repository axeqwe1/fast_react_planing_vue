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

        <!-- <template
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
        </template>
        <div
          class="week-break-background border-r-3 border-r-red-700 z-4"
          v-for="i in divideLeft"
          :style="{ left: i + 'px' }"
        ></div> -->
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
} from 'vue'
import { formatTimeKey } from '@/utils/formatKey'
import { useLoadingStore } from '@/stores/LoadingStore'
import { useDraggable, useElementBounding } from '@vueuse/core'
import viewCanvas from '@/components/viewCanvas.vue'
// สร้าง Map เก็บ ref สำหรับแต่ละ job
const jobRefs = new Map<string, Ref<HTMLElement | null>>()
const jobStates = new Map<string, any>()
const draggableEl = ref<Record<string, HTMLElement>>({})

const draggingJob = ref<Job | null>(null)
const dragStartPosition = ref<{ x: number; y: number } | null>(null)
const divideLeft = ref<number[]>()
const offsetWidth = ref<number>(0)
const dragContext = {
  scrollLeftAtStart: 0,
  containerRect: null as DOMRect | null,
  clientXStart: 0,
}
const { setLoading } = useLoadingStore()
const scheduleRowRefs = ref<ScheduleRefs>({})

const lines = ref<Line[]>([])
const store = useScheduleStore()

function setElementContainer(el: Element | ComponentPublicInstance, lineName: string) {
  if (el instanceof HTMLElement) {
    draggableEl.value[lineName] = el
  }
}
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
    console.log('Container rect:', dragContext.containerRect)
    console.log('Scroll left at start:', dragContext.scrollLeftAtStart)
    console.log('Offset Width', container.offsetWidth)
    console.log(store.timeIndexMap.size, 'timeIndexMap size')
    console.log('unitWidth:', container.offsetWidth / store.timeIndexMap.size)
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
}

function getRelativeX(container: HTMLElement, event: MouseEvent) {
  const containerRect = container.getBoundingClientRect()
  return event.clientX - containerRect.left + container.scrollLeft
}

function onDragOver(e: DragEvent) {
  if (!e.currentTarget || !draggingJob.value) return
  e.preventDefault() // สำคัญ! ต้องมีเพื่อให้สามารถ drop ได้

  // แสดงตำแหน่งขณะลาก
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  console.log('Dragging at position:', x)
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

  const newStart = new Date(timeKey)
  console.table({
    'Relative X': relativeX.toFixed(2),
    'Unit Width': unitWidth.toFixed(2),
    Index: index,
    'Time Key': timeKey,
  })

  //   draggingJob.value.line = lineName

  draggingJob.value.line = lineName
  draggingJob.value.startDate = timeKey
  // หรือถ้าใช้ index: draggingJob.value.timeIndex = timeIndex

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
