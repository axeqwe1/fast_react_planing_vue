<template>
  <div class="w-full h-full flex flex-row form-master-line">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="w-60">
        <div class="flex flex-col items-start gap-2 w-full">
          <label for="HolidayDate">START DATE</label>
          <input type="date" class="input" />
        </div>
      </div>
      <div class="flex flex-row gap-3 flex-wrap">
        <div class="w-60">
          <label for="HolidayDate">OrderNo</label>
          <input type="text" class="input" />
        </div>
        <div class="w-60">
          <label for="HolidayDate">Line</label>
          <input type="text" class="input" />
        </div>
        <div class="w-60">
          <label for="HolidayDate">Style</label>
          <input type="text" class="input" />
        </div>
        <div class="w-60">
          <label for="HolidayDate">Color</label>
          <input type="text" class="input" />
        </div>
        <div class="w-60">
          <label for="HolidayDate">Season</label>
          <input type="text" class="input" />
        </div>

        <!-- <div class="w-60">
          <label for="LineCode">Line Code</label>
          <input v-model="model.lineCode" type="text" placeholder="LineCode" class="input" />
        </div> -->

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
      <div class="flex flex-col max-h-[900px] justify-start items-center p-6">
        <div
          v-bind="containerProps"
          style="height: 350px; overflow-y: auto"
          class="w-full h-full overflow-x-auto"
        >
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
import { onMounted, reactive, ref, watch } from 'vue'
import CustomFilterColumn from '@/components/filterComponent/CustomFilterColumn.vue'
import Modal from '../Modal.vue'
import { defaultDocument, useVirtualList } from '@vueuse/core'
import type { Job, MasterData } from '@/type/types'
import { GetPlanJob } from '@/lib/api/Masterplan'
import { useMaster } from '@/stores/masterStore'
import { getShiftRange } from '@/utils/utility'
import { formatDateLocal, formatLocal } from '@/utils/formatKey'
import { useCaltime } from '@/composables/useCaltime'

const { calTime } = useCaltime()

const showModal = ref<boolean>()
const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const toastMessage = ref<string>('')
const isEdit = ref<boolean>()
const currentActive = ref<number>()
const master = ref<MasterData[]>([])
const masterFiltered = ref<MasterData[]>([])
const pagingMaster = ref<MasterData[]>([])
const openFilter = ref<string | null>(null) // 'orderNo', 'style', null

const modelData = reactive<{
  startDate: string
  Line: string
  Order: string
  Color: string
  Style: string
  Season: string
}>({
  startDate: '',
  Line: '',
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
const props = defineProps<{ defaultStartDate?: string; factoryCode?: string }>()
const { list, containerProps, wrapperProps } = useVirtualList(
  pagingMaster, // ข้อมูล array ที่กรองแล้ว
  {
    itemHeight: 40, // สูงของแต่ละ row (px)
    overscan: 10, // preload แถวก่อน-หลัง
  },
)
const STORE_MASTER = useMaster()
const submit = async () => {}
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
function resetFilter() {
  Object.keys(filterState).forEach((key) => {
    filterState[key as keyof typeof filterState] = []
  })
  masterFiltered.value = master.value
  pagInModel.pageNumber = 1
  resetFilterCount.value++
}
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
  console.log(data)
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

  masterFiltered.value = masterFiltered.value.filter(
    (item) => item.factoryCode == props.factoryCode,
  )

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
  () => props.defaultStartDate,
  (newVal) => {
    console.log(newVal)
  },
)
watch(
  () => props.factoryCode,
  (newVal) => {
    masterFiltered.value = masterFiltered.value.filter((item) => item.factoryCode == newVal)
  },
)

onMounted(() => {
  // calTime(props.defaultStartDate)
})
</script>

<style scoped></style>
