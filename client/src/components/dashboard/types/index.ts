// Tipos para las recomendaciones
export interface Recommendation {
  id: string
  title: string
  description: string
  image: string
  mediaType: '📖' | '🎬' | '📺'
  genres: string[]
  ageRating: string
  // Optional fields for search-origin items
  externalId?: string
  originType?: 'books' | 'movies' | 'series'
}

// Tipos para actividades de amigos
export interface FriendActivity {
  id: number
  friendName: string
  friendInitial: string
  friendColor: string
  friendId?: string
  action: string
  content: string
  contentId?: string
  contentImage: string
  contentMediaType: '📖' | '🎬' | '📺'
  time: string
  comment?: string
  rating?: string
  ratingColor?: string
  mood?: boolean
  genres: string[]
}