<template>
  <div>
    <DashboardHeader />
    <main class="min-h-screen px-6 py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
      <div class="page-wrap mx-auto rounded-2xl p-8">
    <!-- Hero -->
    <section class="max-w-6xl mx-auto text-center mb-12">
      <p class="text-sm text-emerald-300 font-medium tracking-widest">ABOUT US</p>
      <h1 class="mt-4 text-4xl md:text-6xl font-extrabold text-white leading-tight">Somos el equipo que hace posible Puntúalo</h1>
      <p class="mt-4 text-gray-300 max-w-3xl mx-auto">Diseñamos y desarrollamos experiencias para descubrir, puntuar y compartir tus contenidos favoritos</p>
      <p class="mt-2 text-gray-300 max-w-3xl mx-auto italic">"Pequeño equipo — grandes ideas."</p>

      <!-- hero CTAs removed per request -->
    </section>

    <!-- Decorative grid / pattern -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 gap-10">
      <!-- Team cards (transparent container - removed blue background) -->
      <section id="equipo" class="rounded-2xl p-6 about-section">
        <h2 class="text-2xl font-bold text-white mb-4">Nuestro equipo</h2>
        <p class="text-gray-300 mb-6">Un equipo multidisciplinar centrado en calidad, privacidad y experiencia de usuario.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Adrian -->
          <article class="p-6 rounded-xl about-card reveal-item">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold" style="background:linear-gradient(135deg,#06b6d4,#14b8a6)">A</div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white">Adrian Leon Diaz</h3>
                <p class="text-sm text-gray-300">Desarrollador Fullstack — Coordinador técnico</p>
              </div>
            </div>
            <p class="mt-4 text-gray-300 text-sm">Adrián lidera la integración frontend-backend, optimiza rendimiento y vela por una experiencia fluida en la plataforma.</p>
          </article>

          <!-- Víctor -->
          <article class="p-6 rounded-xl about-card reveal-item">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">V</div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white">Víctor Rodríguez Dortay</h3>
                <p class="text-sm text-gray-300">Ingeniero Backend — Arquitectura y APIs</p>
              </div>
            </div>
            <p class="mt-4 text-gray-300 text-sm">Víctor diseña y mantiene la arquitectura del servidor, asegura integridad de datos y APIs robustas para la comunidad.</p>
          </article>

          <!-- Saray -->
          <article class="p-6 rounded-xl about-card reveal-item">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold" style="background:linear-gradient(135deg,#fb7185,#f43f5e)">S</div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white">Saray Garcia Campos</h3>
                <p class="text-sm text-gray-300">Diseño & Calidad — UX/UI</p>
              </div>
            </div>
            <p class="mt-4 text-gray-300 text-sm">Saray vela por la consistencia visual, accesibilidad y pruebas de usabilidad que mantienen la plataforma amigable.</p>
          </article>
        </div>
      </section>

      <!-- Mission / Values -->
      <section class="bg-transparent mt-4 reveal-item mission-section">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="col-span-2 rounded-xl p-6 mission-card reveal-item">
            <h2 class="text-2xl font-bold text-white mb-2">Nuestra misión</h2>
            <p class="text-gray-300 mb-4">Construir una comunidad donde descubrir y valorar contenido sea simple, confiable y divertida. Priorizamos calidad, privacidad y rapidez en cada interacción.</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 class="text-white font-semibold">Calidad</h4>
                <p class="text-gray-300 text-sm">Reseñas útiles, datos correctos y una interfaz clara.</p>
              </div>
              <div>
                <h4 class="text-white font-semibold">Privacidad</h4>
                <p class="text-gray-300 text-sm">Protegemos la información de nuestros usuarios.</p>
              </div>
              <div>
                <h4 class="text-white font-semibold">Innovación</h4>
                <p class="text-gray-300 text-sm">Buscamos nuevas formas de ayudarte a encontrar lo que amarás.</p>
              </div>
            </div>
          </div>

          <aside class="rounded-xl p-6 partner-card reveal-item">
            <h3 class="text-white font-semibold mb-2">¿Quieres colaborar?</h3>
            <p class="text-gray-300 text-sm mb-4">Si te interesa colaborar o tienes feedback, contáctanos y estaremos encantados de hablar.</p>
            <div class="flex gap-2">
              <a class="inline-block px-4 py-2 rounded-full bg-emerald-400 text-black font-semibold" href="#">Contactar</a>
              <a class="inline-block px-4 py-2 rounded-full text-white/90" href="#">Soporte</a>
            </div>
          </aside>
        </div>
      </section>

      <!-- Stats -->
      <section class="mt-6 rounded-xl p-6 stats-section">
        <h2 class="text-2xl text-white font-bold mb-4">Estadísticas</h2>
        <p class="text-gray-300 mb-4">Impacto de la comunidad en números (actualizados en tiempo real).</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="p-6 rounded-lg stat-card">
            <div class="text-4xl font-extrabold text-white stat-number" data-count="12458">0</div>
            <div class="text-sm text-gray-300">Usuarios registrados</div>
          </div>
          <div class="p-6 rounded-lg stat-card">
            <div class="text-4xl font-extrabold text-white stat-number" data-count="84231">0</div>
            <div class="text-sm text-gray-300">Reseñas publicadas</div>
          </div>
          <div class="p-6 rounded-lg stat-card">
            <div class="text-4xl font-extrabold text-white stat-number" data-count="15342">0</div>
            <div class="text-sm text-gray-300">Items catalogados</div>
          </div>
        </div>
      </section>

      <!-- Projects / Highlights -->
      <section class="mt-6 rounded-xl p-6 projects-section">
        <h2 class="text-2xl text-white font-bold mb-4">Proyectos destacados</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article class="p-4 rounded-lg project-card reveal-item">
            <h3 class="text-white font-semibold">Buscador avanzado</h3>
            <p class="text-gray-300 text-sm mt-2">Mejora en relevancia y filtros por preferencia, publicada recientemente.</p>
          </article>
          <article class="p-4 rounded-lg project-card reveal-item">
            <h3 class="text-white font-semibold">Sistema de recomendaciones</h3>
            <p class="text-gray-300 text-sm mt-2">Modelo de recomendaciones mejorado para sugerencias más personales.</p>
          </article>
          <article class="p-4 rounded-lg project-card reveal-item">
            <h3 class="text-white font-semibold">Integraciones</h3>
            <p class="text-gray-300 text-sm mt-2">Conectores para importar listas y sincronizar valoraciones.</p>
          </article>
        </div>
      </section>
      <!-- FAQ removed per request -->
    </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'

// reveal-on-scroll + stat counters
onMounted(() => {
  if (typeof window === 'undefined') return

  const revealEls = Array.from(document.querySelectorAll('.reveal-item')) as HTMLElement[]
  const statEls = Array.from(document.querySelectorAll('.stat-number')) as HTMLElement[]

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement
      if (e.isIntersecting) {
        el.classList.add('is-visible')
        // if it's a stat number, animate it
        if (el.classList.contains('stat-number')) {
          const target = Number(el.dataset.count || el.textContent || 0)
          animateCount(el, target)
        }
      }
    }
  }, { threshold: 0.12 })

  revealEls.forEach(el => io.observe(el))
  statEls.forEach(el => io.observe(el))

  function animateCount(node: HTMLElement, to: number) {
    if (!to || node.dataset.animated) return
    node.dataset.animated = 'true'
    const duration = 1100
    const start = performance.now()
    const from = 0
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const val = Math.floor(from + (to - from) * eased)
      node.textContent = new Intl.NumberFormat('es-ES').format(val)
      if (t < 1) requestAnimationFrame(tick)
      else node.textContent = new Intl.NumberFormat('es-ES').format(to)
    }
    requestAnimationFrame(tick)
  }

  onUnmounted(() => { try { io.disconnect() } catch {} })
})
</script>

