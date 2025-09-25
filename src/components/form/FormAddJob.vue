<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="flex flex-row items-center gap-2">
        <div class="w-40">
          <label for="HolidayDate">Line</label>
          <select class="select" v-model="modelData.Line">
            <option disabled selected>Pick Line</option>
            <option v-for="line in listLine" :value="line.lineCode">
              {{ line.lineName }} ({{ line.factoryCode }})
            </option>
          </select>
        </div>
        <div class="w-50">
          <label for="startDate">START DATE</label>
          <input v-model="modelData.startDate" type="datetime-local" class="input" />
        </div>
      </div>

      <div class="flex flex-row gap-3 flex-wrap">
        <div class="w-60">
          <label for="OrderNo">OrderNo</label>
          <input v-model="modelData.Order" type="text" class="input" placeholder="OrderNO" />
        </div>

        <div class="w-60">
          <label for="Style">Style</label>
          <input v-model="modelData.Style" type="text" class="input" placeholder="Style" />
        </div>
        <div class="w-60">
          <label for="Color">Color</label>
          <input v-model="modelData.Color" type="text" class="input" placeholder="Color" />
        </div>
        <div class="w-60">
          <label for="Season">Season</label>
          <input v-model="modelData.Season" type="text" class="input" placeholder="Season" />
        </div>

        <div class="w-full flex flex-row justify-start items-center gap-2 mt-5">
          <button
            class="btn btn-success w-60 btn-xl"
            :class="'btn-success'"
            @click="confirmModal = true"
          >
            {{ isEdit ? 'Update' : 'Save' }}
          </button>

          <button v-if="isEdit" class="btn btn-accent w-60 btn-xl" @click="reset">Reset</button>
        </div>
      </div>
    </div>
    <div class="flex-1/2 h-full overflow-auto border-1">
      <div class="flex flex-col h-full max-h-[900px] justify-start items-center p-6">
        <div v-bind="containerProps" style="overflow-y: auto" class="w-full h-full overflow-x-auto">
          <div v-bind="wrapperProps">
            <table class="table table-xs">
              <!-- head -->
              <thead>
                <tr class="sticky top-0 bg-base-200 z-10 text-center w-full">
                  <th>#</th>
                  <th class="relative" data-filter="orderNo">
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'orderNo' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('orderNo')"
                    >
                      Order No -
                    </div>
                    <div
                      v-show="openFilter === 'orderNo'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.orderNo)"
                        @update:data="(val) => onFilterSelect('orderNo', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <th class="relative" data-filter="style">
                    <!-- Style -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'style' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('style')"
                    >
                      Style -
                    </div>
                    <div
                      v-show="openFilter === 'style'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.style)"
                        @update:data="(val) => onFilterSelect('style', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <th>Division</th>
                  <th class="relative" data-filter="season">
                    <!-- Season -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'season' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('season')"
                    >
                      Season -
                    </div>
                    <div
                      v-show="openFilter === 'season'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.season)"
                        @update:data="(val) => onFilterSelect('season', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <!-- ProgramTH -->
                  <th class="relative" data-filter="programCode">
                    <!-- programCode -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'programCode' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('programCode')"
                    >
                      Program Code -
                    </div>
                    <div
                      v-show="openFilter === 'programCode'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.programCode)"
                        @update:data="(val) => onFilterSelect('programCode', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <th class="relative" data-filter="color">
                    <!-- Color -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'color' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('color')"
                    >
                      Color -
                    </div>
                    <div
                      v-show="openFilter === 'color'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.color)"
                        @update:data="(val) => onFilterSelect('color', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <th class="relative" data-filter="customer">
                    <!-- Color -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'customer' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('customer')"
                    >
                      Customer -
                    </div>
                    <div
                      v-show="openFilter === 'customer'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.customer)"
                        @update:data="(val) => onFilterSelect('customer', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <th>Ship Date</th>
                  <th>Qty</th>
                  <th>Qty QC Sew</th>
                  <th>Qty Pack</th>
                  <th>Status</th>
                  <th data-filter="statusName" class="relative">
                    <!-- statusName -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'statusName' ? 'bg-blue-500 text-white' : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('statusName')"
                    >
                      Status Name -
                    </div>
                    <div
                      v-show="openFilter === 'statusName'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.statusName)"
                        @update:data="(val) => onFilterSelect('statusName', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>
                  <th data-filter="processNameStatus" class="relative">
                    <!-- Process Name Status -->
                    <div
                      :class="[
                        'cursor-pointer px-2 py-1 rounded',
                        openFilter === 'processNameStatus'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100',
                      ]"
                      @click="toggleFilter('processNameStatus')"
                    >
                      Process Name Status -
                    </div>
                    <div
                      v-show="openFilter === 'processNameStatus'"
                      class="absolute z-50 mt-1 w-42 overflow-auto border rounded shadow bg-white"
                    >
                      <CustomFilterColumn
                        :data="masterFiltered.map((item) => item.processNameStatus)"
                        @update:data="(val) => onFilterSelect('processNameStatus', val)"
                        :reset="resetFilterCount"
                      />
                    </div>
                  </th>

                  <th>Process Pct</th>
                  <th>Qty Bundle</th>
                  <th>Qty Cut</th>
                  <th>Qty EMB</th>
                  <th>Qty Emboss</th>
                  <th>Qty Print</th>
                  <th>Qty Heat</th>
                  <th>Qty PR Pad</th>
                  <th>Qty Fusing</th>
                  <th>Qty Bonding</th>
                  <th>Qty Laser Cut</th>
                  <th>Qty QC</th>
                  <th>Qty Match</th>
                  <th>Qty Out</th>
                  <th>Qty Sew</th>
                </tr>
              </thead>

              <!-- body -->
              <tbody>
                <tr
                  class="hover:bg-base-200 hover:cursor-pointer text-center"
                  v-for="row in list"
                  :key="`${row.data.orderNo}${row.data.style}${row.data.color}${row.index}`"
                  :class="currentActive === row.index ? 'bg-base-200' : ''"
                  @click="selectData(row.data)"
                >
                  <td>{{ row.index + 1 }}</td>
                  <td>{{ row.data.orderNo }}</td>
                  <td>{{ row.data.style }}</td>
                  <td>{{ row.data.division }}</td>
                  <td>{{ row.data.season }}</td>
                  <td>{{ row.data.programCode }}</td>
                  <td>{{ row.data.color }}</td>
                  <td>{{ row.data.customer }}</td>
                  <td
                    :class="{
                      'bg-red-400 text-amber-300': new Date(row.data.shipDate) < new Date(),
                      'bg-sky-400 text-base-200': new Date(row.data.shipDate) > new Date(),
                    }"
                    class="font-bold"
                  >
                    {{ row.data.shipDate.toString().split('T')[0] }}
                  </td>
                  <td>{{ row.data.qty }}</td>
                  <td>{{ row.data.qtyQCSew }}</td>
                  <td>{{ row.data.qtyPack }}</td>
                  <td>{{ row.data.status }}</td>
                  <td>
                    <span
                      :class="{
                        'badge-success': row.data.statusName == 'Confirm',
                        'badge-error':
                          row.data.statusName == 'Cancel' || row.data.statusName == 'Close',
                        'badge-info': row.data.statusName == 'Shipped',
                      }"
                      class="badge font-bold"
                    >
                      {{ row.data.statusName }}
                    </span>
                  </td>
                  <td>
                    <span
                      :class="{
                        'badge-success': row.data.processNameStatus == 'Complete',
                        'badge-warning': row.data.processNameStatus == 'Waiting',
                        'badge-info': row.data.processNameStatus == 'InProgress',
                      }"
                      class="badge font-bold"
                    >
                      {{ row.data.processNameStatus }}
                    </span>
                  </td>

                  <td>{{ row.data.progressPct }}</td>
                  <td>{{ row.data.qtyBundle }}</td>
                  <td>{{ row.data.qtyCut }}</td>
                  <td>{{ row.data.qtyEMB }}</td>
                  <td>{{ row.data.qtyEmboss }}</td>
                  <td>{{ row.data.qtyPrint }}</td>
                  <td>{{ row.data.qtyHeat }}</td>
                  <td>{{ row.data.qtyPRPad }}</td>
                  <td>{{ row.data.qtyFusing }}</td>
                  <td>{{ row.data.qtyBonding }}</td>
                  <td>{{ row.data.qtyLaserCut }}</td>
                  <td>{{ row.data.qtyQc }}</td>
                  <td>{{ row.data.qtyMatch }}</td>
                  <td>{{ row.data.qtyOut }}</td>
                  <td>{{ row.data.qtySew }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- end overflow -->
        <div class="flex flex-row justify-between items-center mt-4 w-full">
          <div>
            <label for="">Total rows : {{ pagInModel.totalRows }}</label>
          </div>
          <div class="flex flex-row">
            <div class="flex flex-row items-center gap-2">
              <button
                @click="pagInModel.pageNumber = 1"
                class="btn btn-sm bg-base-200"
                :class="
                  pagInModel.pageNumber > 1 ? 'btn btn-sm bg-base-200' : 'btn btn-sm btn-disabled'
                "
              >
                <<
              </button>
              <button
                @click="
                  pagInModel.pageNumber > 1 ? pagInModel.pageNumber-- : (pagInModel.pageNumber = 1)
                "
                :class="
                  pagInModel.pageNumber > 1 ? 'btn btn-sm bg-base-200' : 'btn btn-sm btn-disabled'
                "
                class="btn btn-sm bg-base-200"
              >
                <
              </button>
              {{ pagInModel.pageNumber }} of {{ pagInModel.totalPage }}
              <button
                @click="
                  pagInModel.pageNumber < pagInModel.totalPage
                    ? pagInModel.pageNumber++
                    : (pagInModel.pageNumber = pagInModel.totalPage)
                "
                :class="
                  pagInModel.pageNumber < pagInModel.totalPage
                    ? 'btn btn-sm bg-base-200'
                    : 'btn btn-sm btn-disabled'
                "
                class="btn btn-sm bg-base-200"
              >
                >
              </button>
              <button
                @click="pagInModel.pageNumber = pagInModel.totalPage"
                class="btn btn-sm bg-base-200"
                :class="
                  pagInModel.pageNumber < pagInModel.totalPage
                    ? 'btn btn-sm bg-base-200'
                    : 'btn btn-sm btn-disabled'
                "
              >
                >>
              </button>
              <select v-model="pagInModel.pageSize" class="select w-20 select-ghost">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
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

  <!-- Custom Modal -->
  <Modal
    :modelValue="confirmModal"
    :size="'small'"
    @update:modelValue="(val: any) => (showModal = val)"
    :closable="false"
    :persistent="true"
  >
    <template #header>
      <h2 class="text-2xl font-bold">
        Add job to line
        {{ STORE_MASTER.masterLine.find((item) => item.lineCode == modelData.Line)?.lineName }}
      </h2>
    </template>

    <div>
      <h1>Are you sure to Add job to plan?</h1>
    </div>

    <template #footer>
      <div class="flex flex-row-reverse gap-2">
        <button
          @click="submit($event)"
          :disabled="loadingProcess"
          class="border-1 rounded-2xl w-[100px] h-[50px] hover:bg-transparent hover:text-gray-900 text-xl transition-all ease-in duration-100"
          :class="
            loadingProcess
              ? 'btn-disabled opacity-50 cursor-not-allowed'
              : 'bg-green-500 text-white hover:border-green-500 hover:border-3 hover:cursor-pointer'
          "
        >
          <span v-show="loadingProcess">
            <span class="loading loading-spinner"></span>
            loading
          </span>
          <span v-show="!loadingProcess"> Confirm </span>
        </button>
        <button
          @click="confirmModal = false"
          class="hover:cursor-pointer border-1 rounded-2xl w-[100px] h-[50px] hover:bg-gray-500 hover:text-white text-xl transition-all ease-in duration-100"
        >
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import CustomFilterColumn from '@/components/filterComponent/CustomFilterColumn.vue'
import Modal from '../Modal.vue'
import { defaultDocument, useVirtualList } from '@vueuse/core'
import { type MasterLine, type Job, type MasterData, type Line } from '@/type/types'
import { useMaster } from '@/stores/masterStore'
import { useCaltime } from '@/composables/useCaltime'
import type { AddPlanJob } from '@/type/requestDTO'
import { useAuth } from '@/stores/userStore'
import { formatDateLocal, formatLocal } from '@/utils/formatKey'
import { useScheduleStore } from '@/stores/scheduleStore'
import { AddJob, GetPlanJob } from '@/lib/api/Masterplan'

const { calTime } = useCaltime()

const showModal = ref<boolean>()
const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const toastMessage = ref<string>('')
const countDownToast = ref<number>(0)
const isEdit = ref<boolean>()
const currentActive = ref<number>()
const master = ref<MasterData[]>([])
const masterFiltered = ref<MasterData[]>([])
const pagingMaster = ref<MasterData[]>([])
const openFilter = ref<string | null>(null) // 'orderNo', 'style', null
const loadingProcess = ref<boolean>(false)

const modelData = reactive<{
  startDate: string
  Line: string
  Order: string
  Color: string
  Style: string
  Season: string
}>({
  startDate: '',
  Line: 'Pick Line',
  Order: '',
  Color: '',
  Style: '',
  Season: '',
})

const pagInModel = reactive<{
  pageNumber: number
  pageSize: number
  totalRows: number
  totalPage: number
}>({
  pageNumber: 1,
  pageSize: 50,
  totalRows: 0,
  totalPage: 0,
})
const resetFilterCount = ref(0)
const filterState = {
  orderNo: [] as string[],
  style: [] as string[],
  statusName: [] as string[],
  processNameStatus: [] as string[],
  season: [] as string[],
  color: [] as string[],
  customer: [] as string[],
  programCode: [] as string[],
}
const listLine = ref<MasterLine[]>([])
const { user } = useAuth()
const props = defineProps<{ defaultStartDate?: string; factoryCode?: string; lineCode?: string }>()
const { list, containerProps, wrapperProps } = useVirtualList(
  pagingMaster, // ข้อมูล array ที่กรองแล้ว
  {
    itemHeight: 40, // สูงของแต่ละ row (px)
    overscan: 10, // preload แถวก่อน-หลัง
  },
)
const STORE_MASTER = useMaster()
const store = useScheduleStore()
const jobs = ref<Job[]>([])
const masterLine = ref<Line[]>([])
const confirmModal = ref<boolean>(false)
const emit = defineEmits<{
  (e: 'AddJob', value: boolean): void
}>()

function validation() {
  if (!modelData.startDate) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'startDate is required'
    showToastCountdown()
    console.log('startDate is required')
    return false
  } else if (modelData.Line === 'Pick Line') {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Line is required'
    showToastCountdown()
    console.log('Line is required')
    return false
  } else if (!modelData.Order) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Order is required'
    showToastCountdown()
    console.log('Order is required')
    return false
  } else if (!modelData.Color) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Color is required'
    showToastCountdown()
    console.log('Color is required')
    return false
  } else if (!modelData.Style) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Style is required'
    showToastCountdown()
    console.log('Style is required')
    return false
  } else if (!modelData.Season) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Season is required'
    showToastCountdown()
    console.log('Season is required')
    return false
  } else {
    showToast.value = false
    toastIsError.value = false
    console.log('✅ All fields valid')
    return true
  }
}
const submit = async (e: Event) => {
  e.preventDefault()
  loadingProcess.value = true
  if (validation()) {
    console.log('Compare Data : ', modelData.startDate, ' : ', new Date(modelData.startDate))
    console.log(modelData.Line)
    const newData: AddPlanJob = {
      startDate: formatLocal(new Date(modelData.startDate)),
      endDate: formatLocal(
        calTime(
          new Date(modelData.startDate),
          modelData.Order,
          modelData.Color,
          modelData.Line,
        ) as Date,
      ),
      Style: modelData.Style,
      Season: modelData.Season,
      CreateBy: user.fullname,
      OrderNo: modelData.Order,
      LineCode: modelData.Line,
      Color: modelData.Color,
    }

    const res = await AddJob(newData)
    console.log(res)
    if (res.status === 200) {
      confirmModal.value = false
      toastIsError.value = false
      toastMessage.value = res.data

      showToastCountdown()
      emit('AddJob', true)
      await refresh()
      loadingProcess.value = false
    }
  } else {
    loadingProcess.value = false
  }
}
const reset = async () => {}
function selectData(master: MasterData) {
  modelData.Color = master.color
  modelData.Order = master.orderNo
  modelData.Style = master.style
  modelData.Season = master.season
}
function toggleFilter(column: string) {
  if (openFilter.value === column) {
    openFilter.value = null // คลิกซ้ำ → ปิด
  } else {
    openFilter.value = column // เปิด column ใหม่ → ปิดอันอื่น
  }
}
// function resetFilter() {
//   Object.keys(filterState).forEach((key) => {
//     filterState[key as keyof typeof filterState] = []
//   })
//   masterFiltered.value = master.value
//   pagInModel.pageNumber = 1
//   resetFilterCount.value++
// }
function onFilterSelect(column: keyof typeof filterState, selected: string[]) {
  filterState[column] = selected
  // console.log(shipDate)
  let masterArr = master.value

  masterFiltered.value = masterArr.filter((item) => {
    return (Object.entries(filterState) as [keyof typeof filterState, string[]][]).every(
      ([key, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true
        return selectedValues.includes(item[key])
      },
    )
  })
  pagInModel.pageNumber = 1
}

const fetchData = async () => {
  const data = STORE_MASTER.planJob.filter(
    (item) =>
      item.processNameStatus == 'Waiting' &&
      (STORE_MASTER.currentFactory != 'ALL'
        ? item.factoryCode == STORE_MASTER.currentFactory
        : item.factoryCode) &&
      (item.sewStart == null || item.lineCode == null),
  )
  // console.log(data)
  // pagInModel.totalRows = res.data.totalRecords
  // pagInModel.totalPage = res.data.totalPages
  master.value = data
  masterFiltered.value = data
}
function paginateArray(array: MasterData[], pageSize: number, pageNumber: number) {
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = pageNumber * pageSize
  return array.slice(startIndex, endIndex)
}
// ฟังก์ชันตรวจสอบคลิกนอก dropdown
function handleClickOutside(e: PointerEvent) {
  if (!openFilter.value) return

  const target = e.target as HTMLElement
  // th ของคอลัมน์ที่เปิดอยู่ตอนนี้
  const openTh = document.querySelector(
    `th[data-filter="${openFilter.value}"]`,
  ) as HTMLElement | null

  // ถ้าหาไม่เจอ หรือคลิกอยู่นอก th ที่เปิดอยู่ → ปิด
  if (!openTh || !openTh.contains(target)) {
    openFilter.value = null
  }
}
onMounted(async () => {
  await fetchData()

  if (props.factoryCode) {
    listLine.value = STORE_MASTER.masterLine.filter(
      (item) => item.factoryCode === props.factoryCode,
    )
    masterFiltered.value = masterFiltered.value.filter(
      (item) => item.factoryCode == props.factoryCode,
    )
  } else {
    listLine.value = STORE_MASTER.masterLine
  }

  if (props.defaultStartDate) {
    modelData.startDate = props.defaultStartDate
  }
  if (props.lineCode) {
    modelData.Line = props.lineCode
  }
  pagInModel.totalRows = masterFiltered.value.length
  pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
  pagingMaster.value = paginateArray(
    masterFiltered.value,
    pagInModel.pageSize,
    pagInModel.pageNumber,
  )
})
watch(pagInModel, async () => {
  pagInModel.totalRows = masterFiltered.value.length
  pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
  const paginatedData = paginateArray(
    masterFiltered.value,
    pagInModel.pageSize,
    pagInModel.pageNumber,
  )
  pagingMaster.value = paginatedData
  // console.log(paginatedData)
})

watch(masterFiltered, () => {
  pagInModel.totalRows = masterFiltered.value.length
  pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
})
watch(
  () => modelData.Line,
  (newVal) => {
    console.log(newVal)
    let factoryCode = STORE_MASTER.masterLine.find((item) => item.lineCode == newVal)?.factoryCode
    masterFiltered.value = master.value.filter((item) => item.factoryCode == factoryCode)
    pagInModel.totalRows = masterFiltered.value.length
    pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
    pagingMaster.value = paginateArray(
      masterFiltered.value,
      pagInModel.pageSize,
      pagInModel.pageNumber,
    )
  },
)

const refresh = async () => {
  // store.Jobs = []
  // store.jobUpdate = []
  await fetchMasterPlan(STORE_MASTER.currentFactory)
}
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
        processStatus: items.processStatus,
        progressPct: items.progressPct,
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
onMounted(() => {
  // calTime(props.defaultStartDate)
})

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
</script>

<style scoped></style>
