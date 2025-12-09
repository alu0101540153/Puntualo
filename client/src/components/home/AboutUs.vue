<template>
  <section id="about-us" class="bg-white bg-opacity-20 backdrop-blur-md max-w-6xl mx-auto mb-16 p-8 md:p-12 rounded-2xl shadow-2xl">
    <div class="mx-auto">
      <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-md text-center">Sobre nosotros</h2>
      <p class="text-white mb-8 text-center drop-shadow-sm">Puntualo nace como un proyecto universitario.</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div class="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-md">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-inner">
            <img src="/victor.png" alt="Víctor Rodríguez Dorta" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-semibold text-gray-900">Víctor Rodríguez Dorta</h3>
          <a href="https://github.com/alu0101540153" target="_blank" rel="noopener" class="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800">GitHub</a>
        </div>

        <div class="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-md">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-inner">
            <img src="/saray.png" alt="Saray García Campos" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-semibold text-gray-900">Saray García Campos</h3>
          <a href="https://github.com/alu0101544724" target="_blank" rel="noopener" class="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800">GitHub</a>
        </div>

        <div class="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-md">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-inner">
            <img src="/adrian.png" alt="Adrián León Díaz" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-semibold text-gray-900">Adrián León Díaz</h3>
          <a href="https://github.com/Adrian-LD" target="_blank" rel="noopener" class="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800">GitHub</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Componente estático: imágenes referenciadas desde la carpeta public
</script>

<style scoped>
/* Pequeños ajustes si son necesarios */
</style>
