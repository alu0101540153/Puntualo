// Tipos para las recomendaciones
export interface Recommendation {
  id: number
  title: string
  description: string
  image: string
  mediaType: '📖' | '🎬' | '📺'
  genres: string[]
  ageRating: string
}

// Tipos para actividades de amigos
export interface FriendActivity {
  id: number
  friendName: string
  friendInitial: string
  friendColor: string
  action: string
  content: string
  contentImage: string
  contentMediaType: '📖' | '🎬' | '📺'
  time: string
  comment?: string
  rating?: string
  ratingColor?: string
  mood?: boolean
  genres: string[]
}