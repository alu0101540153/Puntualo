<template>
  <section class="max-w-7xl mx-auto px-4 py-12">
    <!-- Estadísticas principales: solo usuarios y reseñas -->
    <div class="stats-grid grid grid-cols-1 sm:grid-cols-2 gap-4" ref="heroRef" role="region" aria-label="Estadísticas de la comunidad">
      <div class="stat-card card-users" aria-hidden="false">
        <div class="card-top">
          <div class="icon w-12 h-12 flex items-center justify-center card-users">
            <UsersIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="number text-3xl users-big">{{ displayUsers }}</div>
            <div class="label">Usuarios registrados</div>
          </div>
        </div>
        <div class="stat-meta">Somos una comunidad activa. Únete y comparte tus valoraciones.</div>
      </div>

      <div class="stat-card card-reviews" aria-hidden="false">
        <div class="card-top">
          <div class="icon w-12 h-12 flex items-center justify-center card-reviews">
            <ChatBubbleLeftRightIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="number text-3xl">{{ displayReviews }}</div>
            <div class="label">Reseñas publicadas</div>
          </div>
        </div>
        <div class="stat-meta">Opiniones reales de usuarios sobre películas, series y libros.</div>
      </div>
    </div>
    <!-- Top películas (usar datos obtenidos en la misma llamada para evitar peticiones duplicadas) -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-semibold text-white">Top películas</h3>
        <div class="text-sm text-gray-300">Las películas mejor valoradas por la comunidad</div>
      </div>

      <div v-if="topMovies && topMovies.length" class="relative">
        <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2" @click="scrollTopMovies(-1)">‹</button>

          <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-3 scrollbar-hide" ref="topMoviesCarousel">
          <MediaCarouselItem v-for="it in topMovies" :key="it.id" :item="it" :showBadge="false" :showWishlist="false" @select="onSelectTopMovie" />
        </div>

        <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2" @click="scrollTopMovies(1)">›</button>
      </div>
      <!-- (Top libros y Top series movidos al final de la página) -->
    </div>

      <!-- Top libros (misma estructura que Top películas) -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold text-white">Top libros</h3>
          <div class="text-sm text-gray-300">Los libros mejor valorados por la comunidad</div>
        </div>

        <div v-if="topBooks && topBooks.length" class="relative">
          <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2" @click="scrollTopBooks(-1)">‹</button>

          <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-3 scrollbar-hide" ref="topBooksCarousel">
            <MediaCarouselItem v-for="it in topBooks" :key="it.id" :item="it" :showBadge="false" :showWishlist="false" @select="onSelectTopMovie" />
          </div>

          <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2" @click="scrollTopBooks(1)">›</button>
        </div>
        <div v-else class="text-gray-400">Cargando recomendaciones...</div>
      </div>

      <!-- Top series (misma estructura que Top películas) -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold text-white">Top series</h3>
          <div class="text-sm text-gray-300">Las series mejor valoradas por la comunidad</div>
        </div>

        <div v-if="topSeries && topSeries.length" class="relative">
          <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2" @click="scrollTopSeries(-1)">‹</button>

          <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-3 scrollbar-hide" ref="topSeriesCarousel">
            <MediaCarouselItem v-for="it in topSeries" :key="it.id" :item="it" :showBadge="false" :showWishlist="false" @select="onSelectTopMovie" />
          </div>

          <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2" @click="scrollTopSeries(1)">›</button>
        </div>
        <div v-else class="text-gray-400">Cargando recomendaciones...</div>
      </div>

      <!-- Preview modal para usuarios no autenticados -->
      <div v-if="previewModalVisible" class="fixed inset-0 z-[99999] flex items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-60 z-[99998]" @click="closePreview"></div>
        <div @click.stop class="relative bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 p-6 z-[100000] text-white max-h-[90vh] overflow-auto">
          <button class="absolute top-4 right-4 text-gray-300 hover:text-white" @click="closePreview">✕</button>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="md:w-1/3">
                <img :src="(previewItem && (previewItem.item && (previewItem.item.data && previewItem.item.data.cover) || previewItem.item && previewItem.item.cover)) || (previewItem && ((previewItem.data && (previewItem.data.cover || previewItem.data.image)) || previewItem.cover || previewItem.image)) || '/img/placeholder-book.png'" class="w-full rounded-lg object-cover h-48 md:h-auto" alt="Portada" />
            </div>
            <div class="md:w-2/3">
              <h3 class="text-2xl font-bold mb-2">{{ (previewItem && (previewItem.item && (previewItem.item.title || previewItem.item.data?.title)) ) || previewItem?.title || previewItem?.data?.title || 'Detalle' }}</h3>
              <div class="flex items-center gap-4 mb-3">
                <div class="text-lg font-semibold">{{ (previewItem && (previewItem.avgScore ?? previewItem.score ?? previewItem.rating)) ? `${previewItem.avgScore ?? previewItem.score ?? previewItem.rating}/10` : '—/10' }}</div>
                <div class="text-sm text-gray-300">{{ (previewItem && (previewItem.count || previewItem.item && previewItem.item.count)) ? `${previewItem.count || previewItem.item.count} reseñas` : '' }}</div>
              </div>
              <p class="text-gray-300 mb-4">{{ (previewItem && (previewItem.item && (previewItem.item.data && previewItem.item.data.description) || previewItem.item.description)) || (previewItem && ((previewItem.data && (previewItem.data.description || previewItem.data.plot)) || previewItem.description)) || 'No hay descripción disponible.' }}</p>

              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <button @click="() => router.push({ name: 'login' })" class="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-full">Inicia sesión para poder puntuarlo</button>
                <button @click="closePreview" class="w-full sm:w-auto bg-transparent border border-gray-700 px-4 py-2 rounded-full text-gray-300">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getUser } from '@/services/auth'
