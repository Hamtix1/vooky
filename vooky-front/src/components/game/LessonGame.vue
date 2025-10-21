<template>
  <div class="lesson-game" ref="lessonGameContainer">
    <!-- Loading State -->
    <div v-if="loading" class="game-loading">
      <div class="spinner-large"></div>
      <p>Cargando lección...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="game-error">
      <div class="error-icon">⚠️</div>
      <h2>Error al cargar la lección</h2>
      <p>{{ error }}</p>
      <button @click="$emit('close')" class="btn-primary">Volver</button>
    </div>

    <!-- Game Playing -->
    <div v-else-if="gameState === 'playing' && currentQuestion" class="game-container" ref="gameContainer">
      <!-- HUD Superior -->
      <div class="game-header">
        <button @click="confirmExit" class="btn-exit">← Salir</button>
        
        <!-- Combo Counter (centro) -->
        <ComboCounter :combo="currentCombo" :multiplier="comboMultiplier" />
        
        <div class="header-right">
          <div class="progress-info">
            <span class="question-counter">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <button @click="toggleFullscreen" class="btn-fullscreen" :title="isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'">
            <font-awesome-icon :icon="isFullscreen ? 'compress' : 'expand'" />
          </button>
        </div>
      </div>
      
      <!-- Score Display (lateral derecho) -->
      <ScoreDisplay :score="score" class="score-sidebar" />

      <!-- Question Area -->
      <div class="question-area">
        <div class="audio-section">
          <button @click="playQuestionAudio" class="btn-play-audio" :disabled="isPlayingAudio">
            <span class="audio-icon">🔊</span>
            <span>{{ isPlayingAudio ? 'Reproduciendo...' : 'Escuchar Audio' }}</span>
          </button>
        </div>

        <h2 class="question-title">Selecciona la imagen correcta</h2>

        <!-- Image Options -->
        <div class="options-container">
          <div 
            ref="leftOptionRef"
            class="option-card left" 
            :class="{ 
              'selected': selectedAnswer === 'left',
              'correct': showResult && currentQuestion.options.left.id === currentQuestion.correct_image_id,
              'incorrect': showResult && selectedAnswer === 'left' && currentQuestion.options.left.id !== currentQuestion.correct_image_id
            }"
            @click="selectAnswer('left')"
          >
            <img :src="getImageUrl(currentQuestion.options.left.url)" :alt="currentQuestion.options.left.description || 'Opción izquierda'" />
            <div v-if="showResult" class="result-indicator">
              <span v-if="currentQuestion.options.left.id === currentQuestion.correct_image_id">✓</span>
              <span v-else-if="selectedAnswer === 'left'">✗</span>
            </div>
          </div>

          <div 
            ref="rightOptionRef"
            class="option-card right"
            :class="{ 
              'selected': selectedAnswer === 'right',
              'correct': showResult && currentQuestion.options.right.id === currentQuestion.correct_image_id,
              'incorrect': showResult && selectedAnswer === 'right' && currentQuestion.options.right.id !== currentQuestion.correct_image_id
            }"
            @click="selectAnswer('right')"
          >
            <img :src="getImageUrl(currentQuestion.options.right.url)" :alt="currentQuestion.options.right.description || 'Opción derecha'" />
            <div v-if="showResult" class="result-indicator">
              <span v-if="currentQuestion.options.right.id === currentQuestion.correct_image_id">✓</span>
              <span v-else-if="selectedAnswer === 'right'">✗</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-else-if="gameState === 'finished'" class="game-results">
      <div class="results-content">
        <h1 class="results-title">
          {{ finishedByErrors ? '❌ Game Over' : (passedLesson ? '🎉 ¡Lección Aprobada!' : '😔 Lección No Aprobada') }}
        </h1>
        
        <!-- Mensaje del backend -->
        <div v-if="resultMessage" class="backend-message" :class="{ 
          'success': isNewHighScore || (passedLesson && !wasAlreadyCompleted),
          'info': wasAlreadyCompleted,
          'warning': !passedLesson && !finishedByErrors
        }">
          <p>{{ resultMessage }}</p>
        </div>
        
        <!-- Badge de nuevo récord -->
        <div v-if="isNewHighScore && !finishedByErrors" class="new-high-score-badge">
          <div class="trophy-icon">🏆</div>
          <p class="trophy-text">¡NUEVO RÉCORD!</p>
          <p class="trophy-subtitle">Anterior: {{ bestScore }} pts → Ahora: {{ finalScore }} pts</p>
        </div>
        
        <!-- Mensaje especial si terminó por errores -->
        <div v-if="finishedByErrors" class="game-over-message">
          <div class="game-over-icon">💔</div>
          <p class="game-over-text">5 errores consecutivos</p>
          <p class="game-over-subtitle">
            {{ wasAlreadyCompleted ? '¡Pero tu lección sigue aprobada!' : 'No te desanimes, ¡puedes intentarlo de nuevo!' }}
          </p>
        </div>
        
        <!-- Mensaje si no aprobó (menos del 75%) -->
        <div v-else-if="!passedLesson" class="failed-message">
          <div class="failed-icon">📚</div>
          <p class="failed-text">Necesitas al menos 75% de aciertos</p>
          <p class="failed-subtitle">Tu porcentaje: {{ accuracyPercentage }}%</p>
        </div>
        
        <!-- Badge de aprobado -->
        <div v-else class="passed-badge">
          <div class="badge-icon">✨</div>
          <p class="badge-text">{{ accuracyPercentage }}% de aciertos</p>
          <p v-if="wasAlreadyCompleted && !isNewHighScore" class="badge-subtitle">
            Mejor puntuación: {{ bestScore }} pts
          </p>
        </div>
        
        <div class="score-circle" :class="scoreClass">
          <div class="score-value">{{ finalScore.toLocaleString() }}</div>
          <div class="score-label">PUNTOS</div>
          <div class="score-sublabel">Intento actual: {{ accuracyPercentage }}%</div>
        </div>

        <div class="results-stats">
          <div class="stat-item">
            <div class="stat-icon correct">✓</div>
            <div class="stat-info">
              <div class="stat-value">{{ correctAnswers }}</div>
              <div class="stat-label">Correctas</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon incorrect">✗</div>
            <div class="stat-info">
              <div class="stat-value">{{ incorrectAnswers }}</div>
              <div class="stat-label">Incorrectas</div>
            </div>
          </div>
          
          <!-- Mostrar mejor puntuación si es diferente -->
          <div v-if="bestScore > finalScore && !finishedByErrors" class="stat-item best-score">
            <div class="stat-icon trophy">🏆</div>
            <div class="stat-info">
              <div class="stat-value">{{ bestScore.toLocaleString() }} pts</div>
              <div class="stat-label">Tu Récord</div>
            </div>
          </div>
        </div>

        <div class="results-message" v-if="passedLesson && !wasAlreadyCompleted">
          <p v-if="accuracyPercentage >= 90">🎉 ¡Excelente trabajo!</p>
          <p v-else-if="accuracyPercentage >= 80">👍 ¡Buen trabajo!</p>
          <p v-else>✅ ¡Aprobaste!</p>
        </div>
        
        <div class="results-message" v-else-if="passedLesson && wasAlreadyCompleted && isNewHighScore">
          <p>🌟 ¡Mejoraste tu puntuación!</p>
        </div>

        <div class="results-actions" :class="{ 'dual-actions': !passedLesson || wasAlreadyCompleted }">
          <button v-if="!passedLesson || wasAlreadyCompleted" @click="restartLesson" class="btn-retry">
            <span class="btn-icon">🔄</span>
            {{ wasAlreadyCompleted ? 'Mejorar Puntuación' : 'Reintentar Lección' }}
          </button>
          <button @click="$emit('close')" class="btn-primary">
            {{ passedLesson ? 'Continuar' : 'Volver al Mapa' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Exit Confirmation Modal -->
    <div v-if="showExitConfirm" class="modal-overlay" @click.self="showExitConfirm = false">
      <div class="modal-content">
        <h3>¿Estás seguro?</h3>
        <p>Si sales ahora, perderás tu progreso en esta lección.</p>
        <div class="modal-actions">
          <button @click="showExitConfirm = false" class="btn-secondary">Cancelar</button>
          <button @click="exitGame" class="btn-danger">Salir</button>
        </div>
      </div>
    </div>

    <!-- Badge Notification -->
    <BadgeNotification 
      v-model="showBadgeNotification"
      :badge="earnedBadge"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getLessonQuestions, saveLessonResult, type Question } from '@/services/lessonGameService';
import { getImageUrl, getAudioUrl } from '@/utils/urlHelper';

// Importar composables del nuevo sistema
import { useScoring } from '@/composables/game/useScoring';
import { useGameEffects } from '@/composables/game/useGameEffects';
import { useGameAudio } from '@/composables/game/useGameAudio';

// Importar componentes HUD
import ScoreDisplay from '@/components/game/v2/hud/ScoreDisplay.vue';
import ComboCounter from '@/components/game/v2/hud/ComboCounter.vue';
import BadgeNotification from '@/components/BadgeNotification.vue';

// Interfaces
interface Badge {
  id: number;
  name: string;
  description: string;
  image?: string;
  lessons_required: number;
}

// Interfaz para elementos con soporte de pantalla completa
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

const props = defineProps<{
  lessonId: number;
}>();

const emit = defineEmits(['close']);

// Composables del nuevo sistema
const {
  score,
  correctAnswers,
  incorrectAnswers,
  currentCombo,
  comboMultiplier,
  consecutiveErrors,
  startQuestionTimer,
  addCorrect,
  addIncorrect,
  calculateFinalBonuses,
  reset: resetScoring
} = useScoring();

const {
  playCorrectAnimation,
  playIncorrectAnimation,
  screenShake,
  showFloatingPoints,
  playComboExplosion,
  flashScreen
} = useGameEffects();

const {
  playQuestionAudio: playAudioWithHowler,
  playCorrectSound,
  playIncorrectSound,
  playLastQuestionSound,
  startBackgroundMusic,
  stopBackgroundMusic,
  adjustBGMIntensity,
  initializeAudio,
  cleanup: cleanupAudio
} = useGameAudio();

// State
const loading = ref(true);
const error = ref('');
const gameState = ref<'playing' | 'finished'>('playing');
const questions = ref<Question[]>([]);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref<'left' | 'right' | null>(null);
const showResult = ref(false);
const isPlayingAudio = ref(false);
const showExitConfirm = ref(false);
const finalScore = ref(0);
const currentAttemptScore = ref(0); // Puntuación del intento actual
const bestScore = ref(0); // Mejor puntuación guardada
const isNewHighScore = ref(false); // Si mejoró el score
const wasAlreadyCompleted = ref(false); // Si ya estaba aprobada antes
const resultMessage = ref(''); // Mensaje del backend
const isFullscreen = ref(false);
const gameContainer = ref<HTMLElement | null>(null);
const lessonGameContainer = ref<HTMLElement | null>(null);
const finishedByErrors = ref(false); // NUEVO: Para rastrear si terminó por errores
const passedLesson = ref(false); // NUEVO: Para rastrear si aprobó con 75% o más

// Badge notification state
const showBadgeNotification = ref(false);
const earnedBadge = ref<Badge | null>(null);

// Refs para las opciones (para animaciones)
const leftOptionRef = ref<HTMLElement | null>(null);
const rightOptionRef = ref<HTMLElement | null>(null);

// Audio elements (mantener para compatibilidad)
const questionAudio = ref<HTMLAudioElement | null>(null);

// Computed
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);
const totalQuestions = computed(() => questions.value.length);
const progressPercentage = computed(() => 
  totalQuestions.value > 0 ? ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100 : 0
);
const accuracyPercentage = computed(() => 
  totalQuestions.value > 0 ? Math.round((correctAnswers.value / totalQuestions.value) * 100) : 0
);
const scoreClass = computed(() => {
  if (accuracyPercentage.value >= 80) return 'excellent';
  if (accuracyPercentage.value >= 60) return 'good';
  return 'needs-practice';
});

