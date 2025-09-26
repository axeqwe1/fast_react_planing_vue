// jobWorker.ts
import { formatTimeKey } from '@/utils/formatKey'

export type Job = {
  id: string
  startDate: string
  endDate: string
  color: string
}

export type TimeIndexMap = Map<string, number>

onmessage = (e: MessageEvent) => {
  const { jobs, timeIndexMap, unitWidth } = e.data as {
    jobs: Job[]
    timeIndexMap: [string, number][]
    unitWidth: number
  }

  const map = new Map(timeIndexMap)
  const results: Record<string, any> = {}

  for (const job of jobs) {
    const startKey = formatTimeKey(new Date(job.startDate))
    const endKey = formatTimeKey(new Date(job.endDate))
    const startOffset = map.get(startKey)
    const endOffset = map.get(endKey)

    if (startOffset == null || endOffset == null) {
      results[job.id] = { display: 'none' }
      continue
    }

    const left = startOffset * unitWidth
    const width = (endOffset - startOffset + 1) * unitWidth

    results[job.id] = {
      left: `${left}px`,
      width: `${Math.max(width, 1.16)}px`,
      backgroundColor: job.color,
      minWidth: '1.16px',
    }
  }

  postMessage(results)
}