import MediaShowcase3D from '@/components/home/MediaShowcase3D.vue'
import MediaCarouselItem from '@/components/ui/MediaCarouselItem.vue'
import MediaShowcase from '@/components/home/MediaShowcase.vue'
import { getGlobalTop } from '@/services/item'
import { getCounts, getUsersCountDirect, getReviewsCountDirect, getItemsCountByType } from '@/services/stats'
// Heroicons solid (used as white filled glyphs inside colored circular backgrounds)
import { UsersIcon, ChatBubbleLeftRightIcon, TvIcon, BookOpenIcon } from '@heroicons/vue/24/solid'

const usersCount = ref<number>(0)
const topGlobal = ref<any[]>([])
// top movies specifically (mapped for the carousel)
const topMovies = ref<any[]>([])
// top books and top series (same carousel UI, stacked below movies)
const topBooks = ref<any[]>([])
const topSeries = ref<any[]>([])
const topGlobalLoading = ref(true)
const topGlobalContainer = ref<HTMLElement | null>(null)
const currentTopIndex = ref(0)
const topGlobalPaused = ref(false)
let topGlobalInterval: number | null = null
let topGlobalRefreshInterval: number | null = null

const formattedUsers = computed(() => {
  try {
    return new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(usersCount.value)
  } catch (e) {
    return String(usersCount.value)
  }
})

const formattedReviews = computed(() => {
  try {
    return new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(totalReviews.value)
  } catch (e) {
    return String(totalReviews.value)
  }
})

const formattedMovies = computed(() => {
  try { return new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(moviesTotal.value) } catch (e) { return String(moviesTotal.value) }
})

const formattedSeries = computed(() => {
  try { return new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(seriesTotal.value) } catch (e) { return String(seriesTotal.value) }
})

const formattedBooks = computed(() => {
  try { return new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(booksTotal.value) } catch (e) { return String(booksTotal.value) }
})

const totalReviews = ref<number>(0)
const countsVerified = ref<boolean>(false)
const countsCheckedAt = ref<string | null>(null)

// animated display values for the stats tiles
const displayUsers = ref<string>('0')
const displayReviews = ref<string>('0')
const statPulseUser = ref(false)
const statPulseReview = ref(false)
const heroRef = ref<HTMLElement | null>(null)
const sparkRef = ref<SVGPolylineElement | null>(null)
const meterRef = ref<SVGPathElement | null>(null)
const heroAnimated = ref(false)
let heroObserver: IntersectionObserver | null = null


function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