// Helper function to reset card visual effects
function resetCardEffects() {
  const cards = document.querySelectorAll('.option-card');
  cards.forEach((card) => {
    const element = card as HTMLElement;
    element.style.opacity = '1';
    element.style.filter = 'none';
    element.style.transform = 'none';
  });
}

// Methods
async function loadLesson() {
  try {
    loading.value = true;
    error.value = '';
    const data = await getLessonQuestions(props.lessonId);
    questions.value = data.questions;
    
    // Auto-play first question audio
    if (questions.value.length > 0) {
      setTimeout(() => playQuestionAudio(), 500);
    }
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 'Error al cargar la lección';
  } finally {
    loading.value = false;
  }
}

function playQuestionAudio() {
  if (!currentQuestion.value || isPlayingAudio.value) return;
  
  // Inicializar audio en la primera interacción del usuario
  initializeAudio();
  
  if (questionAudio.value) {
    questionAudio.value.pause();
    questionAudio.value.currentTime = 0;
  }
  
  // Usar el helper para construir la URL del audio
  const audioUrl = getAudioUrl(currentQuestion.value.audio_url);
  
  questionAudio.value = new Audio(audioUrl);
  isPlayingAudio.value = true;
  
  questionAudio.value.play();
  questionAudio.value.onended = () => {
    isPlayingAudio.value = false;
  };
  questionAudio.value.onerror = () => {
    isPlayingAudio.value = false;
  };
}

