<template>
  <div class="flex flex-col">
    <Header />
    <ChartContent />
  </div>
</template>

<script setup lang="ts">
import ChartContent from '@/components/ChartContent.vue'
import Header from '@/components/Header.vue'
import Loading from '@/components/LoadingComponent.vue'
import { me } from '@/lib/api/auth'
import { useLoadingStore } from '@/stores/LoadingStore'
import { useAuth } from '@/stores/userStore'
import { onMounted } from 'vue'
const { isLoading } = useLoadingStore()
const user = useAuth()

onMounted(async () => {
  console.log('check')
  const res = await me()
  console.log(res)
  if (res == null) {
    user.isAuthen = false
    return
  }
  if (res.status && res.status == 200) {
    user.isAuthen = true
  } else {
    user.isAuthen = false
  }
})
</script>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: #0cdcf7;
  border-radius: 5px;
}
</style>