function animateNumber(target: number, outRef: any, duration = 900, onComplete?: () => void) {
  try {
    const nf = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, notation: 'compact' })
    const start = performance.now()
    const from = 0
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = easeOutCubic(t)
      const val = Math.floor(from + (target - from) * eased)
      outRef.value = nf.format(val)
      if (t < 1) requestAnimationFrame(tick)
      else {
        outRef.value = nf.format(target)
        if (onComplete) onComplete()
      }
    }
    requestAnimationFrame(tick)
  } catch (e) {
    outRef.value = String(target)
  }
}

function mapToCarousel(it: any) {
  return {
    id: it._id || it.id || String(Math.random()),
    image: (it.data && (it.data.cover || it.data.image)) || it.cover || it.image || '/img/placeholder-book.png',
    rating: (it.score ?? it.rating) ? `${(it.score ?? it.rating)}/10` : '',
    type: it.itemType || (it.data && it.data.type) || 'book',
    title: it.title || (it.data && it.data.title) || ''
  }
}

function mapTopMovie(it: any) {
  // input may be { avgScore, count, itemId, item } or raw item
  const source = it.item || it
  const image = (source.data && (source.data.cover || source.data.image)) || source.cover || source.image || '/img/placeholder-book.png'
  const score = (it.avgScore ?? it.score ?? it.rating ?? (source.score || source.rating))
  const numericScore = (typeof score === 'number') ? score : (score ? Number(score) : NaN)
  const rating = (!Number.isNaN(numericScore)) ? `${numericScore.toFixed(1)}/10` : ''
  const title = (source.title || (source.data && source.data.title) || it.title) || ''
  return {
    id: it._id || it.itemId || source._id || source.id || String(Math.random()),
    image,
    rating,
    // use movie emoji badge
    type: '🎬',
    title,
    // keep original raw for potential detail navigation
    raw: it
  }
}

