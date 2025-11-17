<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader />
    
    <main class="max-w-6xl mx-auto px-4 py-8">
      <WelcomeSection />
      
      <RecommendationsGrid 
        :recommendations="recommendations"
        @see-more="handleSeeMoreRecommendations"
      />
      
      <FriendsGrid 
        :activities="friendActivities"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import WelcomeSection from '@/components/dashboard/WelcomeSection.vue'
import RecommendationsGrid from '@/components/dashboard/RecommendationsGrid.vue'
import FriendsGrid from '@/components/dashboard/FriendsGrid.vue'

// Types
import type { Recommendation, FriendActivity } from '../components/dashboard/types'

// Images
import alasSangre from '@/assets/imagenes/alasSangre.jpg'
import trono from '@/assets/imagenes/juegoTronos.jpg.avif'
import culpaTuya from '@/assets/imagenes/culpaTuya.jpg'
import anillos from '@/assets/imagenes/señorAnillos.jpg'
import breakingBad from '@/assets/imagenes/brekingbad.jpeg'
import fastFurious from '@/assets/imagenes/fastfurios.jpg'
import stragerThings from '@/assets/imagenes/imagen2.jpg.webp'

// Datos de recomendaciones
const recommendations: Recommendation[] = [
  {
    id: 1,
    title: 'Alas de Sangre',
    description: 'Una épica historia de fantasía con romance, batallas y criaturas mágicas en un mundo lleno de misterio.',
    image: alasSangre,
    mediaType: '📖',
    genres: ['Fantasy', 'Romance'],
    ageRating: '+16'
  },
  {
    id: 2,
    title: 'Juego de Tronos',
    description: 'Asesina, princesa y rebelde. Una joven lucha por su libertad en una competencia mortal por el trono.',
    image: trono,
    mediaType: '📖',
    genres: ['Fantasy', 'Aventura'],
    ageRating: '+14'
  },
  {
    id: 3,
    title: 'Culpa Tuya',
    description: 'Una historia de amor intensa y prohibida que explora los límites del perdón y la redención.',
    image: culpaTuya,
    mediaType: '📖',
    genres: ['Romance', 'Drama'],
    ageRating: '+18'
  },
  {
    id: 4,
    title: 'Señor de los Anillos',
    description: 'Un legado familiar que desata pasiones, secretos y una lucha por el poder en la alta sociedad.',
    image: anillos,
    mediaType: '📖',
    genres: ['Romance', 'Suspense'],
    ageRating: '+16'
  }
]

// Datos de actividades de amigos
const friendActivities: FriendActivity[] = [
  {
    id: 1,
    friendName: 'Paula',
    friendInitial: 'P',
    friendColor: 'bg-pink-500',
    action: 'ha empezado a ver',
    content: 'Breaking Bad',
    contentImage: breakingBad,
    contentMediaType: '📺',
    time: 'Hace 2h',
    comment: 'Por ahora me esta gustando mucho.',
    genres: ['Drama', 'Crimen', '+18']
  },
  {
    id: 2,
    friendName: 'Saray',
    friendInitial: 'S',
    friendColor: 'bg-purple-500',
    action: 'ha puntuado',
    content: 'Culpa Tuya',
    contentImage: culpaTuya,
    contentMediaType: '📖',
    time: 'Hace 1h',
    rating: '9/10',
    ratingColor: 'bg-green-500',
    genres: ['Romance', 'Drama', '+18']
  },
  {
    id: 3,
    friendName: 'Ayoze',
    friendInitial: 'A',
    friendColor: 'bg-amber-500',
    action: 'esta viendo',
    content: 'Fast and Furious',
    contentImage: fastFurious,
    contentMediaType: '🎬',
    time: 'Ahora',
    comment: 'Quiero ser Toretto 🏎️',
    genres: ['Acción', 'Aventura', '+13']
  },
  {
    id: 4,
    friendName: 'Alex',
    friendInitial: 'A',
    friendColor: 'bg-gray-500',
    action: 'ha terminado de ver',
    content: 'Stranger Things',
    contentImage: stragerThings,
    contentMediaType: '🎬',
    time: 'Hace 30m',
    comment: 'No me esperaba para nada ese final...',
    genres: ['Drama', 'Fantasía', '+16']
  },
  {
    id: 5,
    friendName: 'Abian',
    friendInitial: 'A',
    friendColor: 'bg-teal-500',
    action: 'ha puntuado',
    content: 'Alas de Sangre',
    contentImage: alasSangre,
    contentMediaType: '📖',
    time: 'Hace 3h',
    rating: '6/10',
    ratingColor: 'bg-orange-500',
    genres: ['Fantasy', 'Romance', '+16']
  },
    {
    id: 1,
    friendName: 'Paula',
    friendInitial: 'P',
    friendColor: 'bg-pink-500',
    action: 'ha empezado a ver',
    content: 'Breaking Bad',
    contentImage: breakingBad,
    contentMediaType: '📺',
    time: 'Hace 2h',
    comment: 'Por ahora me esta gustando mucho.',
    genres: ['Drama', 'Crimen', '+18']
  },
  {
    id: 2,
    friendName: 'Saray',
    friendInitial: 'S',
    friendColor: 'bg-purple-500',
    action: 'ha puntuado',
    content: 'Culpa Tuya',
    contentImage: culpaTuya,
    contentMediaType: '📖',
    time: 'Hace 1h',
    rating: '9/10',
    ratingColor: 'bg-green-500',
    genres: ['Romance', 'Drama', '+18']
  },
  {
    id: 3,
    friendName: 'Ayoze',
    friendInitial: 'A',
    friendColor: 'bg-amber-500',
    action: 'esta viendo',
    content: 'Fast and Furious',
    contentImage: fastFurious,
    contentMediaType: '🎬',
    time: 'Ahora',
    comment: 'Quiero ser Toretto 🏎️',
    genres: ['Acción', 'Aventura', '+13']
  },
  {
    id: 4,
    friendName: 'Alex',
    friendInitial: 'A',
    friendColor: 'bg-gray-500',
    action: 'ha terminado de ver',
    content: 'Stranger Things',
    contentImage: stragerThings,
    contentMediaType: '🎬',
    time: 'Hace 30m',
    comment: 'No me esperaba para nada ese final...',
    genres: ['Drama', 'Fantasía', '+16']
  },
  {
    id: 5,
    friendName: 'Abian',
    friendInitial: 'A',
    friendColor: 'bg-teal-500',
    action: 'ha puntuado',
    content: 'Alas de Sangre',
    contentImage: alasSangre,
    contentMediaType: '📖',
    time: 'Hace 3h',
    rating: '6/10',
    ratingColor: 'bg-orange-500',
    genres: ['Fantasy', 'Romance', '+16']
  }
]

// Handlers
const handleSeeMoreRecommendations = () => {
  console.log('Ver más recomendaciones clickeado')
  // Aquí puedes navegar a otra página o cargar más recomendaciones
}
</script>