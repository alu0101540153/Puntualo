<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <div class="relative bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600">
          <!-- Header -->
          <div class="sticky top-0 bg-slate-700/95 backdrop-blur-sm px-6 py-4 border-b border-slate-600 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Puntúa el ítem: {{ item.title }}</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-white transition" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-8">
            <!-- Loading indicator -->
            <div v-if="isLoadingData" class="flex items-center justify-center py-8">
              <div class="text-gray-300 flex items-center gap-3">
                <svg class="animate-spin h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando datos...
              </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Image -->
              <div class="md:col-span-1">
                <img :src="item.image || '/img/placeholder-book.png'" :alt="item.title" class="w-full h-auto object-cover rounded-lg shadow-lg" />
              </div>

              <!-- Form -->
              <div class="md:col-span-2">
                <!-- Info banner if editing existing rating -->
                <div v-if="isEditingExisting" class="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-blue-200 text-sm">Editando tu puntuación existente</span>
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-300 mb-2">Tu puntuación (1-10) — opcional</label>
                  <input 
                    v-model="userScoreRaw" 
                    type="text" 
                    inputmode="decimal" 
                    placeholder="0 - 10 (dejar vacío para solo marcar como viéndolo/leyéndolo)" 
                    class="w-full p-3 rounded-lg bg-white text-gray-900 border-2 border-slate-500 focus:border-emerald-500 focus:outline-none transition" 
                  />
                  <div v-if="userScoreError" class="text-rose-400 text-sm mt-2">{{ userScoreError }}</div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm text-gray-300 mb-2">Estado</label>
                  <select v-model="userStatus" class="w-full p-3 rounded-lg bg-white text-gray-900 border-2 border-slate-500 focus:border-emerald-500 focus:outline-none transition">
                    <option value="watching">Leyendo/Viéndolo</option>
                    <option value="completed">Terminado</option>
                  </select>
                </div>

                <div class="mb-6">
                  <label class="block text-sm text-gray-300 mb-2">Reseña</label>
                  <textarea 
                    v-model="userComment" 
                    rows="5" 
                    placeholder="Esta peli es la hostia me encantan los personajes!!!"
                    class="w-full p-3 rounded-lg bg-white text-gray-900 border-2 border-slate-500 focus:border-emerald-500 focus:outline-none transition resize-none"
                  ></textarea>
                </div>

                <div class="flex justify-end gap-3">
                  <button 
                    @click="submitRating" 
                    :disabled="isSubmitting"
                    class="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {{ isSubmitting ? 'Enviando...' : 'Enviar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUser } from '@/services/auth'
import { addRating, getMyRatings } from '@/services/user'
import { getItemById, createItem } from '@/services/item'
import { success as notifySuccess, error as notifyError } from '@/services/notify'

interface RatingItem {
  id?: string
  _id?: string
  title: string
  image?: string
  itemType?: string
  description?: string
  externalId?: string
  originType?: string
  genres?: string[]
  author?: string
  pages?: string | number
  language?: string
}

interface Props {
  show: boolean
  item: RatingItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: []
}>()

const router = useRouter()

const userScoreRaw = ref<string>('')
const userScoreError = ref<string>('')
const userStatus = ref<string>('completed')
const userComment = ref<string>('')
const isSubmitting = ref(false)
const isLoadingData = ref(false)
const isEditingExisting = ref(false)

function closeModal() {
  emit('close')
}

// Load existing rating data if user has already rated this item
async function loadExistingRating() {
  const user = getUser()
  if (!user || !user._id) return

  try {
    isLoadingData.value = true
    const ratings: any = await getMyRatings(user._id)
    
    if (Array.isArray(ratings) && ratings.length > 0) {
      // Find rating for this specific item
      // Try to match by various ID fields
      const itemId = props.item._id || props.item.id || props.item.externalId
      const itemTitle = props.item.title?.toLowerCase().trim()
      
      const existingRating = ratings.find((rating: any) => {
        const ratingItemId = rating.itemId?._id || rating.itemId?.id || rating.itemId
        const ratingExternalId = rating.itemId?.externalId || rating.externalId
        const ratingTitle = rating.itemId?.title?.toLowerCase().trim()
        
        // Match by _id, id, externalId, or title
        return (
          String(ratingItemId) === String(itemId) ||
          String(ratingExternalId) === String(itemId) ||
          String(ratingExternalId) === String(props.item.externalId) ||
          (itemTitle && ratingTitle && itemTitle === ratingTitle)
        )
      })

      if (existingRating) {
        // Preload the form with existing data
        isEditingExisting.value = true
        if (existingRating.score != null && existingRating.score !== '') {
          userScoreRaw.value = String(existingRating.score).replace('.', ',')
        }
        if (existingRating.status) {
          userStatus.value = existingRating.status
        }
        if (existingRating.comment) {
          userComment.value = existingRating.comment
        }
      } else {
        isEditingExisting.value = false
      }
    }
  } catch (error) {
    console.error('Error loading existing rating:', error)
    // Don't show error to user, just start with empty form
  } finally {
    isLoadingData.value = false
  }
}

