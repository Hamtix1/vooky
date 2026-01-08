<template>
  <div class="game-map" ref="gameMapContainer">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <AppLogo size="large" :clickable="false" :showText="true" />
        <h2 class="loading-title">Cargando Mapa</h2>
        <p class="loading-text">Preparando tu aventura</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Header del curso (sticky) -->
    <div class="map-header">`
      <button @click="$emit('back')" class="btn-back">
        <font-awesome-icon icon="arrow-left" />
        <span>Volver</span>
      </button>
      <div class="course-info">
        <h1 class="course-title">{{ course.title }}</h1>
        <div class="progress-summary">
          <div class="progress-bar-wrapper">
            <div class="progress-bar" :style="{ width: overallProgress + '%' }">
              <span class="progress-percentage">{{ Math.round(overallProgress) }}%</span>
            </div>
          </div>
          <div class="stats-row">
            <span class="progress-text">
              <font-awesome-icon icon="star" class="icon-star" />
              {{ completedLessons }} / {{ totalLessons }}
            </span>
            <span class="score-text" v-if="completedLessons > 0">
              <font-awesome-icon icon="trophy" class="icon-trophy" />
              {{ totalGameScore }} pts
            </span>
          </div>
        </div>
      </div>
      <button @click="toggleFullscreen" class="btn-fullscreen" :title="isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'">
        <font-awesome-icon :icon="isFullscreen ? 'compress' : 'expand'" />
      </button>
    </div>

    <!-- Contenedor scrolleable del mapa -->
    <div class="map-scroll-container" ref="scrollContainer">
      <div class="map-container" ref="mapContainer">
        <svg class="path-svg" :width="svgWidth" :height="svgHeight">
          <!-- Línea del camino con efecto de fondo -->
          <path
            :d="pathData"
            class="lesson-path-shadow"
            fill="none"
            stroke="rgba(0, 0, 0, 0.2)"
            stroke-width="16"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            :d="pathData"
            class="lesson-path"
            fill="none"
            stroke="#bdc3c7"
            stroke-width="12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Línea de progreso animada -->
          <path
            :d="progressPathData"
            class="progress-path"
            fill="none"
            stroke="url(#progressGradient)"
            stroke-width="14"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          
          <!-- Gradientes mejorados -->
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#8BC34A;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#29B6F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FF5598;stop-opacity:1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>

        <!-- Separadores de nivel -->
        <div
          v-for="separator in levelSeparators"
          :key="'separator-' + separator.levelId"
          class="level-separator"
          :style="{ top: separator.y + 'px' }"
        >
          <div class="separator-line"></div>
          <div class="separator-label">
            <span class="level-icon">🏆</span>
            <span class="level-name">{{ separator.levelName }}</span>
          </div>
          <div class="separator-line"></div>
        </div>

        <!-- Nodos de lecciones mejorados -->
        <div
          v-for="(node, index) in lessonNodes"
          :key="node.lesson.id"
          class="lesson-node"
          :class="{
            'completed': node.completed,
            'available': node.available,
            'locked': !node.available,
            'current': node.current
          }"
          :style="{ left: node.x + 'px', top: node.y + 'px' }"
          :ref="el => { if (node.current) currentNodeRef = el as HTMLElement }"
          @click="handleNodeClick(node)"
        >
          <!-- Halo/Brillo para nodo actual -->
          <div v-if="node.current" class="node-halo"></div>
          
          <!-- Número de lección visible -->
          <div class="lesson-number-badge">
            Lección {{ index + 1 }}
          </div>
          
          <!-- Número o icono del nodo -->
          <div class="node-circle">
            <div class="node-circle-inner"></div>
            <span v-if="node.completed" class="node-icon">{{ getStarsForAccuracy(node.accuracy) }}</span>
            <span v-else-if="!node.available" class="node-icon">🔒</span>
            <span v-else class="node-number">{{ index + 1 }}</span>
          </div>

          <!-- Información del nodo (tooltip) -->
          <div class="node-info" @click.stop>
            <div class="info-bubble">
              <h3>{{ node.lesson.title }}</h3>
              <div class="lesson-details">
                <span class="detail-badge">{{ getLessonTypeLabel(node.lesson.content_type) }}</span>
                <span v-if="node.lesson.dia" class="detail-badge">📅 Día {{ node.lesson.dia }}</span>
              </div>
              
              <!-- Métricas de rendimiento -->
              <div v-if="node.completed" class="performance-stats">
                <div class="stat-row">
                  <div class="stat-item primary">
                    <font-awesome-icon icon="trophy" class="stat-icon" />
                    <div class="stat-content">
                      <span class="stat-label">Puntuación</span>
                      <span class="stat-value">{{ node.gameScore?.toLocaleString() || 0 }} pts</span>
                    </div>
                  </div>
                </div>
                <div class="stat-row secondary">
                  <div class="stat-item">
                    <font-awesome-icon icon="check-circle" class="stat-icon" />
                    <div class="stat-content">
                      <span class="stat-label">Último intento</span>
                      <span class="stat-value">{{ node.correctAnswers }}/{{ node.totalQuestions }}</span>
                    </div>
                  </div>
                </div>
                <div class="stat-row stars">
                  <div class="stat-item">
                    <div class="star-rating">
                      <span class="stars-display">{{ getStarsForAccuracy(node.accuracy) }}</span>
                      <span class="accuracy-text">{{ node.accuracy }}% de aciertos</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                v-if="node.available" 
                class="btn-play"
                :class="{ 'completed': node.completed }"
                @click="handleNodeClick(node)"
              >
                <font-awesome-icon :icon="node.completed ? 'redo' : 'play'" />
                {{ node.completed ? 'Reintentar' : 'Jugar' }}
              </button>
              <div v-else class="locked-message">
                <font-awesome-icon icon="lock" />
                Completa la lección anterior
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal del juego -->
    <LessonGame 
      v-if="showGame && selectedLessonId" 
      :lesson-id="selectedLessonId"
      @close="handleGameClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import LessonGame from '@/components/game/LessonGame.vue';
import AppLogo from '@/components/common/AppLogo.vue';
import { getLessonProgress } from '@/services/lessonGameService';
import api from '@/config/api';
import type { Course, Lesson as BaseLesson } from '@/services/courseService';

// Interfaz para elementos con soporte de pantalla completa
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

type LessonWithLevel = BaseLesson & { level_id: number };

interface LessonNode {
  lesson: LessonWithLevel;
  x: number;
  y: number;
  completed: boolean;
  available: boolean;
  current: boolean;
  gameScore: number | null; // Puntuación del juego con combos (puede ser miles de puntos)
  accuracy: number | null; // Porcentaje de aciertos (0-100)
  correctAnswers: number | null; // Preguntas correctas del último intento
  totalQuestions: number | null; // Total de preguntas del último intento
}

const props = defineProps<{
  course: Course;
}>();

defineEmits(['back']);

interface LevelSeparator {
  levelId: number;
  levelName: string;
  y: number;
}

// State
const gameMapContainer = ref<HTMLElement | null>(null);
const mapContainer = ref<HTMLElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const currentNodeRef = ref<HTMLElement | null>(null);
const lessonNodes = ref<LessonNode[]>([]);
const levelSeparators = ref<LevelSeparator[]>([]);
const showGame = ref(false);
const selectedLessonId = ref<number | null>(null);
const svgWidth = ref(800);
const svgHeight = ref(2000);
const isFullscreen = ref(false);
const isLoading = ref(true); // Estado de carga del mapa

// Computed
const allLessons = computed(() => {
  const lessons: LessonWithLevel[] = [];
  if (!props.course.levels) return lessons;
  
  props.course.levels.forEach(level => {
    if (level.lessons) {
      // Agregar level_id a cada lección
      const lessonsWithLevelId = level.lessons.map(lesson => ({
        ...lesson,
        level_id: level.id
      }));
      lessons.push(...lessonsWithLevelId);
    }
  });
  // Ordenar por nivel y luego por día
  return lessons.sort((a, b) => {
    if (a.level_id !== b.level_id) {
      return a.level_id - b.level_id;
    }
    return (a.dia || 0) - (b.dia || 0);
  });
});

const totalLessons = computed(() => allLessons.value.length);

const completedLessons = computed(() => 
  lessonNodes.value.filter(node => node.completed).length
);

const overallProgress = computed(() => 
  totalLessons.value > 0 ? (completedLessons.value / totalLessons.value) * 100 : 0
);

// Puntaje total acumulado (suma de game_scores)
const totalGameScore = computed(() => {
  return lessonNodes.value
    .filter(node => node.completed && node.gameScore !== null)
    .reduce((sum, node) => sum + Number(node.gameScore || 0), 0);
});

// Puntaje máximo posible (100 por cada lección completada)

const pathData = computed(() => {
  if (lessonNodes.value.length < 2) return '';
  
  let path = '';
  let currentLevelId = lessonNodes.value[0].lesson.level_id;
  
  // Empezar desde el centro del primer nodo
  path = `M ${lessonNodes.value[0].x + 35} ${lessonNodes.value[0].y + 35}`;
  
  for (let i = 1; i < lessonNodes.value.length; i++) {
    const current = lessonNodes.value[i];
    const prev = lessonNodes.value[i - 1];
    
    // Detectar cambio de nivel - cortar el camino y reiniciar
    if (current.lesson.level_id !== currentLevelId) {
      currentLevelId = current.lesson.level_id;
      // Reiniciar el camino desde el nuevo nodo
      path += ` M ${current.x + 35} ${current.y + 35}`;
      continue;
    }
    
    // Centro de cada nodo
    const prevCenterX = prev.x + 35;
    const prevCenterY = prev.y + 35;
    const currCenterX = current.x + 35;
    const currCenterY = current.y + 35;
    
    // Determinar el tipo de conexión según posición
    const prevPos = (i - 1) % 4;
    const currPos = i % 4;
    
    // Centro a Centro (posición 1→2 o 3→0): CURVA PRONUNCIADA
    const isCenterToCenter = (prevPos === 1 && currPos === 2) || (prevPos === 3 && currPos === 0);
    
    // Extremo a Centro o Centro a Extremo: LÍNEA RECTA
    const isExtremeToCenter = (prevPos === 0 || prevPos === 2) && (currPos === 1 || currPos === 3);
    const isCenterToExtreme = (prevPos === 1 || prevPos === 3) && (currPos === 0 || currPos === 2);
    
    if (isExtremeToCenter || isCenterToExtreme) {
      // Línea recta para conexiones a/desde centro
      path += ` L ${currCenterX} ${currCenterY}`;
    } else if (isCenterToCenter) {
      // Curva MUY pronunciada para centro a centro (cambio de dirección)
      const dx = currCenterX - prevCenterX;
      const dy = currCenterY - prevCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      const controlDistance = distance * 20; // Factor alto para curva pronunciada
      
      const cp1x = prevCenterX + Math.cos(angle) * controlDistance;
      const cp1y = prevCenterY + Math.sin(angle) * controlDistance;
      
      const cp2x = currCenterX - Math.cos(angle) * controlDistance;
      const cp2y = currCenterY - Math.sin(angle) * controlDistance;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currCenterX} ${currCenterY}`;
    } else {
      // Fallback: línea recta
      path += ` L ${currCenterX} ${currCenterY}`;
    }
  }
  
  return path;
});

