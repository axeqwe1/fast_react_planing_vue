import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: true,
  }),
  actions: {
    setLoading(loading: boolean) {
      // console.log(`Loading state changed: ${loading}`)

      this.isLoading = loading
      // console.log(this.isLoading)
    },
  },
})
