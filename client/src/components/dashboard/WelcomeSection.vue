<template>
  <section class="mb-12 text-center">
    <h1 class="text-4xl font-bold text-white mb-4">{{ title }}</h1>
    <p class="text-gray-200 text-xl">{{ subtitle }}</p>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Inicio',
  subtitle: 'Bienvenido a Puntúalo.com'
})
</script>