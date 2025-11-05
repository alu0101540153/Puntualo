<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300">
    <!-- Header -->
    <header class="bg-black bg-opacity-30 backdrop-blur-md py-4 px-4 md:px-12 flex justify-end gap-4 shadow-xl">
      <button class="btn-login px-6 py-2 border-2 border-white rounded-full text-white font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:text-gray-700 hover:-translate-y-1">
        Login
      </button>
      <button class="btn-signin px-6 py-2 bg-white text-gray-700 rounded-full font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-gray-600 hover:text-white hover:-translate-y-1">
        SignIn
      </button>
    </header>

    <!-- Hero Section -->
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
        <img src="/imagenes/puntualo.jpeg" alt="Puntúa películas, series y libros" class="w-80 h-80 object-cover rounded-lg shadow-xl">
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-white bg-opacity-20 backdrop-blur-md max-w-4xl mx-auto mb-16 p-8 md:p-12 rounded-2xl text-center shadow-2xl">
      <h2 class="cta-title text-white text-2xl md:text-4xl font-bold mb-8 drop-shadow-md">
        mira que ven o leen tus amigos
      </h2>
      <button class="btn-register bg-white text-gray-700 px-10 py-4 rounded-full text-xl font-bold shadow-lg transition-all duration-300 hover:bg-gray-600 hover:text-white hover:-translate-y-1 hover:shadow-xl">
        Regístrate hoy mismo
      </button>
    </section>

    <!-- Featured Content -->
    <section class="max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-8">
      <h2 class="featured-title text-white text-2xl md:text-4xl font-bold mb-10 text-center drop-shadow-md">
        Contenido destacado que puedes Puntuar
      </h2>
      <div class="carousel-container relative">
        <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollCarousel(-1)">
          ‹
        </button>
        <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-5 scrollbar-hide" id="carousel" ref="carousel">
          <!-- Item 1 con imagen -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagenn1.webp');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📺
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                10/10
              </div>
            </div>
          </div>
          
          <!-- Item 2 con imagen -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagen2.jpg.webp');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📺
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                9/10
              </div>
            </div>
          </div>
          
          <!-- Item 3 con imagen -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagen3.jpg');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📺
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                8/10
              </div>
            </div>
          </div>
          
          <!-- Item 4 con imagen -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagen4.jpg');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📺
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                9/10
              </div>
            </div>
          </div>

          <!-- Item 5 con imagen -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagen5.jpg');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📺
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                7/10
              </div>
            </div>
          </div>
          
          <!-- Item 6 con imagen -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagen7.jpg');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📚
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                9.5/10
              </div>
            </div>
          </div>
          
          <!-- Item 7 con imagen (libro) -->
          <div class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105">
            <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" style="background-image: url('/imagenes/imagen6.jpg');">
              <div class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
                📚
              </div>
              <div class="item-rating absolute bottom-3 right-3 bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">
                7/10
              </div>
            </div>
          </div>
        </div>
        
        <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollCarousel(1)">
          ›
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
</style>
