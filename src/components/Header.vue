<template>
  <div
    class="flex fixed w-full top-0 left-0 z-10 bg-white border-b-1 border-gray-200 h-[60px] items-center justify-between px-4"
  >
    <div class="flex items-center">
      <span class="text-lg font-bold">Ai-Planing</span>
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
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/stores/scheduleStore'
import { IconCheck, IconZoomIn, IconZoomOut } from '@tabler/icons-vue'
import { onMounted, ref, watch } from 'vue'
import Modal from './Modal.vue'
import { GetMasterPlanData, UpdatePlan } from '@/lib/api/Masterplan'
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
const { setLoading } = useLoadingStore()
const showModal = ref(false)
const showSettingMasterLine = ref(false)
const showSettingMasterEfficiency = ref(false)
const showSettingMasterHoliday = ref(false)
const showSettingMasterWorkday = ref(false)
const showSettingMasterSam = ref(false)
const showViewOrder = ref(false)

const showConfirmModal = ref(false)
const showCustomModal = ref(false)
const store = useScheduleStore()
const width = ref(store.minWidthHeader || 300)
const jobs = ref([] as Job[])
const STORE_MASTER = useMaster()
const user = useAuth()
const refresh = async () => {
  store.Jobs = []
  store.jobUpdate = []
  await fetchMasterPlan()
}
const UpdatePlans = async () => {
  const res = await UpdatePlan(store.jobUpdate)

  store.jobUpdate = []
  await fetchMasterPlan()

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
const fetchMasterPlan = async () => {
  try {
    const res = await GetMasterPlanData()
    const data = res
    jobs.value = []
    console.log(res)
    data.forEach((items: any, index: number) => {
      jobs.value.push({
        id: index, // Assuming each item has a unique id
        line: items.data.line,
        qty: items.data.qty,
        style: items.data.style,
        color: items.data.color,
        typeName: items.data.typeName,
        name: items.data.orderNo,
        startDate: items.data.sewAssembly,
        endDate: items.data.sewFinish,
        duration: items.duration,
      })
    })
    store.setJobs(jobs.value) // Update the store with fetched jobs
    const filterLine = new Set(data.map((item: any) => item.data.line)) // Extract unique lines
    const arrLine = Array.from(filterLine) // Convert Set to Array
    const lineMap = arrLine.map((line: any) => {
      return {
        name: line,
      } as Line
    })
    store.setLine(lineMap) // Update the store with unique lines
    store.setMasters(data.data) // Update the store with master data
    await store.computeAllJobStyles()
    console.log('Fetched jobs:', jobs.value) // Log fetched jobs for debugging
  } catch (err: any) {
    console.error('Error fetching test data:', err)
  }
}

onMounted(() => {
  STORE_MASTER.getMasterLine()
  STORE_MASTER.getMasterEfficiency()
  STORE_MASTER.GetMasterSAM()
  STORE_MASTER.GetMasterHoliday()
  STORE_MASTER.getMasterSAMView()
})
</script>

<style scoped></style>
