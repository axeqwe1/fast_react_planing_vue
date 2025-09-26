import type { Job } from '@/type/types'

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

export function calculateAllJobStyles(
  jobs: Job[],
  timeIndexMap: Map<string, number>,
  containerWidth: number,
): Promise<{ style: any }[]> {
  return new Promise((resolve) => {
    worker.postMessage({
      jobs,
      timeIndexMaps: Object.fromEntries(timeIndexMap),
      containerWidths: containerWidth,
    })

    worker.onmessage = (event) => {
      resolve(event.data)
    }
  })
}
