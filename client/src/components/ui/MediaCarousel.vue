<template>
  <section class="max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-8">
    <h2 class="featured-title text-white text-2xl md:text-4xl font-bold mb-10 text-center drop-shadow-md">
      Contenido destacado que puedes Puntuar
    </h2>
    <div class="carousel-container relative">
      <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 shadow-lg z-10" @click="scrollCarousel(-1)">
        ‹
      </button>
      <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-5 scrollbar-hide" id="carousel" ref="carousel">
        <MediaCarouselItem 
          v-for="item in mediaItems" 
          :key="item.id"
          :item="item"
        />
      </div>
      <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 shadow-lg z-10" @click="scrollCarousel(1)">
        ›
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MediaCarouselItem from './MediaCarouselItem.vue'

// Datos de ejemplo - en un proyecto real esto vendría de una API
// En tu MediaCarousel.vue, cambia las rutas:
const mediaItems = [
  { id: 1, image: 'imagenn1.webp', rating: '10/10', type: '📺' },
  { id: 2, image: 'imagen2.jpg.webp', rating: '9/10', type: '📺' },
  { id: 3, image: 'imagen3.jpg', rating: '8/10', type: '📺' },
  { id: 4, image: 'imagen4.jpg', rating: '9/10', type: '📺' },
  { id: 5, image: 'imagen5.jpg', rating: '7/10', type: '📺' },
  { id: 6, image: 'imagen6.jpg', rating: '9.5/10', type: '📚' },
  { id: 7, image: 'imagen7.jpg', rating: '7/10', type: '📚' }
]

const carousel = ref<HTMLElement>()
let autoScrollInterval: number

function scrollCarousel(direction: number) {
  if (carousel.value) {
    const scrollAmount = 250
    carousel.value.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    })
  }
}

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    if (carousel.value) {
      if (carousel.value.scrollLeft >= carousel.value.scrollWidth - carousel.value.clientWidth) {
        carousel.value.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollCarousel(1)
      }
    }
  }, 3000)
}

function pauseAutoScroll() {
  clearInterval(autoScrollInterval)
}

function resumeAutoScroll() {
  startAutoScroll()
}

onMounted(() => {
  startAutoScroll()
  
  if (carousel.value) {
    carousel.value.addEventListener('mouseenter', pauseAutoScroll)
    carousel.value.addEventListener('mouseleave', resumeAutoScroll)
  }
})

onUnmounted(() => {
  clearInterval(autoScrollInterval)
  if (carousel.value) {
    carousel.value.removeEventListener('mouseenter', pauseAutoScroll)
    carousel.value.removeEventListener('mouseleave', resumeAutoScroll)
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* ensure arrows are visible and remove any bottom track */
.carousel-btn { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.08) }
.carousel-btn:hover { background: rgba(255,255,255,0.95); color: #111827 }
.carousel-container::after, .carousel::after, .carousel::before, .carousel-track, .carousel-progress, .carousel-bar, .carousel .track { display: none !important }
</style>