export function formatTimeKey(date: Date): string {
  const datePart = date.toISOString().split('T')[0]
  const hour = date.getHours().toString().padStart(2, '0') // ✅ สำคัญมาก
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${datePart} ${hour}:${minute}` // เช่น "2025-02-06 08:45"
}

export function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
