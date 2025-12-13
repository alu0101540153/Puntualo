<template>
  <section class="mb-16">
    <!-- Header removed by request: title and see-more button omitted -->

    <!-- Grid de Recomendaciones -->
    <div :class="gridClass">
      <div v-if="!recommendations || recommendations.length === 0" class="col-span-full text-gray-300">
        No recommendations yet
      </div>
      <RecommendationCard 
        v-else
        v-for="recommendation in recommendations"
        :key="recommendation._id || recommendation.id"
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