<template>
  <div
    class="flex fixed w-full top-0 left-0 z-10 bg-white border-b-1 border-gray-200 h-[60px] items-center justify-between px-4"
  >
    <div class="flex items-center">
      <div class="dropdown">
        <div
          tabindex="0"
          role="button"
          class="p-3 rounded-full hover:bg-base-300 hover:cursor-pointer text-lg font-bold"
        >
          Ai-Planing <span>{{ fac }}</span>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li @click="changeFac(item)" :key="item" v-for="item in ListFac">
            <a>{{ item }}</a>
          </li>
        </ul>
      </div>

      <span
        @click="showListJobOrder = true"
        class="p-3 rounded-full hover:bg-base-300 cursor-pointer relative"
      >
        <IconFolder />
        <span
          class="absolute flex justify-center items-center text-xs font-bold w-3 h-3 p-3 bg-rose-600 text-amber-300 rounded-full top-0 right-0"
          >{{ totalJob > 99 ? '99+' : totalJob }}
        </span>
      </span>
    </div>
    <div class="flex items-center space-x-4">
      <button
        class="px-4 py-2 rounded cursor-pointer"
        @click="showModal = true"
        :class="
          store.jobUpdate.length > 0
            ? 'bg-green-400 hover:bg-green-400/70 text-black cursor-not-allowed'
            : 'hidden'
        "
      >
        <span class="flex justify-center items-center"><IconCheck /> Save</span>
      </button>
      <button
        class="px-4 py-2 rounded cursor-pointer"
        @click="decreaseWidth"
        :class="
          width === 300
            ? 'bg-gray-300 opacity-20 cursor-not-allowed'
            : 'bg-gray-300 hover:bg-gray-700 hover:text-white'
        "
      >
        <IconZoomOut />
      </button>

      <button
        class="px-4 py-2 rounded cursor-pointer"
        @click="increaseWidth"
        :class="
          width === 3000
            ? 'bg-gray-300 opacity-20 cursor-not-allowed'
            : 'bg-gray-300 hover:bg-gray-700 hover:text-white'
        "
      >
        <IconZoomIn />
      </button>

      <button
        @click="refresh"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
      >
        Refresh
      </button>

      <button @click="showViewOrder = true" class="btn btn-accent">View Order</button>
      <div class="drawer drawer-end">
        <input id="my-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <!-- Page content here -->
          <label for="my-drawer" class="btn btn-primary drawer-button">Settings</label>
        </div>
        <div class="drawer-side">
          <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

          <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4 gap-4">
            <!-- Sidebar content here -->
            <label class="text-3xl text-center">Settings</label>
            <div class="flex flex-col justify-between h-full gap-20">
              <div class="flex flex-col gap-3">
                <li>
                  <button @click="showSettingMasterLine = true" class="btn btn-accent rounded-2xl">
                    Master Line
                  </button>
                </li>
                <li>
                  <button
                    @click="showSettingMasterHoliday = true"
                    class="btn btn-accent rounded-2xl"
                  >
                    Master Holiday
                  </button>
                </li>
                <li>
                  <button
                    @click="showSettingMasterWorkday = true"
                    class="btn btn-accent rounded-2xl"
                  >
                    Master Workday
                  </button>
                </li>
                <li>
                  <button
                    @click="showSettingMasterEfficiency = true"
                    class="btn btn-accent rounded-2xl"
                  >
                    Master Efficiency
                  </button>
                </li>
                <li>
                  <button @click="showSettingMasterSam = true" class="btn btn-warning rounded-2xl">
                    Master SAM
                  </button>
                </li>
              </div>
              <div>
                <li>
                  <button @click="handleLogout" class="btn btn-error rounded-2xl">Logout</button>
                </li>
              </div>
            </div>
          </ul>
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

  <!-- Custom Modal -->
  <Modal :modelValue="showModal" :size="'large'" @update:modelValue="(val) => (showModal = val)">
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
          @click="UpdatePlans"
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

  <Modal
    :modelValue="showSettingMasterLine"
    :size="'full'"
    @update:modelValue="(val) => (showSettingMasterLine = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">Masterline Setting</h2>
    </template>

    <div class="h-full">
      <FormMasterLine />
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2"></div>
    </template>
  </Modal>

  <Modal
    :modelValue="showSettingMasterEfficiency"
    :size="'full'"
    @update:modelValue="(val) => (showSettingMasterEfficiency = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">MasterEfficiency Setting</h2>
    </template>

    <div class="h-full">
      <FormMasterEfficiency />
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2"></div>
    </template>
  </Modal>

  <Modal
    :modelValue="showSettingMasterHoliday"
    :size="'full'"
    @update:modelValue="(val) => (showSettingMasterHoliday = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">MasterHoliday Setting</h2>
    </template>

    <div class="h-full">
      <FormMasterHoliday />
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2"></div>
    </template>
  </Modal>

  <Modal
    :modelValue="showSettingMasterWorkday"
    :size="'full'"
    @update:modelValue="(val) => (showSettingMasterWorkday = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">MasterWorkday Setting</h2>
    </template>

    <div class="h-full">
      <FormMasterWorkday />
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2"></div>
    </template>
  </Modal>

  <Modal
    :modelValue="showSettingMasterSam"
    :size="'full'"
    @update:modelValue="(val) => (showSettingMasterSam = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">MasterSam Setting</h2>
    </template>

    <div class="h-full">
      <FormMasterSam />
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2"></div>
    </template>
  </Modal>

  <Modal
    :modelValue="showViewOrder"
    :size="'full'"
    @update:modelValue="(val) => (showViewOrder = val)"
  >
    <template #header>
      <h2 class="text-2xl font-bold">View Order</h2>
    </template>

    <div class="h-full">
      <ViewOrderDetails />
    </div>

    <!-- <template #footer>
      <div class="flex flex-row-reverse gap-2"></div>
    </template> -->
  </Modal>

  <!-- Modal Add Job -->
  <Modal v-model="showListJobOrder" size="full" :closable="false" :persistent="true">
    <template #header>
      <h2 class="text-2xl font-bold">Add Job</h2>
    </template>

    <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 h-full">
      <!-- {{ chooseStartTime }} -->
      <FormAddJob />
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2">
        <button
          @click="showListJobOrder = false"
          class="hover:cursor-pointer border-1 rounded-2xl w-[100px] h-[50px] hover:bg-gray-500 hover:text-white text-xl transition-all ease-in duration-100"
        >
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/stores/scheduleStore'
import { IconCheck, IconZoomIn, IconZoomOut, IconFolder } from '@tabler/icons-vue'
import { onMounted, ref, watch } from 'vue'
import Modal from './Modal.vue'
import { GetMasterPlanData, GetPlanJob, UpdatePlan } from '@/lib/api/Masterplan'
import type { Job, Line } from '@/type/types'
import { useLoadingStore } from '@/stores/LoadingStore'
import FormMasterLine from './form/FormMasterLine.vue'
import { useMaster } from '@/stores/masterStore'
import FormMasterEfficiency from './form/FormMasterEfficiency.vue'
import FormMasterHoliday from './form/FormMasterHoliday.vue'
import FormMasterWorkday from './form/FormMasterWorkday.vue'
import FormMasterSam from './form/FormMasterSam.vue'
import { logout } from '@/lib/api/auth'
import { useAuth } from '@/stores/userStore'
import ViewOrderDetails from './details/ViewOrderDetails.vue'
import FormAddJob from './form/FormAddJob.vue'
const { setLoading } = useLoadingStore()
const showModal = ref(false)
const showSettingMasterLine = ref(false)
const showSettingMasterEfficiency = ref(false)
const showSettingMasterHoliday = ref(false)
const showSettingMasterWorkday = ref(false)
const showSettingMasterSam = ref(false)
const showViewOrder = ref(false)
const showListJobOrder = ref(false)

