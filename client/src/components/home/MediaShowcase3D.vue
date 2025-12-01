<template>
  <div ref="wrap" class="media-showcase-3d" aria-hidden="false">
    <div v-if="!webglSupported" class="fallback">Tu navegador no soporta WebGL</div>
    <!-- Debug overlay removed per request -->
  </div>

  <!-- DOM fallback grid: always visible when there are items so the Top-10 is guaranteed to render -->
  <div class="fallback-grid" v-if="propsItems && propsItems.length">
    <div class="grid-row top-row">
      <div v-for="(it, idx) in propsItems.slice(0,5)" :key="'t'+idx" class="card-wrap" :style="{ '--i': idx }">
        <img :src="it.image || '/img/placeholder-book.png'" :alt="it.title || 'Portada'" />
      </div>
    </div>
    <div class="grid-row bottom-row">
      <div v-for="(it, idx) in propsItems.slice(5,10)" :key="'b'+idx" class="card-wrap" :style="{ '--i': (idx + 5) }">
        <img :src="it.image || '/img/placeholder-book.png'" :alt="it.title || 'Portada'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import * as THREE from 'three'

const props = defineProps<{ items?: Array<any> }>()
// expose items for template fallback grid
const propsItems = props.items || []

const wrap = ref<HTMLElement | null>(null)
const webglSupported = typeof window !== 'undefined' && !!(window as any).WebGLRenderingContext
const loadMessages = ref<string[]>([])

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let rafId: number | null = null
let clock = new THREE.Clock()
let gsapLib: any = null

// core init that sets up scene, cards and animations (no robot)
async function init() {
  loadMessages.value.push('Initializing 3D showcase (cards-only)')

  // try dynamic import of GSAP for nicer animations
  try {
    const mod = await import('gsap')
    gsapLib = mod?.default || mod
    loadMessages.value.push('GSAP loaded — using smoother animations')
  } catch (e) {
    loadMessages.value.push('GSAP not available — using fallback timing animations')
  }

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 100)
  camera.position.set(0, 1.0, 4.5)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setClearColor(0x000000, 0) // transparent

  // make sure the canvas fills the container
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  if (wrap.value) wrap.value.appendChild(renderer.domElement)

  const ambient = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0xffffff, 0.6)
  dir.position.set(5, 10, 7)
  scene.add(dir)

    // create cards for Top-10 (first 5 floating row, next 5 below)
    const texLoader = new THREE.TextureLoader()
    const cardMeshes: THREE.Mesh[] = []
    const targets: THREE.Vector3[] = []

    const count = Math.min(10, props.items?.length || 0)
    const spacing = 1.2
    const leftStart = -((Math.min(5, count) - 1) * spacing) / 2
    for (let i = 0; i < count; i++) {
      const url = props.items![i]?.image || '/img/placeholder-book.png'
      const tex = texLoader.load(url)
      tex.encoding = THREE.sRGBEncoding
      // use MeshBasicMaterial so posters are visible even if lighting/texture load has issues
      const matFront = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff })
      const geo = new THREE.PlaneGeometry(1.6, 2.2)
      const mesh = new THREE.Mesh(geo, matFront)
      mesh.rotation.y = Math.PI

      // compute target positions: first row (i 0..4) higher (floating), second row (i 5..9) lower
      if (i < 5) {
        const x = leftStart + i * spacing
        const y = 1.25 + (i % 2) * 0.03
        const z = -0.6 + (Math.random() - 0.5) * 0.06
        mesh.position.set(x, y, z)
        // floating params
        mesh.userData = { float: { baseY: y, amp: 0.08 + Math.random() * 0.04, speed: 0.9 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2 } }
      } else {
        const idx = i - 5
        const x = leftStart + idx * spacing
        const y = 0.2 + (idx % 2) * 0.02
        const z = -0.4 + (Math.random() - 0.5) * 0.06
        mesh.position.set(x, y, z)
        // subtle float for lower row too (smaller amplitude)
        mesh.userData = { float: { baseY: y, amp: 0.04 + Math.random() * 0.02, speed: 0.8 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2 } }
      }

      mesh.visible = true
      mesh.scale.set(1.05, 1.05, 1.05)
      scene.add(mesh)
      cardMeshes.push(mesh)
      targets.push(mesh.position.clone())
    }

  // Place cards statically (no animation) — show final front material and labels immediately
    // ensure cards are in final positions and apply a subtle floating motion in render loop
    for (let i = 0; i < cardMeshes.length; i++) {
      const mesh = cardMeshes[i]
      mesh.scale.set(1, 1, 1)
    }

  // responsive sizing
  function resize() {
    if (!wrap.value || !renderer || !camera) return
    const w = wrap.value.clientWidth || 800
    const h = wrap.value.clientHeight || 520
    // update drawing buffer and canvas CSS size so the canvas is visible
    renderer.setSize(w, h, true)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  let ro: ResizeObserver | null = null
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    ro = new ResizeObserver(resize)
    if (wrap.value) ro.observe(wrap.value)
  } else {
    window.addEventListener('resize', resize)
  }

  function render() {
    if (!renderer || !scene || !camera) return
    const t = clock.getElapsedTime()
    // animate subtle floating per-card
    for (const m of cardMeshes) {
      const f = (m.userData && m.userData.float) || null
      if (f) {
        const off = Math.sin(t * f.speed + f.phase) * f.amp
        m.position.y = f.baseY + off
      }
    }
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(render)
  }

  resize()
  render()

  // cards are already placed statically — no animation kickoff

  // cleanup helper bound in closure
  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    try { ro && ro.disconnect() } catch (e) {}
    try { window.removeEventListener('resize', resize) } catch (e) {}
    if (renderer) {
      try { renderer.forceContextLoss(); renderer.domElement && renderer.domElement.remove(); renderer.dispose() } catch (e) {}
    }
  })
}