async function loadAll() {
  try {
    // Prefer a single aggregated counts endpoint that tries multiple server routes
    const countsRes: any = await getCounts()
    console.log('📊 countsRes:', countsRes)
    // countsRes is handled below
    if (countsRes && typeof countsRes === 'object') {
      console.log('✅ countsRes.users:', countsRes.users, 'type:', typeof countsRes.users)
      console.log('✅ countsRes.reviews:', countsRes.reviews, 'type:', typeof countsRes.reviews)
      if (typeof countsRes.users === 'number') usersCount.value = countsRes.users
      if (typeof countsRes.reviews === 'number') totalReviews.value = countsRes.reviews
      if (typeof countsRes.movies === 'number') moviesTotal.value = countsRes.movies
      if (typeof countsRes.series === 'number') seriesTotal.value = countsRes.series
      if (typeof countsRes.books === 'number') booksTotal.value = countsRes.books
      // respect server-provided verification info when present
      if (countsRes._verified || countsRes._checkedAt || countsRes.checkedAt) {
        countsVerified.value = !!countsRes._verified || !!countsRes.checkedAt || !!countsRes._checkedAt
        countsCheckedAt.value = countsRes._checkedAt || countsRes.checkedAt || null
      }
      // assigned counts
    }

    // Ensure displayed values reflect current totals immediately so the UI
    // doesn't stay showing zeros while animations or observers may be delayed.
    try {
      const nf = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, notation: 'compact' })
      console.log('🔢 Setting display values - usersCount:', usersCount.value, 'totalReviews:', totalReviews.value)
      displayUsers.value = nf.format(usersCount.value || 0)
      displayReviews.value = nf.format(totalReviews.value || 0)
      displayMovies.value = nf.format(moviesTotal.value || 0)
      displaySeries.value = nf.format(seriesTotal.value || 0)
      displayBooks.value = nf.format(booksTotal.value || 0)
      // display values assigned
    } catch (e) {}

    // If aggregated endpoint returned top lists, map movies/books/series for the carousels and avoid extra top requests
    if (countsRes && countsRes.top) {
      if (Array.isArray(countsRes.top.movies) && countsRes.top.movies.length) {
        topMovies.value = countsRes.top.movies.map((m: any, i: number) => ({ ...mapTopMovie(m), rank: i + 1 }))
      }
      if (Array.isArray(countsRes.top.books) && countsRes.top.books.length) {
        topBooks.value = countsRes.top.books.map((m: any, i: number) => ({ ...mapTopMovie(m), rank: i + 1 }))
      }
      if (Array.isArray(countsRes.top.series) && countsRes.top.series.length) {
        topSeries.value = countsRes.top.series.map((m: any, i: number) => ({ ...mapTopMovie(m), rank: i + 1 }))
      }
    }

    // Fallback: if aggregated endpoint didn't return useful numbers, perform direct per-endpoint queries
    if (!usersCount.value && !totalReviews.value && !moviesTotal.value && !seriesTotal.value && !booksTotal.value) {
      const [u, r, m, s, b] = await Promise.all([
        getUsersCountDirect(),
        getReviewsCountDirect(),
        getItemsCountByType('movie'),
        getItemsCountByType('series'),
        getItemsCountByType('book')
      ])

      if (typeof u === 'number') usersCount.value = u
      if (typeof r === 'number') totalReviews.value = r
      if (typeof m === 'number') moviesTotal.value = m
      if (typeof s === 'number') seriesTotal.value = s
      if (typeof b === 'number') booksTotal.value = b
      if (u || r || m || s || b) {
        countsVerified.value = true
        countsCheckedAt.value = new Date().toISOString()
      }
    }
  } catch (e) {
    usersCount.value = 0
    totalReviews.value = 0
  }

    try {
      // Only fetch global top if we didn't get movies/books/series from the aggregated counts endpoint
      if ((!topMovies.value || !topMovies.value.length) || (!topBooks.value || !topBooks.value.length) || (!topSeries.value || !topSeries.value.length)) {
        const g: any = await getGlobalTop(30)
        topGlobal.value = (g && g.items) ? g.items : []

        // fallbacks: try to derive each section from the global top
        const movieItems = (topGlobal.value || []).filter((it: any) => String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('movie'))
        if ((!topMovies.value || !topMovies.value.length) && movieItems && movieItems.length) topMovies.value = movieItems.slice(0, 10).map((m: any, i: number) => ({ ...mapToCarousel(m), type: '🎬', rank: i + 1 }))

        const bookItems = (topGlobal.value || []).filter((it: any) => String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('book'))
        if ((!topBooks.value || !topBooks.value.length) && bookItems && bookItems.length) topBooks.value = bookItems.slice(0, 10).map((m: any, i: number) => ({ ...mapToCarousel(m), type: '📚', rank: i + 1 }))

        const seriesItems = (topGlobal.value || []).filter((it: any) => String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('series') || String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('tv'))
        if ((!topSeries.value || !topSeries.value.length) && seriesItems && seriesItems.length) topSeries.value = seriesItems.slice(0, 10).map((m: any, i: number) => ({ ...mapToCarousel(m), type: '📺', rank: i + 1 }))
      }
    } catch (e) {
      topGlobal.value = []
    }
  topGlobalLoading.value = false

  if (topGlobal.value && topGlobal.value.length) currentTopIndex.value = 0

  // do not auto-animate here; animations triggered when hero enters viewport


  // Ensure numbers are displayed when data is loaded even if the IntersectionObserver
  // didn't fire (some environments or layout quirks prevent it). Trigger animations
  // idempotently — runHeroAnimations guards against double runs.
  try {
    runHeroAnimations()
  } catch (e) {}

  // if backend didn't provide type totals, derive a sensible fallback from the loaded top items
  try {
    if (!moviesTotal.value) moviesTotal.value = (topGlobal.value || []).filter((it: any) => String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('movie') || String(it.type || '').toLowerCase().includes('movie')).length
    if (!seriesTotal.value) seriesTotal.value = (topGlobal.value || []).filter((it: any) => String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('series') || String(it.type || '').toLowerCase().includes('series')).length
    if (!booksTotal.value) booksTotal.value = (topGlobal.value || []).filter((it: any) => String((it.itemType || (it.data && it.data.type) || '')).toLowerCase().includes('book') || String(it.type || '').toLowerCase().includes('book')).length
  } catch (e) {}
}

