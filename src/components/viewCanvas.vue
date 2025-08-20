<template>
  <div class="timeline-container" @scroll="handleScroll" ref="container">
    <!-- Timeline Grid -->

    <!-- Divide bars overlay -->
    <div class="divide-overlay">
      <div
        v-for="pos in visibleDivides"
        :key="pos"
        class="divide-bar"
        :style="{
          left: `${pos - store.minWidthHeader / 7}px`,
          width: `${store.minWidthHeader / 7}px`,
        }"
      />
      <div v-for="cell in timelineCells" :class="cell.className" :style="cell.style"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { formatTimeKey } from '@/utils/formatKey'

const store = useScheduleStore()
const container = ref<HTMLElement>()
const scrollX = ref(0)
const viewportWidth = ref(1920)

const lineName = 'LINE_1'
const cellWidth = 40
const canvasHeight = 70

// คำนวณ total width
const totalWidth = computed(() => store.headerWidth || 0)

// สร้าง grid template (ไม่ต้องใช้แล้ว เปลี่ยนเป็น absolute positioning)
const gridTemplate = computed(() => {
  return 'none' // ไม่ใช้ grid แล้ว
})

// สร้างข้อมูล cells (วน loop เดียว)
const timelineCells = computed(() => {
  const cells: Array<{
    key: string
    text: string
    className: string
    style: Record<string, any>
  }> = []

  // วน weeks เดียว
  store.weeks.forEach((week, weekIndex) => {
    const key = formatTimeKey(week.start)
    const days = store.cacheWeekDay.get(key)
    if (!days) return

    // วน days เดียว
    days.forEach((day) => {
      const duration = store.getDayDuration(day, lineName)
      const isWeekend = store.isHoliday(day)

      // ใช้ตำแหน่งจริงจาก store แทน cellIndex
      const leftPosition = store.getDurationStyle(key, day)

      if (isWeekend) {
        cells.push({
          key: `${key}-${day.getTime()}`,
          text: duration.toString(),
          className: isWeekend ? 'weekend' : '',
          style: {
            position: 'absolute',
            left: `${leftPosition - store.minWidthHeader / 7}px`,
            width: `${store.minWidthHeader / 7}px`,
            height: '70px',
            background: isWeekend ? '#4da8da80' : '#eee',
          },
        })
      }
    })
  })

  return cells
})

// คำนวณ visible divides (กรองเฉพาะที่เห็น)
const visibleDivides = computed(() => {
  return store.divideCache
})

function handleScroll(): void {
  if (!container.value) return
  scrollX.value = container.value.scrollLeft
}

function updateViewportWidth(): void {
  if (typeof window !== 'undefined') {
    viewportWidth.value = Math.min(window.innerWidth, 1920)
  }
}

onMounted(() => {
  updateViewportWidth()
  window.addEventListener('resize', updateViewportWidth)
})
</script>

<style scoped>
.timeline-container {
  width: 100%;
  height: 70px;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  background: #fff;
}

.timeline-grid {
  height: 70px;
  will-change: transform;
  position: relative;
  /* เปลี่ยนจาก grid เป็น relative positioning */
}

.timeline-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  background: #eee;
  box-sizing: border-box;
}

.timeline-cell.weekend {
  background: #f0f8ff !important;
}

.cell-text {
  font-size: 12px;
  font-family: Arial, sans-serif;
  color: #000;
  pointer-events: none;
}

.divide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.divide-bar {
  position: absolute;
  height: 70px;
  /* background: #4da8da80; */
  border-right: 2px solid red;
}

/* Scrollbar styling */
.timeline-container::-webkit-scrollbar {
  height: 8px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
