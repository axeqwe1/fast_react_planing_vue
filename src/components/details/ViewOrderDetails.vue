<template>
  <div class="w-full h-full flex flex-col gap-3 items-center justify-center form-master-line">
    <div class="flex flex-row justify-start items-end gap-3 px-3">
      <div>
        <label>START SHIPDATE</label>
        <input
          v-model="shipDate.start"
          type="date"
          class="input input-bordered input-sm w-full max-w-xs"
        />
      </div>

      <div>
        <label>END SHIPDATE</label>
        <input
          v-model="shipDate.end"
          type="date"
          class="input input-bordered input-sm w-full max-w-xs"
        />
      </div>

      <div>
        <button @click="resetFilter" class="btn btn-warning">Reset Filter</button>
      </div>
    </div>
    <div class="h-full overflow-auto border-1 max-w-[1400px]">
      <div class="flex flex-col h-full max-h-[900px] justify-between items-center p-3">
        <div
          v-bind="containerProps"
          style="height: 500px; overflow-y: auto"
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
</template>

<script setup lang="ts">
import { useMouseEvent } from '@/composables/useMouseEvent'
import { useTime } from '@/composables/useTime'
import { useMaster } from '@/stores/masterStore'
import CustomFilterColumn from '@/components/filterComponent/CustomFilterColumn.vue'
import type { Job, Line, MasterEfficiency, MasterLine, MasterSam, OrderGNX } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive, onBeforeUnmount, computed } from 'vue'
import { GetOrderGNX } from '@/lib/api/Masterplan'
import Modal from '../Modal.vue'
import type { CreateMasterSam } from '@/type/requestDTO'
import { debounce } from 'lodash'
import { defaultDocument, useVirtualList } from '@vueuse/core'

const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const countDownToast = ref<number>(0)
const toastMessage = ref<string>('')
const master = ref<OrderGNX[]>([])
const masterFiltered = ref<OrderGNX[]>([])
const pagingMaster = ref<OrderGNX[]>([])
const resetFilterCount = ref(0)

const shipDate = reactive<{ start: string; end: string }>({
  start: '',
  end: '',
})
// เก็บ state ของ filter แต่ละ mode
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

const model = reactive<CreateMasterSam>({
  season: '',
  style: '',
  typeName: '',
  SAM_Minutes: 0,
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
const openFilter = ref<string | null>(null) // 'orderNo', 'style', null

const { list, containerProps, wrapperProps } = useVirtualList(
  pagingMaster, // ข้อมูล array ที่กรองแล้ว
  {
    itemHeight: 40, // สูงของแต่ละ row (px)
    overscan: 10, // preload แถวก่อน-หลัง
  },
)

function toggleFilter(column: string) {
  if (openFilter.value === column) {
    openFilter.value = null // คลิกซ้ำ → ปิด
  } else {
    openFilter.value = column // เปิด column ใหม่ → ปิดอันอื่น
  }
}
const currentActive = ref<number | null>(null)
const selectCollect: any[] = []
function resetFilter() {
  Object.keys(filterState).forEach((key) => {
    filterState[key as keyof typeof filterState] = []
  })
  masterFiltered.value = master.value
  pagInModel.pageNumber = 1
  shipDate.start = ''
  shipDate.end = ''
  resetFilterCount.value++
}
function onFilterSelect(column: keyof typeof filterState, selected: string[]) {
  filterState[column] = selected
  // console.log(shipDate)
  let masterArr = master.value
  if (shipDate.start && shipDate.end) {
    const start = new Date(shipDate.start)
    start.setHours(0, 0, 0, 0) // เริ่มต้นวัน

    const end = new Date(shipDate.end)
    end.setHours(23, 59, 59, 999) // สิ้นสุดวัน

    masterArr = masterArr.filter((item) => {
      const ship = new Date(item.shipDate)
      return ship >= start && ship <= end
    })
  }
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
    // submitAction()
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
const fetchOrderGnx = async () => {
  const res = await GetOrderGNX(pagInModel.pageNumber, pagInModel.pageSize)
  console.log(res)
  if (res.status == 200) {
    const data = res.data.data

    // pagInModel.totalRows = res.data.totalRecords
    // pagInModel.totalPage = res.data.totalPages
    master.value = data
    masterFiltered.value = data
    pagInModel.totalRows = masterFiltered.value.length
    pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
    pagingMaster.value = paginateArray(
      masterFiltered.value,
      pagInModel.pageSize,
      pagInModel.pageNumber,
    )
  }
}
function paginateArray(array: OrderGNX[], pageSize: number, pageNumber: number) {
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = pageNumber * pageSize
  return array.slice(startIndex, endIndex)
}
onMounted(async () => {
  await fetchOrderGnx()
})
onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside, { capture: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside, { capture: true })
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
watch(shipDate, () => {
  if (shipDate.start && shipDate.end) {
    const start = new Date(shipDate.start)
    start.setHours(0, 0, 0, 0) // เริ่มต้นวัน

    const end = new Date(shipDate.end)
    end.setHours(23, 59, 59, 999) // สิ้นสุดวัน

    masterFiltered.value = masterFiltered.value.filter((item) => {
      const ship = new Date(item.shipDate)
      return ship >= start && ship <= end
    })

    pagInModel.pageNumber = 1
  } else {
    masterFiltered.value = masterFiltered.value
    pagInModel.pageNumber = 1
  }
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
