<template>
  <teleport to="body">
    <div
      v-if="user.isAuthen == false"
      class="login-overlay bg-gradient-to-b from-white to-yellow-200"
    >
      <div class="login-modal-container" @click.self="close">
        <div class="login-modal-content">
          <!-- เนื้อหา Login Form -->
          <div class="h-screen flex flex-col justify-center items-center">
            <div class="card lg:card-side bg-base-100 shadow-sm">
              <figure class="w-130 h-full p-12">
                <div class="h-full w-full relative">
                  <img src="/image/undraw_scrum-board_uqku.svg" alt="Album" />
                </div>
              </figure>
              <div class="card-body w-96">
                <button
                  class="w-full p-2 rounded-2xl bg-gradient-to-r from-yellow-100 to-base-200 shadow-md transition-all duration-500 ease-in-out custom-hover"
                >
                  <span class="text-3xl font-bold">AI Planning</span>
                </button>
                <form class="flex flex-col gap-2 w-full" @submit.prevent="submit">
                  <div class="flex flex-col gap-1 w-full">
                    <label for="username">Username</label>
                    <input
                      id="username"
                      v-model="username"
                      type="text"
                      placeholder="Username"
                      class="input input-bordered w-full max-w-xs"
                    />
                  </div>
                  <div class="flex flex-col gap-1 w-full">
                    <label for="password">Password</label>
                    <input
                      id="password"
                      v-model="password"
                      type="password"
                      placeholder="Password"
                      class="input input-bordered w-full max-w-xs"
                    />
                  </div>
                  <fieldset
                    class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4"
                  >
                    <legend class="fieldset-legend">Login options</legend>
                    <label class="label">
                      <input type="checkbox" v-model="remember" class="checkbox" />
                      Remember me
                    </label>
                  </fieldset>
                  <button type="submit" class="btn btn-primary mt-4">Login</button>
                </form>
              </div>
            </div>
          </div>
          <!-- /เนื้อหา Login Form -->
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { login } from '@/lib/api/auth'
import { useAuth } from '@/stores/userStore'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'loginSuccess'])

const username = ref('')
const password = ref('')
const remember = ref(true)
const user = useAuth()

onMounted(() => {
  console.log(props.modelValue)
})

const close = () => {
  emit('update:modelValue', false)
}

const submit = async () => {
  const res = await login({
    username: username.value,
    password: password.value,
    remember: remember.value,
  })
  console.log(res)
  if (res.status == 200) {
    user.isAuthen = true
  } else {
    user.isAuthen = false
  }
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  /* background: rgb(0, 0, 0); */
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-modal-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-modal-content {
  background: transparent;
  border-radius: 12px;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); */
  position: relative;
}
.custom-hover {
  background: linear-gradient(-45deg, #fb9475, #f25f98, #23a6d5, #23d5ab);
  animation: hoverEffect 8s ease-in-out infinite;
  background-size: 400% 400%;
}
@keyframes hoverEffect {
  0% {
    background-position: 10% 0%;
  }
  50% {
    background-position: 91% 100%;
  }
  100% {
    background-position: 10% 0%;
  }
}
</style>
