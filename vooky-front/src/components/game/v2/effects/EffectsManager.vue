<template>
  <div class="game-effects-manager">
    <!-- Particle Explosions -->
    <ParticleExplosion
      v-for="explosion in activeExplosions"
      :key="`explosion-${explosion.id}`"
      :x="explosion.x"
      :y="explosion.y"
      :color="explosion.color"
      :particle-count="explosion.particleCount"
      :trigger="explosion.trigger"
    />

    <!-- Floating Texts -->
    <FloatingText
      v-for="text in activeTexts"
      :key="`text-${text.id}`"
      :message="text.message"
      :x="text.x"
      :y="text.y"
      :type="text.type"
      :icon="text.icon"
      :value="text.value"
      :size="text.size"
      :trigger="text.trigger"
    />

    <!-- Ripple Effects -->
    <RippleEffect
      v-for="ripple in activeRipples"
      :key="`ripple-${ripple.id}`"
      :x="ripple.x"
      :y="ripple.y"
      :variant="ripple.variant"
      :trigger="ripple.trigger"
    />

    <!-- Screen Flash -->
    <ScreenFlash
      ref="screenFlashRef"
      :type="flashType"
      :duration="flashDuration"
      :trigger="flashTrigger"
    />

    <!-- Confetti -->
    <Confetti
      ref="confettiRef"
      :count="confettiCount"
      :trigger="confettiTrigger"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ParticleExplosion from './ParticleExplosion.vue';
import FloatingText from './FloatingText.vue';
import RippleEffect from './RippleEffect.vue';
import ScreenFlash from './ScreenFlash.vue';
import Confetti from './Confetti.vue';

interface ExplosionConfig {
  id: number;
  x: number;
  y: number;
  color?: string;
  particleCount?: number;
  trigger: number;
}

interface TextConfig {
  id: number;
  message: string;
  x: number;
  y: number;
  type?: 'success' | 'error' | 'combo' | 'score' | 'info';
  icon?: string;
  value?: string | number;
  size?: 'small' | 'medium' | 'large';
  trigger: number;
}

interface RippleConfig {
  id: number;
  x: number;
  y: number;
  variant?: 'success' | 'error' | 'neutral' | 'combo';
  trigger: number;
}

const activeExplosions = ref<ExplosionConfig[]>([]);
const activeTexts = ref<TextConfig[]>([]);
const activeRipples = ref<RippleConfig[]>([]);

const screenFlashRef = ref();
const flashType = ref<'success' | 'error' | 'white' | 'gold'>('white');
const flashDuration = ref(500);
const flashTrigger = ref(0);

const confettiRef = ref();
const confettiCount = ref(50);
const confettiTrigger = ref(0);

let effectIdCounter = 0;

// Particle Explosion
function triggerExplosion(x: number, y: number, color = '#FFD700', particleCount = 20) {
  const id = effectIdCounter++;
  activeExplosions.value.push({
    id,
    x,
    y,
    color,
    particleCount,
    trigger: Date.now()
  });

  // Cleanup después de 2 segundos
  setTimeout(() => {
    activeExplosions.value = activeExplosions.value.filter(e => e.id !== id);
  }, 2000);
}

// Floating Text
function showFloatingText(
  message: string,
  x: number,
  y: number,
  options: {
    type?: 'success' | 'error' | 'combo' | 'score' | 'info';
    icon?: string;
    value?: string | number;
    size?: 'small' | 'medium' | 'large';
  } = {}
) {
  const id = effectIdCounter++;
  activeTexts.value.push({
    id,
    message,
    x,
    y,
    type: options.type || 'info',
    icon: options.icon,
    value: options.value,
    size: options.size || 'medium',
    trigger: Date.now()
  });

  // Cleanup después de 3 segundos
  setTimeout(() => {
    activeTexts.value = activeTexts.value.filter(t => t.id !== id);
  }, 3000);
}

// Ripple Effect
function triggerRipple(x: number, y: number, variant: 'success' | 'error' | 'neutral' | 'combo' = 'neutral') {
  const id = effectIdCounter++;
  activeRipples.value.push({
    id,
    x,
    y,
    variant,
    trigger: Date.now()
  });

  // Cleanup después de 1.5 segundos
  setTimeout(() => {
    activeRipples.value = activeRipples.value.filter(r => r.id !== id);
  }, 1500);
}

// Screen Flash
function flash(type: 'success' | 'error' | 'white' | 'gold' = 'white', duration = 500) {
  flashType.value = type;
  flashDuration.value = duration;
  flashTrigger.value = Date.now();
}

// Confetti
function launchConfetti(count = 50) {
  confettiCount.value = count;
  confettiTrigger.value = Date.now();
}

// Efectos combinados para eventos comunes del juego
function correctAnswer(x: number, y: number) {
  triggerRipple(x, y, 'success');
  showFloatingText('¡Correcto!', x, y, {
    type: 'success',
    icon: '✓',
    size: 'medium'
  });
}

function incorrectAnswer(x: number, y: number) {
  triggerRipple(x, y, 'error');
  flash('error', 300);
  showFloatingText('Incorrecto', x, y, {
    type: 'error',
    icon: '✗',
    size: 'medium'
  });
}

function comboAchieved(x: number, y: number, comboCount: number) {
  triggerExplosion(x, y, '#f39c12', 15);
  triggerRipple(x, y, 'combo');
  showFloatingText('¡COMBO!', x, y, {
    type: 'combo',
    icon: '🔥',
    value: `x${comboCount}`,
    size: 'large'
  });
}

function scoreGained(x: number, y: number, points: number) {
  showFloatingText('', x, y, {
    type: 'score',
    icon: '⭐',
    value: `+${points}`,
    size: 'small'
  });
}

function levelComplete() {
  flash('gold', 800);
  launchConfetti(80);
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  showFloatingText('¡NIVEL COMPLETADO!', centerX, centerY, {
    type: 'success',
    icon: '🎉',
    size: 'large'
  });

  triggerExplosion(centerX, centerY, '#FFD700', 30);
}

function gameOver() {
  flash('error', 600);
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  showFloatingText('Game Over', centerX, centerY, {
    type: 'error',
    icon: '😢',
    size: 'large'
  });
}

// Exponer métodos
defineExpose({
  // Efectos básicos
  triggerExplosion,
  showFloatingText,
  triggerRipple,
  flash,
  launchConfetti,
  // Efectos combinados
  correctAnswer,
  incorrectAnswer,
  comboAchieved,
  scoreGained,
  levelComplete,
  gameOver
});
</script>

<style scoped>
.game-effects-manager {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9990;
}
</style>
