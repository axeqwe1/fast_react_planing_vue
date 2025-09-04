<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import MainView from './view/MainView.vue'
import { RouterView } from 'vue-router'
import LoginView from './view/LoginView.vue'
import { useAuth } from './stores/userStore'
import { me } from './lib/api/auth'
const user = useAuth()
const isLogin = ref<boolean>(false)
const showLogin = ref(true) // หรือใช้ state จาก store

watch(
  () => user.isAuthen,
  () => {
    isLogin.value = user.isAuthen
  },
  { immediate: true },
)
onMounted(async () => {
  const res = await me()
  console.log(res)
  if (res == null) {
    user.isAuthen = false
  }
  if (res && res.status == 200) {
    user.isAuthen = true
    user.user = res.data.user
  } else {
    user.isAuthen = false
  }
})
</script>

<template>
  <div class="app-container">
    <main>
      <LoginView v-model="isLogin" v-if="isLogin == false" />
      <MainView />
    </main>
  </div>
</template>

<style scoped></style>
