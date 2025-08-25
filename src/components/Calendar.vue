<script setup lang="ts">
import { useScheduleStore } from '@/stores/scheduleStore'
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'select', date: Date): void
}>()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
let holidays = [] as number[]
const store = useScheduleStore()
// ฟังก์ชันหาวันในเดือน
const daysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate()
}

// เริ่มต้นวันแรกของเดือน
const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

// จำนวนวันในเดือน
const totalDays = computed(() => {
  return daysInMonth(currentMonth.value, currentYear.value)
})

// array ของวัน
const calendarDays = computed(() => {
  const days = []
  holidays = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  for (let d = 1; d <= totalDays.value; d++) {
    if (store.isHoliday(new Date(currentYear.value, currentMonth.value, d))) {
      holidays.push(d)
    }
    days.push(d)
  }
  return days
})

// เปลี่ยนเดือน
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// mock data
const workdays = [] as number[]

const otDays = [] as number[]

const getDayClass = (day: number | null) => {
  if (!day) return 'text-gray-400'
  if (holidays.includes(day)) return 'bg-red-200 rounded-full'
  if (otDays.includes(day)) return 'bg-blue-200 rounded-full'
  if (workdays.includes(day)) return 'bg-green-200 rounded-full'
  return 'hover:bg-gray-100 rounded-full cursor-pointer'
}

const selectDay = (day: number | null) => {
  if (!day) return
  const date = new Date(currentYear.value, currentMonth.value, day)
  emit('select', date)
}
</script>

<template>
  <div class="w-full max-w-md mx-auto p-4 border rounded-xl shadow bg-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <button class="btn btn-sm btn-ghost" @click="prevMonth">&lt;</button>
      <span class="font-semibold">
        {{ new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }) }}
        {{ currentYear }}
      </span>
      <button class="btn btn-sm btn-ghost" @click="nextMonth">&gt;</button>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 text-center gap-1">
      <div class="font-bold">Su</div>
      <div class="font-bold">Mo</div>
      <div class="font-bold">Tu</div>
      <div class="font-bold">We</div>
      <div class="font-bold">Th</div>
      <div class="font-bold">Fr</div>
      <div class="font-bold">Sa</div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="p-2 text-center"
        :class="getDayClass(day)"
        @click="selectDay(day)"
      >
        {{ day || '' }}
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex gap-4 text-sm justify-center">
      <!-- <div class="flex items-center gap-1">
        <span class="w-3 h-3 bg-green-300 rounded-full"></span> Work
      </div> -->
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 bg-red-300 rounded-full"></span> Holiday
      </div>
      <!-- <div class="flex items-center gap-1">
        <span class="w-3 h-3 bg-blue-300 rounded-full"></span> OT
      </div> -->
    </div>
  </div>
</template>
