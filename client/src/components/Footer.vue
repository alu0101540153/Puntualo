<template>
  <footer class="mt-12 bg-white text-black relative z-50" style="background-color: #f7fafc; color: #000;">
    <div class="max-w-7xl mx-auto px-8 py-14">
      <!-- top: three columns like the example image -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <!-- left: legal links -->
        <div class="flex flex-col gap-2 text-sm text-black">
          <router-link to="/legal-warning" class="hover:text-gray-700">Legal Warning</router-link>
          <router-link to="/privacy" class="hover:text-gray-700">Privacy Policy</router-link>
          <router-link to="/cookies" class="hover:text-gray-700">Cookies Policy</router-link>
          <router-link to="/quality" class="hover:text-gray-700">Quality Policy</router-link>
        </div>

        <!-- center: logo + social -->
        <div class="flex flex-col items-center">
          <div class="mb-4 flex items-center justify-center">
            <img src="/icon_logo.svg" alt="Puntúalo" class="w-14 h-14 rounded-full object-cover" style="filter: none; background: transparent;" />
          </div>
          <div class="flex items-center gap-3">
            <a aria-label="Facebook" title="Facebook" href="#" target="_blank" rel="noopener" class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-black hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.2c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H20l-1 3.9h-2.1v7A10 10 0 0022 12z"></path></svg>
            </a>

            <a aria-label="Instagram" title="Instagram" href="#" target="_blank" rel="noopener" class="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-100 via-yellow-50 to-purple-100 text-black hover:opacity-95 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-200">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.5A4.5 4.5 0 1016.5 13 4.5 4.5 0 0012 8.5z"></path></svg>
            </a>

            <a aria-label="YouTube" title="YouTube" href="#" target="_blank" rel="noopener" class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-black hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7s-.2-1.6-.8-2.3c-.7-.8-1.5-.8-1.9-.9C17.7 3.5 12 3.5 12 3.5h0s-5.7 0-8.3.3c-.4.1-1.2.1-1.9.9C1.2 5.4 1 7 1 7S1 8.8 1.1 10.7c.1 1.6.5 3.2 1.3 3.9.7.7 1.6.7 2 1 2.6.3 8.3.3 8.3.3s5.7 0 8.3-.3c.4-.1 1.2-.1 1.9-.9.6-.7.8-2.3.8-2.3s.2-1.7.2-3.5c0-1.9-.2-3.5-.2-3.5z"></path></svg>
            </a>
          </div>
        </div>

        <!-- right: site links -->
        <div class="flex flex-col items-end gap-2 text-sm text-black">
          <router-link to="/about" class="hover:text-gray-700">Acerca</router-link>
          <router-link to="/blog" class="hover:text-gray-700">Blog</router-link>
          <router-link to="/contact" class="hover:text-gray-700">Contact</router-link>
          <router-link to="/faq" class="hover:text-gray-700">FAQs</router-link>
        </div>
      </div>

      <!-- bottom strip -->
      <div class="mt-12 text-black text-xs py-3 px-6" style="background-color: transparent; border-top: 1px solid rgba(0,0,0,0.06);">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
          <div>© <span>{{ year }}</span> Puntúalo. Todos los derechos reservados.</div>
          <div class="mt-2 md:mt-0">Dirección de ejemplo · info@puntualo.example · +34 900 000 000</div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
/* small refinements if needed */
</style>
