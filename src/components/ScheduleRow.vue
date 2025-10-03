<template>
  <div class="flex flex-col relative" :style="[{ width: `${store.headerWidth + 200}px` }]">
    <div
      class="flex z-0 border-b-1 border-gray-500 w-full"
      v-for="(line, i) in lines"
      :key="line.lineCode + STORE_MASTER.currentFactory"
    >
      <div
        class="flex flex-col justify-center w-full border-1 border-gray-400 p-2 sticky left-0 max-w-[200px] bg-slate-200 z-8"
        @contextmenu="(e) => onRightClickLine(e, line.lineCode)"
      >
        <div class="flex justify-between items-center text-md">
          <span class="font-bold">
            <span class="pl-1 font-semibold"> {{ line.name }} </span>
          </span>
          <span class="font-bold">
            <span
              class="font-bold pl-1"
              :class="
                (() => {
                  const eff =
                    STORE_MASTER.masterEfficiency.find((item) => item.lineCode == line.lineCode)
                      ?.efficiencyPct ?? 0

                  if (eff === 0) return 'bg-black text-white'
                  if (eff < 35) return 'bg-red-500 text-amber-400'
                  if (eff < 70) return 'bg-amber-400 text-blue-600'
                  return 'bg-green-500 text-black'
                })()
              "
            >
              {{
                STORE_MASTER.masterEfficiency.find((item) => item.lineCode == line.lineCode)
                  ?.efficiencyPct
              }}%
            </span></span
          >
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="font-bold">
            <span class="pl-1 font-semibold"> {{ line.company }} </span>
          </span>
          <span class="font-bold"
            >MP: <span class="font-bold text-sky-600"> {{ line.manpower }}</span></span
          >
        </div>
      </div>

      <div
        class="relative h-[70px] w-full border-b-1 border-gray-200 z-0"
        :ref="
          (el) => {
            if (el) setElementContainer(el, line.lineCode)
          }
        "
        @dragover="onDragOver(line.lineCode, $event)"
        @drop="(e) => onDrop(e, line.lineCode)"
        @contextmenu="(e) => onRightClick(e, line.lineCode, line.company, line.name)"
        @mousemove="(e) => updateMouse(e, line.lineCode, line.manpower)"
      >
        <template v-if="lines.length > 0 && store.timeIndexMap.size > 0">
          <div
            v-for="(job, jIndex) in store.getJobsForLine(line.lineCode)"
            :key="job.line + job.name + STORE_MASTER.currentFactory"
            @contextmenu="(e) => onRightClickJob(e, job, line.lineCode)"
            class="schedule-bar z-5 border-r-4"
            draggable="true"
            @dragstart="(e) => onDragStart(e, job)"
            @dragend="onDragEnd"
            @mouseenter="showTooltip(job, line, $event)"
            @mouseleave="hideTooltip"
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
    <ContextMenu ref="menu" :model="items" />
    <ContextMenu ref="jobmenu" :model="jobMenu" />
    <ContextMenu ref="linemenu" :model="lineMenu" />
    <Popover
      ref="op"
      @hide="
        () => {
          selectedOrderPlaned = []
        }
      "
    >
      <div class="flex flex-col gap-4 w-[25rem]">
        <!-- <div>
          <span class="font-medium block mb-2">Share this document</span>
          <InputGroup>
            <InputText
              value="https://primevue.org/12323ff26t2g243g423g234gg52hy25XADXAG3"
              readonly
              class="w-[25rem]"
            ></InputText>
            <InputGroupAddon>
              <i class="pi pi-copy"></i>
            </InputGroupAddon>
          </InputGroup>
        </div> -->
        <div>
          <span class="font-medium block mb-2">Return Order</span>
          <InputGroup>
            <InputText :value="`${selectedOrderPlaned.length} Selected`" disabled />
            <Button
              @click="confirmReturnDialog = true"
              label="Return"
              icon="pi pi-caret-left"
            ></Button>
            <Dialog
              v-model:visible="confirmReturnDialog"
              modal
              header="Return Job"
              :style="{ width: '25rem' }"
            >
              <span class="text-surface-500 dark:text-surface-400 block mb-8"
                >Are you sure to return job?.</span
              >

              <div class="flex justify-end gap-2">
                <Button
                  type="button"
                  label="Cancel"
                  severity="secondary"
                  @click="confirmReturnDialog = false"
                ></Button>
                <Button
                  type="button"
                  :icon="returnLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
                  :label="returnLoading ? 'loading' : 'Save'"
                  @click="handleReturnJob()"
                ></Button>
              </div>
            </Dialog>
          </InputGroup>
        </div>
        <div class="">
          <div class="flex flex-row justify-between items-center mb-2">
            <span class="font-medium block mb-2"
              >Planed List
              <InputText
                class="w-30 ml-1"
                size="small"
                placeholder="Search Order"
                v-model="filterOrderList"
            /></span>
            <span>Total: {{ filteredJobs.length }} Jobs</span>
          </div>

          <ul class="list-none p-0 m-0 flex flex-col gap-4 max-h-48 overflow-y-auto">
            <li
              v-for="item in filteredJobs"
              :key="item.line + item.name + STORE_MASTER.currentFactory"
              class="flex items-center gap-2 hover:bg-green-100 transition-all duration-150 ease-in-out rounded-lg p-2 cursor-pointer"
              @click="
                () => {
                  if (
                    selectedOrderPlaned.includes(item.sewId.toString()) &&
                    selectedOrderPlaned.length > 0
                  ) {
                    selectedOrderPlaned = selectedOrderPlaned.filter(
                      (i) => i !== item.sewId.toString(),
                    )
                  } else {
                    selectedOrderPlaned.push(item.sewId.toString())
                    selectedOrderPlaned = [...new Set(selectedOrderPlaned)]
                  }
                }
              "
            >
              <!-- <img
                :src="`https://primefaces.org/cdn/primevue/images/avatar/${member.image}`"
                style="width: 32px"
              /> -->

              <div>
                <span class="font-medium">{{ item.name }}</span>
                <div class="text-sm text-surface-500 dark:text-surface-400">
                  {{ item.color }} {{ item.typeName }} {{ item.style }}
                </div>
              </div>
              <div
                class="flex items-center gap-2 text-surface-500 dark:text-surface-400 ml-auto text-sm"
              >
                <!-- <span>{{ member.role }}</span> -->
                <Checkbox
                  v-model="selectedOrderPlaned"
                  :inputId="item.id.toString()"
                  name="category"
                  :value="item.sewId ? item.sewId.toString() : item.id"
                />
                <!-- <i class="pi pi-angle-down"></i> -->
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Popover>
    <!-- Overlay to close the menu -->
    <!-- <div class="overlay" @click="closeContextMenu" v-if="showMenu || showLineMenu" /> -->

    <!-- Custom Context Menu -->
    <!-- <ContextMenu
      v-if="showMenu"
      :actions="contextMenuActions"
      @action-clicked="handleActionClick"
      :x="menus.menuX"
      :y="menus.menuY"
    />

    <ContextMenu
      v-if="showLineMenu"
      :actions="contextLineMenu"
      @action-clicked="handleActionClick"
      :x="menus.menuX"
      :y="menus.menuY"
    /> -->
    <!-- Custom Modal -->
    <Modal v-model="showModal" size="large" :closable="false" :persistent="true">
      <template #header>
        <h2 class="text-2xl font-bold">Plan Schedule : {{ targetOrder }}</h2>
      </template>
      <template v-if="loadingPlan">
        <div>Loading...</div>
      </template>
      <template v-else>
        <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Start</th>
                <th>End</th>
                <th>DoneToday</th>
                <th>cumulativeQty</th>
                <th>TargetQty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in planSchedule" :key="item.seqNo">
                <td>{{ item.seqNo }}</td>

                <td>{{ formatLocal(new Date(item.actualStartDateTime)) }}</td>
                <td>{{ formatLocal(new Date(item.actualEndDateTime)) }}</td>
                <td>{{ item.qtyDoneToday }}</td>
                <td>{{ item.cumulativeQty }}</td>

                <td>{{ item.qty }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

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

    <!-- Modal Add Job -->
    <Modal v-model="showModalAddJob" size="full" :closable="false" :persistent="true">
      <template #header>
        <h2 class="text-2xl font-bold">Add Job</h2>
      </template>

      <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <FormAddJob
          :defaultStartDate="chooseStartTime"
          :factory-code="targetFactoryCode"
          :line-code="targetLineCode"
          @add-job="AddJob"
        />
      </div>

      <template #footer>
        <div class="flex flex-row-reverse gap-2">
          <button
            @click="showModalAddJob = false"
            class="hover:cursor-pointer border-1 rounded-2xl w-[100px] h-[50px] hover:bg-gray-500 hover:text-white text-xl transition-all ease-in duration-100"
          >
            Close
          </button>
        </div>
      </template>
    </Modal>
    <!-- <template v-if="divideLeft">
      <viewCanvas />
    </template> -->

    <!-- <div v-for="divide in divideLeft" class="absolute" :style="{ left: divide + 'px' }">
      <div class="week-break-background"></div>
    </div> -->
    <!-- Tooltip single instance -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        ref="floatingEl"
        class="tooltip"
        v-html="tooltip.content"
        :style="floatingStyles"
      ></div>
    </Teleport>
    <modalTypeMap
      v-model:visible="showTypeMap"
      :line-code="targetLineCode ? targetLineCode : 'undefined'"
    />
    <modalConfigExpertType
      v-model:visible="showConfigExpertType"
      :line-code="targetLineCode ? targetLineCode : 'undefined'"
    />
    <modalManualMP
      v-model:visible="showManualMP"
      :line-code="targetLineCode ? targetLineCode : 'undefined'"
    />
    <modalManualEff
      v-model:visible="showManualEFF"
      :line-code="targetLineCode ? targetLineCode : 'undefined'"
    />
    <Toast position="top-center" group="tc" />
  </div>
</template>

<script setup lang="ts">
interface ScheduleRefs {
  [key: string]: HTMLElement
}

import { useScheduleStore } from '@/stores/scheduleStore'
import type { Job, Line, MasterData, PlanSchedule } from '@/type/types'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'
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
import { formatDateLocal, formatLocal, formatTimeKey } from '@/utils/formatKey'
import { useLoadingStore } from '@/stores/LoadingStore'
import viewCanvas from '@/components/viewCanvas.vue'
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'
import { detectDropMode } from '@/utils/detectDropMode'
// import ContextMenu from './ContextMenu.vue'
import modalTypeMap from '@/components/modal/modalTypeMap.vue'
import modalConfigExpertType from '@/components/modal/modalConfigExpertType.vue'
import modalManualMP from '@/components/modal/modalManualMP.vue'
import modalManualEff from '@/components/modal/modalManualEFF.vue'
import ContextMenu from 'primevue/contextmenu'
import Popover from 'primevue/popover'
import Modal from './Modal.vue'
import { useMaster } from '@/stores/masterStore'
import FormAddJob from '@/components/form/FormAddJob.vue'
import { GetPlanJob, GetPlanScheduleData, ReturnJobPlan } from '@/lib/api/Masterplan'
import type { GetPlanScheduleRequestDTO, ReturnJobPlanRequest } from '@/type/requestDTO'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

const showTypeMap = ref(false)
const showConfigExpertType = ref(false)
const showManualMP = ref(false)
const showManualEFF = ref(false)
const confirmReturnDialog = ref(false)
const menus = reactive({ menuX: 0, menuY: 0 })
const contextMenuActions = ref([{ label: 'plan schedule', action: 'viewplan' }])
const contextLineMenu = ref([{ label: 'add job', action: 'addJob' }])
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
const jobs = ref<Job[]>([])
const showModal = ref<boolean>(false)
const showLineMenu = ref<boolean>(false)
const chooseStartTime = ref<string>('')
const { setLoading } = useLoadingStore()
const scheduleRowRefs = ref<ScheduleRefs>({})
const lines = ref<Line[]>([])
const showMenu = ref(false)
const contextTargetJob = ref<Job | null>()
const showModalAddJob = ref<boolean>(false)
const STORE_MASTER = useMaster()
const targetFactoryCode = ref<string>()
const targetLineCode = ref<string>()
const targetOrder = ref<string>()
const requestPlanSchedule = ref<GetPlanScheduleRequestDTO | null>(null)
const planSchedule = ref<PlanSchedule[]>([])
const selectedOrderPlaned = ref<string[]>([])
const timeOnMouse = ref('')
const menu = ref()
const jobmenu = ref()
const linemenu = ref()
const op = ref()

const filterOrderList = ref('')

const jobsForLine = computed(() =>
  store.getJobsForLine(targetLineCode.value ? targetLineCode.value : ''),
)
const filteredJobs = computed(() => {
  if (!filterOrderList.value || filterOrderList.value.trim() === '') {
    return jobsForLine.value
  }
  return jobsForLine.value.filter((item) =>
    item.name.toLowerCase().includes(filterOrderList.value.toLowerCase()),
  )
})
const items = ref([
  {
    label: 'Add Job',
    icon: 'pi pi-briefcase',
    command: () => {
      showModalAddJob.value = true
    },
  },
])

const jobMenu = ref([
  {
    label: 'Schedule Plan',
    icon: 'pi pi-calendar',
    command: () => {
      showModal.value = true
      if (requestPlanSchedule.value) {
        fetchPlanSchedule(requestPlanSchedule.value)
      }
    },
  },
  {
    label: 'Split (not use)',
    icon: 'pi pi-arrows-h',
    command: () => {},
    disabled: true,
  },
])
const lineMenu = ref([
  {
    label: 'List Order',
    icon: 'pi pi-list-check',
    command: (e: any) => {
      op.value.toggle(e.originalEvent)
    },
  },
  {
    label: 'EFF Manual ',
    icon: 'pi pi-bolt',
    command: () => {
      showManualEFF.value = !showManualEFF.value
    },
  },
  {
    label: 'MP Manual ',
    icon: 'pi pi-users',
    command: () => {
      showManualMP.value = !showManualMP.value
    },
  },
  {
    label: 'Config Expert Eff Type ',
    icon: 'pi pi-cog',
    command: () => {
      showConfigExpertType.value = !showConfigExpertType.value
    },
  },
  {
    label: 'Config Type Order',
    icon: 'pi pi-tags',
    command: () => {
      showTypeMap.value = !showTypeMap.value
    },
  },
])
const fetchMasterPlan = async (factory?: string) => {
  try {
    // const res = await GetPlanJob()
    jobs.value = []
    const res = await GetPlanJob()
    STORE_MASTER.planJob = res
    store.jobStyleCache.clear()
    const data = res
    let filterData = []
    filterData = data.filter((item: any) => item.sewStart != null)

    // console.log(data.filter((item: any) => item.sewStart != null))
    filterData.forEach((items: any, index: number) => {
      jobs.value.push({
        id: items.sewId
          ? items.sewId
          : `${items.orderNo}_${items.lineCode}_${items.style}_${items.color}`, // Assuming each item has a unique id
        sewId: items.sewId,
        line: items.lineCode,
        qty: items.splitQty ? items.splitQty : items.qty,
        splitQty: items.splitQty,
        style: items.style,
        season: items.season,
        color: items.color,
        typeName: items.type,
        name: items.orderNo,
        sam: items.sam,
        startDate: items.sewStart,
        endDate: items.sewFinish,
        duration: items.duration,
        processStatus: items.processStatus,
        progressPct: items.progressPct,
        createBy: items.createBy,
        updateBy: items.updateBy,
        createDate: items.createDate,
        updateDate: items.updateDate,
      })
    })
    store.setJobs(jobs.value) // Update the store with fetched jobs

    // // const filterLine = new Set(data.map((item: any) => item.line)) // Extract unique lines
    // let arrLine = STORE_MASTER.masterLine // Convert Set to Array
    // const lineMap = arrLine.map((line: any) => {
    //   return {
    //     name: line.lineName,
    //     lineCode: line.lineCode,
    //     company: line.factoryCode,
    //     manpower: line.capacityMP,
    //   } as Line
    // })
    // masterLine.value = lineMap

    // if (factory === 'ALL') {
    //   store.Lines = masterLine.value
    // } else {
    //   store.Lines = masterLine.value.filter((line) => line.company === factory)
    // }

    store.computeAllJobStyles()
    // store.setMasters(filterData)
    // store.setLine(masterLine.value) // Update the store with unique lines
    // console.log('Fetched jobs:', jobs.value) // Log fetched jobs for debugging
  } catch (err: any) {
    console.error('Error fetching test data:', err)
  }
}
const onRightClick = (
  event: MouseEvent,
  lineCode: string,
  factoryCode: string,
  linename: string,
) => {
  menu.value.show(event)
  showLineMenu.value = true
  targetFactoryCode.value = factoryCode
  targetLineCode.value = lineCode
  op.value.hide(event)
  chooseStartTime.value = timeOnMouse.value
  console.log(lineCode)
}
const onRightClickJob = (event: any, job: any, lineCode: string) => {
  jobmenu.value.show(event)
  const request: GetPlanScheduleRequestDTO = {
    Order: job.name,
    Color: job.color,
    Line: lineCode,
    StartDate: job.startDate,
    Respect: 1,
  }
  op.value.hide(event)
  requestPlanSchedule.value = request
  targetOrder.value = job.name
}

const onRightClickLine = (event: any, lineCode: string) => {
  linemenu.value.show(event)
  op.value.hide(event)
  targetLineCode.value = lineCode
  console.log(lineCode)
}
// Tooltip state
const tooltip = reactive({
  visible: false,
  content: '',
})

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)

