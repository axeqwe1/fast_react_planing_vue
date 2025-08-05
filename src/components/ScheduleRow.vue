<template>
  <div class="flex flex-col relative">
    <div class="flex z-0" v-for="(line, i) in lines">
      <div
        class="flex flex-col w-full border-1 border-gray-400 p-2 sticky left-0 max-w-[200px] bg-slate-200 z-8"
      >
        <div class="flex justify-between items-center">
          <span class="font-bold">
            0 <span class="pl-1 font-semibold"> {{ line.name }} </span>
          </span>
          <span class="font-bold">3 <span class="font-bold pl-1"> 0 </span></span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-bold"> 0 <span class="pl-1 font-semibold"> YPT </span> </span>
          <span class="font-bold">3</span>
        </div>
      </div>
      <div class="relative h-[70px] w-full border-b-1 border-gray-200 z-0">
        <template v-if="lines.length > 0 && store.timeIndexMap.size > 0">
          <div
            v-for="job in store.getJobsForLine(line.name)"
            :key="job.line + job.name"
            :style="store.getJobStyle(job)"
            v-tooltip.top="'Line: ' + line.name + ' ' + job.name"
            class="schedule-bar z-5 border-r-4"
          >
            <span class="bg-slate-800/50 p-1 rounded-sm">
              {{ job.name }}
            </span>
          </div>
        </template>
        <template
          v-if="store.WorkDuration.size > 0 && store.weeks.length > 0"
          v-for="week in store.weeks"
        >
          <div
            v-for="(day, index) in store.cacheWeekDay.get(formatTimeKey(week.start))"
            :key="index"
            class="hour-of-day flex flex-row-reverse items-end px-2 border-r-1 border-gray-300 z-3"
            :style="{ left: `${store.getDurationStyle(formatTimeKey(week.start), day)}px` }"
          >
            <div class="">
              {{ store.getDayDuration(day, line.name) }}
            </div>
          </div>
          <!-- <div
            v-if="store.WorkDuration.has(`${formatTimeKey(week.start)}${line.name}`)"
            class="hour-of-day z-5"
          >
            {{ store.WorkDuration.get(`${formatTimeKey(week.start)}${line.name}`) }}
          </div> -->
        </template>
        <div
          class="week-break-background border-r-3 border-r-red-700 z-4"
          v-for="i in divideLeft"
          :style="{ left: i + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/stores/scheduleStore'
import type { Job, MasterData } from '@/type/types'
import { watch, ref, onMounted, watchEffect } from 'vue'
import { formatTimeKey } from '@/utils/formatKey'
const divideLeft = ref<number[]>()
const lines = ref()
const store = useScheduleStore()
const jobForLine = ref<Job[]>([])
watch(
  () => store.Lines, // ✅ ต้องใช้แบบนี้เพื่อติดตาม reactive props
  (newMaster) => {
    lines.value = newMaster
    console.log('Updated lines:', newMaster)
  },
  { immediate: true }, // เรียกทันทีตอน mounted
)
watchEffect(async () => {
  store.getDayIndex(8)
  let arrLeft: number[] = []
  store.weeks.forEach((item, index) => {
    const LEFT = store.getDevideStyle(item.end)
    arrLeft.push(LEFT)
  })
  divideLeft.value = arrLeft
  console.log('divideLeft:', arrLeft)
  console.log('store WorkDuration', store.WorkDuration)
})
</script>

<style scoped>
.week-break-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 43px;
  height: 100%;
  background-color: rgb(77, 168, 218, 0.5); /* สีพื้นหลังโปร่งแสง */
}

.schedule-bar {
  position: absolute;
  top: 10px;
  height: 30px;
  color: white;
  text-align: left;
  /*            padding-left: 12px;*/
  line-height: 30px;
  white-space: nowrap;
  min-width: 10px; /* ลด min-width เพื่อรองรับงานสั้นๆ */
  background-color: #007bff;
  overflow: hidden;
  border: 1px solid #000;
  border-right: 2px solid #000; /* กำหนดเส้นขอบด้านขวาให้หนา */
  font-size: 12px; /* ปรับขนาดตัวอักษรให้เล็กลงถ้าจำเป็น */
  font-weight: bold;
}

.hour-of-day {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 43px; /* ความกว้างของแต่ละชั่วโมง */
  height: 100%;
  background-color: #f8f9fa; /* สีพื้นหลังของชั่วโมง */
}
</style>
