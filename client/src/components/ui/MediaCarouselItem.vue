<template>
  <div
    class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105"
    role="button"
    tabindex="0"
    @click="$emit('select', item)"
    @keyup.enter="$emit('select', item)"
    :aria-label="`Abrir detalles de ${item.title || 'ítem'}`"
  >
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
// Importación dinámica de imágenes y soporte para URLs absolutas
const importImage = (imageName: string) => {
  return new URL(`../../assets/imagenes/${imageName}`, import.meta.url).href
}

const imageStyle = (imageName: string) => {
  if (!imageName) return { backgroundImage: "url('/img/placeholder-book.png')" }
  // if it's an absolute url or starts with / use it directly
  if (typeof imageName === 'string' && (imageName.startsWith('http') || imageName.startsWith('/') || imageName.includes('://'))) {
    return { backgroundImage: `url('${imageName}')` }
  }
  try {
    return { backgroundImage: `url('${importImage(imageName)}')` }
  } catch (e) {
    // fallback to direct usage
    return { backgroundImage: `url('${imageName}')` }
  }
}

defineProps<{
  item: {
    id: number | string
    image: string
    rating: string
    type: string
    title?: string
    detailId?: string | number
  }
}>()

// declare emits for TypeScript
defineEmits<{
  (e: 'select', payload: any): void
}>()
</script>