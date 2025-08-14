<template>
  <canvas ref="timelineCanvas" :width="canvasWidth" :height="canvasHeight" />
</template>

<script setup lang="ts">
import { onMounted, watch, ref, type Ref, watchEffect, nextTick } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { formatTimeKey } from '@/utils/formatKey'

const store = useScheduleStore()
const canvasWidth = ref<number>(0)
const timelineCanvas: Ref<HTMLCanvasElement | null> = ref(null)
const divideCache = ref<number[]>(store.divideCache)
const canvasHeight = 70

const lineName = 'LINE_1'

function drawTimeline(): void {
  const canvas = timelineCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight)
  ctx.font = '12px Arial'

  ctx.lineWidth = 0.15
  store.weeks.forEach((week, weekIndex) => {
    // console.log(week.start, 'to', week.end)
    const key = formatTimeKey(week.start)
    const days = store.cacheWeekDay.get(key)
    // if (weekIndex === 0) {
    //   console.log(`Drawing week: ${key}, days:`, days)
    // }
    if (!days) return

    days.forEach((day) => {
      const left = store.getDurationStyle(key, day)
      const durationText = store.getDayDuration(day, lineName)
      // console.log(day, 'duration', left)
      ctx.fillStyle = '#eee' // สีปกติ
      ctx.fillRect(0, 80, 40, 70)
      ctx.fillStyle = '#000'

      ctx.fillText(durationText.toString(), left - 12, 60)

      ctx.beginPath()
      ctx.moveTo(left, 0)
      ctx.lineTo(left, canvasHeight)
      ctx.stroke()
    })
  })
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2
  const divideLeft: number[] = divideCache.value // แก้ตามจริง

  divideLeft.forEach((pos) => {
    ctx.fillStyle = '#4da8da80' // สีปกติ
    ctx.fillRect(pos, 0, 42.72, 70)

    ctx.beginPath()
    ctx.moveTo(pos + 42.72, 0)
    ctx.lineTo(pos + 42.72, canvasHeight)
    ctx.stroke()
  })
}

// onMounted(() => {
//   drawTimeline()
// })
watch(
  () => [store.headerWidth, store.cacheWeekDay, store.divideCache],
  () => {
    // console.log('watchEffect triggered', store.divideCache)
    const width = store.headerWidth // reactive
    if (width) {
      divideCache.value = store.getDivideCache()
      canvasWidth.value = store.headerWidth
      console.log('canvasWidth set from week-header:', canvasWidth.value)
      drawTimeline()
    }
  },
  { immediate: true },
)
watch(
  () => [store.weeks, store.cacheWeekDay, store.divideCache],
  () => {
    if (divideCache.value.length > 0) {
      drawTimeline()
      divideCache.value = store.getDivideCache()
    }
  },
  { deep: true },
)
</script>
<style scoped></style>
