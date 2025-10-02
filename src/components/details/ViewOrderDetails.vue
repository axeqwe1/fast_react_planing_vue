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
      @filter="onFilter"
      :rows="pagInModel.pageSize"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      :totalRecords="pagInModel.totalRows"
      :first="(pagInModel.pageNumber - 1) * pagInModel.pageSize"
      @page="onPageChange"
      scrollable
      scrollHeight="calc(100vh - 275px)"
      v-model:filters="filters"
      tableStyle="min-width: 1400px"
      size="small"
      filterDisplay="row"
      :loading="loading"
      ref="dt"
      :exportFilename="csvFileName"
      removableSort
    >
      <Column field="createDate" header="Planed Date" sortable :showFilterMenu="false">
        <template #body="{ data }">
          <div
            class="text-center min-w-[180px] px-2 py-1 rounded"
            :class="data.createDate ? 'bg-green-400' : ''"
          >
            {{ data.createDate ? formatLocal(new Date(data.createDate)) : 'Not Plan' }}
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <div class="flex gap-2 items-center">
            <DatePicker
              v-model="datePickPlan"
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
                  datePickPlan = null
                  filterModel.value = null

                  filterCallback()
                }
              "
              :disabled="!datePickPlan"
            />
          </div>
        </template>
      </Column>
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
      <Column field="type" header="Type" sortable filter :showFilterMenu="false">
        <template #body="{ data }">
          {{ data.type }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="[
              ...new Set(
                (filteredRows.length ? filteredRows : masterFiltered).map((item) => item.type),
              ),
            ]"
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
            :options="[
              ...new Set(
                (filteredRows.length ? filteredRows : masterFiltered).map((item) => item.color),
              ),
            ]"
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
            {{ data.shipDate ? formatDateLocal(new Date(data.shipDate)) : 'Not Ship' }}
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
            :options="[
              ...new Set(
                (filteredRows.length ? filteredRows : masterFiltered).map(
                  (item) => item.statusName,
                ),
              ),
            ]"
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
            :options="[
              ...new Set(
                (filteredRows.length ? filteredRows : masterFiltered).map(
                  (item) => item.processNameStatus,
                ),
              ),
            ]"
            placeholder="Select One"
            :showClear="true"
          >
            <template #option="slotProps">
              <Tag :value="slotProps.option" :severity="getProcessSeverity(slotProps.option)" />
            </template>
          </Select>
        </template>
      </Column>
      <Column field="sewStart" header="SewStart" sortable :showFilterMenu="false">
        <template #body="{ data }">
          <div class="text-center min-w-[180px] px-2 py-1 rounded">
            {{ data.sewStart ? formatLocal(new Date(data.sewStart)) : 'Not planed' }}
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <div class="flex gap-2 items-center">
            <DatePicker
              v-model="datePickSewStart"
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
                  datePickSewStart = null
                  filterModel.value = null

                  filterCallback()
                }
              "
              :disabled="!datePickSewStart"
            />
          </div>
        </template>
      </Column>
      <Column field="sewFinish" header="SewFinish" sortable :showFilterMenu="false">
        <template #body="{ data }">
          <div class="text-center min-w-[180px] px-2 py-1 rounded">
            {{ data.sewStart ? formatLocal(new Date(data.sewFinish)) : 'Not planed' }}
          </div>
        </template>

        <template #filter="{ filterModel, filterCallback }">
          <div class="flex gap-2 items-center">
            <DatePicker
              v-model="datePickSewFinish"
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
                  datePickSewFinish = null
                  filterModel.value = null

                  filterCallback()
                }
              "
              :disabled="!datePickSewFinish"
            />
          </div>
        </template>
      </Column>
      <Column field="updateDate" header="Update Date" sortable :showFilterMenu="false">
        <template #body="{ data }">
          <div
            class="text-center min-w-[180px] px-2 py-1 rounded"
            :class="data.updateDate ? 'bg-amber-400' : ''"
          >
            {{ data.updateDate ? formatLocal(new Date(data.updateDate)) : 'Never Update' }}
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <div class="flex gap-2 items-center">
            <DatePicker
              v-model="datePickUpdate"
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
                  datePickPlan = null
                  filterModel.value = null

                  filterCallback()
                }
              "
              :disabled="!datePickPlan"
            />
          </div>
        </template>
      </Column>
      <Column field="updateBy" header="Update By" sortable :showFilterMenu="false">
        <template #body="{ data }">
          <div class="text-center min-w-[180px] px-2 py-1 rounded">
            {{ data.updateBy ? data.updateBy : 'Never Update' }}
          </div>
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
import { GetAllJob, GetOrderGNX } from '@/lib/api/Masterplan'
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
const filteredValue = ref()
const pagInModel = reactive({
  pageNumber: 1,
  pageSize: 50,
  totalRows: 0,
  totalPage: 0,
})

const filters = ref({
  createDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  orderNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  shipDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  color: { value: null, matchMode: FilterMatchMode.IN },
  statusName: { value: null, matchMode: FilterMatchMode.EQUALS },
  processNameStatus: { value: null, matchMode: FilterMatchMode.EQUALS },
  sewStart: { value: null, matchMode: FilterMatchMode.BETWEEN },
  sewFinish: { value: null, matchMode: FilterMatchMode.BETWEEN },
  updateDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  updateBy: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.IN },
})

async function fetchOrder() {
  props.mode === 'All' ? (masterFiltered.value = master.value) : null
  props.mode === 'Planed'
    ? (masterFiltered.value = master.value.filter((item) => item.sewStart))
    : null
  props.mode === 'Not'
    ? (masterFiltered.value = master.value.filter((item) => !item.sewStart))
    : null

  pagInModel.totalRows = masterFiltered.value.length
  pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
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
const datePickPlan = ref(null)
const datePickSewStart = ref(null)
const datePickSewFinish = ref(null)
const datePickUpdate = ref(null)

function filterDateRange(date: Date[], filterModel: any, filterCallback: any) {
  if (date && date[1]) {
    const start = new Date(date[0])
    const end = new Date(date[1])
    end.setDate(end.getDate() + 1)
    console.log(formatDateLocal(start), formatDateLocal(end))
    // format กลับเป็น yyyy-MM-dd เหมือนเดิม
    filterModel.value = [formatDateLocal(start), formatDateLocal(end)]
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

const filteredRows = ref([])

function onFilter(event: any) {
  filteredRows.value = event.filteredValue
}

const fetchAllPlanJob = async () => {
  loading.value = true
  const res = await GetAllJob()
  if (res.status === 200) {
    master.value = res.data
    await fetchOrder()
    loading.value = false
  } else {
    console.error('Error fetching data:', res)
    loading.value = false
  }
  loading.value = false
}

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
    if (newVal == 'ALL') masterFiltered.value = master.value
    else masterFiltered.value = master.value.filter((item) => item.factoryCode === newVal)
    pagInModel.totalRows = masterFiltered.value.length
    pagInModel.totalPage = Math.ceil(pagInModel.totalRows / pagInModel.pageSize)
  },
)
onMounted(() => {})
onMounted(() => {
  csvFileName.value = `Order-${props.mode}-${timeStamp}`.toLocaleLowerCase()
  console.log(props.mode)
})
onMounted(fetchAllPlanJob)
</script>
