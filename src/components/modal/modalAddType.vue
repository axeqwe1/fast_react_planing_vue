<template>
  <Dialog
    v-model:visible="internalVisible"
    header="เพิ่ม Type"
    modal
    class="lg:max-w-[500px] w-full"
    :draggable="true"
    @hide="onCancel()"
  >
    <div class="flex flex-row w-full">
      <div class="flex flex-2/4 flex-col gap-4">
        <!-- TypeName จากต้นทาง -->
        <div>
          <label class="block text-sm font-bold mb-2">กรอก TypeCode </label>
          <InputGroup>
            <InputText
              :class="[
                invalidType == null ? '' : invalidType ? 'border-red-600!' : 'border-green-500!',
              ]"
              v-model="internalTypeCode"
              placeholder="กรอก TypeCode"
              :disabled="invalidType === false"
            />
            <Button v-if="invalidType == null" @click="CheckType" label="Check Type" />
            <Button
              v-if="invalidType != null"
              @click="
                () => {
                  invalidType = null
                  showIcon = false
                }
              "
              severity="warn"
              label="Reset"
            />
            <InputGroupAddon
              :class="[
                invalidType == null ? '' : invalidType ? 'border-red-600!' : 'border-green-500!',
              ]"
            >
              <div v-if="showIcon">
                <template v-if="loadingCheck">
                  <i class="pi pi-spin pi-spinner text-blue-600" title="Loading" />
                </template>
                <template v-else>
                  <i
                    v-if="invalidType"
                    class="pi pi-times-circle text-red-500"
                    title="Type Already in system"
                  />
                  <i v-else class="pi pi-check-circle text-green-500" title="OK" />
                </template>
              </div>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <!-- เลือก TypeCode จาก Master -->
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>กรอก TypeName</span>
          </label>
          <InputText
            placeholder="กรอก TypeName"
            :disabled="invalidType != null ? invalidType : true"
            v-model="internalTypeName"
            class="w-full"
          />
        </div>
        <!-- Remark -->
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>Remark</span>
          </label>
          <InputText
            :disabled="invalidType != null ? invalidType : true"
            placeholder="Remark (Optional)"
            v-model="internalRemark"
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
                confirmAddTypeDialog = true
              }
            "
          />
        </div>
        <small class="text-gray-500"
          >* หมายเหตุ: พยายามให้ TypeName และ TypeCode สื่อความหมาย Type ที่ตรงกัน
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
      >ดำเดินการเพิ่ม MasterType ลงใน System?.</span
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
import { ref, watch } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useMaster } from '@/stores/masterStore'
import type { CreateMasterTypeDTO } from '@/type/requestDTO'
import { useAuth } from '@/stores/userStore'
import { CreateMasterType } from '@/lib/api/Mastertype'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
const internalVisible = ref(false)
const props = defineProps<{ showModalType: boolean }>()
const internalTypeName = ref('')
const internalTypeCode = ref('')
const internalRemark = ref('')
const requestCreateType = ref<CreateMasterTypeDTO | null>(null)
const emits = defineEmits<{
  (e: 'update:showModalType', value: boolean): void
  (e: 'save', value: boolean): void
}>()

const store = useScheduleStore()
const STORE_MASTER = useMaster()
const auth = useAuth()
const invalidType = ref(null as boolean | null)
const confirmAddTypeDialog = ref(false)
const toast = useToast()

const loadingCheck = ref(false)
const showIcon = ref(false)
async function CheckType() {
  // Logic to check type
  showIcon.value = true
  loadingCheck.value = true
  await STORE_MASTER.getMasterType()
  const AllType = STORE_MASTER.masterType
  const found = AllType.find((type) => type.typeCode === internalTypeCode.value)
  console.log(found)
  if (internalTypeCode.value === '') {
    invalidType.value = null
    return
  }
  if (found) {
    invalidType.value = true
  } else {
    invalidType.value = false
  }
  loadingCheck.value = false
}
watch(
  () => props.showModalType,
  (newVal) => {
    internalVisible.value = newVal
  },
)

function resetInput() {
  internalTypeName.value = ''
  internalTypeCode.value = ''
  internalRemark.value = ''
  invalidType.value = null
}
async function onSave() {
  requestCreateType.value = {
    typeId: 0,
    typeName: internalTypeName.value,
    typeCode: internalTypeCode.value,
    remark: internalRemark.value,
    createBy: auth.user.fullname,
  }

  if (requestCreateType.value) {
    const res = await CreateMasterType(requestCreateType.value)
    if (res.status == 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Add Type Success',
        life: 3000,
      })
      emits('save', true)
      confirmAddTypeDialog.value = false
      onCancel()
    }
  }
}
function onCancel() {
  resetInput()
  emits('update:showModalType', false)
}
</script>

<style scoped></style>
