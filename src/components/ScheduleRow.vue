<template>
  <div class="flex flex-col relative">
    <div class="flex z-0 border-b-1 border-gray-500" v-for="(line, i) in lines">
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
            @contextmenu.prevent="showContextMenu($event, job, line.name)"
            v-tooltip.top="{
              content: `
                <table style='border-collapse: collapse; font-size: 12px;'>
                  <tr>
                    <td style='padding: 2px 6px;'><b>Line</b></td>
                    <td>${line.name}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>Order</b></td>
                    <td>${job.name}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>Start</b></td>
                    <td>${formatTimeKey(new Date(job.startDate))}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>End</b></td>
                    <td>${formatTimeKey(new Date(job.endDate))}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>Style</b></td>
                    <td>${job.style}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>Color</b></td>
                    <td>${job.color}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>TypeName</b></td>
                    <td>${job.typeName}</td>
                  </tr>
                  <tr>
                    <td style='padding: 2px 6px;'><b>QTY</b></td>
                    <td style=''><b>${job.qty}</b></td>
                  </tr>
                </table>
              `,
              html: true,
            }"
            class="schedule-bar z-5 border-r-4"
            draggable="true"
            @dragstart="(e) => onDragStart(e, job)"
            @dragend="onDragEnd"
            :style="[store.getJobStyleFromCache(job)] as StyleValue"
          >
            <span class="bg-slate-800/50 p-1 rounded-sm">
              {{ job.name }}
            </span>
          </div>
        </template>

        <template v-if="divideLeft">
          <viewCanvas />
        </template>
      </div>
    </div>
    <!-- Overlay to close the menu -->
    <div class="overlay" @click="closeContextMenu" v-if="showMenu" />

    <!-- Custom Context Menu -->
    <ContextMenu
      v-if="showMenu"
      :actions="contextMenuActions"
      @action-clicked="handleActionClick"
      :x="menus.menuX"
      :y="menus.menuY"
    />

    <!-- Custom Modal -->
    <Modal v-model="showModal" size="large" :closable="false" :persistent="true">
      <template #header>
        <h2 class="text-2xl font-bold">Update Plan</h2>
      </template>

      <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table class="table">
          <thead>
            <tr>
              <th>OrderNo</th>
              <th>Line</th>
              <th>Color</th>
              <th>START - END</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in store.jobUpdate.sort(
                (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
              )"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.line }}</td>
              <td>{{ item.color }}</td>
              <td>{{ item.startDate }} - {{ item.endDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="flex flex-row-reverse gap-2">
          <button
            @click="showModal = false"
            class="hover:cursor-pointer border-1 rounded-2xl w-[100px] h-[50px] hover:bg-gray-500 hover:text-white text-xl transition-all ease-in duration-100"
          >
            Close
          </button>
        </div>
      </template>
    </Modal>
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
  type StyleValue,
} from 'vue'
import { formatTimeKey } from '@/utils/formatKey'
import { useLoadingStore } from '@/stores/LoadingStore'
import viewCanvas from '@/components/viewCanvas.vue'
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'
import { detectDropMode } from '@/utils/detectDropMode'
import ContextMenu from './ContextMenu.vue'
import Modal from './Modal.vue'
const menus = reactive({ menuX: 0, menuY: 0 })
const contextMenuActions = ref([{ label: 'plan schedule', action: 'viewplan' }])
const store = useScheduleStore()
const draggableEl = ref<Record<string, HTMLElement>>({})
const draggingJob = ref<Job | null>(null)
const dragStartPosition = ref<{ x: number; y: number } | null>(null)
const divideLeft = ref<number[]>(store.divideCache)
const dragContext = {
  scrollLeftAtStart: 0,
  containerRect: null as DOMRect | null,
  clientXStart: 0,
}
const showModal = ref<boolean>(false)
const { setLoading } = useLoadingStore()
const scheduleRowRefs = ref<ScheduleRefs>({})
const lines = ref<Line[]>([])
const showMenu = ref(false)
const contextTargetJob = ref<Job | null>()
const { getRelativeX, getRelativeY, getInsertIndexInLine } = useMouseEvent()
const { adjustTimeForIndex, adjustToWorkingHours } = useTime()

// contextmenu on rightclick
const showContextMenu = (event: MouseEvent, job: Job, linename: string) => {
  console.log(linename)
  const containerX = draggableEl.value[linename]
  const containerY = (document.querySelector('.containerY') as HTMLElement) || null
  event.preventDefault()
  showMenu.value = true
  contextTargetJob.value = job
  menus.menuX = getRelativeX(containerX, event)
  menus.menuY = getRelativeY(containerY, event)
}
const closeContextMenu = () => {
  showMenu.value = false
}
function handleActionClick(action: any) {
  console.log(action)
  console.log(contextTargetJob.value)
  switch (action) {
    case 'viewplan': {
      console.log('found action')
      showModal.value = true
      if (showModal.value) showMenu.value = false
      break
    }
    default: {
      console.warn('Not found action')
    }
  }
}
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
  dragImage.style.width = store.getJobStyleFromCache(job).width || 'auto' // ใช้ width จาก style ที่คำนวณไว้

  // dragImage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
  dragImage.style.fontWeight = 'bold'
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 0, 10) // offset เล็กน้อยเพื่อความสวยงาม
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

function onDragOver(linename: string, e: DragEvent) {
  e.preventDefault()
}

// ฟังก์ชันช่วยสำหรับ debug การคำนวณ
function onDrop(e: DragEvent, lineName: string) {
  e.preventDefault()
  if (!draggingJob.value) return
  const container = draggableEl.value[lineName]
  if (!container) return

  const relativeX = getRelativeX(container, e)
  const unitWidth = container.offsetWidth / store.timeIndexMap.size
  const index = Math.floor(relativeX / unitWidth)
  const timeKey = [...store.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]
  if (!timeKey) return

  const st = draggingJob.value.startDate
  const dur = new Date(draggingJob.value.endDate).getTime() - new Date(st).getTime()
  const newEnd = adjustToWorkingHours(new Date(new Date(timeKey).getTime() + dur))
  const newStart = adjustToWorkingHours(new Date(timeKey))
  const dropMode = detectDropMode({
    targetLineId: lineName,
    newStart,
    newEnd,
    jobs: store.Jobs,
    holidays: store.holidays,
  })
  console.log(dropMode)
  store.moveJob(
    draggingJob.value.id,
    lineName,
    container,
    e,
    newStart,
    dropMode,
    draggingJob.value.duration,
  )

  // รีเซ็ต state
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
watch(
  () => [store.weeks, store.minWidthHeader],
  () => {
    store.getDayIndex(8)
    store.computeAllJobStyles()
    store.computeDivideStyle()
    setLoading(false)
  },
  { immediate: true },
)
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

// จัดการ Right Click
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

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 49;
}

.overlay::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
}

.overlay:hover {
  cursor: pointer;
}
</style>
