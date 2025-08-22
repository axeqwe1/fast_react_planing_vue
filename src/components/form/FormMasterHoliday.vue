<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="w-100">
        <label for="LineCode">holiday ID : </label>
        <div class="flex flex-row items-center gap-2 w-full">
          <input
            v-model="model.holidayId"
            type="text"
            placeholder="Line ID"
            class="input"
            disabled
          />
          <button @click="reset" v-if="isEdit" class="btn btn-accent">Reset</button>
          <span v-if="isEdit" class="text-amber-500 w-full font-bold">Edit Mode</span>
        </div>
      </div>
      <div class="flex flex-row gap-3 flex-wrap">
        <!-- <div class="w-60">
          <label for="LineCode">Line Code</label>
          <input v-model="model.lineCode" type="text" placeholder="LineCode" class="input" />
        </div> -->
        <div class="w-60">
          <label for="HolidayDate">HolidayDate</label>
          <input v-model="model.holidayDate" type="date" class="input" />
        </div>
        <div class="w-60">
          <label for="LineCode">DayOfWeek</label>
          <input v-model="model.dayOfWeek" type="text" placeholder="dayOfWeek" class="input" />
        </div>
        <div class="w-full flex flex-col">
          <label for="LineCode">Holiday Name</label>
          <input v-model="model.holidayName" type="text" placeholder="holidayName" class="input" />
        </div>

        <div class="w-120 flex flex-row justify-start items-center gap-5">
          <label class="flex flex-col items-center gap-2 cursor-pointer">
            <span>National</span>
            <input
              type="checkbox"
              id="checkbox"
              v-model="model.isNational"
              class="toggle toggle-success"
            />
          </label>

          <label class="flex flex-col items-center gap-2 cursor-pointer">
            <span>Weekend</span>
            <input
              type="checkbox"
              id="checkbox"
              v-model="model.isWeekend"
              class="toggle toggle-success"
            />
          </label>
        </div>
        <div class="w-full flex flex-row justify-start items-center gap-2 mt-5">
          <button
            class="btn btn-success w-60 btn-xl"
            :class="isEdit ? 'btn-warning' : 'btn-success'"
            @click="submit"
          >
            {{ isEdit ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
    <div class="flex-1/2 h-full overflow-auto border-1">
      <div class="flex flex-col my-6">
        <div
          v-for="item in masterHoliday"
          class="card card-border bg-base-100 w-full p-1 px-4"
          @click="selectEdit(item)"
          @contextmenu.prevent="showContextMenu($event, item)"
        >
          <div
            class="card-body gap-3 p-3 border-1 rounded-2xl hover:bg-base-300 transition-all ease-in duration-100 cursor-pointer"
          >
            <h2 class="card-title border-b-1 border-b-gray-400 pb-3">
              <span class="text-sky-700">DATE : {{ item.holidayDate.split('T')[0] }}</span>
              <span>Name : {{ item.holidayName }} </span>
            </h2>

            <!-- <div class="card-actions justify-end">
              <button class="btn btn-primary">Buy Now</button>
            </div> -->
          </div>
        </div>
      </div>
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

  <!-- Overlay to close the menu -->
  <div class="overlay z-100" @click="closeContextMenu" v-if="showMenu" />

  <!-- Custom Context Menu -->
  <ContextMenu
    v-if="showMenu"
    :actions="contextMenuActions"
    @action-clicked="handleActionClick"
    :x="menus.menuX"
    :y="menus.menuY"
  />

  <!-- Custom Modal -->
  <Modal
    :modelValue="showModal"
    :size="'small'"
    @update:modelValue="(val: any) => (showModal = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">Delete Master Line Data</h2>
    </template>

    <div>
      <h1>Are you sure to Delete Data?</h1>
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2">
        <button
          @click="deleteLine(targetLineId)"
          class="hover:cursor-pointer border-1 rounded-2xl w-[100px] h-[50px] bg-green-500 text-white hover:bg-transparent hover:text-gray-900 hover:border-green-500 hover:border-3 text-xl transition-all ease-in duration-100"
        >
          Confirm
        </button>
        <button
          @click="showModal = false"
          class="hover:cursor-pointer border-1 rounded-2xl w-[100px] h-[50px] hover:bg-gray-500 hover:text-white text-xl transition-all ease-in duration-100"
        >
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'
import { useMaster } from '@/stores/masterStore'
import type { Job, Line, MasterEfficiency, MasterHoliday, MasterLine } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive, onBeforeUnmount, computed } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import {
  CreateMasterEfficiency,
  CreateMasterHoliday,
  CreateMasterLine,
  DeleteMasterEfficiency,
  DeleteMasterHoliday,
  DeleteMasterLine,
} from '@/lib/api/Masterplan'
import Modal from '../Modal.vue'

import { formatDateLocal, formatTimeKey } from '@/utils/formatKey'

const myDatepicker = ref<HTMLInputElement | null>(null)

const isEdit = ref<boolean>(false)
const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const countDownToast = ref<number>(0)
const toastMessage = ref<string>('')
const targetLineId = ref<number>(0)
const lines = [
  { id: '1', name: 'YPT' },
  { id: '2', name: 'GNX' },
  { id: '3', name: 'RACHABURI' },
]
const menus = reactive({ menuX: 0, menuY: 0 })
const contextMenuActions = ref([{ label: 'Delete Line', action: 'delete' }])
const DayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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
const masterHoliday = ref<MasterHoliday[]>([])
const STORE_MASTER = useMaster()
const model = reactive<MasterHoliday>({
  holidayId: 0,
  holidayDate: '',
  holidayName: '',
  dayOfWeek: '',
  isNational: false,
  isWeekend: false,
})
const showModal = ref<boolean>(false)
const showMenu = ref(false)
const contextTargetJob = ref<Job | null>()
const { getRelativeX, getRelativeY, getInsertIndexInLine } = useMouseEvent()
const { adjustTimeForIndex, adjustToWorkingHours } = useTime()

// const effectiveDateString = computed({
//   get: () => {
//     return model.effectiveDate ? formatDateLocal(model.effectiveDate) : ''
//   },
//   set: (val: string) => {
//     model.effectiveDate = val ? new Date(val + 'T00:00:00') : null
//   },
// })
const selectEdit = (masterline: MasterHoliday) => {
  // console.log(model.effectiveDate)
  model.holidayId = masterline.holidayId
  model.holidayDate = masterline.holidayDate.split('T')[0]
  model.holidayName = masterline.holidayName
  model.dayOfWeek = masterline.dayOfWeek
  model.isNational = masterline.isNational
  model.isWeekend = masterline.isWeekend
  isEdit.value = true
}

const reset = () => {
  model.holidayId = 0
  model.holidayDate = ''
  model.holidayName = ''
  model.isNational = false
  model.dayOfWeek = ''
  model.isWeekend = false
  isEdit.value = false
}

// contextmenu on rightclick
const showContextMenu = (event: MouseEvent, data: MasterHoliday) => {
  console.log(data)
  event.preventDefault()
  showMenu.value = true
  targetLineId.value = data.holidayId
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

const deleteLine = async (id: number) => {
  try {
    const res = await DeleteMasterHoliday(id)

    if (res.success) {
      toastMessage.value = res.message
      showToastCountdown()
      STORE_MASTER.GetMasterHoliday()
      showModal.value = false
    }
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

const submitAction = async () => {
  try {
    const res = await CreateMasterHoliday(model)
    console.log(res)
    if (res.success) {
      toastMessage.value = res.message
      STORE_MASTER.GetMasterHoliday()
      showToastCountdown()
    } else {
      toastIsError.value = true
    }
  } catch (err: any) {
    toastMessage.value = err
    toastIsError.value = true
    showToastCountdown()
  }
}

const submit = () => {
  if (model.holidayName.trim() === '') {
    toastMessage.value = 'Line Code is required'
    showToastCountdown()
  } else if (model.holidayDate == null) {
    toastMessage.value = 'Effect Date is required'
    showToastCountdown()
  } else {
    // ✅ ผ่าน validation
    toastIsError.value = false
    submitAction()
  }
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
watch(
  () => [model.holidayDate],
  () => {
    console.log(new Date(model.holidayDate).getDay())
    if (new Date(model.holidayDate).getDay() == 0) {
      model.isWeekend = true
    } else {
      model.isWeekend = false
    }
    model.dayOfWeek = DayOfWeek[new Date(model.holidayDate).getDay()]
  },
)
watchEffect(() => {
  masterHoliday.value = STORE_MASTER.masterHoliday
})

onMounted(() => {
  STORE_MASTER.GetMasterHoliday()
  masterHoliday.value = STORE_MASTER.masterHoliday
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
