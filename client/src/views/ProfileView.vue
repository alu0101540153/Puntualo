<template>
  <div class="min-h-screen px-4">
    <!-- Mantener la cabecera alineada con el tope de la página -->
    <DashboardHeader />

  <div class="max-w-screen-2xl mx-auto py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mt-6">
            <ProfileSidebar :profileUser="profileUser" class="md:col-span-1" />

            <div class="md:col-span-3 space-y-6">
              <!-- Si estamos viendo el perfil de otro, mostrar primero el bloque de 'Perfil público' (con botón seguir) -->
              <template v-if="profileUser">
                <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white mb-4">Perfil público: {{ profileUser.name }}</h3>
                  </div>
                  <div class="mt-3">
                    <Button v-if="isViewingOther" @click="toggleFollow" :disabled="followProcessing"
                      :variant="isFollowing ? 'danger' : 'primary'" size="md" class="px-4 py-2 font-semibold">
                      {{ isFollowing ? 'Dejar de seguir' : 'Seguir' }}
                    </Button>
                  </div>
                  <div v-if="profileUser.items && profileUser.items.length">
                    <ul class="space-y-3">
                      <li v-for="it in profileUser.items" :key="it._id" class="p-3 rounded bg-gray-900/40">
                        <div class="text-white font-semibold">{{ it.title }}</div>
                        <div class="text-gray-400 text-sm">{{ it.itemType }}</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>

              <!-- Mostrar resumen de puntuados (propio o del usuario visto) -->
              <template v-if="!isViewingOther">
              <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white">Mis puntuados</h3>
                    <!-- Destacar el botón para que sea más visible -->
                    <Button @click="goToAllRatings" variant="primary" size="md" class="px-6 py-2">Ver mis puntuados</Button>
                  </div>

                  <div v-if="loadingRatings" class="text-gray-300">Cargando resumen...</div>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Total puntuados</div>
                      <div class="text-2xl font-bold text-white">{{ totalRatings }}</div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Puntuación media</div>
                      <div class="text-2xl font-bold text-white">{{ avgScore }}</div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Último puntuado</div>
                      <div class="text-sm text-white truncate">{{ lastRatedTitle || '—' }}</div>
                    </div>
                  </div>
                </div>
              </div>
              </template>

              <template v-if="isViewingOther">
              <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white">Puntuados de {{ profileUser?.name }}</h3>
                    <!-- Destacar también el botón 'Ver sus puntuados' cuando se ve el perfil de otro -->
                    <Button @click="goToUsersRatings" variant="primary" size="md" class="px-6 py-2">Ver sus puntuados</Button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Total puntuados</div>
                      <div class="text-2xl font-bold text-white">{{ otherTotalRatings }}</div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Puntuación media</div>
                      <div class="text-2xl font-bold text-white">{{ otherAvgScore }}</div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Último puntuado</div>
                      <div class="text-sm text-white truncate">{{ otherLastRatedTitle || '—' }}</div>
                    </div>
                  </div>

                  <!-- Detalle: los puntuados del usuario se muestran en la página dedicada (Ver sus puntuados) -->
                </div>
              </div>
              </template>

              <template v-if="!profileUser">
                <CurrentlyWatching />
              </template>

              

              <!-- Mis vistos: usar contenedor más ligero y que ocupe todo el ancho disponible -->
              <template v-if="!isViewingOther">
              <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white">Mis vistos</h3>
                    <button @click="goToAllSeen" class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black font-semibold px-5 py-2.5 rounded-full transition-all duration-300">
                      Ver todos mis vistos
                    </button>
                  </div>

                  <SeenCarousel />
                </div>
              </div>
              </template>

              <!-- Mis deseados (wishlist) visible en mi perfil -->
              <template v-if="!isViewingOther">
                <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-2xl font-semibold text-white">Mis deseados</h3>
                      <router-link to="/my-wishlist" class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black font-semibold px-5 py-2.5 rounded-full transition-all duration-300 no-underline">
                        Ver lista completa
                      </router-link>
                    </div>

                    <div v-if="wishlistLoading" class="text-gray-300">Cargando...</div>
                    <div v-else-if="!wishlistItems || wishlistItems.length === 0" class="text-gray-300">No tienes items en tu lista de deseados.</div>

                    <div v-else class="relative">
                      <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollWishlistPrev">‹</button>

                      <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-3 scrollbar-hide" ref="wishlistCarousel">
                        <MediaCarouselItem v-for="it in wishlistCarouselItems" :key="it.id" :item="it" @select="onWishlistSelect" />
                      </div>

                      <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollWishlistNext">›</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="isViewingOther">
                <!-- Friend: Currently watching with 'Ver más' button that leads to user's watching page -->
                <div class="space-y-4">
                  <CurrentlyWatching :userId="profileUser?._id" :ratings="profileUser?.ratedItems" :friendView="true" :userName="profileUser?.name" :hideHeader="false" />
                </div>

                <!-- Friend: Vistos (completados) with button to see all their seen -->
                <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-2xl font-semibold text-white">Vistos de {{ profileUser?.name }}</h3>
            <button @click="() => router.push({ name: 'user-seen', params: { id: profileUser?._id } })" class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black font-semibold px-5 py-2.5 rounded-full transition-all duration-300">
              Ver todos sus vistos
            </button>
                    </div>

                    <SeenCarousel :userId="profileUser?._id" :ratings="profileUser?.ratedItems" />
                  </div>
                </div>
                <!-- Vistos en común contigo -->
                <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6 mt-4">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-2xl font-semibold text-white">Vistos en común contigo</h3>
                      <button 
                        v-if="me && me._id && commons.length > 0"
                        @click="router.push({ name: 'common-seen', params: { id: profileUser?._id } })"
                        class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-black font-bold px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Ver todos
                      </button>
                    </div>
                    <div v-if="!me || !me._id" class="text-gray-300">Inicia sesión para ver qué habéis visto en común.</div>
                    <div v-else>
                      <div v-if="commons.length > 0">
                        <SeenCarousel :ratings="commons" />
                      </div>
                      <div v-else class="text-gray-300">No hay vistos en común con este usuario.</div>
                    </div>
                  </div>
                </div>
              </template>

              
            </div>
          </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Button from '@/components/Button.vue'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import CurrentlyWatching from '@/components/profile/CurrentlyWatching.vue'