async function selectAnswer(side: 'left' | 'right') {
  if (selectedAnswer.value !== null || showResult.value) return;
  
  // Asegurar que las tarjetas estén limpias antes de aplicar efectos
  resetCardEffects();
  
  selectedAnswer.value = side;
  const selectedImageId = currentQuestion.value?.options[side].id;
  const isCorrect = selectedImageId === currentQuestion.value?.correct_image_id;
  
  // Obtener el elemento para animaciones
  const element = document.querySelector(`.option-card.${side}`) as HTMLElement;
  
  if (isCorrect) {
    // ===== RESPUESTA CORRECTA =====
    const result = addCorrect();
    
    // Efectos visuales
    if (element) {
      await playCorrectAnimation(element);
      
      // Mostrar puntos flotantes
      const rect = element.getBoundingClientRect();
      showFloatingPoints(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        result.points,
        '#4CD964'
      );
    }
    
    // Audio según combo
    playCorrectSound(result.comboLevel);
    
    // Efectos especiales para combos altos
    if (result.comboLevel >= 3) {
      playComboExplosion(result.comboLevel);
      screenShake(result.comboLevel * 3, 0.4);
      flashScreen('rgba(76, 217, 100, 0.2)');
    }
    
    // Ajustar intensidad de la música
    adjustBGMIntensity(result.comboLevel);
    
  } else {
    // ===== RESPUESTA INCORRECTA =====
    addIncorrect();
    
    // Efectos visuales
    if (element) {
      await playIncorrectAnimation(element);
    }
    
    // Audio y shake
    playIncorrectSound();
    screenShake(12, 0.5);
    flashScreen('rgba(255, 59, 48, 0.2)');
    
    // Verificar si llegó a 5 errores consecutivos
    if (consecutiveErrors.value >= 5) {
      showResult.value = true;
      // Esperar un momento para que el usuario vea el resultado
      setTimeout(() => {
        finishGameDueToErrors();
      }, 2000);
      return; // Salir de la función para no continuar
    }
  }
  
  showResult.value = true;
  
  // Move to next question after 2 seconds
  setTimeout(() => {
    nextQuestion();
  }, 2000);
}

function nextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    showResult.value = false;
    
    // Limpiar efectos visuales de las tarjetas
    resetCardEffects();
    
    // Iniciar timer para la nueva pregunta
    startQuestionTimer();
    
    // Verificar si es la última pregunta
    const isLastQuestion = currentQuestionIndex.value === totalQuestions.value - 1;
    
    if (isLastQuestion) {
      // Reproducir sonido especial de última pregunta
      setTimeout(() => {
        playLastQuestionSound();
        // Reproducir el audio de la pregunta después del sonido especial
        setTimeout(() => playQuestionAudio(), 1500);
      }, 300);
    } else {
      // Auto-play next question audio normalmente
      setTimeout(() => playQuestionAudio(), 300);
    }
  } else {
    finishGame();
  }
}

async function finishGame() {
  // Calcular bonificaciones finales
  calculateFinalBonuses();
  
  // El game score es el puntaje real del sistema de combos (score.value incluye todos los puntos acumulados)
  const gameScore = score.value;
  
  try {
    const result = await saveLessonResult(
      props.lessonId,
      correctAnswers.value,
      totalQuestions.value,
      gameScore // Enviar el game score real con combos (puede ser miles de puntos)
    );
    
    // Guardar toda la información del resultado
    passedLesson.value = result.passed;
    bestScore.value = result.game_score; // Mejor game score
    currentAttemptScore.value = result.current_attempt_accuracy; // Accuracy actual
    isNewHighScore.value = result.improved;
    wasAlreadyCompleted.value = result.was_already_completed;
    resultMessage.value = result.message;
    
    // Mostrar el game score del intento actual
    finalScore.value = gameScore;
    gameState.value = 'finished';
    
    // Verificar si hay nuevas insignias
    if (result.new_badges && result.new_badges.length > 0) {
      // Mostrar notificación de la primera insignia (o podríamos mostrarlas todas secuencialmente)
      earnedBadge.value = result.new_badges[0];
      showBadgeNotification.value = true;
    }
  } catch (err) {
    console.error('Error saving result:', err);
    // Still show results even if save fails
    const accuracyCalc = (correctAnswers.value / totalQuestions.value) * 100;
    passedLesson.value = accuracyCalc >= 75;
    currentAttemptScore.value = Math.round(accuracyCalc);
    bestScore.value = Math.round(accuracyCalc);
    finalScore.value = Math.round(accuracyCalc);
    resultMessage.value = 'Error al guardar, pero calculado localmente';
    gameState.value = 'finished';
  }
}

