# 🎮 Cómo Integrar Efectos en LessonGame.vue

## Guía Paso a Paso

### 1. Importar el EffectsManager

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { EffectsManager } from '@/components/game/v2/effects';

// ... otros imports

const effectsRef = ref();
</script>
```

### 2. Agregar el componente al template

```vue
<template>
  <div class="lesson-game">
    <!-- Tu contenido existente del juego -->
    
    <!-- Agregar al final, antes de cerrar el div -->
    <EffectsManager ref="effectsRef" />
  </div>
</template>
```

### 3. Usar los efectos en tus funciones

#### En handleAnswerClick (cuando hacen clic en una imagen):

```typescript
function handleAnswerClick(selectedImage: Image, event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;
  
  if (isCorrect) {
    // Efecto de respuesta correcta
    effectsRef.value?.correctAnswer(x, y);
    
    // Mostrar puntos ganados
    effectsRef.value?.scoreGained(x, y, 10);
    
    // Si hay combo activo
    if (consecutiveCorrect > 1) {
      effectsRef.value?.comboAchieved(x, y, consecutiveCorrect);
    }
    
    correctAnswers++;
    currentScore += 10;
    consecutiveErrors = 0;
  } else {
    // Efecto de respuesta incorrecta
    effectsRef.value?.incorrectAnswer(x, y);
    
    consecutiveErrors++;
    consecutiveCorrect = 0;
    
    // Si alcanzó 5 errores consecutivos (game over)
    if (consecutiveErrors >= 5) {
      setTimeout(() => {
        effectsRef.value?.gameOver();
      }, 500);
    }
  }
}
```

#### Al completar la lección:

```typescript
function finishGame() {
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  if (percentage >= 75) {
    // Lección aprobada
    effectsRef.value?.levelComplete();
    
    // Mostrar puntuación final después del confeti
    setTimeout(() => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      effectsRef.value?.showFloatingText(
        'Puntuación Final',
        centerX,
        centerY - 50,
        {
          type: 'success',
          icon: '🎉',
          value: `${Math.round(percentage)}%`,
          size: 'large'
        }
      );
    }, 1000);
  } else {
    // Lección fallida
    effectsRef.value?.gameOver();
  }
  
  // Resto de tu lógica...
  saveProgress();
  showResults();
}
```

#### Al hacer clic en el botón de reiniciar:

```typescript
function restartLesson() {
  // Pequeño efecto al reiniciar
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  effectsRef.value?.flash('white', 300);
  effectsRef.value?.showFloatingText(
    '¡Nuevo Intento!',
    centerX,
    centerY,
    {
      type: 'info',
      icon: '🔄',
      size: 'medium'
    }
  );
  
  // Reset del estado del juego
  resetGameState();
}
```

### 4. Ejemplo Completo de Integración

```vue
<template>
  <div class="lesson-game" @click="handleBackgroundClick">
    <!-- Header con puntuación -->
    <div class="game-header">
      <div class="score-display">
        Puntos: {{ currentScore }}
      </div>
      <div class="combo-display" v-if="consecutiveCorrect > 1">
        🔥 Combo x{{ consecutiveCorrect }}
      </div>
    </div>

    <!-- Audio player -->
    <div class="audio-section">
      <button @click="playAudio" class="play-button">
        🔊 Reproducir Audio
      </button>
    </div>

    <!-- Grid de imágenes -->
    <div class="images-grid">
      <div
        v-for="image in currentImages"
        :key="image.id"
        class="image-card"
        @click="handleAnswerClick(image, $event)"
      >
        <img :src="getImageUrl(image.url)" :alt="image.name" />
      </div>
    </div>

    <!-- Game Over Modal -->
    <div v-if="showGameOver" class="game-over-modal">
      <h2>Game Over</h2>
      <p>5 errores consecutivos</p>
      <button @click="restartLesson">Reintentar</button>
      <button @click="goToMap">Volver al Mapa</button>
    </div>

    <!-- Results Modal -->
    <div v-if="showResults" class="results-modal">
      <h2>{{ isPassed ? '¡Felicitaciones!' : 'Intentar de Nuevo' }}</h2>
      <p>Puntuación: {{ finalPercentage }}%</p>
      <p>Respuestas correctas: {{ correctAnswers }}/{{ totalQuestions }}</p>
      <button v-if="isPassed" @click="goToMap">Continuar</button>
      <button v-else @click="restartLesson">Reintentar</button>
    </div>

    <!-- Effects Manager -->
    <EffectsManager ref="effectsRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EffectsManager } from '@/components/game/v2/effects';
import { getImageUrl } from '@/utils/urlHelper';
import type { Image, Question } from '@/types';

const router = useRouter();
const effectsRef = ref();

// Estado del juego
const currentScore = ref(0);
const correctAnswers = ref(0);
const totalQuestions = ref(0);
const consecutiveCorrect = ref(0);
const consecutiveErrors = ref(0);
const currentImages = ref<Image[]>([]);
const currentAudio = ref<HTMLAudioElement | null>(null);
const showGameOver = ref(false);
const showResults = ref(false);
const finalPercentage = ref(0);
const isPassed = ref(false);

