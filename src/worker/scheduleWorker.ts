// jobWorker.ts
export type Job = {
  id: string
  startDate: string
  endDate: string
  color: string
}

export type TimeIndexMap = Map<string, number>

function formatDateKey(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

onmessage = (e: MessageEvent) => {
  const { jobs, timeIndexMap, unitWidth } = e.data as {
    jobs: Job[]
    timeIndexMap: [string, number][]
    unitWidth: number
  }

  const map = new Map(timeIndexMap)
  const results: Record<string, any> = {}

  for (const job of jobs) {
    const startKey = formatDateKey(job.startDate)
    const endKey = formatDateKey(job.endDate)
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
