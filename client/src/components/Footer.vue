<template>
  <footer class="mt-12 bg-black/80 backdrop-blur-sm text-white relative z-50 border-t border-primary-500/20">
    <div class="max-w-7xl mx-auto px-8 py-8 flex flex-col items-center gap-3">
      <img src="/icon_logo.svg" alt="Puntúalo" class="w-14 h-14 rounded-full object-cover" />
      <div class="text-sm text-white">© <span>{{ year }}</span></div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = 2025
</script>

<style scoped>
/* Footer simplificado: solo logo + año */
</style>