function handleAnswerClick(selectedImage: Image, event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;
  
  // Tu lógica de verificación aquí
  const isCorrect = checkAnswer(selectedImage);
  
  if (isCorrect) {
    // ✅ EFECTOS DE RESPUESTA CORRECTA
    effectsRef.value?.correctAnswer(x, y);
    effectsRef.value?.scoreGained(x, y, 10);
    
    consecutiveCorrect.value++;
    correctAnswers.value++;
    currentScore.value += 10;
    consecutiveErrors.value = 0;
    
    // Combo cada 3 aciertos consecutivos
    if (consecutiveCorrect.value > 0 && consecutiveCorrect.value % 3 === 0) {
      effectsRef.value?.comboAchieved(x, y, consecutiveCorrect.value);
      currentScore.value += 20; // Bonus por combo
    }
    
    // Siguiente pregunta
    setTimeout(() => {
      loadNextQuestion();
    }, 1000);
    
  } else {
    // ❌ EFECTOS DE RESPUESTA INCORRECTA
    effectsRef.value?.incorrectAnswer(x, y);
    
    consecutiveErrors.value++;
    consecutiveCorrect.value = 0;
    
    // Game Over después de 5 errores
    if (consecutiveErrors.value >= 5) {
      setTimeout(() => {
        effectsRef.value?.gameOver();
        showGameOver.value = true;
      }, 800);
    }
  }
}

function finishGame() {
  const percentage = (correctAnswers.value / totalQuestions.value) * 100;
  finalPercentage.value = Math.round(percentage);
  isPassed.value = percentage >= 75;
  
  if (isPassed.value) {
    // 🎉 NIVEL COMPLETADO
    effectsRef.value?.levelComplete();
    
    // Mostrar puntuación final
    setTimeout(() => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      effectsRef.value?.showFloatingText(
        'Puntuación',
        centerX,
        centerY - 50,
        {
          type: 'success',
          icon: '⭐',
          value: `${finalPercentage.value}%`,
          size: 'large'
        }
      );
      
      showResults.value = true;
    }, 1500);
    
  } else {
    // 😢 NO APROBADO
    effectsRef.value?.gameOver();
    
    setTimeout(() => {
      showResults.value = true;
    }, 1000);
  }
  
  // Guardar progreso
  saveProgress();
}

function restartLesson() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // 🔄 EFECTO DE REINICIO
  effectsRef.value?.flash('white', 300);
  effectsRef.value?.showFloatingText(
    '¡Nuevo Intento!',
    centerX,
    centerY,
    {
      type: 'info',
      icon: '🔄',
      size: 'medium'
    }
  );
  
  // Reset
  currentScore.value = 0;
  correctAnswers.value = 0;
  consecutiveCorrect.value = 0;
  consecutiveErrors.value = 0;
  showGameOver.value = false;
  showResults.value = false;
  
  // Recargar juego
  loadGame();
}

function handleBackgroundClick(event: MouseEvent) {
  // Efecto sutil al hacer clic en el fondo
  const x = event.clientX;
  const y = event.clientY;
  
  // Solo si no es un clic en una imagen
  if (!(event.target as HTMLElement).closest('.image-card')) {
    effectsRef.value?.triggerRipple(x, y, 'neutral');
  }
}

// ... resto de tus funciones
</script>
```

### 5. Efectos Adicionales Opcionales

#### Efecto al cargar cada pregunta:
```typescript
function loadNextQuestion() {
  // Pequeño flash al cambiar pregunta
  effectsRef.value?.flash('white', 200);
  
  // Tu lógica de carga...
}
```

#### Efecto al reproducir audio:
```typescript
function playAudio() {
  const centerX = window.innerWidth / 2;
  const y = 100;
  
  effectsRef.value?.triggerRipple(centerX, y, 'neutral');
  
  // Reproducir audio...
}
```

#### Efecto de tiempo límite (si implementas):
```typescript
function onTimeRunOut() {
  effectsRef.value?.flash('error', 400);
  effectsRef.value?.showFloatingText(
    '¡Tiempo!',
    window.innerWidth / 2,
    window.innerHeight / 2,
    {
      type: 'error',
      icon: '⏰',
      size: 'large'
    }
  );
}
```

---

## 🎯 Resumen de Mejores Prácticas

1. **Usar ref correctamente**: `effectsRef.value?.metodo()`
2. **Coordenadas del mouse**: Usar `event.clientX` y `event.clientY`
3. **Delays entre efectos**: Usar `setTimeout()` para secuenciar
4. **Combinar efectos**: Usar múltiples efectos para acciones importantes
5. **Performance**: Los efectos se autodestruyen, no acumules muchos simultáneos

---

## ✨ Resultado Final

Con esta integración, tu juego tendrá:

- ✅ **Feedback visual inmediato** en cada acción
- ✅ **Celebración épica** al completar niveles
- ✅ **Indicadores claros** de éxito/error
- ✅ **Experiencia más inmersiva** y divertida
- ✅ **Combos visuales** que motivan al jugador

¡Disfruta de los efectos! 🎮✨
