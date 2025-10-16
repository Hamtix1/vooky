<template>
  <div class="score-display">
    <div class="score-container">
      <div class="score-label">SCORE</div>
      <div class="score-value" ref="scoreElement">{{ displayScore }}</div>
      <div class="score-glow"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { gsap } from 'gsap';

const props = defineProps<{
  score: number;
}>();

const scoreElement = ref<HTMLElement | null>(null);
const displayScore = ref(0);

// Observar cambios en el score y animar
watch(() => props.score, (newScore, oldScore) => {
  if (scoreElement.value) {
    // Animación de rolling numbers
    const obj = { value: oldScore };
    gsap.to(obj, {
      value: newScore,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: function() {
        displayScore.value = Math.round(obj.value);
      }
    });
    
    // Bounce effect cuando aumenta el score
    if (newScore > oldScore) {
      gsap.timeline()
        .to(scoreElement.value, {
          scale: 1.3,
          duration: 0.2,
          ease: 'back.out(3)'
        })
        .to(scoreElement.value, {
          scale: 1,
          duration: 0.4,
          ease: 'elastic.out(1, 0.4)'
        });
    }
  }
});

onMounted(() => {
  displayScore.value = props.score;
});
</script>

<style scoped>
.score-display {
  position: relative;
  user-select: none;
}

.score-container {
  position: relative;
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.score-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #95a5a6;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.score-value {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
  line-height: 1;
  font-family: 'Arial Black', sans-serif;
}

.score-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
  border-radius: 20px;
}

@keyframes glow-pulse {
  0%, 100% { 
    opacity: 0.4; 
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .score-container {
    padding: 1rem 1.5rem;
  }
  
  .score-value {
    font-size: 3rem;
  }
  
  .score-label {
    font-size: 0.8rem;
  }
}
</style>