import SeenCarousel from '@/components/profile/SeenCarousel.vue'
import MediaCarouselItem from '@/components/ui/MediaCarouselItem.vue'
// reusing components directly; no low-level carousel refs needed
import { getUser } from '@/services/auth'
import { getMyRatings, getUserById, followUser, unfollowUser, removeItemFromUser } from '@/services/user'

const loadingRatings = ref(true)
const totalRatings = ref(0)
const avgScore = ref<string | number>('—')
const lastRatedTitle = ref('')

const router = useRouter()
const route = useRoute()

const profileUser = ref<any | null>(null)
const commons = ref<any[]>([])

// wishlist state
const wishlistLoading = ref(false)
const wishlistItems = ref<any[]>([])
const wishlistCarousel = ref<HTMLElement | null>(null)

function scrollWishlistNext() {
  if (!wishlistCarousel.value) return
  const el = wishlistCarousel.value
  const amount = Math.max(el.clientWidth * 0.8, 200)
  el.scrollBy({ left: amount, behavior: 'smooth' })
}

function scrollWishlistPrev() {
  if (!wishlistCarousel.value) return
  const el = wishlistCarousel.value
  const amount = Math.max(el.clientWidth * 0.8, 200)
  el.scrollBy({ left: -amount, behavior: 'smooth' })
}

const wishlistCarouselItems = computed(() => {
  // Map wishlistItems (user.items) to the shape expected by MediaCarouselItem
  return (wishlistItems.value || []).map((it: any, idx: number) => {
    const detailId = (it.itemId && (it.itemId._id || it.itemId.id)) || it.externalId || it._id || idx
    const image = getItemImage(it)
    // determine type emoji from itemType or populated itemId
    const rawType = (it.itemType || (it.itemId && (it.itemId.itemType || it.itemId.data?.type)) || '')
    const low = String(rawType || '').toLowerCase()
    let emoji = '🎞️'
    if (low.includes('book') || low.includes('lib')) emoji = '📚'
    else if (low.includes('film') || low.includes('movie') || low.includes('pel') || low.includes('cine')) emoji = '🎬'
    else if (low.includes('serie') || low.includes('tv') || low.includes('show')) emoji = '📺'

    return {
      id: it._id || idx,
      detailId,
      image,
      rating: '-/10',
      type: emoji,
      title: (it.itemId && (it.itemId.title || it.title)) || it.title || ''
    }
  })
})

function onWishlistSelect(selected: any) {
  const id = selected?.detailId || selected?.id
  if (!id) return
  router.push({ name: 'item-detail', params: { id: String(id) } })
}

const me = getUser() || null

// follow state for the profile being viewed
const isFollowing = ref(false)
const followProcessing = ref(false)

function updateFollowingState() {
  try {
    if (!me || !me._id || !profileUser.value || !profileUser.value._id) { isFollowing.value = false; return }
    const follows = Array.isArray(me.follows) ? me.follows.map((s: any) => String(s)) : []
    isFollowing.value = follows.includes(String(profileUser.value._id))
  } catch (e) {
    isFollowing.value = false
  }
}

