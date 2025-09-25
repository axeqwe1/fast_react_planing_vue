<template>
  <div>
    <!-- Filter date
    <div class="flex gap-3 mb-3">
      <div>
        <label>START SHIPDATE</label>
        <input v-model="shipDate.start" type="date" class="input input-bordered input-sm" />
      </div>
      <div>
        <label>END SHIPDATE</label>
        <input v-model="shipDate.end" type="date" class="input input-bordered input-sm" />
      </div>
      <Button label="Reset Filter" severity="warning" @click="resetFilter" />
    </div> -->

    <!-- DataTable -->
    <DataTable
      :value="masterFiltered"
      paginator
      :rows="pagInModel.pageSize"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      :totalRecords="pagInModel.totalRows"
      :first="(pagInModel.pageNumber - 1) * pagInModel.pageSize"
      @page="onPageChange"
      scrollable
      scrollHeight="calc(100vh - 250px)"
      v-model:filters="filters"
      tableStyle="min-width: 1400px"
      size="small"
      filterDisplay="row"
      :loading="loading"
      ref="dt"
      :exportFilename="csvFileName"
      removableSort
    >
      <Column field="orderNo" header="Order No" sortable filter>
        <template #body="{ data }">
          {{ data.orderNo }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            class="max-w-[150px]"
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Search by name"
          />
        </template>
      </Column>
      <Column field="style" header="Style" sortable filter />
      <Column field="division" header="Division" sortable />
      <Column field="season" header="Season" sortable filter />
      <Column field="programCode" header="Program" sortable filter />
      <Column field="color" header="Color" sortable filter :showFilterMenu="false">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span>{{ data.color }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="[...new Set(masterFiltered.map((item) => item.color))]"
            placeholder="Any"
            style="min-width: 100%"
            :maxSelectedLabels="1"
            filter
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span>{{ slotProps.option }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column field="customer" header="Customer" sortable filter />
      <Column field="shipDate" header="Ship Date" sortable :showFilterMenu="false">
        <template #body="{ data }">
          <div
            class="text-center"
            :class="{
              'bg-red-400 text-amber-300 px-2 py-1 rounded': new Date(data.shipDate) < new Date(),
              'bg-sky-400 text-white px-2 py-1 rounded': new Date(data.shipDate) > new Date(),
            }"
          >
            {{ data.shipDate.split('T')[0] }}
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <div class="flex gap-2 items-center">
            <DatePicker
              v-model="datePick"
              selectionMode="range"
              placeholder="Date Range"
              :manualInput="false"
              style="min-width: 8rem"
              @update:modelValue="
                (value) => filterDateRange(value as Date[], filterModel, filterCallback)
              "
            />
            <Button
              icon="pi pi-times"
              size="small"
              severity="secondary"
              @click="
                () => {
                  datePick = null
                  filterModel.value = null

                  filters.shipDate = {
                    value: null,
                    matchMode: FilterMatchMode.BETWEEN,
                  }

                  filterCallback()
                }
              "
              :disabled="!datePick"
            />
          </div>
        </template>
      </Column>
      <Column field="qty" header="Qty" sortable />
      <Column field="qtyQCSew" header="Qty QC Sew" />
      <Column field="qtyPack" header="Qty Pack" />
      <Column field="progressPct" header="ProgressPct" sortable>
        <template #body="{ data }">
          <div class="text-center" :class="data.progressPct > 0 ? 'bg-green-400' : ''">
            {{ data.progressPct.toFixed(2) }}%
          </div>
        </template>
      </Column>
      <Column field="status" header="Status" />
      <Column field="statusName" header="Status Name" filter :showFilterMenu="false">
        <template #body="{ data }">
          <Tag
            :value="data.statusName"
            :severity="getStatusSeverity(data.statusName)"
            class="font-bold w-full"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            class="max-w-[150px]"
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="[...new Set(masterFiltered.map((item) => item.statusName))]"
            placeholder="Select One"
            :showClear="true"
          >
            <template #option="slotProps">
              <Tag :value="slotProps.option" :severity="getStatusSeverity(slotProps.option)" />
            </template>
          </Select>
        </template>
      </Column>
      <Column field="processNameStatus" header="Process Status" filter :showFilterMenu="false">
        <template #body="{ data }">
          <div>
            <Tag
              :value="data.processNameStatus"
              :severity="getProcessSeverity(data.processNameStatus)"
              class="font-bold w-full"
            />
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            class="max-w-[150px]"
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="[...new Set(masterFiltered.map((item) => item.processNameStatus))]"
            placeholder="Select One"
            :showClear="true"
          >
            <template #option="slotProps">
              <Tag :value="slotProps.option" :severity="getProcessSeverity(slotProps.option)" />
            </template>
          </Select>
        </template>
      </Column>
      <Column field="sewStart" header="SewStart">
        <template #body="{ data }">
          <div class="w-25">
            {{ data.sewStart ? formatLocal(new Date(data.sewStart)) : 'Not planed' }}
          </div>
        </template>
      </Column>
      <Column field="sewFinish" header="SewFinish">
        <template #body="{ data }">
          <div class="w-25">
            {{ data.sewStart ? formatLocal(new Date(data.sewFinish)) : 'Not planed' }}
          </div>
        </template></Column
      >
      <!-- เพิ่ม Column อื่น ๆ ตามที่ต้องการ
      <Column #footer>
        <ColumnGroup type="footer">
          <Row>
            <Column footer="Totals:" :colspan="4" footerStyle="text-align:right" />

            <Column :footer="pagInModel.totalRows.toString()" />
          </Row>
        </ColumnGroup>
      </Column> -->
    </DataTable>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { GetOrderGNX } from '@/lib/api/Masterplan'
import type { MasterData, OrderGNX } from '@/type/types'
import MultiSelect from 'primevue/multiselect'
import { values } from 'lodash'
import { useMaster } from '@/stores/masterStore'
import { formatDateLocal, formatLocal } from '@/utils/formatKey'

const props = defineProps<{ mode: string; targetCompany: string }>()
const master = ref<MasterData[]>([])
const masterFiltered = ref<MasterData[]>([])
const shipDate = reactive<{ start: string; end: string }>({ start: '', end: '' })
const loading = ref(true)
const dt = ref()
const STORE_MASTER = useMaster()
const csvFileName = ref('OrderViewExport')
const pagInModel = reactive({
  pageNumber: 1,
  pageSize: 50,
  totalRows: 0,
  totalPage: 0,
})
const filters = ref({
  orderNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  shipDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  color: { value: null, matchMode: FilterMatchMode.IN },
  statusName: { value: null, matchMode: FilterMatchMode.EQUALS },
  processNameStatus: { value: null, matchMode: FilterMatchMode.EQUALS },
})
async function fetchOrder() {
  loading.value = true

  props.mode === 'All' ? (masterFiltered.value = STORE_MASTER.planJob) : null
  props.mode === 'Planed'
    ? (masterFiltered.value = STORE_MASTER.planJob.filter((item) => item.sewStart))
    : null
  props.mode === 'Not'
    ? (masterFiltered.value = STORE_MASTER.planJob.filter((item) => !item.sewStart))
    : null

  pagInModel.totalRows = masterFiltered.value.length
  pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
  console.log(masterFiltered.value)
  loading.value = false
}

function resetFilter() {
  masterFiltered.value = master.value
  shipDate.start = ''
  shipDate.end = ''
  pagInModel.pageNumber = 1
}

function onPageChange(e: any) {
  pagInModel.pageNumber = e.page + 1
  pagInModel.pageSize = e.rows
}
const datePick = ref(null)
function filterDateRange(date: Date[], filterModel: any, filterCallback: any) {
  console.table({ date: date, filterModel: filterModel })
  if (date.length === 2) {
    filterModel.value = date.map((date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })
  } else {
    filterModel.value = null
  }
  filterCallback()
}

function getStatusSeverity(status: string) {
  switch (status) {
    case 'Confirm':
      return 'success'
    case 'Cancel':
    case 'Close':
      return 'danger'
    case 'Shipped':
      return 'info'
    default:
      return ''
  }
}

function getProcessSeverity(status: string) {
  switch (status) {
    case 'Complete':
      return 'success'
    case 'Waiting':
      return 'warn'
    case 'InProgress':
      return 'info'
    default:
      return ''
  }
}
function exportCSV() {
  dt.value.exportCSV() // เรียก method ของ DataTable
}
const timeStamp = formatLocal(new Date()).replace(' ', '-')
defineExpose({
  exportCSV,
  pagInModel,
})
watch(
  () => props.mode,
  (newVal) => {
    csvFileName.value = `Order-${newVal}-${timeStamp}`.toLocaleLowerCase()
    console.log(newVal)
    fetchOrder()
  },
)
watch(
  () => props.targetCompany,
  (newVal) => {
    if (newVal == 'ALL') masterFiltered.value = STORE_MASTER.planJob
    else masterFiltered.value = STORE_MASTER.planJob.filter((item) => item.factoryCode === newVal)
    pagInModel.totalRows = masterFiltered.value.length
    pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
  },
)
onMounted(() => {
  csvFileName.value = `Order-${props.mode}-${timeStamp}`.toLocaleLowerCase()
  console.log(props.mode)
})
onMounted(fetchOrder)
</script>
