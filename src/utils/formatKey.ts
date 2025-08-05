export function formatTimeKey(date: Date): string {
  const datePart = date.toISOString().split('T')[0]
  const hour = date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${datePart} ${hour}:${minute}`
}
