<template>
  <div>
    <button class="chatbot-button" @click="toggle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path d="M12 2a3 3 0 00-3 3v1H7a2 2 0 00-2 2v5a2 2 0 002 2h1v1a3 3 0 003 3h0a3 3 0 003-3v-1h1a2 2 0 002-2v-5a2 2 0 00-2-2h-2V5a3 3 0 00-3-3z" />
      </svg>
    </button>
    <ChatWindow v-if="open" @close="open = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChatWindow from './ChatWindow.vue'

const open = ref(false)
function toggle() {
  open.value = !open.value
}
</script>

<style scoped>
.chatbot-button {
  position: fixed;
  right: 20px;
  /* subir el botón más arriba (pero mantenerlo a la derecha) */
  bottom: 120px;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: linear-gradient(135deg,#06b6d4,#2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  border: none;
  cursor: pointer;
}
</style>
