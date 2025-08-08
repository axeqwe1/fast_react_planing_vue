<template>
  <canvas ref="timelineCanvas" :width="canvasWidth" :height="canvasHeight" />
</template>

<script setup lang="ts">
import { onMounted, watch, ref, type Ref, watchEffect, nextTick } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { formatTimeKey } from '@/utils/formatKey'

const props = defineProps<{ divideLeft: number[] }>()
const store = useScheduleStore()
const canvasWidth = ref<number>(0)
const timelineCanvas: Ref<HTMLCanvasElement | null> = ref(null)

const canvasHeight = 70

const lineName = 'LINE_1'

function drawTimeline(): void {
  const canvas = timelineCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight)
  ctx.font = '12px Arial'

  ctx.textBaseline = 'middle'
  // ตัวอย่างวาดเส้นแบ่ง

  ctx.strokeStyle = 'black'

  ctx.lineWidth = 0.15
  store.weeks.forEach((week) => {
    const key = formatTimeKey(week.start)
    const days = store.cacheWeekDay.get(key)
    if (!days) return

    days.forEach((day) => {
      const left = store.getDurationStyle(key, day)
      const durationText = store.getDayDuration(day, lineName)

      ctx.fillStyle = '#eee' // สีปกติ
      ctx.fillRect(left, 80, 40, 70)

      ctx.fillStyle = '#000'
      ctx.fillText(durationText.toString(), left + 25, 60)

      ctx.beginPath()
      ctx.moveTo(left, 0)
      ctx.lineTo(left, canvasHeight)
      ctx.stroke()
    })
  })
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2
  const divideLeft: number[] = props.divideLeft // แก้ตามจริง
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
watchEffect(() => {
  if (store.headerWidth) {
    canvasWidth.value = store.headerWidth
    // console.log('canvasWidth set from week-header:', canvasWidth.value)
    drawTimeline()
  }
})
watch(
  () => [store.weeks, store.cacheWeekDay],
  () => {
    drawTimeline()
  },
  { deep: true },
)
</script>
<style scoped></style>
