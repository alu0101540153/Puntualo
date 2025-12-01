<template>
  <section id="about-us" class="bg-white/80 mt-12 py-16">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Sobre nosotros</h2>
      <p class="text-gray-700 mb-8">Puntualo nace como un proyecto universitario, una idea original creada por Víctor Rodríguez Dorta, Saray García Campos y Adrián León Díaz. Nuestra aplicación ayuda a los usuarios a puntuar, descubrir y compartir opiniones sobre películas y series de forma ágil y colaborativa. Este proyecto combina aprendizaje, diseño y tecnologías modernas para ofrecer una experiencia cuidada y accesible.</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div class="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-md">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-inner">
            <img src="/victor.png" alt="Víctor Rodríguez Dorta" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-semibold text-gray-900">Víctor Rodríguez Dorta</h3>
          <a href="https://github.com/victor-rodriguez" target="_blank" rel="noopener" class="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800">GitHub</a>
        </div>

        <div class="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-md">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-inner">
            <img src="/saray.png" alt="Saray García Campos" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-semibold text-gray-900">Saray García Campos</h3>
          <a href="https://github.com/saray-garcia" target="_blank" rel="noopener" class="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800">GitHub</a>
        </div>

        <div class="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-md">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-inner">
            <img src="/adrian.png" alt="Adrián León Díaz" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-semibold text-gray-900">Adrián León Díaz</h3>
          <a href="https://github.com/adrian-leon" target="_blank" rel="noopener" class="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800">GitHub</a>
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
