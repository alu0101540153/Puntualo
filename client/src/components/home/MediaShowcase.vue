<template>
  <div class="showcase" ref="root" @mousemove="onMouseMove" @mouseleave="onLeave">
    <div class="poker-table robot-mode">
      <!-- robot: will walk and place cards -->
      <div class="robot" aria-hidden="true">
        <div class="robot-body">
          <div class="robot-head"></div>
          <div class="robot-eye left"></div>
          <div class="robot-eye right"></div>
          <div class="robot-hand left"><span class="palm"></span></div>
          <div class="robot-hand right"><span class="palm"></span></div>
          <div class="robot-leg left"></div>
          <div class="robot-leg right"></div>
        </div>
      </div>

      <div class="cards-area">
        <div v-for="(it, i) in items.slice(0,5)" :key="it.id || i" class="showcase-card" :data-idx="i">
          <div class="card-inner">
            <div class="card-front poster" :style="bgStyle(it.image)">
              <div class="title">{{ it.title }}</div>
              <div class="rating">{{ it.rating }}</div>
            </div>
            <div class="card-back" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
const props = defineProps<{ items: any[], usersCount?: number, reviewsCount?: number }>()
const usersCount = props.usersCount ?? 0
const reviewsCount = props.reviewsCount ?? 0
const root = ref<HTMLElement | null>(null)
const mouse = ref({ x: 0, y: 0 })
const time = ref(0)
let raf = 0

function onMouseMove(e: MouseEvent) {
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  mouse.value.x = (e.clientX - rect.left) / rect.width - 0.5
  mouse.value.y = (e.clientY - rect.top) / rect.height - 0.5
}
function onLeave() {
  mouse.value.x = 0
  mouse.value.y = 0
}

function bgStyle(url: string) {
  return { backgroundImage: `url('${url || '/img/placeholder-book.png'}')` }
}

function cardStyle(i: number) {
  // placeholder; real positioning handled in RAF loop
  return { transform: `translate3d(0px, 0px, 0) scale(1)` }
}

