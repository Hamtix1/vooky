<template>
  <Transition name="flash">
    <div
      v-if="isVisible"
      class="screen-flash"
      :class="type"
    ></div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  type?: 'success' | 'error' | 'white' | 'gold';
  duration?: number;
  intensity?: number; // 0-1
  trigger?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'white',
  duration: 500,
  intensity: 0.3
});

const isVisible = ref(false);

function flash() {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
}

watch(() => props.trigger, (newVal) => {
  if (newVal !== undefined) {
    flash();
  }
});

defineExpose({ flash });
</script>

<style scoped>
.screen-flash {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9996;
  animation: flash-fade 0.5s ease-out forwards;
}

.screen-flash.success {
  background: radial-gradient(circle, rgba(46, 204, 113, 0.4) 0%, rgba(46, 204, 113, 0) 70%);
}

.screen-flash.error {
  background: radial-gradient(circle, rgba(231, 76, 60, 0.5) 0%, rgba(231, 76, 60, 0) 70%);
}

.screen-flash.white {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%);
}

.screen-flash.gold {
  background: radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, rgba(255, 165, 0, 0) 70%);
}

@keyframes flash-fade {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.flash-enter-active {
  animation: flash-fade 0.5s ease-out;
}

.flash-leave-active {
  animation: flash-fade 0.3s ease-in reverse;
}
</style>
