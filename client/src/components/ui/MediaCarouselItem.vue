<template>
  <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
    <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" :style="imageStyle(item.image)">
      <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
        {{ item.type }}
      </div>
      <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
        {{ item.rating }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Importación dinámica de imágenes
const importImage = (imageName: string) => {
  return new URL(`../../assets/imagenes/${imageName}`, import.meta.url).href
}

const imageStyle = (imageName: string) => {
  return {
    backgroundImage: `url('${importImage(imageName)}')`
  }
}

defineProps<{
  item: {
    id: number
    image: string
    rating: string
    type: string
  }
}>()
</script>