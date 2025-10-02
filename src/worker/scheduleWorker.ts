// // jobWorker.ts
// import { formatTimeKey } from '@/utils/formatKey'

// export type Job = {
//   id: string
//   startDate: string
//   endDate: string
//   color: string
// }

// const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

// onmessage = (e: MessageEvent) => {
//   const { jobs, timeIndexMap, unitWidth } = e.data as {
//     jobs: Job[]
//     timeIndexMap: [string, number][]
//     unitWidth: number
//   }

//   const map = new Map(timeIndexMap)
//   const results: Record<string, any> = {}

//   for (const job of jobs) {
//     const startKey = formatTimeKey(new Date(job.startDate))
//     const endKey = formatTimeKey(new Date(job.endDate))
//     const startOffset = map.get(startKey)
//     const endOffset = map.get(endKey)

//     if (startOffset == null || endOffset == null) {
//       results[job.id] = { display: 'none' }
//       continue
//     }
//   }
// }