function restartLesson() {
  // Resetear todos los estados del juego
  gameState.value = 'playing';
  currentQuestionIndex.value = 0;
  finishedByErrors.value = false;
  finalScore.value = 0;
  selectedAnswer.value = null;
  showResult.value = false;
  
  // Resetear el scoring (incluye consecutiveErrors)
  resetScoring();
  
  // Resetear efectos visuales
  resetCardEffects();
  
  // Recargar la lección desde el inicio
  loadLesson();
}

async function finishGameDueToErrors() {
  // Terminar juego por 5 errores consecutivos
  console.log('🚫 Game Over: 5 errores consecutivos');
  finishedByErrors.value = true; // Marcar que terminó por errores
  passedLesson.value = false; // No puede aprobar si terminó por errores
  
  // Calcular bonificaciones finales (aunque sean pocas por los errores)
  calculateFinalBonuses();
  
  // El game score es el puntaje real del sistema de combos
  const gameScore = score.value;
  
  try {
    const result = await saveLessonResult(
      props.lessonId,
      correctAnswers.value,
      totalQuestions.value,
      gameScore // Enviar el game score real con combos
    );
    
    // Guardar información del resultado
    bestScore.value = result.game_score;
    currentAttemptScore.value = result.current_attempt_accuracy;
    wasAlreadyCompleted.value = result.was_already_completed;
    resultMessage.value = result.message;
    passedLesson.value = result.passed; // Usar el del backend (puede estar aprobada previamente)
    
    // Mostrar el game score del intento actual
    finalScore.value = gameScore;
    gameState.value = 'finished';
  } catch (err) {
    console.error('Error saving result:', err);
    // Still show results even if save fails
    currentAttemptScore.value = Math.round((correctAnswers.value / totalQuestions.value) * 100);
    finalScore.value = currentAttemptScore.value;
    resultMessage.value = 'Error al guardar, pero calculado localmente';
    gameState.value = 'finished';
  }
}

