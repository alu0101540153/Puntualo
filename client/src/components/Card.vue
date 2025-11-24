<template>
  <div v-bind="$attrs" class="w-full max-w-3xl mx-auto bg-gradient-to-br from-gray-900/70 to-black/60 text-white rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm border border-white/10 box-border">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Card is purely presentational now; keep API (attrs/slot) identical
</script>

<style scoped>
.box-border { box-sizing: border-box; }
</style>