async function toggleFollow() {
  if (!me || !me._id) { alert('Debes iniciar sesión para seguir a usuarios.'); return }
  if (!profileUser.value || !profileUser.value._id) return
  followProcessing.value = true
  try {
    const targetId = String(profileUser.value._id)
    if (isFollowing.value) {
      await unfollowUser(targetId)
      // update localStorage user.follows if present
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const user = JSON.parse(raw)
          if (Array.isArray(user.follows)) {
            user.follows = user.follows.filter((id: string) => String(id) !== targetId)
            localStorage.setItem('user', JSON.stringify(user))
          }
        }
      } catch (e) {}
      isFollowing.value = false
    } else {
      await followUser(String(profileUser.value._id))
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const user = JSON.parse(raw)
          if (!Array.isArray(user.follows)) user.follows = []
          if (!user.follows.includes(String(profileUser.value._id))) user.follows.push(String(profileUser.value._id))
          user.follows = Array.from(new Set(user.follows.map((id: any) => String(id))))
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (e) {}
      isFollowing.value = true
    }
    // refresh me reference from localStorage
    try { (me as any) = getUser() } catch (e) {}
  } catch (err) {
    console.error('Follow toggle error', err)
    alert('No se pudo completar la acción. Intenta de nuevo.')
  } finally {
    followProcessing.value = false
  }
}

const isViewingOther = computed(() => {
  if (!profileUser.value) return false
  const pid = profileUser.value && (profileUser.value._id || profileUser.value.id)
  const myid = me && (me._id || me.id)
  if (!pid || !myid) return false
  return String(pid) !== String(myid)
})

// When viewing another user's profile, compute summary data from profileUser.ratedItems
const otherTotalRatings = computed(() => {
  if (!profileUser.value || !Array.isArray(profileUser.value.ratedItems)) return 0
  return profileUser.value.ratedItems.length
})

const otherAvgScore = computed(() => {
  if (!profileUser.value || !Array.isArray(profileUser.value.ratedItems) || profileUser.value.ratedItems.length === 0) return '—'
  const sum = profileUser.value.ratedItems.reduce((s: number, r: any) => s + (Number(r.score) || 0), 0)
  const avg = sum / profileUser.value.ratedItems.length
  return Number.isInteger(avg) ? avg : avg.toFixed(1)
})

const otherLastRatedTitle = computed(() => {
  if (!profileUser.value || !Array.isArray(profileUser.value.ratedItems) || profileUser.value.ratedItems.length === 0) return ''
  const sorted = profileUser.value.ratedItems.slice().sort((a: any, b: any) => {
    const da = a.lastModified ? new Date(a.lastModified).getTime() : 0
    const db = b.lastModified ? new Date(b.lastModified).getTime() : 0
    return db - da
  })
  const top = sorted[0]
  return (top && ((top.itemId && (top.itemId.title || top.itemId.data?.title)) || top.title)) || ''
})



function goToAllSeen() {
  router.push('/my-seen')
}

function goToUserFriends(id: string | undefined) {
  if (!id) return
  router.push({ name: 'user-friends', params: { id: String(id) } })
}

async function loadRatingsSummary() {
  loadingRatings.value = true
  const user = getUser()
  if (!user || !user._id) {
    totalRatings.value = 0
    avgScore.value = '—'
    lastRatedTitle.value = ''
    loadingRatings.value = false
    return
  }

  try {
    const data: any[] = await getMyRatings(user._id) || []
    totalRatings.value = data.length
    if (data.length === 0) {
      avgScore.value = '—'
      lastRatedTitle.value = ''
    } else {
      const sum = data.reduce((s, r) => s + (Number(r.score) || 0), 0)
      const avg = sum / data.length
      // show one decimal if not integer
      avgScore.value = Number.isInteger(avg) ? avg : avg.toFixed(1)
      // pick the most recent by lastModified or _id timestamp
      const sorted = data.slice().sort((a, b) => {
        const da = a.lastModified ? new Date(a.lastModified).getTime() : 0
        const db = b.lastModified ? new Date(b.lastModified).getTime() : 0
        return db - da
      })
      lastRatedTitle.value = (sorted[0] && ((sorted[0].itemId && (sorted[0].itemId.title || sorted[0].itemId.data?.title)) || sorted[0].title)) || ''
    }
  } catch (e) {
    console.error('Error cargando resumen de puntuados', e)
    totalRatings.value = 0
    avgScore.value = '—'
    lastRatedTitle.value = ''
  } finally {
    loadingRatings.value = false
  }
}

function goToAllRatings() {
  router.push('/my-ratings')
}

function goToUsersRatings() {
  // Navigate to the user's ratings page when viewing another user's profile
  if (isViewingOther.value && profileUser.value && (profileUser.value._id || profileUser.value.id)) {
    const id = profileUser.value._id || profileUser.value.id
    router.push({ name: 'user-ratings', params: { id: String(id) } })
    return
  }

  // Fallback: go to my ratings
  router.push('/my-ratings')
}

