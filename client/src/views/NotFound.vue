<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
    <div class="max-w-xl w-full text-center">
      <div class="flex justify-center mb-6">
        <img src="/Logo_white.svg" alt="Logo" class="logo-animation h-40" />
      </div>

      <h1 class="text-8xl md:text-9xl font-bold mb-4">404</h1>
      <p class="text-2xl md:text-3xl mb-8 text-white">Página no encontrada. Parece que te has perdido.</p>

      <router-link to="/" class="inline-block px-6 py-3 rounded-md font-medium bg-green-500 text-black hover:brightness-90 transition text-lg">
        Volver al inicio
      </router-link>
    </div>
  </div>
</template>

<script setup>
// vacío: no necesitamos lógica adicional
</script>

<style scoped>
.logo-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0) rotate(-2deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  50% { transform: translateY(0) rotate(-1deg); }
  75% { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(0) rotate(-2deg); }
}
</style>
