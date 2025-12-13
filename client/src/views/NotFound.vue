<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
    <div class="max-w-xl w-full text-center">
      <div class="flex justify-center mb-6">
        <img src="/Logo_white.svg" alt="Logo" class="logo-animation h-40" />
      </div>

      <h1 class="text-8xl md:text-9xl font-bold mb-4">404</h1>
      <p class="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 text-white">Página no encontrada. Parece que te has perdido.</p>

      <router-link to="/" class="inline-block px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110 shadow-glow hover:shadow-glow-lg transition-all duration-300 text-base sm:text-lg">
        Volver al Inicio
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
