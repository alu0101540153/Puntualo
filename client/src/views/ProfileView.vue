<template>
  <div class="min-h-screen px-4">
    <!-- Mantener la cabecera alineada con el tope de la página -->
    <DashboardHeader />

    <div class="max-w-7xl mx-auto py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mt-6">
            <ProfileSidebar class="md:col-span-1" />

            <div class="md:col-span-3 space-y-6">
              <CurrentlyWatching />

              <!-- Mis vistos: usar contenedor más ligero y que ocupe todo el ancho disponible -->
              <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white">Mis vistos</h3>
                    <button class="bg-white/10 text-white px-3 py-1 rounded-full">Editar mi lista</button>
                  </div>

                  <SeenCarousel />
                </div>
              </div>
            </div>
          </div>
    </div>
  </div>
</template>

<script setup lang="ts">
    import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
    import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
    import CurrentlyWatching from '@/components/profile/CurrentlyWatching.vue'
    import SeenCarousel from '@/components/profile/SeenCarousel.vue'
</script>

<style scoped>
/* pequeños ajustes puntuales si son necesarios */
</style>