const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const countDownToast = ref<number>(0)
const toastMessage = ref<string>('')

const showConfirmModal = ref(false)
const showCustomModal = ref(false)
const store = useScheduleStore()
const width = ref(store.minWidthHeader || 300)
const jobs = ref([] as Job[])
const fac = ref<string>('ALL')
const ListFac = ref<string[]>([])

const masterLine = ref<Line[]>([])
const STORE_MASTER = useMaster()
const user = useAuth()

const totalJob = ref<number>(0)

const emit = defineEmits<{
  (e: 'factory', value: string): void
  (e: 'openAddJobModal', value: boolean): void
}>()

const changeFac = (item: string) => {
  fac.value = item
  STORE_MASTER.currentFactory = item
  // emit('factory', item)
  const active = document.activeElement as HTMLElement | null
  active?.blur()
}

const refresh = async () => {
  store.Jobs = []
  store.jobUpdate = []
  await fetchMasterPlan(STORE_MASTER.currentFactory)
}
const UpdatePlans = async () => {
  const res = await UpdatePlan(store.jobUpdate)
  console.log(res)
  if (res.status === 200) {
    showModal.value = false
    toastIsError.value = false
    toastMessage.value = 'UPDATE SUCCESS'
    showToastCountdown()
  } else {
    toastIsError.value = true
    toastMessage.value = res.statusText
    showToastCountdown()
  }

  store.jobUpdate = []
  await fetchMasterPlan(STORE_MASTER.currentFactory)

  showModal.value = false
}

