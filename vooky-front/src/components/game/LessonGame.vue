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
      <button @click="handleClose" class="btn-primary">Volver</button>
    </div>

    <!-- Game Playing -->
    <div v-else-if="gameState === 'playing' && currentQuestion" class="game-container" ref="gameContainer">
      <!-- HUD Superior -->
      <div class="game-header">
        <!-- Combo Counter (centro) -->
        <ComboCounter :combo="currentCombo" :multiplier="comboMultiplier" />
        <button @click="handleConfirmExit" class="btn-exit">← Salir</button>
        
        
        
        <div class="header-right">
          <div class="progress-info">
            <span class="question-counter">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <button @click="handleToggleFullscreen" class="btn-fullscreen" :title="isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'">
            <font-awesome-icon :icon="isFullscreen ? 'compress' : 'expand'" />
          </button>
        </div>
      </div>
      
      <!-- Score Display (lateral derecho) -->
      <ScoreDisplay :score="score" class="score-sidebar" />

      <!-- Question Area -->
      <div class="question-area">
        <div class="audio-section">
          <button @click="handlePlayQuestionAudio" class="btn-play-audio" :disabled="isPlayingAudio">
            <span class="audio-icon">🔊</span>
            <span class="audio-text">{{ isPlayingAudio ? 'Reproduciendo...' : 'Escuchar Audio' }}</span>
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
        <!-- Título Principal con emoji dinámico -->
        <div class="results-header">
          <div class="results-emoji">
            {{ finishedByErrors ? '💔' : (passedLesson ? '🎉' : '📚') }}
          </div>
          <h1 class="results-title">
            {{ finishedByErrors ? 'Game Over' : (passedLesson ? '¡Aprobaste!' : 'Necesitas Practicar Más') }}
          </h1>
          <p class="results-subtitle" v-if="finishedByErrors">
            5 errores consecutivos
          </p>
          <p class="results-subtitle" v-else-if="!passedLesson">
            Necesitas al menos 75% de aciertos
          </p>
          <p class="results-subtitle" v-else-if="isNewHighScore">
            ¡Nuevo récord personal!
          </p>
          <p class="results-subtitle" v-else-if="accuracyPercentage >= 90">
            ¡Excelente trabajo!
          </p>
        </div>
        
        <!-- Círculo de Puntuación Principal -->
        <div class="score-display">
          <div class="score-circle" :class="scoreClass">
            <div class="score-value">{{ finalScore.toLocaleString() }}</div>
            <div class="score-label">PUNTOS</div>
          </div>
          <div class="accuracy-badge" :class="{ 'passed': passedLesson, 'failed': !passedLesson }">
            <span class="accuracy-value">{{ accuracyPercentage }}%</span>
            <span class="accuracy-label">Precisión</span>
          </div>
        </div>

        <!-- Estadísticas en Cards -->
        <div class="results-stats-grid">
          <div class="stat-card correct">
            <div class="stat-icon">✓</div>
            <div class="stat-number">{{ correctAnswers }}</div>
            <div class="stat-label">Correctas</div>
          </div>

          <div class="stat-card incorrect">
            <div class="stat-icon">✗</div>
            <div class="stat-number">{{ incorrectAnswers }}</div>
            <div class="stat-label">Incorrectas</div>
          </div>
          
          <div v-if="bestScore > finalScore && !finishedByErrors" class="stat-card record">
            <div class="stat-icon">🏆</div>
            <div class="stat-number">{{ bestScore.toLocaleString() }}</div>
            <div class="stat-label">Tu Récord</div>
          </div>
          
          <div v-else-if="isNewHighScore && !finishedByErrors" class="stat-card new-record">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">¡Nuevo!</div>
            <div class="stat-label">Récord</div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="results-actions">
          <!-- Botón de Reintentar (solo si no aprobó o quiere mejorar) -->
          <button 
            v-if="!passedLesson || wasAlreadyCompleted" 
            @click="handleRestartLesson" 
            class="btn-action btn-retry">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">
              {{ wasAlreadyCompleted ? 'Mejorar Puntuación' : 'Reintentar' }}
            </span>
          </button>
          
          <!-- Botón de Siguiente Lección (solo si aprobó y hay siguiente) -->
          <button 
            v-if="passedLesson && nextLesson" 
            @click="handleNextLesson" 
            class="btn-action btn-next">
            <span class="btn-text">Siguiente Lección</span>
            <span class="btn-icon">→</span>
          </button>
          
          <!-- Botón de Volver al Mapa (siempre visible) -->
          <button 
            @click="handleBackToMap" 
            class="btn-action btn-map">
            <span class="btn-icon">🗺️</span>
            <span class="btn-text">Volver al Mapa</span>
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
          <button @click="handleCancelExit" class="btn-secondary">Cancelar</button>
          <button @click="handleExitGame" class="btn-danger">Salir</button>
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
  allLessons?: Array<{ id: number; [key: string]: any }>;
}>();

