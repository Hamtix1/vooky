<template>
  <Transition name="badge-notification">
    <div v-if="show && badge" class="badge-notification">
      <div class="badge-content">
        <div class="badge-glow">
          <img v-if="badge.image" :src="getBadgeImageUrl(badge.image)" :alt="badge.name" />
          <font-awesome-icon v-else icon="trophy" size="3x" />
        </div>
        <h2>¡Nueva Insignia Obtenida!</h2>
        <h3>{{ badge.name }}</h3>
        <p>{{ badge.description }}</p>
        <p class="badge-requirement">{{ badge.lessons_required }} lecciones completadas</p>
        <button @click="close" class="btn-close-badge">Continuar</button>
      </div>
      <div class="confetti"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Badge {
  id: number;
  name: string;
  description: string;
  image?: string;
  lessons_required: number;
}

interface Props {
  badge?: Badge | null;
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const show = ref(false);

watch(() => props.modelValue, (newVal) => {
  show.value = newVal;
  if (newVal) {
    // Reproducir sonido de insignia
    playBadgeSound();
    // Crear confetti cuando se muestre
    createConfetti();
    // Auto-cerrar después de 8 segundos
    setTimeout(() => {
      close();
    }, 8000);
  }
});

function close() {
  show.value = false;
  emit('update:modelValue', false);
}

function playBadgeSound() {
  const audio = new Audio('/sounds/powerup.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('No se pudo reproducir el sonido:', err));
}

function createConfetti() {
  const confettiContainer = document.querySelector('.confetti');
  if (!confettiContainer) return;
  
  // Limpiar confetti anterior
  confettiContainer.innerHTML = '';
  
  // Crear 50 piezas de confetti
  for (let i = 0; i < 50; i++) {
    const confettiPiece = document.createElement('div');
    confettiPiece.className = 'confetti-piece';
    
    // Colores aleatorios
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Posición y animación aleatoria
    confettiPiece.style.left = Math.random() * 100 + '%';
    confettiPiece.style.animationDelay = Math.random() * 3 + 's';
    confettiPiece.style.animationDuration = (Math.random() * 3 + 2) + 's';
    
    confettiContainer.appendChild(confettiPiece);
  }
}

function getBadgeImageUrl(image: string): string {
  if (image.startsWith('http')) {
    return image;
  }
  return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${image}`;
}
</script>

<style scoped>
.badge-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in;
}

.badge-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
  position: relative;
  z-index: 10;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.6);
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.badge-glow {
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(255, 255, 255, 0.3),
    0 0 60px rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
  position: relative;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.5),
      0 0 40px rgba(255, 255, 255, 0.3),
      0 0 60px rgba(255, 255, 255, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 
      0 0 30px rgba(255, 255, 255, 0.7),
      0 0 50px rgba(255, 255, 255, 0.5),
      0 0 70px rgba(255, 255, 255, 0.3);
  }
}

.badge-glow img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.badge-glow svg {
  color: #FFD700;
}

.badge-content h2 {
  color: white;
  font-size: 2rem;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.badge-content h3 {
  color: #FFD700;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.badge-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.badge-requirement {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem !important;
  margin-top: 1rem !important;
}

.btn-close-badge {
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-close-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  opacity: 0;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}

/* Animación de entrada/salida */
.badge-notification-enter-active,
.badge-notification-leave-active {
  transition: opacity 0.3s ease;
}

.badge-notification-enter-from,
.badge-notification-leave-to {
  opacity: 0;
}

.badge-notification-enter-active .badge-content {
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.badge-notification-leave-active .badge-content {
  animation: scaleOut 0.3s ease-in;
}

@keyframes scaleOut {
  from {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: scale(0.5) rotate(10deg);
    opacity: 0;
  }
}
</style>
