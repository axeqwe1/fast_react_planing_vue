<template>
  <Dialog
    v-model:visible="internalVisible"
    :header="`Split Quantity ของ Job Order ${internalOrder?.name} `"
    modal
    class="lg:max-w-[500px] w-full"
    :draggable="true"
    @hide="onCancel()"
  >
    <div class="flex flex-row w-full">
      <div class="flex flex-2/4 flex-col gap-4">
        <!-- เลือก TypeCode จาก Master -->
        <div>
          <label class="flex flex-row items-center justify-between text-sm font-bold mb-2">
            <span>กรอก SplitQty</span>
          </label>
          <InputNumber
            :min="0"
            placeholder="กรอก SplitQty"
            v-model="internalSplitQty"
            class="w-full"
          />
        </div>
        <!-- Remark -->

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
            :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-save'"
            :disabled="loading"
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
      <Button
        type="button"
        :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-save'"
        :disabled="loading"
        :label="'Save'"
        @click="onSave()"
      ></Button>
    </div>
  </Dialog>
  <Toast position="top-center" />
</template>

<script setup lang="ts">
import { GetPlanJobBySewId, SplitJob } from '@/lib/api/Masterplan'
import type { SplitJobRequestDTO } from '@/type/requestDTO'
import type { Job } from '@/type/types'
import { onMounted, ref, watch } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useMaster } from '@/stores/masterStore'

const props = defineProps<{ Show: boolean; OrderJob: Job | null }>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', value: { splitQty: number }): void
}>()

const confirmAddTypeDialog = ref(false)
const internalVisible = ref(false)
const internalSplitQty = ref(0)
const internalOrder = ref(props.OrderJob)

const store = useScheduleStore()
const STORE_MASTER = useMaster()

const loading = ref(false)

const toast = useToast()

function onCancel() {
  emit('update:visible', false)
  internalVisible.value = false
}
async function onSave() {
  loading.value = true
  // Logic to save the new type
  const request: SplitJobRequestDTO = {
    sewId: internalOrder.value?.sewId || 0,
    splitQty: internalSplitQty.value,
  }
  const res = await SplitJob(request)
  if (res.status === 200) {
    const oldData = res.data.results.old
    const oldPlan = await GetPlanJobBySewId(oldData.sewId || 0)
    const jobIndex = store.Jobs.findIndex((j) => j.sewId === oldData.sewId)
    if (jobIndex !== -1) {
      const job = store.Jobs[jobIndex]
      job.startDate = oldPlan.sewStart
      job.endDate = oldPlan.sewFinish
      job.qty = oldData.splitQty ?? oldData.qty
      job.splitQty = oldData.splitQty ?? oldData.qty
      job.progressPct = oldPlan.progressPct
      job.processStatus = oldPlan.processStatus
      job.updateBy = oldPlan.updateBy
      job.updateDate = oldPlan.updateDate

      // update cache
      store.jobStyleCache.set(job.id, store.getJobStyle(job))
      const indexPlan = STORE_MASTER.planJob.findIndex((j) => j.sewId === job.sewId)
      if (indexPlan !== -1) {
        const plan = STORE_MASTER.planJob[indexPlan]
        plan.qty = oldData.splitQty ?? oldData.qty
        plan.splitQty = oldData.splitQty ?? oldData.qty
      }
    }

    const newData = res.data.results.new
    const newPlan = await GetPlanJobBySewId(newData.sewId || 0)
    const newJob: Job = {
      id: newPlan.sewId,
      sewId: newPlan.sewId,
      line: newPlan.lineCode,
      qty: newPlan.splitQty ? newData.splitQty : newData.qty,
      splitQty: newPlan.splitQty,
      qtyBal: newPlan.qtyBal,
      style: newPlan.style,
      season: newPlan.season,
      color: newPlan.color,
      sam: newPlan.sam,
      typeCode: newPlan.typeCode,
      typeName: newPlan.type,
      name: newPlan.orderNo,
      startDate: newPlan.sewStart,
      endDate: newPlan.sewFinish,
      duration: newPlan.duration,
      processStatus: newPlan.processStatus,
      progressPct: newPlan.progressPct,
      createBy: newPlan.createBy,
      updateBy: newPlan.updateBy,
      createDate: newPlan.createDate,
      updateDate: newPlan.updateDate,
    }
    store.Jobs.push(newJob)
    store.jobStyleCache.set(newJob.id, store.getJobStyle(newJob))

    STORE_MASTER.planJob.push(newPlan)
    console.table(newJob, newPlan)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Split Job สำเร็จ',
      life: 3000,
    })
  }
  confirmAddTypeDialog.value = false
  internalVisible.value = false
  loading.value = false
}

onMounted(() => {
  internalOrder.value = props.OrderJob
  internalVisible.value = props.Show
  console.log(props.OrderJob)
})
watch(
  () => props.Show,
  (newVal) => {
    internalVisible.value = newVal
    console.log(newVal)
  },
)
watch(
  () => props.OrderJob,
  (newVal) => {
    internalOrder.value = newVal
    console.log(newVal)
  },
)
</script>

<style scoped></style>
