<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300">
    <AppHeader />
    <HeroSection />
    <CTASection />
      <FeaturedHome />
      <AboutUs />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import CTASection from '@/components/home/CTASection.vue'
    import FeaturedHome from '@/components/home/FeaturedHome.vue'
import AboutUs from '@/components/home/AboutUs.vue'
</script>