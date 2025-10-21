<template>
  <div class="particle-container" v-if="isActive">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="particle.style"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface Props {
  x: number;
  y: number;
  color?: string;
  particleCount?: number;
  trigger?: number; // Incrementar para activar explosión
}

interface Particle {
  id: number;
  style: {
    left: string;
    top: string;
    backgroundColor: string;
    width: string;
    height: string;
    '--angle': string;
    '--distance': string;
    '--duration': string;
    '--delay': string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  color: '#FFD700',
  particleCount: 20
});

const isActive = ref(false);
const particles = ref<Particle[]>([]);

function createExplosion() {
  isActive.value = true;
  particles.value = [];

  const colors = [
    props.color,
    '#FFA500',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DFE6E9'
  ];

  for (let i = 0; i < props.particleCount; i++) {
    const angle = (360 / props.particleCount) * i;
    const distance = 50 + Math.random() * 100;
    const size = 4 + Math.random() * 8;
    const duration = 0.5 + Math.random() * 0.5;
    const delay = Math.random() * 0.1;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particles.value.push({
      id: i,
      style: {
        left: `${props.x}px`,
        top: `${props.y}px`,
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`
      }
    });
  }

  // Limpiar después de la animación
  setTimeout(() => {
    isActive.value = false;
    particles.value = [];
  }, 1500);
}

watch(() => props.trigger, (newVal) => {
  if (newVal !== undefined) {
    createExplosion();
  }
});

onMounted(() => {
  createExplosion();
});
</script>

<style scoped>
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: explode var(--duration) ease-out var(--delay) forwards;
  transform-origin: center;
  box-shadow: 0 0 10px currentColor;
}

@keyframes explode {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: 
      translate(
        calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))
      )
      scale(0)
      rotate(720deg);
    opacity: 0;
  }
}

/* Alternativa con mejor soporte de navegadores */
@keyframes explode {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: 
      translateX(calc(var(--distance) * cos(var(--angle))))
      translateY(calc(var(--distance) * sin(var(--angle))))
      scale(0);
    opacity: 0;
  }
}
</style>
