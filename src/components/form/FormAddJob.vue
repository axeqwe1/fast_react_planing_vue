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
      <div class="flex flex-col h-full max-h-[1000px] justify-start items-center p-6">
        <div class="card w-full overflow-auto h-full">
          <DataTable
            :loading="loading"
            :value="masterFiltered"
            v-model:selection="selectedRow"
            selectionMode="single"
            paginator
            :rows="pagInModel.pageSize"
            :totalRecords="pagInModel.totalRows"
            :first="(pagInModel.pageNumber - 1) * pagInModel.pageSize"
            @page="onPageChange"
            :rowsPerPageOptions="[10, 20, 50, 100]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="Total {totalRecords} entries"
            scrollable
            scrollHeight="calc(100vh - 370px)"
            filterDisplay="row"
            v-model:filters="filters"
            :globalFilterFields="[
              'orderNo',
              'style',
              'season',
              'color',
              'customer',
              'programCode',
              'statusName',
              'processNameStatus',
            ]"
            size="small"
            class="p-datatable-sm"
            @row-select="selectData"
          >
            <!-- Order No Column -->
            <Column
              field="orderNo"
              header="Order No"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 120px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.orderNo))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Style Column -->
            <Column
              field="style"
              header="Style"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 120px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.style))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Division Column -->
            <Column field="division" header="Division" sortable style="min-width: 100px" />

            <!-- Season Column -->
            <Column
              field="season"
              header="Season"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 100px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.season))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Program Code Column -->
            <Column
              field="programCode"
              header="Program Code"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 120px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.programCode))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Color Column -->
            <Column
              field="color"
              header="Color"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 100px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.color))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Customer Column -->
            <Column
              field="customer"
              header="Customer"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 120px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.customer))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Ship Date Column -->
            <Column field="shipDate" header="Ship Date" sortable style="min-width: 120px">
              <template #body="{ data }">
                <div
                  :class="{
                    'bg-red-400 text-amber-300': new Date(data.shipDate) < new Date(),
                    'bg-sky-400 text-base-200': new Date(data.shipDate) > new Date(),
                  }"
                  class="font-bold px-2 py-1 rounded min-w-[125px] text-center"
                >
                  {{ data.shipDate.toString().split('T')[0] }}
                </div>
              </template>
            </Column>

            <!-- Quantity Columns -->
            <Column field="qty" header="Qty" sortable style="min-width: 80px" />
            <Column field="qtyQCSew" header="Qty QC Sew" sortable style="min-width: 100px" />
            <Column field="qtyPack" header="Qty Pack" sortable style="min-width: 90px" />
            <Column field="status" header="Status" sortable style="min-width: 80px" />

            <!-- Status Name Column -->
            <Column
              field="statusName"
              header="Status Name"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 120px"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.statusName"
                  :severity="getStatusSeverity(data.statusName)"
                  class="font-bold"
                />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.statusName))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Process Name Status Column -->
            <Column
              field="processNameStatus"
              header="Process Status"
              sortable
              filter
              :showFilterMenu="false"
              style="min-width: 140px"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.processNameStatus"
                  :severity="getProcessSeverity(data.processNameStatus)"
                  class="font-bold"
                />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="[...new Set(masterFiltered.map((item) => item.processNameStatus))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                  class="p-column-filter"
                />
              </template>
            </Column>

            <!-- Additional Quantity Columns -->
            <Column field="progressPct" header="Process Pct" sortable style="min-width: 100px" />
            <Column field="qtyBundle" header="Qty Bundle" sortable style="min-width: 100px" />
            <Column field="qtyCut" header="Qty Cut" sortable style="min-width: 80px" />
            <Column field="qtyEMB" header="Qty EMB" sortable style="min-width: 80px" />
            <Column field="qtyEmboss" header="Qty Emboss" sortable style="min-width: 100px" />
            <Column field="qtyPrint" header="Qty Print" sortable style="min-width: 90px" />
            <Column field="qtyHeat" header="Qty Heat" sortable style="min-width: 80px" />
            <Column field="qtyPRPad" header="Qty PR Pad" sortable style="min-width: 90px" />
            <Column field="qtyFusing" header="Qty Fusing" sortable style="min-width: 90px" />
            <Column field="qtyBonding" header="Qty Bonding" sortable style="min-width: 100px" />
            <Column field="qtyLaserCut" header="Qty Laser Cut" sortable style="min-width: 110px" />
            <Column field="qtyQc" header="Qty QC" sortable style="min-width: 80px" />
            <Column field="qtyMatch" header="Qty Match" sortable style="min-width: 90px" />
            <Column field="qtyOut" header="Qty Out" sortable style="min-width: 80px" />
            <Column field="qtySew" header="Qty Sew" sortable style="min-width: 80px" />
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
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
    @update:modelValue="(val: any) => (confirmModal = val)"
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
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Modal from '../Modal.vue'
import { type MasterLine, type Job, type MasterData, type Line } from '@/type/types'
import { useMaster } from '@/stores/masterStore'
import { useCaltime } from '@/composables/useCaltime'
import type { AddPlanJob } from '@/type/requestDTO'
import { useAuth } from '@/stores/userStore'
import { formatDateLocal, formatLocal } from '@/utils/formatKey'
import { useScheduleStore } from '@/stores/scheduleStore'
import { AddJob, GetPlanJob } from '@/lib/api/Masterplan'

const { calTime } = useCaltime()

const showToast = ref<boolean>(false)
const toastIsError = ref<boolean>(true)
const toastMessage = ref<string>('')
const countDownToast = ref<number>(0)
const isEdit = ref<boolean>()
const selectedRow = ref<MasterData>()
const master = ref<MasterData[]>([])
const masterFiltered = ref<MasterData[]>([])
const loadingProcess = ref<boolean>(false)