onMounted(() => {
  if (!webglSupported) return
  nextTick().then(() => init())
})
</script>

<style scoped>
.media-showcase-3d { width: 100%; height: 240px; position: relative; }
.media-showcase-3d .fallback { color: #fff; padding: 2rem }
.media-showcase-3d .load-overlay {
  position: absolute;
  right: 12px;
  top: 12px;
  background: rgba(0,0,0,0.45);
  color: #fff;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 320px;
}
.media-showcase-3d .load-overlay ul { margin: 6px 0 0; padding-left: 16px }
.media-showcase-3d .load-overlay li { margin-bottom: 4px; opacity: 0.95 }

.media-showcase-3d canvas { display: none; }
.fallback-grid { --card-w: 160px; --gap: 1.6rem; position: relative; /* expand to escape parent padding so cards align with page title underline */ width: calc(100% + 2rem); max-width: none; margin: 0 -1rem; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 10; pointer-events: auto; transform: translateY(-120px); padding: 0 1rem }
.fallback-grid .grid-row { display: flex; justify-content: space-between; flex-wrap: nowrap; gap: var(--gap); padding: 0.4rem 1rem; width: 100%; margin: 0 }
.fallback-grid .card-wrap { width: var(--card-w); aspect-ratio: 2 / 3; display:flex; align-items:center; justify-content:center }
.fallback-grid .card-wrap img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; box-shadow: 0 24px 74px rgba(2,6,23,0.45); display:block }
.fallback-grid .top-row { margin-bottom: 1.6rem }
.fallback-grid .bottom-row { margin-top: 0 }

/* continuous floating animation + small entrance fade */
.fallback-grid .card-wrap { opacity: 0; transform: translateY(6px) }
.fallback-grid .card-wrap { animation: cardEnter 420ms cubic-bezier(.2,.9,.2,1) forwards; animation-delay: calc(var(--i) * 70ms) }
.fallback-grid .card-wrap img { transition: transform .22s ease, box-shadow .22s ease; animation: floatAnim 4s ease-in-out infinite; animation-delay: calc(var(--i) * -0.12s) }
.fallback-grid .card-wrap:hover img { transform: translateY(-10px) scale(1.06); box-shadow: 0 32px 54px rgba(2,6,23,0.6) }

@keyframes cardEnter { to { opacity: 1; transform: translateY(0) } }
@keyframes floatAnim { 0% { transform: translateY(0) } 50% { transform: translateY(-12px) } 100% { transform: translateY(0) } }

/* Responsive: allow wrap and smaller cards on narrow screens */
@media (max-width: 1200px) {
  .fallback-grid { --card-w: 140px; --gap: 1rem; width: calc(100% + 2rem); margin: 0 -1rem }
  .fallback-grid .grid-row { width: 100%; flex-wrap: wrap; gap: 0.9rem; padding: 0.4rem 1rem }
  .media-showcase-3d { height: auto }
}

@media (min-width: 1400px) {
  .fallback-grid { --card-w: 180px; --gap: 1.8rem }
}
</style>