function inferGenresFromTitle(title: string) {
  if (!title) return []
  const t = title.toLowerCase()
  const genres: string[] = []
  if (t.includes('fast') || t.includes('furious') || t.includes('toretto') || t.includes('race')) {
    genres.push('Acción', 'Coches')
  }
  if (t.includes('love') || t.includes('amor') || t.includes('romance')) genres.push('Romance')
  if (t.includes('king') || t.includes('trono') || t.includes('game of')) genres.push('Fantasy')
  if (t.includes('stranger') || t.includes('things')) genres.push('Drama')
  if (t.includes('crime') || t.includes('murder') || t.includes('detective')) genres.push('Crimen')
  return Array.from(new Set(genres))
}

// Normalize itemType to match server enum: 'movie', 'series', 'book'
function normalizeItemType(itemType?: string): 'movie' | 'series' | 'book' {
  if (!itemType) return 'book'
  const lower = itemType.toLowerCase()
  if (lower === 'movies' || lower === 'movie') return 'movie'
  if (lower === 'series') return 'series'
  if (lower === 'books' || lower === 'book') return 'book'
  return 'book'
}

async function submitRating() {
  const user = getUser()
  if (!user || !user._id) {
    router.push('/login')
    return
  }

  // Validate score
  const raw = String(userScoreRaw.value || '').trim()
  let payloadScore: number | undefined = undefined
  if (raw.length > 0) {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (isNaN(parsed)) {
      userScoreError.value = 'Introduce un número válido entre 0 y 10 (puedes usar coma o punto), o deja vacío.'
      return
    }

    let normalized = Math.round(parsed * 10) / 10

    if (normalized < 0) {
      userScoreError.value = 'La nota no puede ser menor que 0.'
      return
    }
    if (normalized > 10) {
      userScoreError.value = 'La nota no puede ser mayor que 10.'
      return
    }

    userScoreError.value = ''
    payloadScore = normalized
  }

  // Ensure item exists in DB
  let dbItemId = props.item._id || props.item.id || null

  if (dbItemId) {
    try {
      const existing = await getItemById(String(dbItemId))
      if (existing && existing._id) {
        dbItemId = existing._id
      } else {
        dbItemId = null
      }
    } catch (err) {
      dbItemId = null
    }
  }

  // Create item if it doesn't exist
  if (!dbItemId) {
    try {
      // Normalize itemType to match server enum
      const normalizedItemType = normalizeItemType(props.item.itemType)
      
      const payloadCreate: any = {
        title: props.item.title || '',
        itemType: normalizedItemType,
        data: {
          title: props.item.title || '',
          description: props.item.description || '',
          cover: props.item.image || '',
          genres: props.item.genres || [],
          author: props.item.author || '',
          pages: props.item.pages || '',
          language: props.item.language || ''
        }
      }

      // If we have externalId, add it
      if (props.item.externalId) {
        payloadCreate.externalId = props.item.externalId
      }

      // Infer genres if empty
      if ((!payloadCreate.data.genres || payloadCreate.data.genres.length === 0) && payloadCreate.title) {
        const inferred = inferGenresFromTitle(String(payloadCreate.title))
        if (inferred.length) payloadCreate.data.genres = inferred
      }

      const created: any = await createItem(payloadCreate)
      dbItemId = created && (created._id || created.id)
    } catch (err) {
      console.error('Error al crear item en servidor antes de puntuar', err)
      notifyError('Error al crear el ítem. Intenta de nuevo.')
      return
    }
  }

  // Use normalized itemType for the rating payload too
  const normalizedItemType = normalizeItemType(props.item.itemType)
  
  const payload: any = {
    itemId: dbItemId,
    itemType: normalizedItemType,
    comment: userComment.value || '',
    status: userStatus.value || 'watching'
  }
  if (typeof payloadScore !== 'undefined') payload.score = payloadScore

  try {
    isSubmitting.value = true
    await addRating(user._id, payload)

    // Notify other components
    try {
      window.dispatchEvent(new CustomEvent('ratingsChanged'))
    } catch (err) {
      // ignore
    }

    const successMsg = isEditingExisting.value 
      ? 'Puntuación actualizada correctamente' 
      : 'Puntuación enviada correctamente'
    
    notifySuccess(successMsg)
    emit('success')
    emit('close')

    // Reset form
    userScoreRaw.value = ''
    userComment.value = ''
    userStatus.value = 'completed'
    userScoreError.value = ''
    isEditingExisting.value = false
  } catch (e) {
    console.error('Error al enviar puntuación', e)
    notifyError('No se ha podido enviar la puntuación. Intenta de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}

// Load existing rating when modal opens, reset when it closes
watch(() => props.show, async (newVal) => {
  if (newVal) {
    // Modal is opening - load existing rating data
    await loadExistingRating()
  } else {
    // Modal is closing - reset form
    userScoreRaw.value = ''
    userComment.value = ''
    userStatus.value = 'completed'
    userScoreError.value = ''
    isEditingExisting.value = false
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
