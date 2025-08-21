import { useScheduleStore } from '@/stores/scheduleStore'
import { ref } from 'vue'

export function useMouseEvent() {
  const store = useScheduleStore()

  function getRelativeX(container: HTMLElement, event: MouseEvent) {
    const containerRect = container.getBoundingClientRect()
    return event.clientX - containerRect.left + container.scrollLeft
  }

  function getRelativeY(container: HTMLElement, event: MouseEvent) {
    const containerRect = container.getBoundingClientRect()
    return event.clientY - containerRect.top + container.scrollTop
  }
  const getInsertIndexInLine = (container: HTMLElement, event: MouseEvent): number => {
    const relativeX = getRelativeX(container, event) // ใช้ clientX
    const unitWidth = container.offsetWidth / store.timeIndexMap.size
    const index = Math.floor(relativeX / unitWidth)

    return index
  }

  return {
    getInsertIndexInLine,
    getRelativeX,
    getRelativeY,
  }
}
