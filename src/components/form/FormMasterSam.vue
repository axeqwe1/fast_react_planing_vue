<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="w-100">
        <div class="flex flex-row items-center gap-2 w-full"></div>
      </div>
      <div class="flex flex-row gap-3 flex-wrap">
        <!-- <div class="w-60">
          <label for="LineCode">Line Code</label>
          <input v-model="model.lineCode" type="text" placeholder="LineCode" class="input" />
        </div> -->
        <div class="w-60">
          <div class="dropdown w-full">
            <label>Style</label>
            <input v-model="model.style" tabindex="0" role="input" class="input" />
            <ul
              tabindex="0"
              class="dropdown-content bg-base-100 rounded-box z-1 p-2 shadow-sm max-h-[200px] overflow-auto w-full"
            >
              <li
                v-for="item in styleList"
                @click="handleClickStyle(item)"
                class="p-2 bg-base-100 hover:bg-base-300 hover:cursor-pointer w-full"
              >
                <a>{{ item }}</a>
              </li>
              <li
                v-if="styleList.length <= 0"
                class="p-2 bg-base-100 hover:bg-base-300 hover:cursor-pointer w-full"
              >
                <a>No Data</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="w-60">
          <div class="dropdown w-full">
            <label>Season</label>
            <input v-model="model.season" tabindex="0" role="input" class="input" />
            <ul
              tabindex="0"
              class="dropdown-content bg-base-100 rounded-box z-1 p-2 shadow-sm w-full"
            >
              <li
                v-for="item in seasonList"
                @click="handleClickSeason(item)"
                class="p-2 bg-base-100 hover:bg-base-300 hover:cursor-pointer w-full"
              >
                <a>{{ item }}</a>
              </li>
              <li
                v-if="seasonList.length <= 0"
                class="p-2 bg-base-100 hover:bg-base-300 hover:cursor-pointer w-full"
              >
                <a>No Data</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="w-60">
          <label for="SAM">SAM</label>
          <input v-model="model.SAM_Minutes" type="number" min="0" class="input" />
        </div>
        <div class="w-60">
          <label for="TypeName">TypeName</label>
          <input v-model="model.typeName" type="text" class="input" />
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
          <button v-if="isEdit" class="btn btn-accent w-60 btn-xl" @click="reset">Reset</button>
        </div>
      </div>
    </div>
    <div class="flex-1/2 h-full overflow-auto border-1">
      <div class="flex flex-col h-full justify-start items-center p-6">
        <div class="overflow-x-auto">
          <table class="table table-xs">
            <!-- head -->
            <thead class="sticky top-0 bg-base-300">
              <tr>
                <th></th>
                <th>Style</th>
                <th>Season</th>
                <th>TypeName</th>
                <th>Program Code</th>
                <th>SAM_Minutes</th>
                <th>Effective Date</th>
                <th>Expire Date</th>
              </tr>
            </thead>
            <tbody>
              <!-- row 1 -->
              <tr
                @contextmenu="(e) => showContextMenu(e, item)"
                @click="selectEdit(item, index)"
                class="hover:bg-base-200 hover:cursor-pointer"
                v-for="(item, index) in master"
                :class="currentActive == index ? 'bg-base-200' : ''"
                :key="item.id"
              >
                <td>{{ item.id }}</td>
                <td class="w-50">{{ item.style }}</td>
                <td>{{ item.season }}</td>
                <td>{{ item.typeName }}</td>
                <td>{{ item.programCode }}</td>
                <td>{{ item.saM_Minutes }}</td>
                <td>{{ item.effectiveDate.split('T')[0] }}</td>
                <td>{{ item.expireDate.split('T')[0] }}</td>
              </tr>
            </tbody>
          </table>
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
import type { Job, Line, MasterEfficiency, MasterLine, MasterSam } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive, onBeforeUnmount, computed } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import {
  CreateMasterEfficiency,
  CreateMasterLine,
  CreateMasterSamAPI,
  DeleteMasterEfficiency,
  DeleteMasterLine,
  deleteMasterSAM,
  SearchQueryMasterSamViewStyle,
} from '@/lib/api/Masterplan'
import Modal from '../Modal.vue'
import type { CreateMasterSam } from '@/type/requestDTO'
import { debounce } from 'lodash'
import { defaultDocument } from '@vueuse/core'

