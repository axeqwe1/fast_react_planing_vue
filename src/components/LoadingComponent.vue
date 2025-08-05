<script setup lang="ts">
import { motion } from 'motion-v'
</script>

<template>
  <motion.div
    class="spinner"
    :animate="{ rotate: 360 }"
    :transition="{
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    }"
  />
</template>

<style>
.spinner {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 7px solid;
  border-top-color: #072cff;
  will-change: transform;
  position: absolute;
}
</style>