function runHeroAnimations() {
  if (heroAnimated.value) return
  heroAnimated.value = true
  // animate numbers
  animateNumber(usersCount.value || 0, displayUsers, 900, () => {
    statPulseUser.value = true
    setTimeout(() => (statPulseUser.value = false), 900)
  })
  animateNumber(totalReviews.value || 0, displayReviews, 1100, () => {
    statPulseReview.value = true
    setTimeout(() => (statPulseReview.value = false), 900)
  })

  // animate sparkline draw
  nextTick(() => {
    try {
      const poly = sparkRef.value as any
      if (poly && poly.getTotalLength) {
        const L = poly.getTotalLength()
        poly.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.2,.9,.2,1)'
        poly.style.strokeDasharray = L
        poly.style.strokeDashoffset = L
        // trigger
        requestAnimationFrame(() => { poly.style.strokeDashoffset = '0' })
      }
    } catch (e) {}

    // animate circular meter
    try {
      const p = meterRef.value as any
      if (p) {
        // set final dasharray using percent
        const pct = Math.max(0, Math.min(100, Number(progressPct.value)))
        // animate from 0 to pct
        p.style.transition = 'stroke-dasharray 900ms cubic-bezier(.2,.9,.2,1)'
        p.style.strokeDasharray = `${pct}, 100`
      }
    } catch (e) {}
    // animate type counts (use backend totals if available)
    try {
      animateNumber(moviesTotal.value || 0, displayMovies, 900)
      animateNumber(seriesTotal.value || 0, displaySeries, 900)
      animateNumber(booksTotal.value || 0, displayBooks, 900)
    } catch (e) {}
  })
}

// simplified: we only auto-scroll the topGlobal carousel

function authorFor(r: any) {
  return (r.user && (r.user.name || r.user.handle)) || r.author || r.username || 'Usuario anónimo'
}
function initialFor(r: any) {
  const a = authorFor(r)
  return a ? String(a).charAt(0).toUpperCase() : '?'
}
function excerptFor(r: any) {
  return (r.comment || r.text || r.body || '').slice(0, 80) || 'Sin comentario'
}
function timeAgo(r: any) {
  const date = r.lastModified || r.createdAt || r.addedAt || r.date || null
  if (!date) return ''
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'Ahora'
  if (s < 3600) return `Hace ${Math.floor(s/60)}m`
  if (s < 86400) return `Hace ${Math.floor(s/3600)}h`
  return `Hace ${Math.floor(s/86400)}d`
}

onMounted(() => loadAll())

// carousel ref & helpers for top movies
const topMoviesCarousel = ref<HTMLElement | null>(null)
function scrollTopMovies(direction: number) {
  if (!topMoviesCarousel.value) return
  const el = topMoviesCarousel.value
  const amount = Math.max(el.clientWidth * 0.8, 200)
  el.scrollBy({ left: direction * amount, behavior: 'smooth' })
}

const topBooksCarousel = ref<HTMLElement | null>(null)
function scrollTopBooks(direction: number) {
  if (!topBooksCarousel.value) return
  const el = topBooksCarousel.value
  const amount = Math.max(el.clientWidth * 0.8, 200)
  el.scrollBy({ left: direction * amount, behavior: 'smooth' })
}

const topSeriesCarousel = ref<HTMLElement | null>(null)
function scrollTopSeries(direction: number) {
  if (!topSeriesCarousel.value) return
  const el = topSeriesCarousel.value
  const amount = Math.max(el.clientWidth * 0.8, 200)
  el.scrollBy({ left: direction * amount, behavior: 'smooth' })
}

const router = useRouter()

// modal state for unauthenticated preview
const previewModalVisible = ref(false)
const previewItem = ref<any | null>(null)

function openPreviewFor(item: any) {
  previewItem.value = item && (item.raw || item)
  previewModalVisible.value = true
}

function closePreview() {
  previewModalVisible.value = false
  previewItem.value = null
}

function onSelectTopMovie(item: any) {
  const me = getUser()
  const id = item && (item.id || item.detailId || (item.raw && (item.raw.itemId || item.raw._id)))
  if (!id) return
  if (me && me._id) {
    // logged -> go to real detail
    router.push({ name: 'item-detail', params: { id: String(id) } })
    return
  }

  // not logged -> open preview modal using already-loaded data
  openPreviewFor(item)
}

onMounted(() => {
  // load data and start top global autoplay
  loadAll()
  setTimeout(() => startTopGlobalAuto(), 700)

  // create intersection observer to trigger hero animations when visible
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    heroObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          runHeroAnimations()
          if (heroObserver && heroRef.value) heroObserver.unobserve(heroRef.value)
        }
      }
    }, { threshold: 0.25 })
    if (heroRef.value) heroObserver.observe(heroRef.value)
  } else {
    // fallback: run immediately
    runHeroAnimations()
  }
})

