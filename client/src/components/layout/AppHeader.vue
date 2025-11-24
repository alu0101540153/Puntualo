<template>
  <header class="bg-black bg-opacity-30 backdrop-blur-md py-4 px-4 md:px-12 flex justify-end gap-4 shadow-xl rounded-lg border border-white/10">
    <RouterLink to="/login" class="btn-login px-8 py-3 border-2 border-white rounded-full text-white font-extrabold text-lg uppercase tracking-wider transition-transform duration-200 hover:bg-white hover:text-gray-800 hover:-translate-y-1 shadow-md">
      Iniciar sesión
    </RouterLink>
    <RouterLink to="/register" class="btn-signin px-8 py-3 bg-emerald-400 text-black rounded-full font-extrabold text-lg uppercase tracking-wider transition-transform duration-200 hover:bg-emerald-500 hover:text-white hover:-translate-y-1 shadow-md">
      Registrarse
    </RouterLink>
  </header>
</template>

<script setup lang="ts">
// Aquí puedes añadir lógica específica del header si es necesario
</script>