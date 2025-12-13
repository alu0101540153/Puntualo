<template>
  <div v-bind="$attrs" class="w-full max-w-[1600px] mx-auto bg-gradient-to-br from-dark-900/80 to-black/80 text-white rounded-2xl p-6 md:p-8 shadow-cinema backdrop-blur-md border border-primary-500/20 hover:border-primary-500/30 transition-all box-border">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Card is purely presentational now; keep API (attrs/slot) identical
</script>

<style scoped>
.box-border { box-sizing: border-box; }
</style>