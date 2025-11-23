<template>
  <div class="relative">
    <button class="carousel-btn btn-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollCarousel(-1)">
      ‹
    </button>

    <div class="carousel flex gap-6 overflow-x-auto scroll-smooth py-3 scrollbar-hide" id="carousel" ref="carousel">
      <MediaCarouselItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        @select="onSelect"
      />
    </div>

    <button class="carousel-btn btn-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 border-none w-10 h-10 md:w-12 md:h-12 rounded-full text-xl cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white hover:scale-110 shadow-lg z-10 text-gray-700" @click="scrollCarousel(1)">
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MediaCarouselItem from '@/components/ui/MediaCarouselItem.vue'
import { getMyRatings } from '@/services/user'
import { getUser } from '@/services/auth'

const props = defineProps<{ userId?: string; ratings?: any[] }>()
const items = ref<any[]>([])
const carousel = ref<HTMLElement | null>(null)
const router = useRouter()

function scrollCarousel(direction: number) {
  if (carousel.value) {
    const scrollAmount = 240 // matches MediaCarousel item width
    carousel.value.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }
}

function getCover(r: any) {
  return (r.itemId && r.itemId.data && r.itemId.data.cover) || r.itemId?.image || r.cover || '/img/placeholder-book.png'
}

function getTypeEmoji(r: any) {
  const t = (r.itemId && (r.itemId.type || r.itemId.data?.type)) || r.type || ''
  if (!t) return '🎬'
  const low = String(t).toLowerCase()
  if (low.includes('book') || low.includes('lib') || low.includes('book')) return '📚'
  if (low.includes('film') || low.includes('movie') || low.includes('pel') || low.includes('cine')) return '🎬'
  if (low.includes('serie') || low.includes('tv') || low.includes('show')) return '📺'
  return '🎞️'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || r.itemId.data?.title)) || r.title || 'Sin título'
}

async function loadFinished() {
  // allow passing ratings array directly via props.ratings for reuse
  if (props.ratings && Array.isArray(props.ratings)) {
    normalizeAndSet(props.ratings)
    return
  }

  const uid = props.userId || (getUser() && getUser()._id)
  if (!uid) {
    items.value = []
    return
  }

  try {
    const data: any[] = (await getMyRatings(uid)) || []
    // normalize to latest per item
    const map = new Map<string, any>()
    for (const entry of data) {
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
    // filter those completed/terminado
    const completed = latest.filter((x: any) => {
      const s = (x.status || '').toString().toLowerCase()
      return s === 'completed' || s === 'terminado' || s === 'finished'
    })

    // map to items expected by MediaCarouselItem
    items.value = completed.map((r: any, idx: number) => ({
        id: r._id || idx,
        detailId: r.itemId?._id || r.itemId?.id || r._id,
      image: getCover(r),
      rating: r.score ? `${r.score}/10` : '-/10',
      type: getTypeEmoji(r),
      title: getTitle(r)
    }))
  } catch (e) {
    console.error('Error cargando vistos terminados', e)
    items.value = []
  }
}

function normalizeAndSet(data: any[]) {
  const map = new Map<string, any>()
  for (const entry of data) {
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
  const completed = latest.filter((x: any) => {
    const s = (x.status || '').toString().toLowerCase()
    return s === 'completed' || s === 'terminado' || s === 'finished'
  })
  items.value = completed.map((r: any, idx: number) => ({
    id: r._id || idx,
    detailId: r.itemId?._id || r.itemId?.id || r._id,
    image: getCover(r),
    rating: r.score ? `${r.score}/10` : '-/10',
    type: getTypeEmoji(r),
    title: getTitle(r)
  }))
}

onMounted(() => {
  loadFinished()
  window.addEventListener('ratingsChanged', loadFinished)
})

watch(() => props.userId, () => {
  loadFinished()
})
watch(() => props.ratings, () => {
  if (props.ratings) normalizeAndSet(props.ratings)
})
function onSelect(selected: any) {
  const id = selected?.detailId || selected?.id
  if (!id) return
  router.push({ name: 'item-detail', params: { id: String(id) } })
}
</script>

<style scoped>
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
