<template>
  <div class="relative">
    <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollCarousel(-1)">
      ‹
    </button>

    <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-3 scrollbar-hide" id="carousel" ref="carousel">
      <MediaCarouselItem
        v-for="item in items"
        :key="item.id"
        :item="item"
      />
    </div>

    <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollCarousel(1)">
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaCarouselItem from '@/components/ui/MediaCarouselItem.vue'

// mock items - replace with API data when ready
const items = [
  { id: 1, image: 'juegoTronos.jpg.avif', rating: '10/10', type: '📺' },
  { id: 2, image: 'juegoTronos.jpg.avif', rating: '3/10', type: '📺' },
  { id: 3, image: 'juegoTronos.jpg.avif', rating: '8/10', type: '📺' },
  { id: 4, image: 'juegoTronos.jpg.avif', rating: '9/10', type: '📺' },
  { id: 5, image: 'juegoTronos.jpg.avif', rating: '7/10', type: '📺' },
  { id: 6, image: 'juegoTronos.jpg.avif', rating: '7/10', type: '📺' },
  { id: 7, image: 'juegoTronos.jpg.avif', rating: '6/10', type: '📺' },
  { id: 8, image: 'juegoTronos.jpg.avif', rating: '8/10', type: '📺' }
]

const carousel = ref<HTMLElement | null>(null)

function scrollCarousel(direction: number) {
  if (carousel.value) {
    const scrollAmount = 240 // matches MediaCarousel item width
    carousel.value.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
