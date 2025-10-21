<template>
  <Transition name="popup">
    <div v-if="isVisible" class="floating-text" :class="[type, size]" :style="floatingStyle">
      <div class="text-content">
        <span class="icon" v-if="icon">{{ icon }}</span>
        <span class="message">{{ message }}</span>
        <span class="value" v-if="value">{{ value }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  message: string;
  x?: number;
  y?: number;
  type?: 'success' | 'error' | 'combo' | 'score' | 'info';
  icon?: string;
  value?: string | number;
  duration?: number;
  size?: 'small' | 'medium' | 'large';
  trigger?: number; // Incrementar para mostrar
}

const props = withDefaults(defineProps<Props>(), {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  type: 'info',
  duration: 2000,
  size: 'medium'
});

const isVisible = ref(false);

const floatingStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  '--start-y': `${props.y}px`,
  '--end-y': `${props.y - 100}px`
}));

function show() {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
}

watch(() => props.trigger, (newVal) => {
  if (newVal !== undefined) {
    show();
  }
});

defineExpose({ show });
</script>

<style scoped>
.floating-text {
  position: fixed;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9998;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  animation: float-up 2s ease-out forwards;
}

.text-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 2px solid;
}

/* Sizes */
.small .text-content {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.medium .text-content {
  font-size: 1.5rem;
  padding: 0.75rem 1.5rem;
}

.large .text-content {
  font-size: 2.5rem;
  padding: 1rem 2rem;
}

/* Types */
.success {
  color: #2ecc71;
}

.success .text-content {
  border-color: #2ecc71;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%);
}

.error {
  color: #e74c3c;
}

.error .text-content {
  border-color: #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
  animation: float-up 2s ease-out forwards, shake 0.5s ease-in-out;
}

.combo {
  color: #f39c12;
}

.combo .text-content {
  border-color: #f39c12;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(230, 126, 34, 0.1) 100%);
  animation: float-up 2s ease-out forwards, pulse 0.5s ease-in-out infinite;
}

.score {
  color: #3498db;
}

.score .text-content {
  border-color: #3498db;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%);
}

.info {
  color: #9b59b6;
}

.info .text-content {
  border-color: #9b59b6;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%);
}

.icon {
  font-size: 1.2em;
  animation: bounce 0.6s ease-in-out;
}

.value {
  font-weight: 900;
  margin-left: 0.25rem;
}

/* Animations */
@keyframes float-up {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  10% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  20% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-50%, -150%) scale(0.8);
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) rotate(-5deg); }
  20%, 40%, 60%, 80% { transform: translate(-50%, -50%) rotate(5deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(-5px); }
  75% { transform: translateY(-7px); }
}

/* Transition */
.popup-enter-active,
.popup-leave-active {
  transition: all 0.3s ease;
}

.popup-enter-from {
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
}

.popup-leave-to {
  transform: translate(-50%, -150%) scale(0.5);
  opacity: 0;
}
</style>
