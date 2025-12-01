<template>
  <footer class="mt-12 bg-white text-black relative z-50" style="background-color: #f7fafc; color: #000;">
    <div class="max-w-7xl mx-auto px-8 py-8 flex flex-col items-center gap-3">
      <img src="/icon_logo.svg" alt="Puntúalo" class="w-14 h-14 rounded-full object-cover" />
      <div class="text-sm text-black">© <span>{{ year }}</span></div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = 2025
</script>

<style scoped>
/* Footer simplificado: solo logo + año */
</style>
