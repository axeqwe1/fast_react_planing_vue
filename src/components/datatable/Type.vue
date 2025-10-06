<template>
  <div class="bg-surface-50 dark:bg-surface-950 p-3 w-full">
    <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-2xl flex flex-col gap-4">
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <DataTable
            :value="data"
            scrollable
            scrollHeight="calc(80vh - 250px)"
            selectionMode="single"
            v-model:selection="selectOrder"
            size="large"
            class="text-xs"
          >
            <Column field="typeCode" header="TypeCode"></Column>
            <!-- Style Column -->

            <Column field="typeName" header="TypeName" />
            <Column field="EffPct" header="Efficiency"> </Column>
            <!-- <Column field="color" header="Color" sortable filter :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  size="small"
                  v-model="filterModel.value"
                  :options="[...new Set(data.map((item) => item.color))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                />
              </template>
            </Column>
            <!-- Season Column -->
            <!-- <Column field="season" header="Season" sortable filter :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  size="small"
                  v-model="filterModel.value"
                  :options="[...new Set(data.map((item) => item.season))]"
                  placeholder="Any"
                  display="chip"
                  @change="filterCallback"
                />
              </template>
            </Column> -->

            <!-- TypeName Column -->
            <!-- <Column field="createDate" header="CreateDate" sortable filter :showFilterMenu="false">
            </Column> -->
          </DataTable>
        </div>
      </div>
      <!-- <div class="flex flex-1">
        <div
          class="flex-1 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg h-[150px]"
        />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMaster } from '@/stores/masterStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import type { Job, MasterType, mergeExpertType } from '@/type/types'
import { FilterMatchMode } from '@primevue/core/api'
import { ref, onMounted, watch } from 'vue'

const store = useScheduleStore()
const STORE_MASTER = useMaster()
const props = defineProps<{
  lineCode: string
  data: mergeExpertType[]
  loading: boolean
}>()

const data = ref<mergeExpertType[]>([])
const selectOrder = ref<any>(null)
const loading = ref(false)
const filters = ref({
  style: { value: null, matchMode: FilterMatchMode.IN },
  color: { value: null, matchMode: FilterMatchMode.IN },
  season: { value: null, matchMode: FilterMatchMode.IN },
  typeName: { value: null, matchMode: FilterMatchMode.IN },
  saM_Minutes: { value: null, matchMode: FilterMatchMode.EQUALS },
  effectiveDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  expireDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
})

defineExpose({
  getSelectedData: () => selectOrder.value,
})

watch(
  () => props.data,
  (newVal) => {
    data.value = newVal
  },
  { immediate: true },
)
watch(selectOrder, (newVal) => {
  console.log(selectOrder.value)
})
watch(data, (newVal) => {
  console.log(data.value)
})
</script>

<style scoped></style>