function loop() {
  time.value += 0.016
  const cards = root.value ? Array.from(root.value.querySelectorAll('.showcase-card')) as HTMLElement[] : []
  // do not run float animation while robot is walking or placing cards
  if (root.value?.classList.contains('robot-walking') || root.value?.classList.contains('robot-placing')) {
    raf = requestAnimationFrame(loop)
    return
  }
  const n = cards.length || 1
  const mid = (n - 1) / 2
  const spacing = Math.min(160, (root.value ? root.value.clientWidth / Math.max(n,1) : 160))

  cards.forEach((c, idx) => {
    const baseX = (idx - mid) * spacing
    const floatY = Math.sin(time.value * 1.4 + idx * 0.6) * 8
    const px = baseX + mouse.value.x * 40
    const py = floatY + mouse.value.y * 20
    const rot = (idx - mid) * 2 + mouse.value.x * (idx - mid) * 3 + Math.sin(time.value + idx) * 0.6
    const scale = 1 + (1 - Math.abs(idx - mid) / Math.max(mid,1)) * 0.06 + Math.abs(Math.sin(time.value + idx)) * 0.01
    // if a shuffle/deal is active we let the deal animation position control the final transform
    if (!root.value?.classList.contains('dealing')) {
      c.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${rot}deg) scale(${scale})`
    }
    c.style.zIndex = String(100 - Math.abs(idx - mid))
    // ensure visible
    c.style.opacity = '1'
  })

  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  // entrance: set initial off-table transform, then stagger show + start loop
  const cards = root.value ? Array.from(root.value.querySelectorAll('.showcase-card')) as HTMLElement[] : []
  cards.forEach((c, i) => {
    // initial 'deck' position (slightly below)
    c.style.opacity = '0'
    c.style.transform = 'translate3d(0,220px,0) rotate(10deg) scale(0.95)'
    c.style.transition = 'opacity 400ms ease, transform 600ms cubic-bezier(.2,.8,.2,1)'
    // keep opacity 0 until robot places the card
  })
  // start a 7s shuffle animation, then animate dealing from the deck: cards come from the deck face-down
  const el = root.value
  if (el) {
    // robot walk + place sequence: start promptly
    el.classList.add('debug-visuals')
    el.classList.add('robot-walking')
    const cards = Array.from(el.querySelectorAll('.showcase-card')) as HTMLElement[]
    // walk duration then start placing
    const walkDuration = 2500
    setTimeout(() => {
      el.classList.remove('robot-walking')
      el.classList.add('robot-placing')
      const rootRect = el.getBoundingClientRect()
      const robotEl = el.querySelector('.robot') as HTMLElement | null
      const robotRect = robotEl ? robotEl.getBoundingClientRect() : { left: rootRect.left + 40, top: rootRect.top + 40, width: 80, height: 80 }
      cards.forEach((c, idx) => {
        // compute robot-relative starting transform for the card
        const centerRootX = rootRect.left + rootRect.width / 2
        const centerRootY = rootRect.top + rootRect.height / 2
        const robotCenterX = robotRect.left + robotRect.width / 2
        const robotCenterY = robotRect.top + robotRect.height / 2
        const startX = robotCenterX - centerRootX
        const startY = robotCenterY - centerRootY
        // apply immediate transform at robot position
        c.style.transition = 'transform 700ms cubic-bezier(.2,.8,.2,1), opacity 400ms ease'
        c.style.transform = `translate3d(${startX}px, ${startY}px, 0) rotate(6deg) scale(0.9)`
        c.style.opacity = '1'

        // after small stagger, compute a distributed target position and animate there
        setTimeout(() => {
          // pick a target position spread across the root area so cards don't cluster
          const rootRect2 = el.getBoundingClientRect()
          const paddingX = Math.max(40, rootRect2.width * 0.08)
          const paddingY = Math.max(40, rootRect2.height * 0.08)
          // evenly spread using index across -40vw..40vw and random small vertical offset
          const pctX = ((idx - 2) / 2) // -2..+2 -> -1..+1
          const targetX = pctX * (rootRect2.width * 0.38) + (Math.random() - 0.5) * (rootRect2.width * 0.08)
          const targetY = (Math.random() - 0.5) * (rootRect2.height * 0.08)
          // ensure the card animates from robot position to target using inline transforms
          const rotate = (idx - 2) * 3 + (Math.random() - 0.5) * 6
          c.style.transition = 'transform 700ms cubic-bezier(.2,.8,.2,1), opacity 400ms ease'
          c.style.transform = `translate3d(${startX}px, ${startY}px, 0) rotate(6deg) scale(0.9)`
          c.style.opacity = '1'
          // trigger robot hand reach
          const hand = el.querySelector(`.robot-hand.${idx % 2 === 0 ? 'left' : 'right'}`) as HTMLElement | null
          if (hand) hand.classList.add('reach')
          // animate to final position (use translate relative to center)
          setTimeout(() => {
            c.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(${rotate}deg) scale(1)`
            c.style.zIndex = String(200 + idx)
            // create and drop a pin at approximate location
            const pin = document.createElement('div')
            pin.className = 'pin'
            const left = rootRect2.width / 2 + targetX
            const top = rootRect2.height / 2 + targetY - 16
            pin.style.left = `${left}px`
            pin.style.top = `${top}px`
            el.appendChild(pin)
            // reveal the front after pin drop
            setTimeout(() => {
              const front = c.querySelector('.card-front') as HTMLElement | null
              const back = c.querySelector('.card-back') as HTMLElement | null
              if (front) front.style.opacity = '1'
              if (back) back.style.opacity = '0'
              pin.classList.add('drop')
              if (hand) setTimeout(() => hand.classList.remove('reach'), 300)
            }, 220)
          }, 120)
        }, idx * 520)
      })
      // leave robot in placing pose briefly
      setTimeout(() => el.classList.remove('robot-placing'), 3000)
    }, walkDuration)
  }
  // log useful debug info. Keep debug visuals until user confirms (manual removal).
  console.log('MediaShowcase mounted', { usersCount, reviewsCount, hasRoot: !!root.value })
  setTimeout(() => { raf = requestAnimationFrame(loop) }, Math.min(140 * (cards.length || 1) + 300, 1000))
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
})