onUnmounted(() => {
  stopTopGlobalAuto()
  stopTopGlobalRefresh()
  try { heroObserver && heroRef.value && heroObserver.unobserve(heroRef.value) } catch (e) {}
})

function startTopGlobalAuto() {
  stopTopGlobalAuto()
  topGlobalInterval = window.setInterval(() => {
    if (topGlobalPaused.value) return
    nextTop()
  }, 4000)
  // refresh data every 5 minutes so top reflects backend changes
  stopTopGlobalRefresh()
  topGlobalRefreshInterval = window.setInterval(() => {
    refreshTopGlobal()
  }, 5 * 60 * 1000)
}

function stopTopGlobalAuto() {
  if (topGlobalInterval) {
    clearInterval(topGlobalInterval as number)
    topGlobalInterval = null
  }
}

function stopTopGlobalRefresh() {
  if (topGlobalRefreshInterval) {
    clearInterval(topGlobalRefreshInterval as number)
    topGlobalRefreshInterval = null
  }
}

function pauseTop(val = true) {
  topGlobalPaused.value = val
}

function nextTop() {
  if (!topGlobal.value || !topGlobal.value.length) return
  const next = (currentTopIndex.value + 1) % topGlobal.value.length
  goToTop(next)
}

function goToTop(i: number) {
  const el = topGlobalContainer.value as HTMLElement | null
  const children = el ? Array.from(el.children) as HTMLElement[] : []
  if (!children.length || i < 0 || i >= children.length) return
  const target = children[i]
  if (target && el) {
    el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.clientWidth) / 2, behavior: 'smooth' })
    currentTopIndex.value = i
  }
}

async function refreshTopGlobal() {
  try {
    const g: any = await getGlobalTop(10)
    topGlobal.value = (g && g.items) ? g.items : topGlobal.value
  } catch (e) {
    // ignore
  }
}

// derived creative metrics for hero rectangle (no images)
const progressPct = computed(() => {
  const u = usersCount.value || 1
  const r = totalReviews.value || 0
  // simple heuristic: reviews per user scaled to 0-100
  const ratio = Math.min(1, r / (u * 2))
  return Math.round(ratio * 100)
})

const topTypes = computed(() => {
  const map: Record<string, number> = {}
  for (const it of topGlobal.value || []) {
    const t = (it.itemType || (it.data && it.data.type) || 'otros')
    map[t] = (map[t] || 0) + 1
  }
  // sort by count and return top 3 readable names
  return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,3).map(x => String(x[0]).replace(/_/g,' '))
})

const sparkPoints = computed(() => {
  // build minimal sparkline from topGlobal scores (fallback to small dummy values)
  const vals: number[] = (topGlobal.value && topGlobal.value.length)
    ? topGlobal.value.map((it: any) => Number(it.score ?? it.rating ?? 0)).slice(0,8)
    : [2,4,3,6,5,7,6,8]
  const max = Math.max(...vals, 1)
  const min = Math.min(...vals)
  // map to viewbox 0..100 x 0..30
  return vals.map((v, i) => {
    const x = Math.round((i / (vals.length - 1)) * 100)
    const y = Math.round(30 - ((v - min) / (max - min || 1)) * 26) // leave top/bottom padding
    return `${x},${y}`
  }).join(' ')
})

// totals received from backend (preferred) or fallback to top-derived if backend doesn't provide
const moviesTotal = ref<number>(0)
const seriesTotal = ref<number>(0)
const booksTotal = ref<number>(0)

const displayMovies = ref<string>('0')
const displaySeries = ref<string>('0')
const displayBooks = ref<string>('0')
</script>