// useFloating setup
const { floatingStyles, update } = useFloating(referenceEl, floatingEl, {
  placement: 'top',
  middleware: [offset(6), flip(), shift()],
  whileElementsMounted: autoUpdate,
})

function showTooltip(job: any, line: any, event: MouseEvent) {
  tooltip.visible = true
  tooltip.content = tooltipContent(job, line)
  referenceEl.value = event.currentTarget as HTMLElement
  update() // update position
}

function hideTooltip() {
  tooltip.visible = false
}

const emits = defineEmits<{
  (e: 'updatePositionDate', value: string): void
  (e: 'updatePositionManpower', value: number): void
}>()
const { getRelativeX, getRelativeY, getInsertIndexInLine } = useMouseEvent()
const { adjustTimeForIndex, adjustToWorkingHours } = useTime()

// contextmenu on rightclick
const showContextMenu = async (event: MouseEvent, job: Job, linename: string) => {
  console.log(linename)
  const containerX = draggableEl.value[linename]
  const containerY = (document.querySelector('.containerY') as HTMLElement) || null
  event.preventDefault()
  showMenu.value = true
  contextTargetJob.value = job

  menus.menuX = getRelativeX(containerX, event)
  menus.menuY = getRelativeY(containerY, event)
  const request: GetPlanScheduleRequestDTO = {
    Order: job.name,
    Color: job.color,
    Line: linename,
    StartDate: job.startDate,
    Respect: 1,
  }
  requestPlanSchedule.value = request
  targetOrder.value = job.name
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
  const img = new Image()
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==' // transparent pixel
  e.dataTransfer?.setDragImage(img, 0, 0)
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 0, 10) // offset เล็กน้อยเพื่อความสวยงาม
  document.addEventListener('mousemove', handleDragMove)
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

