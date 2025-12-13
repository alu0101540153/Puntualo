<template>
  <div class="w-full bg-gradient-to-r from-black via-dark-900 to-black border-b border-primary-500/20 overflow-hidden relative h-32 sm:h-40 md:h-48 lg:h-64 flex items-center justify-center shadow-cinema">
    <!-- Decorative Background Elements (Film Strip) - Hidden on very small screens -->
    <div class="absolute top-0 left-0 h-full w-16 sm:w-20 md:w-24 lg:w-32 bg-gradient-to-b from-dark-800 to-black hidden xs:flex flex-col justify-between py-2 z-0 -skew-x-12 -ml-6 sm:-ml-8 md:-ml-10 border-r-2 md:border-r-4 border-primary-500/60 opacity-90 md:opacity-100 shadow-glow">
      <div v-for="i in 8" :key="i" class="h-2 sm:h-3 md:h-4 w-10 sm:w-12 md:w-16 bg-gradient-to-r from-gray-200 to-white mx-auto rounded-sm opacity-90 shadow-sm"></div>
    </div>
    
    <!-- Main Title -->
    <div class="z-10 text-center px-4 sm:px-6 md:px-8">
      <h1 
        class="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-wide sm:tracking-wider md:tracking-widest transition-all duration-500 select-none cursor-default outline-text"
        :class="isHovered ? 'text-white scale-105' : 'text-transparent'"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        PUNTÚALO
      </h1>
      <p class="text-gray-400 text-[0.5rem] xs:text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] mt-1 sm:mt-2 uppercase font-medium">
        Series • Películas • Libros
      </p>
    </div>

    <!-- Decorative Icons (Right side) - Visible on screens sm and up -->
    <div class="absolute right-0 top-0 h-full w-1/3 md:w-1/4 lg:w-1/3 opacity-15 sm:opacity-18 md:opacity-20 pointer-events-none hidden sm:block">
      <!-- Film Icon -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="absolute top-2 sm:top-3 md:top-2 lg:top-4 right-2 sm:right-3 md:right-4 lg:right-10 text-white w-8 h-8 sm:w-9 md:w-10 lg:w-14 xl:w-16 sm:h-9 md:h-10 lg:h-14 xl:h-16 transform rotate-12" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 3v18" />
        <path d="M3 7.5h4" />
        <path d="M3 12h18" />
        <path d="M3 16.5h4" />
        <path d="M17 3v18" />
        <path d="M17 7.5h4" />
        <path d="M17 16.5h4" />
      </svg>
      
      <!-- Book Icon -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="absolute bottom-4 sm:bottom-5 md:bottom-6 lg:bottom-10 right-12 sm:right-14 md:right-20 lg:right-32 xl:right-36 text-white w-10 h-10 sm:w-11 md:w-12 lg:w-16 xl:w-20 sm:h-11 md:h-12 lg:h-16 xl:h-20 transform -rotate-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      
      <!-- Camera Icon -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="absolute top-1/2 -translate-y-1/2 right-1 sm:right-2 lg:right-4 text-white w-7 h-7 sm:w-8 md:w-8 lg:w-10 xl:w-12 sm:h-8 md:h-8 lg:h-10 xl:h-12 transform -rotate-12" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
      
      <!-- Popcorn Icon -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="absolute bottom-1 sm:bottom-2 lg:bottom-4 right-1 sm:right-2 lg:right-4 text-white w-8 h-8 sm:w-9 md:w-10 lg:w-12 xl:w-14 sm:h-9 md:h-10 lg:h-12 xl:h-14" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4" />
        <path d="M10 22 9 8" />
        <path d="m14 22 1-14" />
        <path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z" />
      </svg>

      <!-- Video/Play Icon - Visible from md and up -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="absolute top-10 md:top-12 lg:top-14 xl:top-20 right-20 md:right-24 lg:right-32 xl:right-48 text-white w-8 h-8 md:w-9 lg:w-10 xl:w-12 md:h-9 lg:h-10 xl:h-12 transform rotate-6 hidden md:block" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-7.1 3.78c-.57.3-1.23.3-1.8 0L6 7" />
        <path d="M2 8v11c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V8" />
      </svg>
    </div>
    
    <!-- Mobile background gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0 lg:hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isHovered = ref(false);
</script>

<style scoped>
/* Outline text effect - responsive stroke width with green glow */
.outline-text {
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.9);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 900;
  letter-spacing: 0.15em;
  filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.4));
}

.outline-text:hover {
  filter: drop-shadow(0 0 40px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 60px rgba(34, 197, 94, 0.4));
}

@media (min-width: 640px) {
  .outline-text {
    -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.95);
    letter-spacing: 0.2em;
  }
}

@media (min-width: 768px) {
  .outline-text {
    -webkit-text-stroke: 2px white;
    letter-spacing: 0.3em;
  }
}
</style>