<style scoped>
.bg-white\/3 { background-color: rgba(255,255,255,0.03); }
.bg-white\/4 { background-color: rgba(255,255,255,0.04); }
.team-initial { width: 56px; height: 56px; border-radius: 9999px; display:flex; align-items:center; justify-content:center; font-weight:700 }

/* Reveal animation */
.reveal-item { opacity: 0; transform: translateY(12px) scale(0.995); transition: opacity .6s ease, transform .6s cubic-bezier(.2,.9,.2,1); }
.reveal-item.is-visible { opacity: 1; transform: translateY(0) scale(1); }

/* Stagger using nth-child for team cards */
.reveal-item:nth-child(1) { transition-delay: 0.06s }
.reveal-item:nth-child(2) { transition-delay: 0.12s }
.reveal-item:nth-child(3) { transition-delay: 0.18s }

/* Card hover */
article.p-6:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 30px 60px rgba(2,6,23,0.45); transition: transform .2s ease, box-shadow .2s ease }

/* Small decorative animation for hero heading */
h1 { animation: heroPop 700ms cubic-bezier(.2,.9,.2,1) both }
@keyframes heroPop { from { transform: translateY(-6px) scale(.995); opacity: 0 } to { transform: translateY(0) scale(1); opacity:1 } }

/* About page specific */
.about-section { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding: 1.25rem; }
.about-card { background: rgba(10,11,13,0.36); box-shadow: 0 10px 30px rgba(2,6,23,0.35); }
.about-card h3 { color: #ffffff; }
.mission-card { background: rgba(10,11,13,0.26); }
.partner-card { background: rgba(10,11,13,0.18); }
.stat-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); box-shadow: 0 10px 30px rgba(2,6,23,0.18); text-align: left }
.stat-card .stat-number { color: #fff; }
.project-card { background: rgba(255,255,255,0.02); }

.about-card, .mission-card, .partner-card, .project-card { transition: transform .18s ease, box-shadow .18s ease }
.about-card:hover, .project-card:hover { transform: translateY(-6px); box-shadow: 0 26px 46px rgba(2,6,23,0.38) }

/* Page wrap: subtle top->bottom gradient and rounded corners */
.page-wrap { background: transparent; border-radius: 0; border: none; box-shadow: none; }
.page-wrap { padding: 2rem; }
.page-wrap { overflow: visible; }

</style>

