<template>
  <section class="max-w-6xl mx-auto py-16 md:py-20 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
    <div class="flex-1 text-white">
      <h1 class="logo text-5xl md:text-7xl font-black mb-6 drop-shadow-lg">
        Puntúalo<span class="text-2xl md:text-4xl font-normal opacity-90">.com</span>
      </h1>
      <p class="tagline text-2xl md:text-4xl font-semibold leading-tight mb-10 drop-shadow-md">
        Puntúa libros, películas y series, y comparte con tus amigos
      </p>
    </div>
    <div class="flex-1 flex justify-center items-center">
      <img
        src="/inicio_imagen.svg"
        alt="Imagen de inicio"
        class="w-64 md:w-80 h-auto svg-shadow"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// Lógica específica del hero si es necesaria
</script>

<style scoped>
.svg-shadow {
  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.35));
}
</style>