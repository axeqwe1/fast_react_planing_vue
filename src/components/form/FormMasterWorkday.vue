<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-between gap-2">
      <div class="w-full text-center">
        <h1 class="text-2xl font-bold">Workhour</h1>
      </div>
      <div
        class="flex flex-col gap-2 justify-center items-center border-1 max-w-[500px] w-full mx-auto p-3 rounded-2xl"
      >
        <div
          class="flex gap-6 items-center"
          v-for="item in InputList"
          v-if="InputList ? InputList.length >= 7 : InputList"
        >
          <label class="text-xl font-semibold w-40 text-center text-ellipsis"
            >{{ item.workDate }}
          </label>
          <label class="w-10 flex justify-end items-center">{{
            store.dayInWeek[parseDate(item.workDate).getUTCDay()]
          }}</label>
          <input type="number" class="input w-25" v-model="item.workHour" min="0" />
        </div>
        <div v-else>
          <span>...Please select Date in Calendar</span>
        </div>
      </div>

      <div
        class="flex flex-row justify-center items-center"
        v-if="InputList ? InputList.length >= 7 : InputList"
      >
        <button @click="submit" class="btn btn-success w-30 h-15 font-semibold text-xl">
          SAVE
        </button>
      </div>
    </div>
    <div
      class="flex flex-1/8 h-full overflow-auto border-1 border-neutral-200 shadow-2xl rounded-3xl justify-center items-center"
    >
      <Calendar @select="onSelectDay" />
    </div>
  </div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-500"
      leave-active-class="transition-opacity duration-500"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showToast" class="toast toast-top toast-center z-[9999]">
        <div class="alert" :class="toastIsError ? 'alert-error text-amber-200' : 'alert-success'">
          <span class="font-bold">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'
import { useMaster } from '@/stores/masterStore'
import type { Job, Line, MasterHoliday, MasterLine } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import { CreateMasterLine, CreateWorkDay, DeleteMasterLine, GetWorkDay } from '@/lib/api/Masterplan'
import Modal from '../Modal.vue'
import Calendar from '../Calendar.vue'
import { formatDateLocal, formatTimeKey } from '@/utils/formatKey'
import { useScheduleStore } from '@/stores/scheduleStore'
import { parseDate } from '@/utils/formatKey'
import type { CreateMasterWorkDay } from '@/type/requestDTO'
const isEdit = ref<boolean>(false)
const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const countDownToast = ref<number>(0)
const toastMessage = ref<string>('')
const targetLineId = ref<number>(0)
const store = useScheduleStore()
const lines = [
  { id: '1', name: 'YPT' },
  { id: '2', name: 'GNX' },
  { id: '3', name: 'RACHABURI' },
]
const menus = reactive({ menuX: 0, menuY: 0 })
const contextMenuActions = ref([{ label: 'Delete Line', action: 'delete' }])
const listDate = ref<Map<string, number>>(new Map())
const InputList = ref<CreateMasterWorkDay[]>([])
const lineType = [
  { name: 'ALL' },
  { name: '_None' },
  { name: 'Accessories' },
  { name: 'Baseball Shirt' },
  { name: 'BG' },
  { name: 'BG V' },
  { name: 'Jacket' },
  { name: 'Jacket FZ' },
  { name: 'Jacket HD' },
  { name: 'Jacket HZ' },
  { name: 'NURSE PANTS' },
  { name: 'NURSE SCRUB' },
  { name: 'Pants' },
  { name: 'Pants BG' },
  { name: 'Polo Long arm' },
  { name: 'Polo Short arm' },
  { name: 'SKIRT' },
  { name: 'Tight' },
  { name: 'T-Shirt' },
  { name: 'T-Shirt+Pants' },
  { name: 'Underwear' },
]
const masterline = ref<MasterLine[]>([])
const STORE_MASTER = useMaster()
const model = reactive<MasterLine>({
  id: 0,
  lineCode: '',
  lineName: '',
  lineType: 'Choose Line Type',
  factoryCode: 'Choose Factory',
  capacityMP: 0,
  defaultHours: 0,
  isActive: false,
  status: 1,
  remark: '',
  createBy: '',
  createDate: new Date(),
  updateBy: '',
  updateDate: new Date(),
})
const showModal = ref<boolean>(false)
const showMenu = ref(false)
const contextTargetJob = ref<Job | null>()
const { getRelativeX, getRelativeY, getInsertIndexInLine } = useMouseEvent()
const { adjustTimeForIndex, adjustToWorkingHours } = useTime()
const selectEdit = (masterline: MasterLine) => {
  model.id = masterline.id
  model.lineCode = masterline.lineCode
  model.lineName = masterline.lineName
  model.factoryCode = masterline.factoryCode
  model.lineType = masterline.lineType
  model.capacityMP = masterline.capacityMP
  model.defaultHours = masterline.defaultHours
  model.isActive = masterline.isActive
  isEdit.value = true
}