function increaseWidth() {
  width.value += 600
}

function decreaseWidth() {
  width.value -= 600
}
const handleConfirm = () => {
  console.log('Confirmed!')
  showConfirmModal.value = false
}

const handleClose = () => {
  console.log('Modal closed')
}
const handleLogout = async () => {
  const res = await logout()
  if (res.status && res.status == 200) {
    user.isAuthen = false
  }
}
watch(width, (newWidth) => {
  if (newWidth) {
    if (newWidth <= 300) {
      newWidth = 300
      width.value = 300
    }
    if (newWidth >= 3000) {
      newWidth = 3000
      width.value = 3000
    }
    store.minWidthHeader = newWidth
    console.log('New width:', store.minWidthHeader)
  }
})
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
        id: index, // Assuming each item has a unique id
        line: items.lineCode,
        qty: items.qty,
        style: items.style,
        season: items.season,
        color: items.color,
        typeName: items.type,
        name: items.orderNo,
        startDate: items.sewStart,
        endDate: items.sewFinish,
        duration: items.duration,
      })
    })
    store.setJobs(jobs.value) // Update the store with fetched jobs

    // const filterLine = new Set(data.map((item: any) => item.line)) // Extract unique lines
    let arrLine = STORE_MASTER.masterLine // Convert Set to Array
    const lineMap = arrLine.map((line: any) => {
      return {
        name: line.lineName,
        lineCode: line.lineCode,
        company: line.factoryCode,
        manpower: line.capacityMP,
      } as Line
    })
    masterLine.value = lineMap

    if (factory === 'ALL') {
      store.Lines = masterLine.value
    } else {
      store.Lines = masterLine.value.filter((line) => line.company === factory)
    }

    store.computeAllJobStyles()
    // store.setMasters(filterData)
    // store.setLine(masterLine.value) // Update the store with unique lines
    // console.log('Fetched jobs:', jobs.value) // Log fetched jobs for debugging
  } catch (err: any) {
    console.error('Error fetching test data:', err)
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
  () => STORE_MASTER.masterFactory,
  (newVal) => {
    ListFac.value = newVal.map((item) => item.factoryCode)
    if (!ListFac.value.includes(fac.value)) {
      fac.value = 'ALL'
      STORE_MASTER.currentFactory = 'ALL'
      store.Lines = masterLine.value
    }

    emit('factory', fac.value)
  },
)
watch(
  () => [STORE_MASTER.currentFactory, STORE_MASTER.planJob],
  () => {
    const data = STORE_MASTER.planJob.filter(
      (item) =>
        item.processNameStatus == 'Waiting' && (item.sewStart == null || item.lineCode == null),
    )
    if (STORE_MASTER.currentFactory === 'ALL') {
      totalJob.value = data.length
    } else {
      totalJob.value = data.filter(
        (item) => item.factoryCode === STORE_MASTER.currentFactory,
      ).length
    }
  },
)

onMounted(() => {
  STORE_MASTER.getMasterLine()
  STORE_MASTER.getMasterEfficiency()
  STORE_MASTER.GetMasterSAM()
  STORE_MASTER.GetMasterHoliday()
  STORE_MASTER.getMasterSAMView()
  STORE_MASTER.getMasterFactory()
  STORE_MASTER.getMasterWorkDay()
  // STORE_MASTER.getPlanJob()

  emit('factory', fac.value)
})
</script>

<style scoped></style>
