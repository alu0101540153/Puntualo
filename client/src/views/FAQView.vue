<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
    <DashboardHeader />
    <main class="max-w-5xl mx-auto px-6 py-16">
      <section class="bg-white/5 rounded-2xl p-8 shadow-lg">
        <h1 class="text-3xl font-extrabold text-white mb-2">Preguntas Frecuentes</h1>
        <p class="text-gray-300 mb-6">Respuestas a las dudas más habituales — preguntas inventadas a modo de ejemplo.</p>

        <div class="space-y-6">
          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300 font-semibold">A.M.</div>
              <div>
                <div class="text-white font-semibold">¿Cómo puedo recuperar mi contraseña?</div>
                <div class="text-gray-300 mt-2">Pulsa en 'Login' y selecciona "Olvidé mi contraseña". Te enviaremos un enlace para restablecerla al correo asociado a tu cuenta.</div>
              </div>
            </div>
          </article>

          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-pink-400/20 flex items-center justify-center text-pink-300 font-semibold">M.R.</div>
              <div>
                <div class="text-white font-semibold">¿Cómo edito o elimino una reseña que publiqué?</div>
                <div class="text-gray-300 mt-2">Ve a tu perfil, entra en 'Mis reseñas', localiza la reseña y usa los botones de editar o eliminar.</div>
              </div>
            </div>
          </article>

          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-300 font-semibold">C.L.</div>
              <div>
                <div class="text-white font-semibold">¿Cómo puedo sugerir una mejora o reportar un bug?</div>
                <div class="text-gray-300 mt-2">Usa el enlace 'Soporte' en el footer para enviarnos un mensaje o escribe directamente a soporte@puntualo.example (ejemplo de correo).</div>
              </div>
            </div>
          </article>

          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-semibold">S.P.</div>
              <div>
                <div class="text-white font-semibold">¿Puedo importar mis listas desde otra plataforma?</div>
                <div class="text-gray-300 mt-2">Estamos trabajando en integraciones: ve a 'Integraciones' en tu perfil para ver las opciones de importación disponibles actualmente.</div>
              </div>
            </div>
          </article>

          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-indigo-400/20 flex items-center justify-center text-indigo-300 font-semibold">T.J.</div>
              <div>
                <div class="text-white font-semibold">¿Cómo se calculan las puntuaciones de los items?</div>
                <div class="text-gray-300 mt-2">Las puntuaciones se calculan agregando las valoraciones de los usuarios y aplicando un algoritmo que favorece reseñas recientes y con confianza. Estamos trabajando para publicar detalles técnicos próximamente.</div>
              </div>
            </div>
          </article>

          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-rose-400/20 flex items-center justify-center text-rose-300 font-semibold">L.F.</div>
              <div>
                <div class="text-white font-semibold">¿Puedo eliminar mi cuenta y mis datos?</div>
                <div class="text-gray-300 mt-2">Sí. Ve a 'Editar perfil' y encontrarás la opción para eliminar tu cuenta. Si necesitas asistencia, contacta con soporte para proceder con la verificación.</div>
              </div>
            </div>
          </article>

          <article class="bg-transparent p-4 rounded-lg border border-white/6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-sky-400/20 flex items-center justify-center text-sky-300 font-semibold">R.G.</div>
              <div>
                <div class="text-white font-semibold">¿Hay app móvil disponible?</div>
                <div class="text-gray-300 mt-2">Actualmente estamos desarrollando aplicaciones móviles. Mientras tanto, la web es responsive y funciona en la mayoría de móviles.</div>
              </div>
            </div>
          </article>

        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
</script>

<style scoped>
/* Small FAQ styles */
</style>
