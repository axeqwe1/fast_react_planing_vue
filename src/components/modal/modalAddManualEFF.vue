<template>
  <Dialog
    v-model:visible="internalVisible"
    header="Manual Manpower ตามช่วงเวลา"
    modal
    class="lg:max-w-[400px] w-full"
    :draggable="true"
    @hide="onCancel()"
  >
    <div class="flex flex-row justify-center items-center w-full">
      <div class="flex flex-col gap-4">
        <!-- TypeName จากต้นทาง -->
        <!-- Remark -->
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>เลือกช่วงเวลา</span>
          </label>
          <DatePicker
            placeholder="เลือกช่วงเวลาที่ต้องการ"
            class="w-full"
            v-model="dates"
            selectionMode="range"
            :manualInput="false"
          />
        </div>
        <div>
          <label>Efficiency Percentage</label>
          <InputNumber
            fluid
            :min="0"
            v-model="internalCapMP"
            :prefix="'%'"
            class="w-full"
            placeholder="กรอกค่า Manpower ที่ต้องการ"
          />
        </div>
        <!-- เพิ่ม Alias
        <div class="">
          <label class="block text-sm font-bold mb-2">Alias / คำอื่นๆ</label>
          <InputChips
            v-model="internalAliases"
            separator=","
            placeholder="พิมพ์แล้วกด Enter"
            class="w-full"
          />
        </div> -->

        <!-- Action -->
        <div class="flex justify-end gap-2 mt-4">
          <Button label="ยกเลิก" severity="secondary" @click="onCancel" />
          <Button
            label="บันทึก"
            icon="pi pi-save"
            @click="
              () => {
                confirmAddTypeDialog = true
              }
            "
          />
        </div>
        <small class="text-gray-500"
          >* หมายเหตุ: กรอกช่วงเวลาที่ต้องการ Specific ค่า Efficiency
        </small>
      </div>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="confirmAddTypeDialog"
    modal
    header="Add Type"
    :style="{ width: '25rem' }"
  >
    <span class="text-surface-500 dark:text-surface-400 block mb-8"
      >ดำเดินการเพิ่มข้อมูล Manual Efficiency?.</span
    >

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="confirmAddTypeDialog = false"
      ></Button>
      <Button type="button" :icon="'pi pi-check'" :label="'Save'" @click="onSave()"></Button>
    </div>
  </Dialog>
  <Toast position="top-center" />
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { onMounted, ref, watch } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useMaster } from '@/stores/masterStore'
import type { CreateManualEFFDTO, CreateManualMPDTO, CreateMasterTypeDTO } from '@/type/requestDTO'
import { useAuth } from '@/stores/userStore'
import { CreateMasterType } from '@/lib/api/Mastertype'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { CreateManualEff, CreateManualMP } from '@/lib/api/ManualEFFMP'
const internalVisible = ref(false)
const internalLineCode = ref('')
const props = defineProps<{ showModal: boolean; lineCode: string }>()
const internalCapMP = ref(0)
const requestCreateType = ref<CreateMasterTypeDTO | null>(null)
const emits = defineEmits<{
  (e: 'update:showModal', value: boolean): void
  (e: 'save', value: boolean): void
}>()

const store = useScheduleStore()
const STORE_MASTER = useMaster()
const auth = useAuth()
const invalidType = ref(null as boolean | null)
const confirmAddTypeDialog = ref(false)
const toast = useToast()
const dates = ref()

const loadingCheck = ref(false)
const showIcon = ref(false)

watch(
  () => props.showModal,
  (newVal) => {
    internalVisible.value = newVal
    console.log(newVal)
  },
)
watch(
  () => props.lineCode,
  (newVal) => {
    internalLineCode.value = newVal
    console.log(newVal)
  },
)
onMounted(() => {
  internalLineCode.value = props.lineCode
})
function resetInput() {
  internalCapMP.value = 0
  dates.value = null
  confirmAddTypeDialog.value = false
}
async function onSave() {
  const request: CreateManualEFFDTO = {
    id: 0,
    LineCode: internalLineCode.value,
    EffPct: internalCapMP.value,
    StartDate: dates.value ? localToISO(dates.value[0]) : null,
    EndDate: dates.value ? localToISO(dates.value[1]) : null,
  }

  const res = await CreateManualEff(request)
  if (res.status == 200) {
    toast.add({ severity: 'success', summary: 'Success', detail: 'เพิ่มข้อมูลสำเร็จ', life: 3000 })
    emits('update:showModal', false)
    resetInput()
    emits('save', true)
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'เกิดข้อผิดพลาด', life: 3000 })
    console.error(res)
  }
  console.log(request)
}
function onCancel() {
  resetInput()
  emits('update:showModal', false)
}
const localToISO = (date: Date) => {
  if (!date) return null
  const tzOffset = date.getTimezoneOffset() * 60000 // offset in ms
  const localISO = new Date(date.getTime() - tzOffset).toISOString().slice(0, 19)
  return localISO // e.g. "2025-09-30T00:00:00"
}
</script>

<style scoped></style>