const emit = defineEmits(['close', 'next-lesson']);

// Computed para siguiente lección
const nextLesson = computed(() => {
  if (!props.allLessons || props.allLessons.length === 0) return null;
  const currentIndex = props.allLessons.findIndex(l => l.id === props.lessonId);
  if (currentIndex === -1 || currentIndex === props.allLessons.length - 1) return null;
  return props.allLessons[currentIndex + 1];
});

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
  playVictorySound,
  playGameOverSound,
  playUIClick,
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
    const errorResponse = err as { 
      response?: { 
        data?: { 
          message?: string;
          error?: string;
          status?: string;
        };
        status?: number;
      } 
    };
    
    // Manejar errores específicos de inscripción
    if (errorResponse.response?.status === 403) {
      const errorCode = errorResponse.response.data?.error;
      
      if (errorCode === 'NOT_ENROLLED') {
        error.value = '🔒 No estás inscrito en este curso. Contacta al administrador para inscribirte.';
      } else if (errorCode === 'ENROLLMENT_NOT_ACTIVE') {
        const enrollmentStatus = errorResponse.response.data?.status;
        
        if (enrollmentStatus === 'pending') {
          error.value = '⏳ Tu inscripción está pendiente. Realiza el pago de la matrícula para activar el curso.';
        } else if (enrollmentStatus === 'inactive') {
          error.value = '⚠️ Tu acceso al curso ha sido suspendido. Contacta al administrador.';
        } else {
          error.value = errorResponse.response.data?.message || 'No tienes acceso a este curso.';
        }
      } else {
        error.value = errorResponse.response.data?.message || 'No tienes permiso para acceder a esta lección.';
      }
    } else {
      error.value = errorResponse.response?.data?.message || 'Error al cargar la lección';
    }
  } finally {
    loading.value = false;
  }
}

// Wrapper functions para botones con sonido UI
function handleClose() {
  playUIClick();
  emit('close');
}

function handleConfirmExit() {
  playUIClick();
  confirmExit();
}

function handleToggleFullscreen() {
  playUIClick();
  toggleFullscreen();
}

function handlePlayQuestionAudio() {
  playUIClick();
  playQuestionAudio();
}

function handleRestartLesson() {
  playUIClick();
  restartLesson();
}

function handleCancelExit() {
  playUIClick();
  showExitConfirm.value = false;
}

function handleExitGame() {
  playUIClick();
  exitGame();
}

function handleNextLesson() {
  if (!nextLesson.value) return;
  playUIClick();
  
  // Resetear las variables antes de cambiar de lección
  currentQuestionIndex.value = 0;
  correctAnswers.value = 0;
  incorrectAnswers.value = 0;
  consecutiveErrors.value = 0;
  
  // Emitir el evento para cambiar a la siguiente lección
  emit('next-lesson', nextLesson.value.id);
}

function handleBackToMap() {
  playUIClick();
  emit('close');
}