<style scoped>
.carousel { gap: 1rem }
.carousel-container { position: relative }
.carousel-btn { background: rgba(255,255,255,0.12); color: #ffffff; width: 40px; height: 40px; border-radius: 999px; display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px rgba(2,6,23,0.45); border: 1px solid rgba(255,255,255,0.08); }
.carousel-btn:hover { transform: translateY(-50%) translateY(-4px) scale(1.02); background: rgba(255,255,255,0.95); color: #111827 }
.carousel ::v-deep .media-card { transition: transform .25s ease, box-shadow .25s ease }
.carousel ::v-deep .media-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(2,6,23,0.6) }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
.scrollbar-hide::-webkit-scrollbar { display: none }

/* hide any decorative carousel progress/track that may be rendered below the items */
.carousel-container::after, .carousel::after, .carousel::before, .carousel-track, .carousel-progress, .carousel-bar, .carousel .track { display: none !important }

/* subtle section background removed for a cleaner, elegant look */
section { background: transparent; padding-top: 3rem }

.animate-pulse { background: linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 100%); }

/* Top global carousel styling */
.top-global { scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch }
.top-global > * { scroll-snap-align: center }
.top-global { padding-bottom: 2rem }
.dots button { border: none; outline: none }

.panel-card { background: transparent; border: 1px solid rgba(255,255,255,0.03); min-height:460px; padding:1.0rem; overflow:visible }
.panel-card.no-outline { border: none; min-height: auto; padding: 0 }
.panel-header { border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.5rem }
.dots button { transition: transform .15s ease }
.dots button:hover { transform: scale(1.15) }

/* Stats card adjustments */
.stats-card { background: linear-gradient(180deg, rgba(15,15,15,0.85), rgba(18,18,18,0.6)); padding: 0 }
.stats-card .icon { flex-shrink: 0 }

/* Stats row styling above the title */
.stats-row { display: flex; align-items: center }
.stat-tile { backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.03) }
.shadow-stats { box-shadow: 0 12px 30px rgba(2,6,23,0.32) }
.stat-icon svg { opacity: 0.95 }
.stat-tile { animation: popIn .42s cubic-bezier(.2,.9,.2,1) both }
@keyframes popIn { from { transform: translateY(6px) scale(.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
.stats-area { display: flex; justify-content: flex-start }

/* Stat hero visuals */
.stat-hero { position: relative; overflow: hidden; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); box-shadow: 0 18px 40px rgba(2,6,23,0.32) }
.stat-hero.rose { background: linear-gradient(135deg, rgba(255,240,230,0.02), rgba(255,225,230,0.01)); }
.stat-deco { position: absolute; right: -40px; top: -40px; width: 140px; height: 140px; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), rgba(255,255,255,0.0) 40%); transform: rotate(18deg); filter: blur(6px); pointer-events: none }
.stat-content { position: relative; z-index: 5; display:flex; flex-direction:column }
.stat-figure { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -0.02em }
.stat-label { color: rgba(255,255,255,0.78); font-size: 0.85rem }
.stat-meta { font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 8px }
.stat-hero.pulse { animation: statPulse .72s cubic-bezier(.2,.9,.25,1) both }
@keyframes statPulse { 0% { transform: translateY(0) scale(1); box-shadow: 0 18px 40px rgba(2,6,23,0.32) } 30% { transform: translateY(-6px) scale(1.02); box-shadow: 0 26px 46px rgba(2,6,23,0.45) } 100% { transform: translateY(0) scale(1); box-shadow: 0 18px 40px rgba(2,6,23,0.32) } }
.hero-rectangle { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.04); box-shadow: 0 22px 60px rgba(2,6,23,0.38); }
.hero-rectangle .mini-thumb { width: 60px; height: 90px; object-fit: cover; border-radius: 8px; box-shadow: 0 14px 40px rgba(2,6,23,0.38); transform: translateY(0); transition: transform .28s ease }
.hero-rectangle .mini-thumb:hover { transform: translateY(-6px) scale(1.03) }
.hero-rectangle .hero-cta { border: 1px solid rgba(255,255,255,0.06) }
.hero-rectangle .hero-cta .arrow { opacity: 0.9 }
.hero-rectangle .users-big { text-shadow: 0 6px 18px rgba(2,6,23,0.5) }
.hero-rectangle .hero-grid { align-items: center }
.hero-rectangle .hero-left, .hero-rectangle .hero-center, .hero-rectangle .hero-right { min-height: 96px }

.stat-hero.compact { padding: 14px; border-radius: 10px; background: linear-gradient(135deg, rgba(255,255,255,0.015), rgba(255,255,255,0.005)); box-shadow: 0 14px 40px rgba(2,6,23,0.28); border: 1px solid rgba(255,255,255,0.03) }
.stat-hero.compact .stat-deco { right: -24px; top: -24px; width: 92px; height: 92px }
.stat-hero.compact .stat-content .text-3xl { line-height: 1 }