watch(() => props.items, () => {
  // small visual refresh on items change
  time.value = 0
})
</script>

<style scoped>
.showcase { height: 56rem; position: relative; overflow: visible; display:flex; align-items:center; justify-content:center }
.showcase-grid { width: 100%; height: 100%; position: relative; display:flex; align-items:center; justify-content:center }
.showcase-card { width: 14rem; height: 20rem; position: absolute; top: 50%; left: 50%; transform: translate3d(0,0,0); transition: transform 0.2s ease, box-shadow 0.2s ease; will-change: transform }
.showcase-card .poster { width:100%; height:100%; border-radius:0.75rem; overflow:hidden; box-shadow: 0 12px 30px rgba(2,6,23,0.45); background-size:cover; background-position:center; position:relative; border: 2px solid rgba(255,255,255,0.04) }
.showcase-card .rating { position:absolute; left:0.6rem; bottom:0.6rem; background:linear-gradient(90deg,#111827,#111827); color:#ffd54a; padding:0.25rem 0.6rem; border-radius:999px; font-weight:700; font-size:0.85rem }
.showcase-card .title { position:absolute; left:0.6rem; top:0.6rem; right:0.6rem; color:rgba(255,255,255,0.95); font-weight:700; text-shadow: 0 4px 18px rgba(0,0,0,0.6); font-size:0.95rem }
.showcase-card:hover { transform: translate3d(0, -6px, 0) scale(1.05); box-shadow: 0 22px 60px rgba(2,6,23,0.6) }

/* responsive */
@media (max-width: 768px) {
  .showcase { height: 22rem }
  .showcase-card { width: 11.5rem; height: 16rem }
}

/* Poker table styling */
.poker-table { position:relative; width:100%; height:100%; max-width:1200px; margin:0 auto; min-height:760px; background: linear-gradient(180deg,#b58e66,#b9824d); background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0 6px, transparent 6px 12px), linear-gradient(180deg,#b58e66,#b9824d); border-radius:8px }
.poker-table::before { content: ''; position:absolute; inset:0; background: rgba(0,0,0,0.03); border-radius: 8px }
.deck { position:absolute; left:50%; top:6%; width:120px; height:80px; transform:translateX(-50%); background:linear-gradient(180deg,#f6b042,#f97316); border-radius:12px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); opacity:1; z-index:160; display:flex; align-items:center; justify-content:center; color:#081214; font-weight:800 }
.deck::after { content: ''; position:absolute; left:50%; bottom:-10px; width:220px; height:36px; transform:translateX(-50%); background:linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02)); border-radius:8px }
.deck::before { content: 'DECK'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:12px; color:#081214; letter-spacing:1px }


.cards-area { position:absolute; left:50%; top:62%; transform:translate(-50%, -40%); width:100%; height:70%; pointer-events:none; z-index:120 }
.showcase-card { position:absolute; left:50%; top:50%; width:14rem; height:20rem; transform-origin:center bottom; transition: transform 600ms cubic-bezier(.2,.8,.2,1), opacity 400ms ease; will-change:transform; pointer-events:auto }
.card-inner { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition: transform 600ms cubic-bezier(.2,.8,.2,1) }
.cards-area { perspective: 1200px }
.card-front, .card-back { position:absolute; inset:0; border-radius:0.75rem; backface-visibility:hidden; overflow:hidden }
.card-front.poster { border:8px solid #fff; box-shadow: 0 30px 80px rgba(2,6,23,0.6); background-size:cover; background-position:center; }
.card-back { background: repeating-linear-gradient(135deg, #dfe9ec 0px, #dfe9ec 6px, #e9f0f2 6px, #e9f0f2 12px); border:8px solid rgba(0,0,0,0.06); box-shadow: inset 0 2px 6px rgba(0,0,0,0.04); transform:rotateY(0deg); }
.card-front { opacity: 0; transition: opacity 360ms ease }
.card-back { opacity: 1; transition: opacity 360ms ease }
.showcase-card .title { color:#111; background: rgba(255,255,255,0.92); padding:6px 10px; border-radius:8px; font-weight:800; box-shadow: 0 6px 18px rgba(0,0,0,0.18) }
.showcase-card .rating { position:absolute; right:10px; bottom:12px; background:#111827; color:#ffd54a; padding:6px 10px; border-radius:999px; font-weight:700 }

.showcase-card { transform: translate3d(0,220px,0) rotate(10deg) scale(0.95); opacity:0 }
.showcase-card .card-inner.flipped { transform: rotateY(0deg) }
.showcase-card .card-inner { transform: rotateY(180deg) }
.showcase-card .card-back { transform: rotateY(0deg) }
.showcase-card .card-front { transform: rotateY(0deg) }
.showcase-card[style] { /* inline transform used for final position */ }

.showcase-card:hover { transform: translate3d(0,200px,0) scale(1.03); z-index:120 }

@media (max-width: 768px) {
  .showcase { height: 22rem }
  .showcase-card { width: 11.5rem; height: 16rem }
  .chips { right:4% }
  .deck { top:6% }
}

/* Shuffling/dealing animations */
.poker-table.shuffling .deck { transform: translateX(-50%) rotate(4deg) translateY(-6px); animation: deck-shuffle 0.5s ease-in-out infinite }
@keyframes deck-shuffle { 0% { transform: translateX(-50%) rotate(0deg) translateY(0) } 50% { transform: translateX(-50%) rotate(3deg) translateY(-8px) } 100% { transform: translateX(-50%) rotate(0deg) translateY(0) } }

.poker-table.dealing .cards-area .showcase-card:nth-child(1) { transform: translate3d(-260px, 0, 0) rotate(-8deg) }
.poker-table.dealing .cards-area .showcase-card:nth-child(2) { transform: translate3d(-130px, -8px, 0) rotate(-4deg) }
.poker-table.dealing .cards-area .showcase-card:nth-child(3) { transform: translate3d(0px, -12px, 0) rotate(0deg) }
.poker-table.dealing .cards-area .showcase-card:nth-child(4) { transform: translate3d(130px, -8px, 0) rotate(4deg) }
.poker-table.dealing .cards-area .showcase-card:nth-child(5) { transform: translate3d(260px, 0, 0) rotate(8deg) }

/* robot mode placements */
.poker-table.robot-mode .cards-area .showcase-card:nth-child(1) { transform: translate3d(-28vw, 0, 0) rotate(-6deg) }
.poker-table.robot-mode .cards-area .showcase-card:nth-child(2) { transform: translate3d(-14vw, -3vh, 0) rotate(-3deg) }
.poker-table.robot-mode .cards-area .showcase-card:nth-child(3) { transform: translate3d(0vw, -6vh, 0) rotate(0deg) }
.poker-table.robot-mode .cards-area .showcase-card:nth-child(4) { transform: translate3d(14vw, -3vh, 0) rotate(3deg) }
.poker-table.robot-mode .cards-area .showcase-card:nth-child(5) { transform: translate3d(28vw, 0, 0) rotate(6deg) }

/* robot visuals */
.robot { position:absolute; left:8%; top:10%; width:92px; height:120px; z-index:180; pointer-events:none; transform-origin:center; transition: transform 400ms }
.robot .robot-body { width:90px; height:110px; background:linear-gradient(180deg,#e6eef2,#c7d8de); border-radius:12px; position:relative; display:flex; align-items:center; justify-content:center }
.robot .robot-head { position:absolute; top:8px; left:50%; transform:translateX(-50%); width:42px; height:36px; background:#f3f7f8; border-radius:8px }
.robot .robot-eye { position:absolute; top:18px; width:6px; height:6px; background:#0b3a20; border-radius:50% }
.robot .robot-eye.left { left:34% }
.robot .robot-eye.right { left:64% }
.robot .robot-leg { position:absolute; bottom:-6px; width:12px; height:18px; background:#9aa7ab; border-radius:4px }
.robot .robot-leg.left { left:28% }
.robot .robot-leg.right { left:60% }

/* walking animation */
.robot-walking .robot { animation: robot-walk 2.5s linear forwards }
@keyframes robot-walk {
  0% { transform: translate3d(0,0,0) rotate(0deg) }
  25% { transform: translate3d(calc(15vw), -6vh, 0) rotate(-6deg) }
  50% { transform: translate3d(calc(28vw), 3vh, 0) rotate(4deg) }
  75% { transform: translate3d(calc(18vw), -2vh, 0) rotate(-3deg) }
  100% { transform: translate3d(calc(50vw - 180px), 0, 0) rotate(0deg) }
}

.robot-placing .robot { transform: translateX(calc(50vw - 180px)) scale(0.98) }

/* robot hands */
.robot-hand { position:absolute; width:34px; height:40px; bottom:18px; background:#dfe8ea; border-radius:8px; display:flex; align-items:center; justify-content:center; transform-origin:top center; transition: transform 300ms }
.robot-hand.left { left:6px }
.robot-hand.right { right:6px }
.robot-hand .palm { width:18px; height:14px; background:#b7c7c9; border-radius:6px }
.robot-hand.reach { transform: translateY(-60px) rotate(-12deg) }
.robot-hand.right.reach { transform: translateY(-60px) rotate(12deg) }

/* pins */
.pin { position:absolute; width:12px; height:12px; background: radial-gradient(circle at 35% 30%, #fff, #f2c9c9 20%, #d94b4b 60%); border-radius:50%; transform: translate(-50%, -50%) scale(0); box-shadow: 0 4px 10px rgba(0,0,0,0.25); z-index:220; transition: transform 300ms cubic-bezier(.2,.8,.2,1) }
.pin.drop { transform: translate(-50%, -50%) scale(1) }

/* when placed, card has final transform and flip is triggered via .card-inner.flipped */
.showcase-card.placed { opacity:1 }

/* when a card has been dealt we set pointer-events none on the card and ensure the inner is ready to flip */
.showcase-card.dealt { pointer-events:auto; opacity:1 }

/* debug visuals already set earlier */

/* dealer hand (gloved) overlay */
.poker-table::after { content:''; position:absolute; left:50%; top:14%; width:320px; height:180px; transform:translateX(-50%); background-image: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.02), transparent 20%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Cg fill='%23ffffff'%3E%3Crect rx='14' x='10' y='30' width='80' height='30'/%3E%3Ccircle cx='30' cy='24' r='8'/%3E%3Ccircle cx='46' cy='20' r='8'/%3E%3Ccircle cx='62' cy='18' r='8'/%3E%3Ccircle cx='78' cy='22' r='8'/%3E%3C/g%3E%3C/svg%3E"); background-size:contain; background-repeat:no-repeat; background-position:center; opacity:0; pointer-events:none; transition: opacity 300ms; z-index:150 }
.poker-table.shuffling::after { opacity:0.98 }
.poker-table.dealing::after { opacity:0 }

/* Debug visuals: outlines and stronger overlay (temporary) */
/* debug visuals removed: user reports violet outline is distracting */
</style>
