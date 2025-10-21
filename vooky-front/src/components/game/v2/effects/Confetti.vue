<template>
  <div class="confetti-container" v-if="isActive">
    <div
      v-for="confetto in confetti"
      :key="confetto.id"
      class="confetto"
      :style="confetto.style"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Define component name for linter
defineOptions({
  name: 'ConfettiEffect'
});

interface Props {
  count?: number;
  duration?: number;
  trigger?: number;
}

interface Confetto {
  id: number;
  style: {
    left: string;
    backgroundColor: string;
    width: string;
    height: string;
    '--rotation': string;
    '--duration': string;
    '--delay': string;
    '--swing': string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  count: 50,
  duration: 3000
});

const isActive = ref(false);
const confetti = ref<Confetto[]>([]);

function launch() {
  isActive.value = true;
  confetti.value = [];

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E63946', '#A8DADC'
  ];

  for (let i = 0; i < props.count; i++) {
    const left = Math.random() * 100;
    const width = 8 + Math.random() * 8;
    const height = 12 + Math.random() * 12;
    const rotation = Math.random() * 720 - 360;
    const duration = 2 + Math.random() * 2;
    const delay = Math.random() * 0.5;
    const swing = -30 + Math.random() * 60;
    const color = colors[Math.floor(Math.random() * colors.length)];

    confetti.value.push({
      id: i,
      style: {
        left: `${left}%`,
        backgroundColor: color,
        width: `${width}px`,
        height: `${height}px`,
        '--rotation': `${rotation}deg`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        '--swing': `${swing}px`
      }
    });
  }

  setTimeout(() => {
    isActive.value = false;
    confetti.value = [];
  }, props.duration);
}

watch(() => props.trigger, (newVal) => {
  if (newVal !== undefined) {
    launch();
  }
});

defineExpose({ launch });
</script>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9995;
  overflow: hidden;
}

.confetto {
  position: absolute;
  top: -20px;
  opacity: 0;
  animation: 
    fall var(--duration) ease-in var(--delay) forwards,
    spin var(--duration) linear var(--delay) infinite;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes fall {
  0% {
    transform: translateY(0) translateX(0) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: 
      translateY(100vh) 
      translateX(var(--swing)) 
      rotateZ(var(--rotation));
    opacity: 0.8;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
