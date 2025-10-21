<template>
  <Transition name="ripple-fade">
    <div
      v-if="isVisible"
      class="ripple-effect"
      :class="variant"
      :style="rippleStyle"
    >
      <div class="ripple-circle ripple-1"></div>
      <div class="ripple-circle ripple-2"></div>
      <div class="ripple-circle ripple-3"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  x: number;
  y: number;
  variant?: 'success' | 'error' | 'neutral' | 'combo';
  duration?: number;
  trigger?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  duration: 1000
});

const isVisible = ref(false);

const rippleStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  '--duration': `${props.duration}ms`
}));

function showRipple() {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
}

watch(() => props.trigger, (newVal) => {
  if (newVal !== undefined) {
    showRipple();
  }
});

defineExpose({ trigger: showRipple });
</script>

<style scoped>
.ripple-effect {
  position: fixed;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9997;
  width: 0;
  height: 0;
}

.ripple-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0;
  animation: ripple var(--duration, 1000ms) ease-out;
}

.ripple-1 {
  animation-delay: 0ms;
}

.ripple-2 {
  animation-delay: 100ms;
}

.ripple-3 {
  animation-delay: 200ms;
}

/* Variants */
.success .ripple-circle {
  border: 3px solid #2ecc71;
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
}

.error .ripple-circle {
  border: 3px solid #e74c3c;
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
}

.neutral .ripple-circle {
  border: 3px solid #3498db;
  box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
}

.combo .ripple-circle {
  border: 3px solid #f39c12;
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

.ripple-fade-enter-active,
.ripple-fade-leave-active {
  transition: opacity 0.3s ease;
}

.ripple-fade-enter-from,
.ripple-fade-leave-to {
  opacity: 0;
}
</style>
