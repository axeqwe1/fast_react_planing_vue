import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/view/MainView.vue'
import { me } from '@/lib/api/auth'
import { useScheduleStore } from '@/stores/scheduleStore'
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'Home',
    //   component: MainView,
    // },
    // {
    //   path: '/login',
    //   name: 'Login',
    //   component: () => import('@/view/LoginView.vue'),
    // },
  ],
})

// router.beforeEach(async (to, from, next) => {
//   const res = me()
//   if (to.name !== 'Login' && (await res) == null) {
//     next({ name: 'Login' })
//   } else if (to.name === 'Login' && (await res) != null) {
//     next({ name: 'Home' })
//   } else {
//     next()
//   }
// })

// router.beforeEach(async (to, from, next) => {
//   const store = useScheduleStore()

//   // Pre-load data สำหรับหน้าที่ต้องการ
//   if (to.name === 'schedule' || to.path.includes('schedule')) {
//     try {
//       // เริ่ม initialization แต่ไม่รอให้เสร็จ
//       store.initializeOnce().catch(console.error)
//     } catch (error) {
//       console.error('Failed to pre-load schedule data:', error)
//     }
//   }

//   next()
// })

export default router