function confirmExit() {
  showExitConfirm.value = true;
}

function exitGame() {
  // Salir de pantalla completa si está activa
  if (isFullscreen.value) {
    exitFullscreen();
  }
  stopAllAudio();
  emit('close');
}

// Función para activar/desactivar pantalla completa
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}

function enterFullscreen() {
  const element = (lessonGameContainer.value || document.documentElement) as FullscreenElement;
  
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) { // Safari
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // IE11
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  const doc = document as FullscreenDocument;
  
  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) { // Safari
    doc.webkitExitFullscreen();
  } else if (doc.msExitFullscreen) { // IE11
    doc.msExitFullscreen();
  }
}

// Detectar cambios en el estado de pantalla completa
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

function stopAllAudio() {
  if (questionAudio.value) {
    questionAudio.value.pause();
    questionAudio.value = null;
  }
  // Limpiar audio del nuevo sistema
  cleanupAudio();
}

onMounted(() => {
  loadLesson();
  
  // Iniciar música de fondo (comentado hasta que tengas el archivo)
  // startBackgroundMusic();
  
  // Iniciar timer para la primera pregunta
  startQuestionTimer();
  
  // Escuchar cambios en el estado de pantalla completa
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  stopAllAudio();
  stopBackgroundMusic();
  
  // Limpiar listeners de pantalla completa
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.lesson-game {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  overflow-y: auto;
}

/* Estilos para pantalla completa en el contenedor principal */
.lesson-game:fullscreen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lesson-game:-webkit-full-screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lesson-game:-moz-full-screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lesson-game:-ms-fullscreen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Loading & Error States */
.game-loading,
.game-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  color: white;
  text-align: center;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Game Container */
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* Estilos para pantalla completa */
.game-container:fullscreen {
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-container:-webkit-full-screen {
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-container:-moz-full-screen {
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-container:-ms-fullscreen {
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Score Sidebar (fixed positioning for premium videogame feel) */
.score-sidebar {
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 10000;
  pointer-events: none;
}

/* Combo Counter en el centro del header */
.game-header > .combo-counter {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.btn-exit {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-exit:hover {
  background: #c0392b;
}

.progress-info {
  flex: 1;
  margin: 0 2rem;
}

.question-counter {
  display: block;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.5s ease;
}

.score-display {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.correct-count {
  color: #27ae60;
}

.incorrect-count {
  color: #e74c3c;
}

.btn-fullscreen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 45px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-fullscreen:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.btn-fullscreen:active {
  transform: scale(0.95);
}

/* Question Area */
.question-area {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.audio-section {
  text-align: center;
  margin-bottom: 2rem;
}

.btn-play-audio {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-play-audio:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-play-audio:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.audio-icon {
  font-size: 1.5rem;
}

.question-title {
  text-align: center;
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

/* Options */
.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.option-card {
  position: relative;
  background: #f8f9fa;
  border: 4px solid #dee2e6;
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.option-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.option-card.selected {
  border-color: #3498db;
}

.option-card.correct {
  border-color: #27ae60;
  background: #d5f4e6;
}

.option-card.incorrect {
  border-color: #e74c3c;
  background: #fadbd8;
}

.option-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
}

.result-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: popIn 0.3s ease;
}

.result-indicator span {
  display: block;
}

.option-card.correct .result-indicator span {
  color: #27ae60;
}

.option-card.incorrect .result-indicator span {
  color: #e74c3c;
}

@keyframes popIn {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Results Screen */
.game-results {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.results-content {
  background: white;
  padding: 3rem;
  border-radius: 24px;
  text-align: center;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.results-title {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

/* Game Over Message Styles */
.game-over-message {
  background: linear-gradient(135deg, #fdcbcb 0%, #fdeaea 100%);
  border: 2px solid #e74c3c;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  animation: shakeIn 0.6s ease;
}

.game-over-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: heartbeat 1.5s ease infinite;
}

.game-over-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #c0392b;
  margin: 0.5rem 0;
}

.game-over-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0.5rem 0 0 0;
}

@keyframes shakeIn {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  10%, 30% { transform: scale(0.9); }
  20%, 40% { transform: scale(1.1); }
}

/* Failed Message Styles */
.failed-message {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe5b4 100%);
  border: 2px solid #f39c12;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  animation: fadeInDown 0.5s ease;
}

.failed-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: bounce 1s ease infinite;
}

.failed-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d68910;
  margin: 0.5rem 0;
}

.failed-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0.5rem 0 0 0;
  font-weight: 600;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Passed Badge Styles */
.passed-badge {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #28a745;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  animation: scaleIn 0.5s ease;
}

.badge-icon {
  font-size: 3rem;
  margin-bottom: 0.3rem;
  animation: sparkle 1.5s ease infinite;
}

.badge-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: #155724;
  margin: 0;
}

.badge-subtitle {
  font-size: 1rem;
  color: #155724;
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* Backend Message Styles */
.backend-message {
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: fadeIn 0.5s ease;
  font-weight: 500;
}

.backend-message.success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #28a745;
  color: #155724;
}

.backend-message.info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  border: 2px solid #17a2b8;
  color: #0c5460;
}

.backend-message.warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe5b4 100%);
  border: 2px solid #ffc107;
  color: #856404;
}

.backend-message p {
  margin: 0;
  font-size: 1.1rem;
}

/* New High Score Badge */
.new-high-score-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  border: 3px solid #f39c12;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  animation: pulse 1s ease infinite, glow 2s ease infinite;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
}

.trophy-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: rotate 2s ease infinite;
}

.trophy-text {
  font-size: 1.8rem;
  font-weight: bold;
  color: #d68910;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.trophy-subtitle {
  font-size: 1.1rem;
  color: #856404;
  margin: 0.5rem 0 0 0;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 10px 40px rgba(255, 215, 0, 0.6); }
}

@keyframes rotate {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.score-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  border: 8px solid;
  animation: scaleIn 0.5s ease;
}

.score-circle.excellent {
  border-color: #27ae60;
  background: linear-gradient(135deg, #d5f4e6, #a8e6cf);
}

.score-circle.good {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff4e6, #ffe8cc);
}

.score-circle.needs-practice {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #fadbd8, #f8b4b0);
}

.score-value {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.score-label {
  font-size: 1rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-comparison {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

.score-comparison small {
  display: block;
  margin-top: 0.3rem;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.results-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-icon.correct {
  background: #d5f4e6;
  color: #27ae60;
}

.stat-icon.incorrect {
  background: #fadbd8;
  color: #e74c3c;
}

.stat-icon.trophy {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #d68910;
  font-size: 1.8rem;
  animation: sparkle 1.5s ease infinite;
}

.stat-item.best-score {
  background: linear-gradient(135deg, #fff4e6, #ffe8cc);
  border: 2px solid #f39c12;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.results-message {
  font-size: 1.5rem;
  margin: 2rem 0;
}

.results-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.results-actions.dual-actions {
  justify-content: center;
}

.btn-retry {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-retry:hover {
  background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.btn-retry:active {
  transform: translateY(0);
}

.btn-retry .btn-icon {
  font-size: 1.3rem;
  display: inline-block;
  animation: rotateIcon 2s linear infinite;
}

.btn-retry:hover .btn-icon {
  animation: rotateIcon 0.6s linear infinite;
}

@keyframes rotateIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-right {
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
    justify-content: space-between;
  }

  .progress-info {
    margin: 0;
    width: 100%;
  }

  .options-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .option-card img {
    aspect-ratio: 1 / 1;
  }

  .results-stats {
    flex-direction: column;
    gap: 1rem;
  }

  /* Score Sidebar - ajuste móvil */
  .score-sidebar {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    transform: none;
  }

  /* Combo Counter - ajuste móvil */
  .game-header > .combo-counter {
    position: static;
    transform: none;
    margin: 0 auto;
  }
}
</style>
