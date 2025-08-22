<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="w-100">
        <label for="LineCode">eff ID : </label>
        <div class="flex flex-row items-center gap-2 w-full">
          <input v-model="model.id" type="text" placeholder="Line ID" class="input" disabled />
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
          <label for="LineType">Line Code</label>
          <select class="select" v-model="model.lineCode">
            <option disabled selected>Choose Line Code</option>
            <option
              v-for="item in STORE_MASTER.masterLine"
              :key="item.lineCode"
              :value="item.lineCode"
            >
              {{ item.lineName }}
            </option>
          </select>
        </div>
        <div class="w-60">
          <label for="EffectiveDate">EffectiveDate</label>
          <input v-model="model.effectiveDate" type="date" class="input" />
        </div>
        <div class="w-60">
          <label for="efficiencyPct">EfficiencyPct</label>
          <input
            type="number"
            class="input"
            required
            placeholder="Type a number EfficiencyPct"
            min="1"
            max="100"
            title="Must be between be 1 to 100"
            v-model="model.efficiencyPct"
          />
        </div>
        <div class="w-60">
          <label for="LineCode">BasisNote</label>
          <input v-model="model.basisNote" type="text" placeholder="basisNote" class="input" />
        </div>
        <!-- <div class="w-60 flex flex-col justify-start">
          <label class="flex items-center gap-2 cursor-pointer">
            <span>Active</span>
            <input
              type="checkbox"
              id="checkbox"
              v-model="model.status"
              class="toggle toggle-success"
            />
          </label>
        </div> -->
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
          v-for="item in masterEfficiency"
          class="card card-border bg-base-100 w-full p-1 px-4"
          @click="selectEdit(item)"
          @contextmenu.prevent="showContextMenu($event, item)"
        >
          <div
            class="card-body gap-3 p-3 border-1 rounded-2xl hover:bg-base-300 transition-all ease-in duration-100 cursor-pointer"
          >
            <h2 class="card-title border-b-1 border-b-gray-400 pb-3">
              <span class="text-sky-700"
                >LineCode :
                {{
                  STORE_MASTER.masterLine.find((i) => i.lineCode == item.lineCode)?.lineName
                }}</span
              >
              <span>Efficiency : {{ item.efficiencyPct }}% </span>
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
import type { Job, Line, MasterEfficiency, MasterLine } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive, onBeforeUnmount, computed } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import {
  CreateMasterEfficiency,
  CreateMasterLine,
  DeleteMasterEfficiency,
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
const masterEfficiency = ref<MasterEfficiency[]>([])
const STORE_MASTER = useMaster()
const model = reactive<MasterEfficiency>({
  id: 0,
  lineCode: '',
  effectiveDate: '',
  efficiencyPct: 0,
  basisNote: '',
  status: 1, // หรือ 0 แล้วแต่ logic ของคุณ
  remark: '',
  createBy: '',
  createDate: null,
  updateBy: '',
  updateDate: null,
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
const selectEdit = (masterline: MasterEfficiency) => {
  console.log(model.effectiveDate)
  model.id = masterline.id
  model.lineCode = masterline.lineCode
  model.effectiveDate = masterline.effectiveDate.split('T')[0]
  model.efficiencyPct = masterline.efficiencyPct
  model.basisNote = masterline.basisNote
  model.status = masterline.status
  isEdit.value = true
}

const reset = () => {
  model.id = 0
  model.lineCode = ''
  model.effectiveDate = ''
  model.efficiencyPct = 0
  model.basisNote = ''
  model.status = 0
  isEdit.value = false
}

// contextmenu on rightclick
const showContextMenu = (event: MouseEvent, data: MasterEfficiency) => {
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

const deleteLine = async (id: number) => {
  try {
    const res = await DeleteMasterEfficiency(id)

    if (res.success) {
      toastMessage.value = res.message
      showToastCountdown()
      STORE_MASTER.getMasterEfficiency()
      showModal.value = false
    }
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

const submitAction = async () => {
  try {
    const res = await CreateMasterEfficiency(model)
    console.log(res)
    if (res.success) {
      toastMessage.value = res.message
      STORE_MASTER.getMasterEfficiency()
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
  if (model.lineCode.trim() === '') {
    toastMessage.value = 'Line Code is required'
    showToastCountdown()
  } else if (model.effectiveDate == null) {
    toastMessage.value = 'Effect Date is required'
    showToastCountdown()
  } else if (model.basisNote.trim() === '') {
    toastMessage.value = 'Invalid basisNote'
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

watchEffect(() => {
  masterEfficiency.value = STORE_MASTER.masterEfficiency
})

onMounted(() => {
  STORE_MASTER.getMasterEfficiency()
  masterEfficiency.value = STORE_MASTER.masterEfficiency
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
