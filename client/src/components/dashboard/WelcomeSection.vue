<template>
  <section class="mb-12 text-center relative py-20 overflow-hidden">
    <!-- Círculos decorativos animados sutiles -->
    <div class="absolute top-10 left-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl animate-float-delayed"></div>
    
    <div class="relative z-10">
      <!-- Título principal con efecto gradiente y animación -->
      <h1 class="text-8xl md:text-9xl font-black mb-8 relative inline-block group tracking-tight">
        <span class="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-text bg-[length:200%_auto] drop-shadow-2xl">
          {{ title }}
        </span>
        
        <!-- Efecto de brillo que pasa por encima -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shine pointer-events-none"></div>
        
        <!-- Decoración de estrellitas animadas -->
        <span class="absolute -top-8 -right-12 text-5xl animate-bounce-slow drop-shadow-lg">⭐</span>
        <span class="absolute -bottom-6 -left-12 text-4xl animate-bounce-delayed drop-shadow-lg">✨</span>
      </h1>
      
      <!-- Subtítulo con animación de escritura -->
      <p class="text-gray-200 text-3xl md:text-4xl font-light mb-10 animate-fade-in-up tracking-wide">
        {{ subtitle }}
      </p>
      
      <!-- Mensaje motivacional con animación -->
      <div class="flex items-center justify-center gap-4 text-emerald-400 text-xl font-medium animate-pulse-soft">
        <span class="text-3xl drop-shadow-lg">🎬</span>
        <span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
          Descubre, puntúa y comparte tus favoritos
        </span>
        <span class="text-3xl drop-shadow-lg">📺</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Inicio',
  subtitle: 'Bienvenido a Puntúalo.com'
})
</script>

<style scoped>
@keyframes gradient-text {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.05);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-40px) scale(1.08);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(-5deg);
  }
}

@keyframes bounce-delayed {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(8deg);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.92;
    transform: scale(1.03);
  }
}

.animate-gradient-text {
  animation: gradient-text 4s linear infinite;
}

.animate-float {
  animation: float 7s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 9s ease-in-out infinite 0.5s;
}

.animate-shine {
  animation: shine 3s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3.5s ease-in-out infinite;
}

.animate-bounce-delayed {
  animation: bounce-delayed 4.5s ease-in-out infinite 1.2s;
}

.animate-fade-in-up {
  animation: fade-in-up 1.2s ease-out;
}

.animate-pulse-soft {
  animation: pulse-soft 3.5s ease-in-out infinite;
}

/* Efecto hover en el título */
.group:hover span {
  filter: brightness(1.15);
}
</style>