<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300">
    <AppHeader />
    <HeroSection />
    <CTASection />
    <MediaCarousel />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import CTASection from '@/components/home/CTASection.vue'
import MediaCarousel from '@/components/ui/MediaCarousel.vue'
</script>