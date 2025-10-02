<template>
  <Dialog
    v-model:visible="internalVisible"
    :header="`จัดการ Type Mapping ของ Line ${internalLineCode}`"
    modal
    class="lg:max-w-[1000px] w-full"
    :draggable="false"
    @hide="onCancel"
  >
    <div class="flex flex-row w-full">
      <div class="flex flex-2/4 flex-col gap-4">
        <!-- TypeName จากต้นทาง -->
        <div>
          <label class="block text-sm font-bold mb-2">Type Code ที่จะเป็น</label>
          <InputText v-model="internalTypeCode" disabled class="w-full" />
        </div>

        <!-- เลือก TypeCode จาก Master -->
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>เลือก TypeName</span>
            <span
              @click="
                () => {
                  showModalType = !showModalType
                }
              "
              class="text-xs text-sky-600 hover:underline hover:cursor-pointer"
              >เพิ่ม TypeName</span
            >
          </label>
          <Select
            v-model="internalTypeCode"
            :options="typeOptions"
            optionLabel="typeName"
            optionValue="typeCode"
            placeholder="เลือก TypeName"
            class="w-full"
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
                confirmChangeTypeDialog = true
              }
            "
          />
        </div>
        <small class="text-gray-500"
          >* หมายเหตุ: ให้ปรับเฉพาะ Order ที่ TypeName ไม่ตรงกับ MasterType ในระบบ</small
        >
      </div>
      <div class="flex flex-3/4 w-full">
        <OrderFromLine :lineCode="internalLineCode" ref="refOrderFromLine" />
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
import OrderFromLine from '../datatable/OrderFromLine.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useMaster } from '@/stores/masterStore'
import modalAddType from './modalAddType.vue'
import type { MasterType } from '@/type/types'
import type { changeTypeOrderRequestDTO } from '@/type/requestDTO'
import { ChangeOrderType } from '@/lib/api/Masterplan'
import { useAuth } from '@/stores/userStore'

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
const internalTypeName = ref('')
const internalTypeCode = ref('')
const typeOptions = ref<MasterType[]>([])
const internalLineCode = ref<string>('')
const showModalType = ref(false)
const confirmChangeTypeDialog = ref(false)

const refOrderFromLine = ref<InstanceType<typeof OrderFromLine>>()
const store = useScheduleStore()
const STORE_MASTER = useMaster()
const auth = useAuth()
// watch sync props → local state
function resetInput() {
  internalTypeName.value = ''
  internalTypeCode.value = ''
}
watch(
  () => props.visible,
  (v) => (internalVisible.value = v),
)

watch(internalTypeCode, (v) => {
  console.log('Selected TypeCode:', v)
  internalTypeName.value =
    STORE_MASTER.masterType.find((type) => type.typeCode === v)?.typeName || ''
})
watch(
  () => props.lineCode,
  () => {
    internalLineCode.value = props.lineCode
  },
)
// initial data
onMounted(async () => {
  await STORE_MASTER.getMasterType()
  typeOptions.value = STORE_MASTER.masterType
})

// ✅ Emit กลับ
async function onSave() {
  const request: changeTypeOrderRequestDTO = {
    TypeName: internalTypeName.value,
    TypeCode: internalTypeCode.value,
    jobList: refOrderFromLine.value?.getSelectedOrders() || [],
    createBy: auth.user.fullname,
  }
  console.log(request)
  const res = await ChangeOrderType(request)
  if (res.status === 200) {
    alert('บันทึกสำเร็จ')
    confirmChangeTypeDialog.value = false
  } else {
    alert('บันทึกไม่สำเร็จ')
    return
  }
  console.log(request)
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
