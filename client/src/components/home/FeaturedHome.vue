<template>
  <section class="max-w-7xl mx-auto px-4 py-12">
    <div class="pro-hero mb-12 pb-8 border-b border-white/6">
      <div class="hero-rectangle rounded-xl p-6 mb-4" ref="heroRef">
        <div class="hero-grid">
          <div class="hero-header mb-4 flex items-start justify-between">
            <div>
              <div class="title text-lg font-semibold text-white">Estadísticas de la comunidad</div>
              <div class="subtitle text-sm text-white/70">Resumen rápido: usuarios, reseñas y tipos de contenido</div>
            </div>
            <div class="ml-4">
              <template v-if="countsVerified">
                <span class="verified-badge inline-block text-xs px-3 py-1 rounded-full bg-green-600/20 text-green-300 border border-green-600/25" :title="countsCheckedAt ? `Comprobado: ${countsCheckedAt}` : 'Comprobado desde BD'">Comprobado BD</span>
              </template>
            </div>
          </div>

          <div class="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
            <!-- Usuarios -->
            <div class="stat-card card-users">
              <div class="card-top">
                <div class="icon">
                  <UsersIcon class="w-7 h-7" aria-hidden="true" :style="{ color: '#06b6d4' }" />
                </div>
                <div class="number" aria-live="polite">{{ formattedUsers }}</div>
              </div>
              <div class="label text-sm text-white/70">Usuarios activos</div>
            </div>

            <!-- Reseñas -->
            <div class="stat-card card-reviews">
              <div class="card-top">
                <div class="icon">
                  <ChatBubbleLeftRightIcon class="w-7 h-7" aria-hidden="true" :style="{ color: '#10b981' }" />
                </div>
                <div class="number" aria-live="polite">{{ formattedReviews }}</div>
              </div>
              <div class="label text-sm text-white/70">Reseñas publicadas</div>
            </div>

            <!-- Películas -->
            <div class="stat-card card-movie">
              <div class="card-top">
                <div class="icon">
                  <!-- clapperboard (claqueta) solid icon, colored via currentColor -->
                  <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" :style="{ color: '#7c3aed' }">
                    <!-- body -->
                    <path d="M3 9h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                    <!-- top clapper with stripes -->
                    <path d="M2.2 6.2L9 3.2l2 3.6-6.8 3-2-3.6z" opacity="0.98" />
                    <path d="M10.5 4.2l8-3 1 2-8 3-1-2z" opacity="0.98" />
                    <!-- decorative stripe on clapper -->
                    <path d="M4 4.3l2.2-1 1.2 2.2L5.2 6.5 4 4.3z" fill-opacity="0.12" />
                  </svg>
                </div>
                <div class="number" aria-live="polite">{{ formattedMovies }}</div>
              </div>
              <div class="label text-sm text-white/70">Películas</div>
            </div>

            <!-- Series -->
            <div class="stat-card card-series">
              <div class="card-top">
                <div class="icon">
                  <TvIcon class="w-7 h-7" aria-hidden="true" :style="{ color: '#fb923c' }" />
                </div>
                <div class="number" aria-live="polite">{{ formattedSeries }}</div>
              </div>
              <div class="label text-sm text-white/70">Series</div>
            </div>

            <!-- Libros -->
            <div class="stat-card card-book">
              <div class="card-top">
                <div class="icon">
                  <BookOpenIcon class="w-7 h-7" aria-hidden="true" :style="{ color: '#3b82f6' }" />
                </div>
                <div class="number" aria-live="polite">{{ formattedBooks }}</div>
              </div>
              <div class="label text-sm text-white/70">Libros</div>
            </div>
          </div>

          <!-- Verification badge: shown when backend marks stats as computed from DB -->
          <div class="hero-footer mt-4 w-full flex items-center justify-end">
            <div v-if="countsVerified || countsCheckedAt" class="verified-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 text-white text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="opacity-95"><path d="M20 6L9 17l-5-5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Comprobado</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Title separated from stats: more space from stats, closer to the cards below -->
    <div class="mt-6 mb-2">
      <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-2">Top 10 — Mejores valorados</h1>
    </div>

    <div class="w-full mb-6">
      <div class="panel-card rounded-lg p-0 no-outline">
        <div class="relative">
          <template v-if="topGlobalLoading">
            <div class="w-full h-72 flex items-center justify-center text-gray-300">Cargando...</div>
          </template>
          <template v-else>
            <MediaShowcase3D :items="topGlobal.map(mapToCarousel)" />
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import MediaShowcase3D from '@/components/home/MediaShowcase3D.vue'
import MediaCarouselItem from '@/components/ui/MediaCarouselItem.vue'
import MediaShowcase from '@/components/home/MediaShowcase.vue'
import { getGlobalTop } from '@/services/item'
import { getCounts, getUsersCountDirect, getReviewsCountDirect, getItemsCountByType } from '@/services/stats'
// Heroicons solid (used as white filled glyphs inside colored circular backgrounds)
import { UsersIcon, ChatBubbleLeftRightIcon, TvIcon, BookOpenIcon } from '@heroicons/vue/24/solid'

const usersCount = ref<number>(0)
const topGlobal = ref<any[]>([])
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

async function loadAll() {
  try {
    // Prefer a single aggregated counts endpoint that tries multiple server routes
    const countsRes: any = await getCounts()
    // countsRes is handled below
    if (countsRes && typeof countsRes === 'object') {
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
      displayUsers.value = nf.format(usersCount.value || 0)
      displayReviews.value = nf.format(totalReviews.value || 0)
      displayMovies.value = nf.format(moviesTotal.value || 0)
      displaySeries.value = nf.format(seriesTotal.value || 0)
      displayBooks.value = nf.format(booksTotal.value || 0)
      // display values assigned
    } catch (e) {}

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
    const g: any = await getGlobalTop(10)
    topGlobal.value = (g && g.items) ? g.items : []
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
.carousel-btn { background: white; color: #111827; width: 40px; height: 40px; border-radius: 999px; display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px rgba(2,6,23,0.45); }
.carousel-btn:hover { transform: translateY(-1px) scale(1.02) }
.carousel ::v-deep .media-card { transition: transform .25s ease, box-shadow .25s ease }
.carousel ::v-deep .media-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(2,6,23,0.6) }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
.scrollbar-hide::-webkit-scrollbar { display: none }

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
