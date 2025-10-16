<template>
  <Transition name="combo">
    <div v-if="combo > 1" class="combo-counter" ref="comboElement">
      <div class="combo-flame">🔥</div>
      <div class="combo-content">
        <div class="combo-number">{{ combo }}</div>
        <div class="combo-label">COMBO</div>
      </div>
      <div class="combo-multiplier">×{{ multiplier.toFixed(1) }}</div>
      <div class="combo-ripple"></div>
      <div class="combo-particles"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { gsap } from 'gsap';

const props = defineProps<{
  combo: number;
  multiplier: number;
}>();

const comboElement = ref<HTMLElement | null>(null);

// Observar cambios en el combo
watch(() => props.combo, (newVal, oldVal) => {
  if (newVal > oldVal && comboElement.value) {
    // Pop animation cuando aumenta el combo
    gsap.timeline()
      .to(comboElement.value, {
        scale: 1.4,
        duration: 0.15,
        ease: 'back.out(4)'
      })
      .to(comboElement.value, {
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    
    // Ripple effect
    const ripple = comboElement.value.querySelector('.combo-ripple');
    if (ripple) {
      gsap.fromTo(ripple,
        { scale: 1, opacity: 0.8 },
        {
          scale: 2.8,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out'
        }
      );
    }
    
    // Efecto especial para combos altos
    if (newVal >= 5) {
      gsap.timeline()
        .to(comboElement.value, { rotation: -5, duration: 0.1 })
        .to(comboElement.value, { rotation: 5, duration: 0.1 })
        .to(comboElement.value, { rotation: 0, duration: 0.2 });
    }
  }
});
</script>

<style scoped>
.combo-counter {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFA07A 100%);
  padding: 0.75rem 1.75rem;
  border-radius: 50px;
  box-shadow: 
    0 5px 25px rgba(255, 107, 107, 0.6),
    0 0 40px rgba(255, 107, 107, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.3);
  user-select: none;
  overflow: hidden;
}

.combo-flame {
  font-size: 2.5rem;
  animation: flame-flicker 0.4s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.8));
}

@keyframes flame-flicker {
  0%, 100% { 
    transform: scale(1) rotate(0deg); 
  }
  25% {
    transform: scale(1.05) rotate(-3deg);
  }
  50% { 
    transform: scale(1.1) rotate(3deg); 
  }
  75% {
    transform: scale(1.05) rotate(-2deg);
  }
}

.combo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.combo-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  text-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 255, 255, 0.5);
  line-height: 1;
  font-family: 'Arial Black', sans-serif;
}

.combo-label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.combo-multiplier {
  font-size: 2rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.9),
    0 0 30px rgba(255, 215, 0, 0.5);
  font-family: 'Arial Black', sans-serif;
}

.combo-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  pointer-events: none;
}

.combo-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 3%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 3%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 4%);
  animation: particles-float 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes particles-float {
  0%, 100% {
    opacity: 0.5;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-5px);
  }
}

/* Animaciones de transición */
.combo-enter-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.combo-leave-active {
  transition: all 0.3s ease-in;
}

.combo-enter-from {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.combo-leave-to {
  opacity: 0;
  transform: scale(1.5) rotate(180deg);
}

/* Responsive */
@media (max-width: 768px) {
  .combo-counter {
    padding: 0.6rem 1.2rem;
    gap: 0.5rem;
  }
  
  .combo-flame {
    font-size: 2rem;
  }
  
  .combo-number {
    font-size: 2rem;
  }
  
  .combo-label {
    font-size: 0.65rem;
  }
  
  .combo-multiplier {
    font-size: 1.5rem;
  }
}
</style>