onMounted(() => {
  loadRatingsSummary()
  // listen for global ratings changes (other components dispatch this event)
  window.addEventListener('ratingsChanged', loadRatingsSummary)
  // If query param userId is present, load that user's public profile
  const otherId = route.query.userId as string | undefined
  if (otherId) {
    getUserById(otherId).then((u) => {
      profileUser.value = u
      // compute commons when loading public profile
      computeCommons()
      updateFollowingState()
      try { console.debug('ProfileView: loaded public profile', otherId, u && u.ratedItems ? u.ratedItems.length : 0) } catch (e) {}
    }).catch((e) => {
      console.error('Error loading profile user', e)
    })
  }
  // load wishlist for own profile
  loadWishlist()
})

// Also react to query changes so navigating to the same /profile route with a different
// userId (e.g. /profile?userId=...) will reload the public profile. This fixes the case
// where the user is already on /profile and clicks "Ver perfil" from SearchView.
watch(() => route.query.userId, (newVal) => {
  const otherId = newVal as string | undefined
  if (otherId) {
    getUserById(otherId).then((u) => {
      profileUser.value = u
      computeCommons()
      updateFollowingState()
      try { console.debug('ProfileView.watch: reloaded public profile', otherId, u && u.ratedItems ? u.ratedItems.length : 0) } catch (e) {}
    }).catch((e) => {
      console.error('Error loading profile user', e)
      profileUser.value = null
    })
  } else {
    // clear so the view falls back to default (own summary)
    profileUser.value = null
    isFollowing.value = false
    // reload wishlist for own profile
    loadWishlist()
  }
})

function formatDate(d: any) {
  if (!d) return ''
  try { return new Date(d).toLocaleString() } catch (e) { return '' }
}

// recompute commons when profileUser or the current user's ratings change
async function computeCommons() {
  commons.value = []
  try {
    if (!profileUser.value) { commons.value = []; return }
    const current = getUser()
    if (!current || !current._id) { commons.value = []; return }
    const myRatings: any[] = await getMyRatings(current._id) || []
    const mySet = new Set<string>()
    for (const e of myRatings) {
      const rid = e.itemId?._id || e.itemId?.id || String(e.itemId || e._id || '')
      if (rid) mySet.add(rid)
    }

    const arr = Array.isArray(profileUser.value.ratedItems) ? profileUser.value.ratedItems : []
    // normalize latest per item for the profile user's ratedItems
    const map = new Map<string, any>()
    for (const entry of arr) {
      const rawId = entry.itemId?._id || entry.itemId?.id || String(entry.itemId || entry._id || '')
      if (!rawId) continue
      const existing = map.get(rawId)
      if (!existing) map.set(rawId, entry)
      else {
        const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
        const b = entry.lastModified ? new Date(entry.lastModified).getTime() : 0
        if (b >= a) map.set(rawId, entry)
      }
    }
    const latest = Array.from(map.values())
    commons.value = latest.filter((x: any) => {
      const s = (x.status || '').toString().toLowerCase()
      const idRaw = x.itemId?._id || x.itemId?.id || String(x.itemId || x._id || '')
      return (s === 'completed' || s === 'terminado' || s === 'finished') && idRaw && mySet.has(idRaw)
    })
  } catch (e) {
    console.error('Error computing commons', e)
    commons.value = []
  }
}

window.addEventListener('ratingsChanged', computeCommons)

function getItemImage(it: any) {
  if (!it) return '/img/placeholder-book.png'
  if (it.itemId && it.itemId.data && it.itemId.data.cover) return it.itemId.data.cover
  if (it.itemId && it.itemId.cover) return it.itemId.cover
  return '/img/placeholder-book.png'
}

async function loadWishlist() {
  wishlistLoading.value = true
  wishlistItems.value = []
  const user = getUser()
  if (!user || !user._id) {
    wishlistLoading.value = false
    return
  }
  try {
    const res: any = await getUserById(user._id)
    wishlistItems.value = (res && res.items) ? res.items : []
  } catch (err) {
    console.error('Error cargando wishlist en perfil', err)
    wishlistItems.value = []
  } finally {
    wishlistLoading.value = false
  }
}

async function removeWishlistItem(itemSubId: string) {
  const user = getUser()
  if (!user || !user._id) return
  try {
    await removeItemFromUser(user._id, itemSubId)
    await loadWishlist()
  } catch (err) {
    console.error('Error quitando item de wishlist', err)
    alert('No se pudo eliminar el item. Intenta de nuevo.')
  }
}
</script>

<style scoped>
/* pequeños ajustes puntuales si son necesarios */
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
