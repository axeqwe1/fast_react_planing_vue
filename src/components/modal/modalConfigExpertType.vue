<template>
  <Dialog
    v-model:visible="internalVisible"
    :header="`Config Expert Efficiency Type ของ Line ${internalLineCode}`"
    modal
    class="lg:max-w-[1000px] lg:max-h-screen w-full"
    :draggable="false"
    @hide="onCancel"
  >
    <div class="flex flex-row w-full">
      <div class="flex flex-2/4 flex-col gap-4">
        <!-- TypeName จากต้นทาง -->
        <div>
          <label class="block text-sm font-bold mb-2">LineCode</label>
          <InputText v-model="internalLineCode" disabled class="w-full" />
        </div>

        <!-- เลือก TypeCode จาก Master -->
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>เลือก TypeCode</span>
          </label>
          <Select
            v-model="internalTypeCode"
            :options="typeData"
            optionLabel="typeCode"
            optionValue="typeCode"
            placeholder="เลือก TypeCode"
            class="w-full"
          />
        </div>
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>กรอกค่า Efficiency</span>
          </label>
          <InputNumber fluid prefix="%" :min="0" v-model="internalEff" class="w-full" />
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
                confirmChangeTypeDialog = true
              }
            "
          />
        </div>
        <small class="text-gray-500"
          >* หมายเหตุ: ถ้า Type ใน Line นี้ไม่ได้ปรับค่า Expert Eff ระบบจะดึงใช้ Eff ของ Line
          มาใช้งานแทน
        </small>
      </div>
      <div class="flex flex-3/4 w-full">
        <TypeDataTable
          :data="mergeExpertType"
          :loading="loading"
          :lineCode="internalLineCode"
          ref="refView"
        />
      </div>
    </div>
  </Dialog>
  <modalAddType
    :showModalType="showModalType"
    @update:showModalType="onCloseAddType"
    @save="saveType"
  />
  <Dialog
    v-model:visible="confirmChangeTypeDialog"
    modal
    header="Add Type"
    :style="{ width: '25rem' }"
  >
    <span class="text-surface-500 dark:text-surface-400 block mb-8"
      >ดำเดินการเพิ่ม MasterType ลงใน System?.</span
    >

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="confirmChangeTypeDialog = false"
      ></Button>
      <Button type="button" :icon="'pi pi-check'" :label="'Save'" @click="onSave()"></Button>
    </div>
  </Dialog>
  <Toast position="top-center" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import InputChips from 'primevue/InputChips'
import TypeDataTable from '../datatable/Type.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useMaster } from '@/stores/masterStore'
import modalAddType from './modalAddType.vue'
import { type ExpertEfficiency, type MasterType, type mergeExpertType } from '@/type/types'
import type { changeTypeOrderRequestDTO, CreateExpertEfficiencyDTO } from '@/type/requestDTO'
import { ChangeOrderType } from '@/lib/api/Masterplan'
import { useAuth } from '@/stores/userStore'
import { CreateExpertEfficiency, GetExpertEfficiencyLineCode } from '@/lib/api/ExpertEffType'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
// ✅ Props
const props = defineProps<{
  visible: boolean
  lineCode: string
}>()

// ✅ Emit
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', payload: { typeName: string; typeCode: string | null; aliases: string[] }): void
  (e: 'cancel'): void
}>()

// ✅ Local states (sync กับ props)
const internalVisible = ref(props.visible)
const internalEff = ref(0)
const internalTypeCode = ref('')
const typeOptions = ref<MasterType[]>([])
const internalLineCode = ref<string>('')
const showModalType = ref(false)
const confirmChangeTypeDialog = ref(false)

const refView = ref<InstanceType<typeof TypeDataTable>>()
const store = useScheduleStore()
const STORE_MASTER = useMaster()
const auth = useAuth()

const expertData = ref<ExpertEfficiency[]>([])
const typeData = ref<MasterType[]>([])
const mergeExpertType = ref<mergeExpertType[]>([])
const loading = ref<boolean>(false)
const toast = useToast()
// Fetch data
async function FetchData() {
  const res = await GetExpertEfficiencyLineCode(internalLineCode.value)
  if (res.status == 200) {
    console.log(res.data)
    expertData.value = res.data
  } else {
    console.error(res)
  }
}

async function MergeExpertType(lineCode: string, type: MasterType[], expert: ExpertEfficiency[]) {
  const merged: mergeExpertType[] = type.map((t) => {
    const matchedExpert = expert.find(
      (e) => e.typeCode === t.typeCode && e.lineCode == internalLineCode.value,
    )
    console.log(matchedExpert)
    return {
      typeCode: t.typeCode,
      typeName: t.typeName,
      lineCode: lineCode,
      EffPct: matchedExpert ? matchedExpert.effPct : 0,
    }
  })
  mergeExpertType.value = merged
  console.log('Merged Data:', mergeExpertType.value)
}
// watch sync props → local state
function resetInput() {
  internalEff.value = 0
  internalTypeCode.value = ''
}
watch(
  () => props.visible,
  (v) => (internalVisible.value = v),
)

// watch(internalTypeCode, (v) => {
//   console.log('Selected TypeCode:', v)
//   internalTypeName.value =
//     STORE_MASTER.masterType.find((type) => type.typeCode === v)?.typeName || ''
// })
watch(
  () => props.lineCode,
  async () => {
    internalLineCode.value = props.lineCode
  },
)
watch(
  () => [internalLineCode.value, typeData.value, expertData.value],
  async () => {
    await MergeExpertType(internalLineCode.value, typeData.value, expertData.value)
  },
)
watch(mergeExpertType, (newVal) => {
  if (newVal.filter((item) => item.lineCode != '' || item.lineCode != null).length > 0) {
    loading.value = false
  } else {
    loading.value = true
  }
})

watch(
  () => refView?.value?.getSelectedData(),
  (newVal) => {
    const selectData = newVal
    console.log(selectData)
    if (selectData != null) {
      internalTypeCode.value = selectData.typeCode
      internalEff.value = selectData.EffPct
    }
    // selectData?.forEach((item) => {
    //   internalTypeCode.value = item.typeCode
    //   internalTypeName.value = item.typeName
    // })
  },
)
// initial data
onMounted(async () => {
  loading.value = true
  await STORE_MASTER.getMasterType()
  await FetchData()
  typeData.value = STORE_MASTER.masterType
})

// ✅ Emit กลับ
async function onSave() {
  const request: CreateExpertEfficiencyDTO = {
    lineCode: internalLineCode.value,
    typeCode: internalTypeCode.value,
    EffPct: internalEff.value,
  }
  const res = await CreateExpertEfficiency(request)
  if (res.status === 200) {
    await FetchData()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'เพิ่ม ExpertType สำเร็จ',
      life: 3000,
    })
    confirmChangeTypeDialog.value = false
  }
}
function onCancel() {
  resetInput()
  emit('cancel')
  emit('update:visible', false)
}

// รับ Emit
function onCloseAddType(bool: boolean) {
  showModalType.value = bool
}

async function saveType(bool: boolean) {
  if (bool) {
    await STORE_MASTER.getMasterType()
    typeOptions.value = STORE_MASTER.masterType
  }
}
</script>
