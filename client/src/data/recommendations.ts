import alasSangre from '@/assets/imagenes/alasSangre.jpg'
import trono from '@/assets/imagenes/juegoTronos.jpg.avif'
import culpaTuya from '@/assets/imagenes/culpaTuya.jpg'
import anillos from '@/assets/imagenes/señorAnillos.jpg'
import type { Recommendation } from '@/components/dashboard/types'

export const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Alas de Sangre',
    description: 'Una épica historia de fantasía con romance, batallas y criaturas mágicas en un mundo lleno de misterio.',
    image: alasSangre,
    mediaType: '📖',
    genres: ['Fantasy', 'Romance'],
    ageRating: '+16'
  },
  {
    id: '2',
    title: 'Juego de Tronos',
    description: 'Asesina, princesa y rebelde. Una joven lucha por su libertad en una competencia mortal por el trono.',
    image: trono,
    mediaType: '📖',
    genres: ['Fantasy', 'Aventura'],
    ageRating: '+14'
  },
  {
    id: '3',
    title: 'Culpa Tuya',
    description: 'Una historia de amor intensa y prohibida que explora los límites del perdón y la redención.',
    image: culpaTuya,
    mediaType: '📖',
    genres: ['Romance', 'Drama'],
    ageRating: '+18'
  },
  {
    id: '4',
    title: 'Señor de los Anillos',
    description: 'Un legado familiar que desata pasiones, secretos y una lucha por el poder en la alta sociedad.',
    image: anillos,
    mediaType: '📖',
    genres: ['Romance', 'Suspense'],
    ageRating: '+16'
  }
]

export default recommendations