const progressPathData = computed(() => {
  if (lessonNodes.value.length < 2) return '';
  
  const completedIndex = lessonNodes.value.findIndex(node => !node.completed);
  const lastCompletedIndex = completedIndex === -1 ? lessonNodes.value.length - 1 : completedIndex - 1;
  
  if (lastCompletedIndex < 0) return '';
  
  let path = '';
  let currentLevelId = lessonNodes.value[0].lesson.level_id;
  
  // Empezar desde el centro del primer nodo
  path = `M ${lessonNodes.value[0].x + 35} ${lessonNodes.value[0].y + 35}`;
  
  for (let i = 1; i <= lastCompletedIndex; i++) {
    const current = lessonNodes.value[i];
    const prev = lessonNodes.value[i - 1];
    
    // Detectar cambio de nivel - cortar el camino y reiniciar
    if (current.lesson.level_id !== currentLevelId) {
      currentLevelId = current.lesson.level_id;
      // Reiniciar el camino desde el nuevo nodo
      path += ` M ${current.x + 35} ${current.y + 35}`;
      continue;
    }
    
    // Centro de cada nodo
    const prevCenterX = prev.x + 35;
    const prevCenterY = prev.y + 35;
    const currCenterX = current.x + 35;
    const currCenterY = current.y + 35;
    
    const prevPos = (i - 1) % 4;
    const currPos = i % 4;
    
    const isCenterToCenter = (prevPos === 1 && currPos === 2) || (prevPos === 3 && currPos === 0);
    const isExtremeToCenter = (prevPos === 0 || prevPos === 2) && (currPos === 1 || currPos === 3);
    const isCenterToExtreme = (prevPos === 1 || prevPos === 3) && (currPos === 0 || currPos === 2);
    
    if (isExtremeToCenter || isCenterToExtreme) {
      path += ` L ${currCenterX} ${currCenterY}`;
    } else if (isCenterToCenter) {
      const dx = currCenterX - prevCenterX;
      const dy = currCenterY - prevCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      const controlDistance = distance * 0.85;
      
      const cp1x = prevCenterX + Math.cos(angle) * controlDistance;
      const cp1y = prevCenterY + Math.sin(angle) * controlDistance;
      
      const cp2x = currCenterX - Math.cos(angle) * controlDistance;
      const cp2y = currCenterY - Math.sin(angle) * controlDistance;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currCenterX} ${currCenterY}`;
    } else {
      path += ` L ${currCenterX} ${currCenterY}`;
    }
  }
  
  return path;
});

// Methods
async function loadLessonProgress() {
  isLoading.value = true; // Activar indicador de carga
  
  try {
    // OPTIMIZACIÓN: Obtener progreso de TODAS las lecciones en UNA sola llamada
    // En lugar de hacer N requests (uno por lección), hacemos 1
    const lessonIds = allLessons.value.map(lesson => lesson.id);
    
    let progressMap: Record<number, any> = {};
    
    // Intentar usar el nuevo endpoint batch si existe
    try {
      const batchResponse = await api.post('/lessons/batch/progress', { lesson_ids: lessonIds });
      progressMap = batchResponse.data.data || {};
    } catch (err) {
      // Fallback a llamadas individuales si el endpoint no existe
      console.warn('Batch progress endpoint not available, falling back to individual calls:', err);
      for (const lesson of allLessons.value) {
        try {
          progressMap[lesson.id] = await getLessonProgress(lesson.id);
        } catch (e) {
          console.error(`Error loading progress for lesson ${lesson.id}:`, e);
        }
      }
    }
    
    const nodes: LessonNode[] = [];
    let previousCompleted = true;
    
    for (let i = 0; i < allLessons.value.length; i++) {
      const lesson = allLessons.value[i];
      const progress = progressMap[lesson.id];
      const completed = progress?.completed || false;
      const available = i === 0 || previousCompleted;
      
      nodes.push({
        lesson,
        x: 0,
        y: 0,
        completed,
        available,
        current: !completed && available,
        gameScore: progress?.game_score || null,
        accuracy: progress?.accuracy || null,
        correctAnswers: progress?.correct_answers || null,
        totalQuestions: progress?.total_questions || null
      });
      previousCompleted = completed;
    }
    
    lessonNodes.value = nodes;
    
    await nextTick();
    calculateNodePositions();
  } catch (err) {
    console.error('Error loading lesson progress:', err);
  } finally {
    // Pequeño delay para asegurar que todo se renderice
    setTimeout(() => {
      isLoading.value = false; // Desactivar indicador de carga
    }, 500);
  }
}

function calculateNodePositions() {
  if (!mapContainer.value) return;
  
  const containerWidth = mapContainer.value.clientWidth || 800;
  const padding = 80;
  const verticalSpacing = 140; // Distancia para extremos
  const centerSpacing = 110; // Distancia reducida para nodos del centro
  const horizontalOffset = 200; // Desplazamiento izquierda/derecha
  const centerX = containerWidth / 2 - 35;
  const levelSeparatorHeight = 80; // Espacio para los separadores de nivel
  
  let currentY = 100;
  let currentLevelId: number | null = null;
  const separators: LevelSeparator[] = [];
  
  svgWidth.value = containerWidth;
  
  lessonNodes.value.forEach((node, index) => {
    // Detectar cambio de nivel y agregar separador ANTES del nodo
    if (currentLevelId !== null && node.lesson.level_id !== currentLevelId) {
      // Buscar el nombre del nivel
      const level = props.course.levels?.find(l => l.id === node.lesson.level_id);
      if (level) {
        // Colocar el separador en la posición actual (antes de incrementar Y)
        separators.push({
          levelId: node.lesson.level_id,
          levelName: level.title,
          y: currentY - 20 // Posicionar un poco arriba para darle espacio
        });
      }
      
      // Agregar espacio para el separador
      currentY += levelSeparatorHeight;
    }
    currentLevelId = node.lesson.level_id;
    // Posición X: patrón izquierda → centro → derecha → centro
    const position = index % 4;
    let xOffset = 0;
    
    if (position === 0) {
      xOffset = -horizontalOffset; // Izquierda
    } else if (position === 1) {
      xOffset = 0; // Centro
    } else if (position === 2) {
      xOffset = horizontalOffset; // Derecha
    } else {
      xOffset = 0; // Centro
    }
    
    const xPos = Math.max(padding, Math.min(containerWidth - padding - 70, centerX + xOffset));
    
    node.x = xPos;
    node.y = currentY;
    
    // Incrementar Y según si el siguiente es centro o extremo
    // Si estamos en extremo (0 o 2) y el siguiente es centro (1 o 3), usar espacio reducido
    // Si estamos en centro y el siguiente es extremo, usar espacio reducido
    // Si estamos en centro y el siguiente es centro (3→0), usar espacio normal
    const nextPosition = (index + 1) % 4;
    const isToCenter = (position === 0 || position === 2) && (nextPosition === 1 || nextPosition === 3);
    const isFromCenter = (position === 1 || position === 3) && (nextPosition === 0 || nextPosition === 2);
    
    if (isToCenter || isFromCenter) {
      currentY += centerSpacing; // Espacio reducido hacia/desde centro
    } else {
      currentY += verticalSpacing; // Espacio normal
    }
  });
  
  // Asignar los separadores calculados
  levelSeparators.value = separators;
  
  // Calcular altura total del SVG basado en la última posición Y
  svgHeight.value = currentY + 100;
}

function scrollToCurrentNode() {
  // Esperar a que el DOM esté completamente renderizado
  nextTick(() => {
    setTimeout(() => {
      if (!scrollContainer.value) return;
      
      // Buscar el nodo actual
      const currentNode = lessonNodes.value.find(node => node.current);
      if (!currentNode) return;
      
      const containerHeight = scrollContainer.value.clientHeight;
      const scrollPosition = currentNode.y - (containerHeight / 2) + 35; // Centrar verticalmente
      
      scrollContainer.value.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }, 300); // Pequeño delay para asegurar que todo esté renderizado
  });
}

function getLessonTypeLabel(contentType: string): string {
  const labels: Record<string, string> = {
    'combinadas': 'Combinadas',
    'enlace_categoria': 'Misma Categoría',
    'mixto': 'Mixto'
  };
  return labels[contentType] || contentType;
}

/**
 * Calcula cuántas estrellas mostrar según el accuracy
 * 75-84%: ⭐ (1 estrella)
 * 85-99%: ⭐⭐ (2 estrellas)
 * 100%: ⭐⭐⭐ (3 estrellas)
 */
function getStarsForAccuracy(accuracy: number | null): string {
  if (!accuracy) return '⭐';
  
  if (accuracy >= 100) return '⭐⭐⭐';
  if (accuracy >= 85) return '⭐⭐';
  return '⭐';
}

function handleNodeClick(node: LessonNode) {
  if (!node.available) return;
  
  selectedLessonId.value = node.lesson.id;
  showGame.value = true;
}

async function handleGameClose() {
  showGame.value = false;
  selectedLessonId.value = null;
  
  // Recargar progreso después de jugar
  await loadLessonProgress();
}

// Funciones de pantalla completa
function toggleFullscreen() {
  if (isFullscreen.value) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function enterFullscreen() {
  const elem = gameMapContainer.value as FullscreenElement;
  if (elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }
}

function exitFullscreen() {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  } else if (doc.msExitFullscreen) {
    doc.msExitFullscreen();
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(async () => {
  await loadLessonProgress();
  
  // Scroll automático al nodo actual
  scrollToCurrentNode();
  
  // Recalcular posiciones al cambiar tamaño de ventana
  window.addEventListener('resize', calculateNodePositions);
  
  // Escuchar cambios de pantalla completa
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.game-map {
  min-height: 100vh;
  background: linear-gradient(180deg, #8BC34A 0%, #29B6F6 50%, #FF5598 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 50%, #FF5598 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: dotBounce 1.4s infinite ease-in-out both;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.map-header {
  background: rgba(255, 255, 255, 0.98);
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.btn-back {
  background: transparent;
  border: 2px solid #29B6F6;
  color: #29B6F6;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-back:hover {
  background: #29B6F6;
  color: white;
  transform: translateX(-5px);
  box-shadow: 0 4px 15px rgba(41, 182, 246, 0.4);
}

.btn-fullscreen {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #FF5598 0%, #F50057 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(255, 85, 152, 0.4);
  z-index: 1000;
}

.btn-fullscreen:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 85, 152, 0.6);
}

.btn-fullscreen:active {
  transform: scale(0.95);
}

.course-info {
  flex: 1;
  text-align: center;
}

.course-title {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.progress-bar-wrapper {
  position: relative;
  width: 350px;
  height: 16px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8BC34A 0%, #29B6F6 100%);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

.progress-percentage {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.progress-text,
.score-text {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-star {
  color: #FFA726;
  animation: star-twinkle 2s ease-in-out infinite;
}

.icon-trophy {
  color: #FFA726;
  animation: trophy-pulse 1.5s ease-in-out infinite;
}

@keyframes trophy-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes star-twinkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(10deg); }
}

.map-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  position: relative;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
}

/* Custom scrollbar */
.map-scroll-container::-webkit-scrollbar {
  width: 12px;
}

.map-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin: 10px 0;
}

.map-scroll-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8BC34A, #29B6F6);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.map-scroll-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #689F38, #0288D1);
}

.map-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 600px;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.path-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  width: 100%;
  will-change: transform;
}

.lesson-path-shadow {
  opacity: 0.2;
  filter: blur(3px);
}

.lesson-path {
  opacity: 0.4;
  stroke-width: 12;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.progress-path {
  opacity: 1;
  filter: drop-shadow(0 0 12px rgba(139, 195, 74, 0.8)) url(#glow);
  stroke-width: 14;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: path-glow 3s ease-in-out infinite;
}

@keyframes path-glow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(139, 195, 74, 0.8)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 85, 152, 1)); }
}

/* Separadores de nivel */
.level-separator {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 0 60px;
  z-index: 5;
}

.separator-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(139, 195, 74, 0.5), transparent);
  border-radius: 2px;
}

.separator-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 100%);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.4);
  white-space: nowrap;
  animation: separator-glow 3s ease-in-out infinite;
}

@keyframes separator-glow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(139, 195, 74, 0.4);
  }
  50% {
    box-shadow: 0 4px 25px rgba(139, 195, 74, 0.7);
  }
}

.level-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.level-name {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

/* Badge con número de lección */
.lesson-number-badge {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
  white-space: nowrap;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.lesson-node:hover .lesson-number-badge,
.lesson-node.current .lesson-number-badge {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.lesson-node {
  position: absolute;
  z-index: 10;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.lesson-node.available:hover {
  transform: scale(1.15) translateY(-5px);
  z-index: 20;
}

.lesson-node.locked {
  cursor: not-allowed;
  opacity: 1;
  filter: grayscale(0);
}

.lesson-node.locked:hover {
  transform: scale(1.05);
}

/* Halo brillante para nodo actual */
.node-halo {
  position: absolute;
  width: 110px;
  height: 110px;
  top: -25px;
  left: -25px;
  background: radial-gradient(circle, rgba(139, 195, 74, 0.5) 0%, transparent 70%);
  border-radius: 50%;
  animation: halo-pulse 2.5s ease-in-out infinite;
  z-index: -1;
}

@keyframes halo-pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.7;
  }
  50% { 
    transform: scale(1.3); 
    opacity: 0.3;
  }
}

.node-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  border: 5px solid white;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: visible; /* Permitir que las estrellas sobresalgan del círculo */
}

/* Capa interna con overflow hidden para contener el efecto de brillo */
.node-circle-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden; /* Contiene el brillo dentro */
  z-index: 0;
  pointer-events: none;
}

/* Efecto de brillo dentro de la capa interna */
.node-circle-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.lesson-node:hover .node-circle-inner::before {
  left: 100%;
}

.lesson-node.completed .node-circle {
  background: linear-gradient(135deg, #FFA726, #F57C00);
  animation: completed-pulse 3s infinite;
  box-shadow: 0 6px 25px rgba(255, 167, 38, 0.6);
}

.lesson-node.available .node-circle {
  background: linear-gradient(135deg, #29B6F6, #0288D1);
  box-shadow: 0 6px 20px rgba(41, 182, 246, 0.5);
}

.lesson-node.current .node-circle {
  background: linear-gradient(135deg, #8BC34A, #689F38);
  animation: current-bounce 1.2s ease-in-out infinite, current-glow 2s ease-in-out infinite;
  box-shadow: 0 8px 30px rgba(139, 195, 74, 0.8);
  border-color: #FF5598;
  border-width: 6px;
}

.lesson-node.locked .node-circle {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

@keyframes completed-pulse {
  0%, 100% {
    box-shadow: 0 6px 25px rgba(255, 167, 38, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 35px rgba(255, 167, 38, 0.9);
    transform: scale(1.05);
  }
}

@keyframes current-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes current-glow {
  0%, 100% {
    box-shadow: 0 8px 30px rgba(139, 195, 74, 0.8);
  }
  50% {
    box-shadow: 0 12px 45px rgba(255, 85, 152, 1);
  }
}

.node-icon {
  font-size: 2.2rem; /* Más grande para que sobresalgan visualmente */
  line-height: 1;
  letter-spacing: -3px; /* Juntar más las estrellas múltiples */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2; /* Asegurar que estén por encima del círculo */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)); /* Sombra para destacar */
  transform: scale(1.1); /* Escalar un poco más para que sobresalgan */
  animation: stars-float 3s ease-in-out infinite, stars-twinkle 1.5s ease-in-out infinite;
}

@keyframes stars-float {
  0%, 100% {
    transform: scale(1.1) translateY(0) rotate(0deg);
  }
  25% {
    transform: scale(1.15) translateY(-3px) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) translateY(0) rotate(0deg);
  }
  75% {
    transform: scale(1.15) translateY(-3px) rotate(5deg);
  }
}

@keyframes stars-twinkle {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) brightness(1);
  }
  50% {
    opacity: 0.7;
    filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.8)) brightness(1.4);
  }
}

.node-number {
  color: white;
  font-size: 1.8rem;
}

.node-info {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 20;
}

.lesson-node:hover .node-info {
  opacity: 1;
  pointer-events: auto;
}

.info-bubble {
  background: white;
  padding: 1.25rem 1.75rem;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  min-width: 220px;
  text-align: center;
  border: 3px solid rgba(139, 195, 74, 0.3);
  backdrop-filter: blur(10px);
}

.info-bubble::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border: 12px solid transparent;
  border-bottom-color: white;
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

.info-bubble h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 700;
}

.lesson-details {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.detail-badge {
  background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
  color: #2c3e50;
  padding: 0.35rem 0.9rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Estadísticas de rendimiento */
.performance-stats {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-row {
  display: flex;
  gap: 0.5rem;
}

.stat-row.primary .stat-item {
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  border: 2px solid #FFA726;
}

.stat-row.secondary .stat-item {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border: 2px solid #8BC34A;
}

.stat-item {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-row.primary .stat-icon {
  color: #FFA726;
  animation: trophy-bounce 1s ease-in-out infinite;
}

.stat-row.secondary .stat-icon {
  color: #8BC34A;
}

@keyframes trophy-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.stat-row.primary .stat-value {
  color: #FFA726;
}

.stat-row.secondary .stat-value {
  color: #8BC34A;
}

/* Fila de estrellas */
.stat-row.stars .stat-item {
  background: linear-gradient(135deg, #FFF9C4, #FFF59D);
  border: 2px solid #FFA726;
  padding: 0.6rem;
  justify-content: center;
}

.star-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
}

.stars-display {
  font-size: 1.5rem;
  letter-spacing: 2px;
  animation: stars-shine 2s ease-in-out infinite, stars-twinkle-card 1.5s ease-in-out infinite;
}

@keyframes stars-shine {
  0%, 100% { 
    filter: brightness(1);
    transform: scale(1);
  }
  50% { 
    filter: brightness(1.3);
    transform: scale(1.05);
  }
}

@keyframes stars-twinkle-card {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }
  50% {
    opacity: 0.75;
    text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.8);
  }
}

.accuracy-text {
  font-size: 0.75rem;
  color: #F57C00;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-play {
  background: linear-gradient(135deg, #FF5598, #F50057);
  color: white;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 0.75rem;
  box-shadow: 0 4px 15px rgba(255, 85, 152, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  font-size: 1rem;
}

.btn-play:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 85, 152, 0.6);
}

.btn-play:active {
  transform: translateY(-1px) scale(1.02);
}

.btn-play.completed {
  background: linear-gradient(135deg, #FFA726, #F57C00);
  box-shadow: 0 4px 15px rgba(255, 167, 38, 0.4);
}

.btn-play.completed:hover {
  box-shadow: 0 8px 25px rgba(255, 167, 38, 0.6);
}

.locked-message {
  color: #95a5a6;
  font-size: 0.95rem;
  font-style: italic;
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(149, 165, 166, 0.1);
  border-radius: 8px;
}

@media (max-width: 768px) {
  .map-header {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .course-title {
    font-size: 1.5rem;
  }

  .progress-bar-wrapper {
    width: 250px;
    height: 14px;
  }

  .progress-text {
    font-size: 1rem;
  }

  .map-container {
    padding: 1rem 0.5rem;
  }

  .info-bubble {
    min-width: 180px;
    padding: 1rem 1.25rem;
  }

  .info-bubble h3 {
    font-size: 1rem;
  }

  .node-circle {
    width: 60px;
    height: 60px;
  }

  .node-halo {
    width: 95px;
    height: 95px;
    top: -17px;
    left: -17px;
  }

  .node-icon {
    font-size: 1.7rem;
  }

  .node-number {
    font-size: 1.6rem;
  }

  .btn-back {
    padding: 0.5rem 0.9rem;
    font-size: 0.9rem;
  }

  .btn-fullscreen {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .course-title {
    font-size: 1.25rem;
  }

  .progress-bar-wrapper {
    width: 180px;
  }

  .progress-summary {
    flex-direction: column;
    gap: 0.75rem;
  }

  .map-header {
    padding: 0.75rem;
  }

  .btn-back span {
    display: none;
  }
}
</style>