const isEdit = ref<boolean>(false)
const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const countDownToast = ref<number>(0)
const toastMessage = ref<string>('')
const targetLineId = ref<number>(0)
const menus = reactive({ menuX: 0, menuY: 0 })
const contextMenuActions = ref([{ label: 'Delete SAM', action: 'delete' }])
const master = ref<MasterSam[]>([])
const STORE_MASTER = useMaster()
const model = reactive<CreateMasterSam>({
  season: '',
  style: '',
  typeName: '',
  SAM_Minutes: 0,
})
const showModal = ref<boolean>(false)
const showMenu = ref(false)

const styleRef = ref('')
const styleList = ref<string[]>([])

const seasonRef = ref('')
const seasonList = ref<string[]>([])

const currentActive = ref<number | null>(null)

const selectEdit = (masterline: MasterSam, index: number) => {
  if (currentActive.value == index) {
    reset()
  } else {
    model.season = masterline.season
    model.style = masterline.style
    model.SAM_Minutes = masterline.saM_Minutes
    model.typeName = masterline.typeName
    currentActive.value = index
    isEdit.value = true
  }
}
const handleClickStyle = (item: string) => {
  model.style = item
  const el = document.activeElement as HTMLElement | null
  if (el) el.blur()
}
const handleClickSeason = (item: string) => {
  model.season = item
  const el = document.activeElement as HTMLElement | null
  if (el) el.blur()
}
const reset = () => {
  model.season = ''
  model.style = ''
  model.SAM_Minutes = 0
  model.typeName = ''
  isEdit.value = false
  seasonList.value = []
  styleList.value = []
  currentActive.value = null
}

// contextmenu on rightclick
const showContextMenu = (event: MouseEvent, data: MasterSam) => {
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
    const res = await deleteMasterSAM(id)

    if (res.success) {
      toastMessage.value = res.message
      showToastCountdown()
      STORE_MASTER.getMasterSAMView()
      STORE_MASTER.GetMasterSAM()
      showModal.value = false
    }
  } catch (err: any) {
    console.error(err)
    throw err
  }
}

const submitAction = async () => {
  try {
    const res = await CreateMasterSamAPI(model)
    console.log(res)
    if (res.success) {
      toastMessage.value = res.message
      STORE_MASTER.getMasterSAMView()
      STORE_MASTER.GetMasterSAM()
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
  if (model.season.trim() === '') {
    toastMessage.value = 'Season is required'
    showToastCountdown()
  } else if (model.SAM_Minutes == null) {
    toastMessage.value = 'SAM is required'
    showToastCountdown()
  } else if (model.style.trim() === '') {
    toastMessage.value = 'Invalid style'
    showToastCountdown()
  } else if (model.typeName.trim() === '') {
    toastMessage.value = 'Type is required'
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

const fetchStyled = debounce(async (newVal: string) => {
  if (!newVal) {
    styleList.value = []
    seasonList.value = []
    return
  }

  const res = await SearchQueryMasterSamViewStyle(newVal)

  const setStyle = new Set(res.map((item: any) => item.style))
  styleList.value = [...setStyle] as string[]

  const set = new Set(res.map((item: any) => item.season))
  seasonList.value = [...set] as string[]
  console.log(seasonList.value, styleList.value)
}, 100)

watchEffect(() => {
  master.value = STORE_MASTER.masterSam
})
watch(
  () => model.style,
  async (newVal) => {
    fetchStyled(newVal)
  },
)
onMounted(() => {
  STORE_MASTER.GetMasterSAM()
  STORE_MASTER.getMasterSAMView()
  master.value = STORE_MASTER.masterSam
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
