<template>
  <header class="bg-black bg-opacity-30 backdrop-blur-md py-4 px-4 md:px-12 flex justify-end gap-4 shadow-xl rounded-lg border border-white/10">
    <RouterLink to="/login" class="btn-login px-6 py-2 border-2 border-white rounded-full text-white font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:text-gray-700 hover:-translate-y-1">
      Login
    </RouterLink>
    <RouterLink to="/register" class="btn-signin px-6 py-2 bg-white text-gray-700 rounded-full font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-gray-600 hover:text-white hover:-translate-y-1">
      SignIn
    </RouterLink>
  </header>
</template>

<script setup lang="ts">
// Aquí puedes añadir lógica específica del header si es necesario
</script>