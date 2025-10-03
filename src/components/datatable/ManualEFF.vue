<template>
  <div class="bg-surface-50 dark:bg-surface-950 p-3 w-full">
    <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-2xl flex flex-col gap-4">
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <Toolbar class="mb-6">
            <template #start>
              <Button label="New" icon="pi pi-plus" class="mr-2" @click="opModal" />
            </template>
          </Toolbar>
          <DataTable
            :value="data"
            scrollable
            scrollHeight="calc(80vh - 250px)"
            size="large"
            class="text-xs"
            :pt="{
              column: {
                bodycell: ({ state }: { state: Record<string, any> }) => ({
                  class: [{ '!py-0 w-25': state['d_editing'] }],
                }),
              },
            }"
          >
            <Column field="startDate" header="Start Date">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  {{ formatDateTime(data.startDate) }}
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="openDateEditor(data, 'startDate')"
                  />
                </div>
              </template>
            </Column>

            <Column field="endDate" header="End Date">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  {{ formatDateTime(data.endDate) }}
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="openDateEditor(data, 'endDate')"
                  />
                </div>
              </template>
            </Column>

            <Column field="isActive" header="Is Active">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i
                    v-if="data.isActive"
                    class="pi pi-check text-green-500"
                    style="font-size: 1.5rem"
                  ></i>
                  <i v-else class="pi pi-times text-red-500" style="font-size: 1.5rem"></i>
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="toggleActive(data)"
                  />
                </div>
              </template>
            </Column>

            <Column field="effPct" header="EffPct">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  {{ data.effPct || 0 }}
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="openMpCapEditor(data)"
                  />
                </div>
              </template>
            </Column>

            <Column header="Actions" :exportable="false" style="min-width: 8rem">
              <template #body="{ data, index }">
                <Button
                  icon="pi pi-trash"
                  outlined
                  rounded
                  severity="danger"
                  @click="confirmDelete(data, index)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Modal Add Manual MP -->
      <modalAddManualEFF
        :lineCode="internalLineCode"
        :showModal="showModal"
        @update:showModal="onClose"
      />

      <!-- Date Picker Dialog -->
      <Dialog
        v-model:visible="dateDialog"
        :style="{ width: '450px' }"
        header="Select Date & Time"
        :modal="true"
      >
        <div class="flex flex-col gap-4">
          <label class="font-semibold">
            {{ editingField === 'startDate' ? 'Start Date' : 'End Date' }}
          </label>
          <DatePicker
            v-model="tempDate"
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
            fluid
            inline
          />
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="dateDialog = false" />
          <Button label="Save" icon="pi pi-check" @click="saveDateEdit" />
        </template>
      </Dialog>

      <!-- MP Cap Editor Dialog -->
      <Dialog
        v-model:visible="mpCapDialog"
        :style="{ width: '400px' }"
        header="Edit MP Cap"
        :modal="true"
      >
        <div class="flex flex-col gap-4">
          <label class="font-semibold">Manpower Capacity</label>
          <InputNumber v-model="tempMpCap" :min="0" fluid showButtons />
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="mpCapDialog = false" />
          <Button label="Save" icon="pi pi-check" @click="saveMpCapEdit" />
        </template>
      </Dialog>

      <!-- Delete Confirmation Dialog -->
      <Dialog
        v-model:visible="deleteDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="flex items-center gap-4">
          <i class="pi pi-exclamation-triangle !text-3xl" />
          <span v-if="selectedItem"> Are you sure you want to delete this efficiency config? </span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
          <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteItem" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { manualEff, manualMP } from '@/type/types'
import {
  DeleteManualEFF,
  DeleteManualMP,
  ToggleActive,
  ToggleActiveEFF,
  UpdateManualEff,
  UpdateManualMP,
} from '@/lib/api/ManualEFFMP'
import { localToISO } from '@/utils/utility'
import modalAddManualEFF from '../modal/modalAddManualEFF.vue'
const props = defineProps<{
  lineCode: string
  data: manualEff[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void
}>()
const showModal = ref(false)
const data = ref<manualEff[]>([])
const selectOrder = ref<any>(null)
const deleteDialog = ref(false)
const dateDialog = ref(false)
const mpCapDialog = ref(false)
const selectedItem = ref<manualEff | null>(null)
const selectedIndex = ref<number>(-1)
const editingItem = ref<manualEff | null>(null)
const editingField = ref<'startDate' | 'endDate'>('startDate')
const tempDate = ref<Date | null>(null)
const tempMpCap = ref<number>(0)

const internalLineCode = ref('')

function opModal() {
  showModal.value = !showModal.value
}

function onClose(bool: boolean) {
  showModal.value = bool
  emit('update:showModal', bool)
}

function formatDateTime(dateString: string | null | undefined) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openDateEditor(item: manualEff, field: 'startDate' | 'endDate') {
  editingItem.value = item
  editingField.value = field
  tempDate.value = item[field] ? new Date(item[field]) : new Date()
  dateDialog.value = true
}

function saveDateEdit() {
  if (editingItem.value && tempDate.value) {
    editingItem.value[editingField.value] = localToISO(tempDate.value) as string
    UpdateData(editingItem.value)
  }
  dateDialog.value = false
  editingItem.value = null
}

async function toggleActive(item: manualEff) {
  item.isActive = !item.isActive
  const res = await ToggleActiveEFF(item.id)
  if (res.status === 200) {
    console.log('Toggle successful:', res.data)
  } else {
    console.error('Toggle failed:', res)
  }
}

function openMpCapEditor(item: manualEff) {
  editingItem.value = item
  tempMpCap.value = item.effPct || 0
  mpCapDialog.value = true
}

function saveMpCapEdit() {
  if (editingItem.value) {
    editingItem.value.effPct = tempMpCap.value
    UpdateData(editingItem.value)
  }
  mpCapDialog.value = false
  editingItem.value = null
}

function confirmDelete(item: manualEff, index: number) {
  selectedItem.value = item
  selectedIndex.value = index
  deleteDialog.value = true
}

async function deleteItem() {
  if (selectedIndex.value !== -1) {
    data.value.splice(selectedIndex.value, 1)
    const res = await DeleteManualEFF(selectedItem.value!.id)
    if (res.status === 200) {
      console.log('Delete successful:', res.data)
    } else {
      console.error('Delete failed:', res)
    }
  }
  deleteDialog.value = false
  selectedItem.value = null
  selectedIndex.value = -1
}

async function UpdateData(newData: manualEff) {
  const res = await UpdateManualEff(newData)
  if (res.status === 200) {
    console.log('Update successful:', res.data)
  } else {
    console.error('Update failed:', res)
  }
}

defineExpose({
  getSelectedData: () => selectOrder.value,
})

watch(
  () => props.data,
  (newVal) => {
    console.log('Data updated:', newVal)
    data.value = newVal
  },
  { immediate: true },
)

watch(
  () => props.lineCode,
  (newVal) => {
    internalLineCode.value = newVal
    console.log('Line code:', newVal)
  },
  { immediate: true },
)

onMounted(() => {
  internalLineCode.value = props.lineCode
})
</script>

<style scoped></style>