@media (max-width: 768px) {
  .hero-rectangle .mini-thumb { width: 48px; height: 72px }
  .hero-rectangle { padding: 14px }
}

.progress-wrap { width: 84px; height: 84px }
.progress { width: 84px; height: 84px; transform: rotate(-90deg) }
.progress .bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 3.4 }
.progress .meter { fill: none; stroke: linear-gradient(90deg,#fff,#fff); stroke-width: 3.6; stroke-linecap: round; transition: stroke-dasharray .8s cubic-bezier(.2,.9,.2,1) }
.progress-text { font-size: 7px; fill: rgba(255,255,255,0.95); text-anchor: middle }
.sparkline { width: 100%; height: 32px }
.badges .badge { background: rgba(255,255,255,0.03); color: #fff; padding: 4px 8px; border-radius: 999px; font-size: 12px; border: 1px solid rgba(255,255,255,0.03) }

/* animated background */
.hero-rectangle { animation: bgShift 8s linear infinite }
@keyframes bgShift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }

/* sparkline initial hidden stroke */
.sparkline polyline { stroke-dasharray: 0; stroke-dashoffset: 0 }

.badges .badge { transform-origin: center; transition: transform .18s ease, box-shadow .18s ease }
.badges .badge:hover { transform: translateY(-4px) scale(1.04); box-shadow: 0 10px 26px rgba(2,6,23,0.45) }

.type-stats { margin-top: 6px }
.type-tile { display:flex; gap:10px; align-items:center; padding:10px; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); box-shadow: 0 12px 32px rgba(2,6,23,0.28) }
.type-tile .tile-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.03); border-radius:8px }
.type-tile .tile-body { display:flex; flex-direction:column }
.type-tile .tile-number { font-variant-numeric: tabular-nums }
.type-tile { transform-origin: center; transition: transform .22s ease, box-shadow .22s ease }
.type-tile:hover { transform: translateY(-6px); box-shadow: 0 20px 46px rgba(2,6,23,0.36) }

/* New stat cards styling (clean, professional) */
.hero-header .title { letter-spacing: -0.01em }
.stats-grid { width: 100% }
.stat-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008)); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.03); display:flex; flex-direction:column; gap:8px; box-shadow: 0 12px 30px rgba(2,6,23,0.22); transition: transform .18s ease, box-shadow .18s ease }
.stat-card .card-top { display:flex; align-items:center; gap:12px }
  .stat-card .icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.03); border-radius:9999px }
.stat-card .number { font-size: 1.6rem; font-weight:800; color: #fff; letter-spacing: -0.02em }
.stat-card .label { opacity: 0.85 }
.stat-card:hover { transform: translateY(-6px); box-shadow: 0 22px 48px rgba(2,6,23,0.32) }

/* color accents per card */
.card-users .icon { background: linear-gradient(135deg,#0ea5a4,#06b6d4/60) }
.card-reviews .icon { background: linear-gradient(135deg,#10b981,#f59e0b/40) }
.card-movie .icon { background: linear-gradient(135deg,#7c3aed,#06b6d4/30) }
.card-series .icon { background: linear-gradient(135deg,#fb923c,#f97316/30) }
.card-book .icon { background: linear-gradient(135deg,#60a5fa,#3b82f6/30) }

/* Responsive: make top cards larger on wide screens */
@media (min-width: 1024px) {
  .top-global > * { width: 18rem; height: 26rem }
}

/* Stats card */
.stats-card { padding: 0.5rem } 

/* Stats tile specifics */
.stats-tile { background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); padding: 1rem; border-radius: 0.75rem; box-shadow: 0 10px 30px rgba(2,6,23,0.35) }
.stat-number { font-size: 1.6rem; font-weight: 800 }
.stat-label { color: rgba(255,255,255,0.75); font-size: 0.85rem }
.spark { height: 6px; border-radius: 999px; background: linear-gradient(90deg,#10b981,#f59e0b); margin-top:0.6rem }
.stats-card .text-3xl { letter-spacing: -0.01em }
.stats-card .w-14 { box-shadow: 0 10px 30px rgba(2,6,23,0.45); }
</style>