// Funciones relacionadas con toggle fullscreen
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
    
    // Audio según combo (NO reproducir en la última pregunta)
    const isLastQuestion = currentQuestionIndex.value === totalQuestions.value - 1;
    if (!isLastQuestion) {
      playCorrectSound(result.comboLevel);
    }
    
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
        // Reproducir el audio de la pregunta DESPUÉS del sonido especial (y solo una vez)
        setTimeout(() => playQuestionAudio(), 2000); // Aumentado a 2000ms para que no se solape
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
    
    // Reproducir sonido según el resultado
    if (result.passed) {
      playVictorySound(); // Sonido de victoria si aprobó
    } else {
      playGameOverSound(); // Sonido de game over si no aprobó
    }
    
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
    
    // Reproducir sonido según el resultado calculado
    if (passedLesson.value) {
      playVictorySound();
    } else {
      playGameOverSound();
    }
    
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
  finishedByErrors.value = true; // Marcar que terminó por errores
  passedLesson.value = false; // No puede aprobar si terminó por errores
  
  // Calcular bonificaciones finales (aunque sean pocas por los errores)
  calculateFinalBonuses();
  
  // El game score es el puntaje real del sistema de combos
  const gameScore = score.value;
  
  // Reproducir sonido de game over (siempre, porque terminó por errores)
  playGameOverSound();
  
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
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  max-height: 100vh;
  min-height: 100vh;
  max-width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  overflow-y: none;
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
  max-height: 100%;
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
  min-height: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-right {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Combo Counter - esquina inferior izquierda flotante */
.game-header > .combo-counter {
  position: fixed;
  top: 8vh;
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
  min-height: 70vh;
  max-height: 70vh;
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
  place-items: center;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 90%;
  max-height: 50vh;
  margin: 0 auto;
}

.option-card {
  aspect-ratio: 1 / 1;
  background: #f8f9fa;
  border: 4px solid #dee2e6;
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  max-height: 45vh;
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
  width: 100%;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.results-content {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 24px;
  text-align: center;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideInUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header Section - Título con Emoji */
.results-header {
  margin-bottom: 2rem;
}

.results-emoji {
  font-size: 5rem;
  margin-bottom: 0.5rem;
  animation: bounceIn 0.8s ease;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.results-title {
  color: #2c3e50;
  font-size: clamp(2rem, 5vw, 2.5rem);
  margin-bottom: 0.5rem;
  line-height: 1.2;
  font-weight: 700;
}

.results-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* Score Display - Círculo de Puntuación y Badge de Precisión */
.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 10px solid;
  animation: scaleIn 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
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

@keyframes scaleIn {
  0% { transform: scale(0) rotate(-180deg); }
  60% { transform: scale(1.1) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

.score-value {
  font-size: 3.5rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
}

.score-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Badge de Precisión */
.accuracy-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.6s ease;
}

.accuracy-badge.passed {
  background: linear-gradient(135deg, #d5f4e6, #a8e6cf);
  border: 3px solid #27ae60;
}

.accuracy-badge.failed {
  background: linear-gradient(135deg, #fadbd8, #f8b4b0);
  border: 3px solid #e74c3c;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.accuracy-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
}

.accuracy-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 0.3rem;
  font-weight: 600;
}

/* Stats Grid - Tarjetas de Estadísticas */
.results-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeInUp 0.6s ease backwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }

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

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-card.correct {
  background: linear-gradient(135deg, #d5f4e6, #a8e6cf);
  border: 2px solid #27ae60;
}

.stat-card.incorrect {
  background: linear-gradient(135deg, #fadbd8, #f8b4b0);
  border: 2px solid #e74c3c;
}

.stat-card.record {
  background: linear-gradient(135deg, #fff4e6, #ffe8cc);
  border: 2px solid #f39c12;
}

.stat-card.new-record {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  border: 3px solid #f39c12;
  animation: pulse 1.5s ease infinite, glow 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 8px 30px rgba(255, 215, 0, 0.7); }
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Botones de Acción */
.results-actions {
  margin-top: 2.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-action {
  flex: 1;
  min-width: 180px;
  max-width: 220px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-action:hover::before {
  width: 300px;
  height: 300px;
}

.btn-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-action:active {
  transform: translateY(-1px);
}

.btn-retry {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.btn-retry:hover {
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
}

.btn-retry .btn-icon {
  animation: rotateIcon 2s linear infinite;
}

.btn-retry:hover .btn-icon {
  animation: rotateIcon 0.5s linear infinite;
}

@keyframes rotateIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-next {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

.btn-next:hover {
  background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
}

.btn-next .btn-icon {
  animation: slideRight 1s ease infinite;
}

@keyframes slideRight {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.btn-map {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
}

.btn-map:hover {
  background: linear-gradient(135deg, #8e44ad 0%, #71368a 100%);
}

.btn-icon {
  font-size: 1.3rem;
  position: relative;
  z-index: 1;
}

.btn-text {
  position: relative;
  z-index: 1;
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
  /* Ocultar botón de pantalla completa en móvil */
  .btn-fullscreen {
    display: none;
  }

  /* Botón de audio flotante sobrepuesto */
  .audio-section {
    position: absolute;
    top: 10vh;
    width: 50px;
    z-index: 100;
    margin: 0;
    pointer-events: none; /* Permitir clics en elementos debajo */
    border: #fff4e6 3px solid;
    border-radius: 50%;
  }

  .btn-play-audio {
    pointer-events: auto; /* Solo el botón es clickeable */
    min-width: auto;
    padding: 0;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-play-audio .audio-text {
    display: none;
  }

  .btn-play-audio .audio-icon {
    font-size: 2rem;
    margin: 0;
  }

  /* Ocultar título de pregunta en móvil */
  .question-title {
    display: none;
  }

  /* Ajustes generales del header */
  .game-header {
    min-height: auto;
  }

  .header-right {
    flex-direction: row;
    gap: 0.5rem;
    flex: 1;
    justify-content: flex-end;
  }

  .progress-info {
    margin: 0;
    flex: 1;
  }

  /* Combo Counter - esquina inferior izquierda flotante */
  .game-header > .combo-counter {
    position: fixed !important; 
    top: 85%;
    left: 30px;
    z-index: 100;

  }

  /* Game container - sin scroll, altura completa */
  .game-container {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  /* Question area - sin padding, ocupar todo el espacio */
  .question-area {
    padding: 1px;
    min-height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Opciones - ocupar todo el espacio disponible */
  .options-container {
    display: flex;
    flex-direction: column;
    max-height: 90%;
    gap: 0.3rem;
    padding: 10px;
    padding-top: 0.3rem;
    margin-top: 2rem;
    align-content: center;
  }

  .option-card {
    aspect-ratio: 1 / 1;
  }

  .option-card img {
    aspect-ratio: 1/1;
    object-fit: cover;
    width: 100%;
    max-height: 40vh;
    height: 100%;
  }

  /* Score Sidebar - más pequeño y abajo derecha */
  .score-sidebar {
    position: fixed;
    top: 10%;
    bottom: 1rem;
    right: 1rem;
    transform: none;
    scale: 0.7;
    z-index: 50;
  }

  /* Results stats */
  .results-stats {
    flex-direction: column;
    gap: 1rem;
  }

  /* Ajustar botón de salir */
  .btn-exit {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  /* Question counter más pequeño */
  .question-counter {
    font-size: 0.85rem;
  }

  /* Progress bar más delgada */
  .progress-bar-container {
    height: 4px;
  }

  /* Results screen responsive */
  .results-content {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }

  .results-header {
    margin-bottom: 1.5rem;
  }

  .results-emoji {
    font-size: 3.5rem;
  }

  .results-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }

  .results-subtitle {
    font-size: 0.95rem;
  }

  .score-display {
    flex-direction: column;
    gap: 1.5rem;
    margin: 1.5rem 0;
  }

  .score-circle {
    width: 160px;
    height: 160px;
    border-width: 8px;
  }

  .score-value {
    font-size: 2.8rem;
  }

  .score-label {
    font-size: 0.8rem;
  }

  .accuracy-badge {
    padding: 1rem 1.5rem;
  }

  .accuracy-value {
    font-size: 2rem;
  }

  .accuracy-label {
    font-size: 0.75rem;
  }

  .results-stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .results-actions {
    margin-top: 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-action {
    min-width: 100%;
    max-width: 100%;
    font-size: 1rem;
    padding: 0.875rem 1.25rem;
  }

  .btn-icon {
    font-size: 1.1rem;
  }
}
</style>
