<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-3xl font-bold text-white">{{ title }}</h2>
      <button 
        class="bg-gray-800 bg-opacity-30 hover:bg-opacity-30 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
        @click="$emit('seeMore')"
      >
        {{ buttonText }}
      </button>
    </div>

    <!-- Grid de Recomendaciones -->
    <div :class="gridClass">
      <RecommendationCard 
        v-for="recommendation in recommendations"
        :key="recommendation.id"
        :recommendation="recommendation"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Recommendation } from './types'
import RecommendationCard from './RecommendationCard.vue'

interface Props {
  title?: string
  buttonText?: string
  recommendations: Recommendation[]
  gridClass?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Te podría interesar ...',
  buttonText: 'Ver mas recomendaciones',
  gridClass: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
})

defineEmits<{
  seeMore: []
}>()
</script>