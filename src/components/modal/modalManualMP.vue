<template>
  <Dialog
    v-model:visible="internalVisible"
    :header="`Config Manual Manpower ของ Line ${internalLineCode}`"
    modal
    class="lg:max-w-[1000px] lg:max-h-screen w-full"
    :draggable="false"
    @hide="onCancel"
  >
    <div class="flex flex-row w-full">
      <div class="flex w-full">
        <ManualMPDataTable
          :data="Data"
          :loading="loading"
          :lineCode="internalLineCode"
          ref="refView"
          @update:showModal="onCancele"
        />
      </div>
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
import ManualMPDataTable from '../datatable/ManualMP.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useMaster } from '@/stores/masterStore'
import modalAddType from './modalAddType.vue'
import {
  type ExpertEfficiency,
  type manualMP,
  type MasterType,
  type mergeExpertType,
} from '@/type/types'
import type { changeTypeOrderRequestDTO, CreateExpertEfficiencyDTO } from '@/type/requestDTO'
import { ChangeOrderType } from '@/lib/api/Masterplan'
import { useAuth } from '@/stores/userStore'
import { CreateExpertEfficiency, GetExpertEfficiencyLineCode } from '@/lib/api/ExpertEffType'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { GetManualMpData, GetManualMpDataByLineCode } from '@/lib/api/ManualEFFMP'
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

const refView = ref<InstanceType<typeof ManualMPDataTable>>()
const store = useScheduleStore()
const STORE_MASTER = useMaster()
const auth = useAuth()

const Data = ref<manualMP[]>([])
const typeData = ref<MasterType[]>([])
const mergeExpertType = ref<mergeExpertType[]>([])
const loading = ref<boolean>(false)
const toast = useToast()
// Fetch data
async function FetchData() {
  const res = await GetManualMpDataByLineCode(internalLineCode.value)
  if (res.status == 200) {
    console.log(res.data)
    Data.value = res.data
  } else {
    console.error(res)
  }
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

watch(
  () => props.lineCode,
  async () => {
    internalLineCode.value = props.lineCode
    await FetchData()
  },
)

watch(mergeExpertType, (newVal) => {
  if (newVal.filter((item) => item.lineCode != '' || item.lineCode != null).length > 0) {
    loading.value = false
  } else {
    loading.value = true
  }
})

// initial data
onMounted(async () => {
  internalLineCode.value = props.lineCode
  loading.value = true
  await FetchData()
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
    await STORE_MASTER.getManualMP()
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
async function onCancele() {
  await FetchData()
}
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
