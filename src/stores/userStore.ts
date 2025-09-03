import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/type/types'
import { me } from '@/lib/api/auth'

export const useAuth = defineStore('authen', {
  state: () => ({
    user: {
      username: '',
      fullname: '',
      isActive: false,
      email: '',
      factoryId: 0,
      factoryName: '',
    } as User,
    isAuthen: false as boolean,
  }),
  actions: {
    checkAuth() {
      me().then((res) => {
        console.log(res)
      })
    },
  },
})
