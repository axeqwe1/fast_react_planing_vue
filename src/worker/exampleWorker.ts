// exampleWorker.ts

// ฟังข้อความที่ส่งมาจาก main thread
self.onmessage = (event) => {
  const { numbersa } = event.data as { numbersa: number[] }

  // ตัวอย่าง: คำนวณผลรวม (งานที่ CPU ทำ)
  const sum = numbersa.reduce((a, b) => a + b, 0)

  // ส่งผลกลับไปให้ main thread
  postMessage({ sum })
}

export {} // บอก TypeScript ว่านี่คือ module