function onDragOver(lineCode: string, e: DragEvent) {
  e.preventDefault() // ต้องมี ไม่งั้น drop ไม่ทำงาน

  const container = draggableEl.value[lineCode]
  if (!container) return

  const relativeX = getRelativeX(container, e)
  const unitWidth = container.offsetWidth / store.timeIndexMap.size
  const index = Math.floor(relativeX / unitWidth)

  const timeKey = [...store.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]

  timeOnMouse.value = timeKey ?? ''
  emits('updatePositionDate', timeKey ?? '')
  emits(
    'updatePositionManpower',
    STORE_MASTER.masterLine.find((l) => l.lineCode === lineCode)?.capacityMP ?? 0,
  )
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
  document.removeEventListener('mousemove', handleDragMove)
}

watch(
  () => STORE_MASTER.currentFactory, // ✅ ต้องใช้แบบนี้เพื่อติดตาม reactive props
  (newMaster) => {
    lines.value = store.Lines.filter(
      (line) =>
        line.company === STORE_MASTER.currentFactory || STORE_MASTER.currentFactory === 'ALL',
    )
    console.log('Updated lines:', newMaster)
  },
  { immediate: true }, // เรียกทันทีตอน mounted
)
watch(
  () => [store.weeks, store.minWidthHeader, store.headerWidth],
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

function AddJob(success: boolean) {
  showModalAddJob.value = !success
}

function updateMouse(e: MouseEvent, lineCode: string, manpower: number) {
  const container = draggableEl.value[lineCode]
  if (!container) return

  const relativeX = getRelativeX(container, e)
  const unitWidth = container.offsetWidth / store.timeIndexMap.size
  const index = Math.floor(relativeX / unitWidth)
  const timeKey = [...store.timeIndexMap.entries()].find(([k, v]) => v === index)?.[0]
  timeOnMouse.value = timeKey ? timeKey : ''
  emits('updatePositionDate', timeKey as string)
  emits('updatePositionManpower', manpower)
}
// จัดการ Right Click

// getPlanschedule
const loadingPlan = ref<boolean>(false)
const fetchPlanSchedule = async (request: GetPlanScheduleRequestDTO) => {
  loadingPlan.value = true
  const res = await GetPlanScheduleData(request)

  if (res.status === 200) {
    planSchedule.value = res.data
  }
  loadingPlan.value = false
}
function tooltipContent(job: any, line: any) {
  return `
    <table style='border-collapse: collapse; font-size: 12px;'>
      <tr><td><b>Line</b></td><td>${line.name}</td></tr>
      <tr><td><b>Order</b></td><td>${job.name}</td></tr>
      <tr><td><b>Start</b></td><td>${formatTimeKey(new Date(job.startDate))}</td></tr>
      <tr><td><b>End</b></td><td>${formatTimeKey(new Date(job.endDate))}</td></tr>
      <tr><td><b>Style</b></td><td>${job.style}</td></tr>
      <tr><td><b>Color</b></td><td>${job.color}</td></tr>
      <tr><td><b>Type</b></td><td>${job.typeName}</td></tr>
      <tr><td><b>SAM</b></td><td>${STORE_MASTER.planJob.filter((item) => item.color == job.color && item.orderNo == job.name).map((item) => item.sam)[0]}</td></tr>
      <tr><td><b>Status</b></td><td>${job.processStatus == '1' ? 'InProcess' : 'Waiting'}</td></tr>
      <tr><td><b>Progres</b></td><td>${job.progressPct}</td></tr>
      <tr><td><b>QTY</b></td><td><b>${job.qty}</b></td></tr>
    </table>
  `
}

function handleDragMove(e: MouseEvent) {
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  if (!el) return

  // หา lineCode จาก container ที่ตรงกับ element
  const lineEntry = Object.entries(draggableEl.value).find(([lineCode, container]) =>
    container.contains(el),
  )

  if (!lineEntry) return

  const [lineCode, container] = lineEntry
  updateMouse(
    e,
    lineCode,
    STORE_MASTER.masterLine.find((item) => item.lineCode == lineCode)?.capacityMP ?? 0,
  )
}

const returnLoading = ref(false)

function handleReturnJob() {
  returnLoading.value = true
  let arrRequest: ReturnJobPlanRequest[] = []
  selectedOrderPlaned.value.forEach((item) => {
    const [sewId] = item.split('_')
    const request: ReturnJobPlanRequest = {
      SewId: parseInt(sewId),
    }
    arrRequest.push(request)
  })

  ReturnJobPlan(arrRequest).then((res) => {
    if (res.status === 200) {
      const removedJobs = res.data.removedlist
      store.Jobs = store.Jobs.filter((job) => {
        return !removedJobs.some(
          (r: any) =>
            r.orderNo === job.name &&
            r.color === job.color &&
            r.style === job.style &&
            r.season === job.season &&
            r.typeName === job.typeName,
        )
      })

      toast.add({
        severity: 'success',
        summary: 'Success Message',
        detail: 'Return Order Success',
        group: 'tc',
        life: 5000,
      })

      selectedOrderPlaned.value = []
      op.value.hide()
      confirmReturnDialog.value = false
      returnLoading.value = false
    } else {
      toast.add({
        severity: 'error',
        summary: 'error',
        detail: 'Return Order Fail',
        group: 'tc',
        life: 5000,
      })
      returnLoading.value = false
    }
  })
}

watch(selectedOrderPlaned, (newVal) => {
  console.log(selectedOrderPlaned.value)
})
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

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 9999;
}
</style>
