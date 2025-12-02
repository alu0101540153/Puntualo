<template>
  <div
    class="carousel-item min-w-[180px] md:min-w-[200px] relative cursor-pointer transition-transform duration-300 hover:scale-105"
    role="button"
    tabindex="0"
    @click="$emit('select', item)"
    @keyup.enter="$emit('select', item)"
    :aria-label="`Abrir detalles de ${item.title || 'ítem'}`"
  >
    <div class="item-poster w-full h-80 bg-cover bg-center rounded-xl shadow-xl relative overflow-hidden" :style="imageStyle(item.image)">
      <div v-if="item.rank" class="absolute top-3 left-3 flex items-center justify-center">
        <div :class="['rank-badge', item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? 'bronze' : '']">
          <span class="rank-text">{{ item.rank }}º</span>
        </div>
      </div>
      <div v-if="showBadge" class="media-badge absolute top-3 right-3 w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-lg">
        {{ item.type }}
      </div>
          <div class="absolute bottom-3 right-3 flex items-center gap-2">
            <div class="item-rating bg-black bg-opacity-80 text-yellow-400 px-3 py-2 rounded-full font-bold text-sm">{{ item.rating }}</div>
            <button
              v-if="showWishlist"
              class="wishlist-btn w-10 h-10 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center text-white"
              @click.stop="onAddWishlist"
              :aria-label="`Añadir ${item.title || 'ítem'} a deseados`"
              title="Añadir a deseados"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Importación dinámica de imágenes y soporte para URLs absolutas
const importImage = (imageName: string) => {
  return new URL(`../../assets/imagenes/${imageName}`, import.meta.url).href
}

const imageStyle = (imageName: string) => {
  if (!imageName) return { backgroundImage: "url('/img/placeholder-book.png')" }
  // if it's an absolute url or starts with / use it directly
  if (typeof imageName === 'string' && (imageName.startsWith('http') || imageName.startsWith('/') || imageName.includes('://'))) {
    return { backgroundImage: `url('${imageName}')` }
  }
  try {
    return { backgroundImage: `url('${importImage(imageName)}')` }
  } catch (e) {
    // fallback to direct usage
    return { backgroundImage: `url('${imageName}')` }
  }
}

const props = defineProps<{
  item: {
    id: number | string
    image: string
    rating: string
    type: string
    title?: string
    detailId?: string | number
  },
  showBadge?: boolean,
  showWishlist?: boolean
}>()

// default for showWishlist: true when not provided
const showWishlist = (props.showWishlist === undefined) ? true : Boolean(props.showWishlist)
// expose showBadge with default true (keeps previous behavior)
const showBadge = (props.showBadge === undefined) ? true : Boolean(props.showBadge)
// expose item for template convenience
const item = props.item

// declare emits for TypeScript
defineEmits<{
  (e: 'select', payload: any): void
}>()

import { getUser } from '@/services/auth'
import { addItemToUser } from '@/services/user'
import { success as notifySuccess, error as notifyError } from '@/services/notify'
import { useRouter } from 'vue-router'

const router = useRouter()

async function onAddWishlist(e?: Event) {
  try {
    const me = getUser()
    if (!me || !me._id) {
      // redirect to login if not authenticated
      router.push({ name: 'login' })
      return
    }

    const userId = me._id || me.id
    // payload: itemId, itemType, title
    const payload = {
      itemId: item.id || item.detailId || item.id,
      itemType: (item.type && String(item.type)) || 'item',
      title: item.title || ''
    }

    await addItemToUser(String(userId), payload)
    notifySuccess('Añadido a tus deseados')
  } catch (err: any) {
    console.error('Error añadiendo a wishlist', err)
    notifyError(err?.message || 'No se pudo añadir a deseados')
  }
}
</script>

<style scoped>
.rank-badge { display:flex; align-items:center; justify-content:center; border-radius:9999px; box-shadow: 0 10px 26px rgba(2,6,23,0.25); background: rgba(255,255,255,0.95); color: #111; width:36px; height:36px; font-weight:700; font-size:0.85rem }
.rank-badge .rank-text { line-height:1 }
.rank-badge.gold { background: linear-gradient(135deg,#FFD54A,#D4AF37); color: #111; width:52px; height:52px; font-size:1rem }
.rank-badge.silver { background: linear-gradient(135deg,#e6e7e8,#c0c0c0); color: #111; width:46px; height:46px; font-size:0.95rem }
.rank-badge.bronze { background: linear-gradient(135deg,#c78659,#cd7f32); color: #fff; width:46px; height:46px; font-size:0.95rem }
</style>

<style scoped>
.rank-badge { box-shadow: 0 8px 20px rgba(2,6,23,0.25); }
</style>