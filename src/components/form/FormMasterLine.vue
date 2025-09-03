<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="w-100">
        <label for="LineCode">Line ID : </label>
        <div class="flex flex-row items-center gap-2 w-full">
          <input v-model="model.id" type="text" placeholder="Line ID" class="input" disabled />
          <button @click="reset" v-if="isEdit" class="btn btn-accent">Reset</button>
          <span v-if="isEdit" class="text-amber-500 w-full font-bold">Edit Mode</span>
        </div>
      </div>
      <div class="flex flex-row gap-3 flex-wrap">
        <div class="w-60">
          <label for="LineCode">Line Code</label>
          <input v-model="model.lineCode" type="text" placeholder="LineCode" class="input" />
        </div>
        <div class="w-60">
          <label for="LineName">Line Name</label>
          <input v-model="model.lineName" type="text" placeholder="LineName" class="input" />
        </div>
        <div class="w-60">
          <label for="Factory">Factory</label>
          <select class="select" v-model="model.factoryCode">
            <option disabled selected>Choose Factory</option>
            <option v-for="line in lines" :key="line.id" :value="line.factoryCode">
              {{ line.factoryCode }}
            </option>
          </select>
        </div>
        <div class="w-60">
          <label for="LineType">Line Type</label>
          <select class="select" v-model="model.lineType">
            <option disabled selected>Choose Line Type</option>
            <option v-for="item in lineType" :key="item.name" :value="item.name">
              {{ item.name }}
            </option>
          </select>
        </div>
        <div class="w-60">
          <label for="CapMP">CapMP</label>
          <input
            type="number"
            class="input"
            required
            placeholder="Type a number CapMP"
            min="1"
            max="200"
            title="Must be between be 1 to 200"
            v-model="model.capacityMP"
          />
        </div>
        <div class="w-60">
          <label for="DefaultHours">DefaultHours</label>
          <input
            type="number"
            class="input"
            required
            placeholder="Type a number DefaultHours"
            min="1"
            max="200"
            title="Must be between be 1 to 200"
            v-model="model.defaultHours"
          />
        </div>
        <div class="w-60 flex flex-col justify-start">
          <label class="flex items-center gap-2 cursor-pointer">
            <span>Active</span>
            <input
              type="checkbox"
              id="checkbox"
              v-model="model.isActive"
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
          v-for="item in masterline"
          class="card card-border bg-base-100 w-full p-1 px-4"
          @click="selectEdit(item)"
          @contextmenu.prevent="showContextMenu($event, item)"
        >
          <div
            class="card-body gap-3 p-3 border-1 rounded-2xl hover:bg-base-300 transition-all ease-in duration-100 cursor-pointer"
          >
            <h2 class="card-title border-b-1 border-b-gray-400 pb-3">
              <span class="text-sky-700">LineCode : {{ item.lineCode }}</span>
              <span>LineName : {{ item.lineName }} </span>
            </h2>
            <table class="">
              <thead>
                <tr class="p-0 text-sky-500 font-semibold">
                  <th>CapMP</th>
                  <th>DefaultHours</th>
                  <th>Factory</th>
                  <th>LineType</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-center">
                  <td>{{ item.capacityMP }}</td>
                  <td>{{ item.defaultHours }}</td>
                  <td>{{ item.factoryCode }}</td>
                  <td>{{ item.lineType }}</td>
                  <td
                    class="p-3 rounded-full font-bold badge"
                    :class="item.isActive ? 'badge-success' : 'badge-error'"
                  >
                    {{ item.isActive ? 'Active' : 'Deactive' }}
                  </td>
                </tr>
              </tbody>
            </table>
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
import type { Job, Line, MasterLine } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import { CreateMasterLine, DeleteMasterLine } from '@/lib/api/Masterplan'
import Modal from '../Modal.vue'
const STORE_MASTER = useMaster()
const isEdit = ref<boolean>(false)
const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const countDownToast = ref<number>(0)
const toastMessage = ref<string>('')
const targetLineId = ref<number>(0)
const lines = STORE_MASTER.masterFactory
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
const masterline = ref<MasterLine[]>([])

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
  console.log(masterline)
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

const deleteLine = async (id: number) => {
  try {
    const res = await DeleteMasterLine(id)

    if (res.success) {
      toastMessage.value = res.message
      showToastCountdown()
      STORE_MASTER.getMasterLine()
      showModal.value = false
    }
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
const submitAction = async () => {
  try {
    const res = await CreateMasterLine(model)
    console.log(res)
    if (res.success) {
      toastMessage.value = res.message
      STORE_MASTER.getMasterLine()
      showToastCountdown()
    }
  } catch (err: any) {
    toastMessage.value = err
    showToastCountdown()
  }
}
const submit = () => {
  if (model.lineCode.trim() === '') {
    toastMessage.value = 'Line Code is required'
    showToastCountdown()
  } else if (model.lineName.trim() === '') {
    toastMessage.value = 'Line Name is required'
    showToastCountdown()
  } else if (!lines.some((h) => h.factoryCode === model.factoryCode)) {
    toastMessage.value = 'Invalid Factory'
    showToastCountdown()
  } else if (!lineType.some((h) => h.name === model.lineType)) {
    toastMessage.value = 'Invalid Line Type'
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