const reset = () => {
  model.id = 0
  model.lineCode = ''
  model.lineName = ''
  model.factoryCode = 'Choose Factory'
  model.lineType = 'Choose Line Type'
  model.capacityMP = 0
  model.defaultHours = 0
  model.isActive = false
  isEdit.value = false
}

// contextmenu on rightclick
const showContextMenu = (event: MouseEvent, data: MasterLine) => {
  console.log(data)
  event.preventDefault()
  showMenu.value = true
  targetLineId.value = data.id
  // :style="{ left: x + 250 + 'px', top: y - 60 + 'px' }"
  menus.menuX = event.x - 205
  menus.menuY = event.y + 30
}
const closeContextMenu = () => {
  showMenu.value = false
}
function handleActionClick(action: any) {
  switch (action) {
    case 'delete': {
      console.log('found action')
      showModal.value = true
      console.log(showModal.value)
      if (showModal.value) showMenu.value = false
      break
    }
    default: {
      console.warn('Not found action')
    }
  }
}

const submitAction = async () => {
  console.log(InputList.value)
  try {
    let data: CreateMasterWorkDay[] = InputList.value
    const res = await CreateWorkDay(data)

    console.log(res)
    if (res.success) {
      toastMessage.value = res.message
      STORE_MASTER.getMasterLine()
      showToastCountdown()
    }
    console.log(InputList.value)
  } catch (err: any) {
    toastMessage.value = err
    showToastCountdown()
  }
}
const submit = () => {
  toastIsError.value = false
  submitAction()
}
let timer: any = null
const showToastCountdown = () => {
  countDownToast.value = 5
  showToast.value = true
  timer = setInterval(() => {
    if (countDownToast.value > 0) {
      countDownToast.value--
    } else {
      showToast.value = false
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const onSelectDay = async (date: Date) => {
  listDate.value.clear()
  InputList.value = []
  const startWeek = getStartOfWeek(date)
  const endOfWeek = getEndOfWeek(startWeek)
  for (let i = startWeek; i <= endOfWeek; i.setDate(i.getDate() + 1)) {
    const key = formatDateLocal(i).split(' ')[0]
    console.log(i)
    listDate.value?.set(key, 8)
    const res = await GetWorkDay([key])
    if (res.length > 0) {
      InputList.value.push({
        workDate: res[0].date,
        workHour: res[0].hour,
      })
    } else {
      if (store.isHoliday(i)) {
        InputList.value.push({
          workDate: key,
          workHour: 0,
        })
      } else {
        InputList.value.push({
          workDate: key,
          workHour: 8,
        })
      }
    }
  }
  console.log('Selected Date:', InputList.value)
}

const saveWorkDay = async () => {
  try {
    let data: CreateMasterWorkDay[] = InputList.value
    const res = await CreateWorkDay(data)
  } catch (err: any) {}
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

watchEffect(() => {
  masterline.value = STORE_MASTER.masterLine
})

onMounted(() => {
  masterline.value = STORE_MASTER.masterLine
})
</script>

<style scoped>
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