// PrimeVue Filters
const filters = ref({
  orderNo: { value: null, matchMode: FilterMatchMode.IN },
  style: { value: null, matchMode: FilterMatchMode.IN },
  season: { value: null, matchMode: FilterMatchMode.IN },
  color: { value: null, matchMode: FilterMatchMode.IN },
  customer: { value: null, matchMode: FilterMatchMode.IN },
  programCode: { value: null, matchMode: FilterMatchMode.IN },
  statusName: { value: null, matchMode: FilterMatchMode.IN },
  processNameStatus: { value: null, matchMode: FilterMatchMode.IN },
})

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
  pageSize: 10,
  totalRows: 0,
  totalPage: 0,
})

const listLine = ref<MasterLine[]>([])
const { user } = useAuth()
const props = defineProps<{ defaultStartDate?: string; factoryCode?: string; lineCode?: string }>()
const STORE_MASTER = useMaster()
const store = useScheduleStore()
const jobs = ref<Job[]>([])
const masterLine = ref<Line[]>([])
const confirmModal = ref<boolean>(false)
const emit = defineEmits<{
  (e: 'AddJob', value: boolean): void
}>()

// PrimeVue Event Handlers
const onPageChange = (event: any) => {
  pagInModel.pageNumber = Math.floor(event.first / event.rows) + 1
  pagInModel.pageSize = event.rows
}

// Row styling
// const getRowClass = (data: MasterData) => {
//   return selectedRow.value?.orderNo === data.orderNo ? 'bg-base-200' : ''
// }

// Tag severity functions
const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'Confirm':
      return 'success'
    case 'Cancel':
    case 'Close':
      return 'danger'
    case 'Shipped':
      return 'info'
    default:
      return 'secondary'
  }
}

const getProcessSeverity = (status: string) => {
  switch (status) {
    case 'Complete':
      return 'success'
    case 'Waiting':
      return 'warning'
    case 'InProgress':
      return 'info'
    default:
      return 'secondary'
  }
}

function validation() {
  if (!modelData.startDate) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'startDate is required'
    showToastCountdown()
    return false
  } else if (modelData.Line === 'Pick Line') {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Line is required'
    showToastCountdown()
    return false
  } else if (!modelData.Order) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Order is required'
    showToastCountdown()
    return false
  } else if (!modelData.Color) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Color is required'
    showToastCountdown()
    return false
  } else if (!modelData.Style) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Style is required'
    showToastCountdown()
    return false
  } else if (!modelData.Season) {
    showToast.value = true
    toastIsError.value = true
    toastMessage.value = 'Season is required'
    showToastCountdown()
    return false
  } else {
    showToast.value = false
    toastIsError.value = false
    return true
  }
}

const submit = async (e: Event) => {
  e.preventDefault()
  loadingProcess.value = true
  if (validation()) {
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
    if (res.status === 200) {
      confirmModal.value = false
      toastIsError.value = false
      toastMessage.value = res.data.message
      console.log(res)
      showToastCountdown()
      emit('AddJob', true)
      const newData = res.data.newjob
      const newJob: Job = {
        id: newData.sewId,
        sewId: newData.sewId,
        line: newData.lineCode,
        qty: newData.splitQty ? newData.splitQty : newData.qty,
        splitQty: newData.splitQty,
        style: newData.style,
        season: newData.season,
        color: newData.color,
        sam: newData.sam,
        typeCode: newData.typeCode,
        typeName: newData.type,
        name: newData.orderNo,
        startDate: newData.sewStart,
        endDate: newData.sewFinish,
        duration: newData.duration,
        processStatus: newData.processStatus,
        progressPct: newData.progressPct,
        createBy: newData.createBy,
        updateBy: newData.updateBy,
        createDate: newData.createDate,
        updateDate: newData.updateDate,
      }
      STORE_MASTER.planJob.push(newData)
      store.Jobs.push(newJob)
      store.jobStyleCache.set(newJob.id, store.getJobStyle(newJob))

      loadingProcess.value = false
    }
  } else {
    loadingProcess.value = false
  }
}

const reset = async () => {}

function selectData(event: any) {
  const master = event.data
  modelData.Color = master.color
  modelData.Order = master.orderNo
  modelData.Style = master.style
  modelData.Season = master.season
  selectedRow.value = master
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
  master.value = data
  masterFiltered.value = data
  pagInModel.totalRows = data.length
  pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
}

const refresh = async () => {
  await fetchMasterPlan(STORE_MASTER.currentFactory)
}

const loading = ref(true)
const fetchMasterPlan = async (factory?: string) => {
  try {
    const res = await GetPlanJob()
    STORE_MASTER.planJob = res
  } catch (err: any) {
    console.error('Error fetching test data:', err)
  }
}

onMounted(async () => {
  loading.value = true
  await fetchMasterPlan(STORE_MASTER.currentFactory)
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

  loading.value = false
})

watch(
  () => modelData.Line,
  (newVal) => {
    let factoryCode = STORE_MASTER.masterLine.find((item) => item.lineCode == newVal)?.factoryCode
    masterFiltered.value = master.value.filter((item) => item.factoryCode == factoryCode)
    pagInModel.totalRows = masterFiltered.value.length
    pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
  },
)

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

<style scoped>
/* Custom DataTable Styles */
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.5rem;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-column-filter) {
  width: 100%;
}

:deep(.p-multiselect-chip) {
  font-size: 0.75rem;
}
</style>
