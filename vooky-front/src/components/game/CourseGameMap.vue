<template>
  <div class="game-map" ref="gameMapContainer">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <h2 class="loading-title">Cargando Mapa</h2>
        <p class="loading-text">Preparando tu aventura...</p>
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
          <span class="progress-text">
            <font-awesome-icon icon="star" class="icon-star" />
            {{ completedLessons }} / {{ totalLessons }}
          </span>
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
              <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#3498db;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2ecc71;stop-opacity:1" />
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
          
          <!-- Número o icono del nodo -->
          <div class="node-circle">
            <span v-if="node.completed" class="node-icon">⭐</span>
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
              <div v-if="node.completed && node.score !== null" class="score-display">
                <font-awesome-icon icon="trophy" class="trophy-icon" />
                <span class="score-value">{{ node.score }} pts</span>
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
import { getLessonProgress } from '@/services/lessonGameService';
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
  score: number | null;
}

const props = defineProps<{
  course: Course;
}>();

defineEmits(['back']);

// State
const gameMapContainer = ref<HTMLElement | null>(null);
const mapContainer = ref<HTMLElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const currentNodeRef = ref<HTMLElement | null>(null);
const lessonNodes = ref<LessonNode[]>([]);
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

const pathData = computed(() => {
  if (lessonNodes.value.length < 2) return '';
  
  let path = `M ${lessonNodes.value[0].x + 30} ${lessonNodes.value[0].y + 30}`;
  
  for (let i = 1; i < lessonNodes.value.length; i++) {
    const current = lessonNodes.value[i];
    const prev = lessonNodes.value[i - 1];
    
    // Crear curvas suaves entre nodos
    const midX = (prev.x + current.x) / 2 + 30;
    
    path += ` Q ${midX} ${prev.y + 30}, ${current.x + 30} ${current.y + 30}`;
  }
  
  return path;
});

const progressPathData = computed(() => {
  if (lessonNodes.value.length < 2) return '';
  
  const completedIndex = lessonNodes.value.findIndex(node => !node.completed);
  const lastCompletedIndex = completedIndex === -1 ? lessonNodes.value.length - 1 : completedIndex - 1;
  
  if (lastCompletedIndex < 0) return '';
  
  let path = `M ${lessonNodes.value[0].x + 30} ${lessonNodes.value[0].y + 30}`;
  
  for (let i = 1; i <= lastCompletedIndex; i++) {
    const current = lessonNodes.value[i];
    const prev = lessonNodes.value[i - 1];
    
    const midX = (prev.x + current.x) / 2 + 30;
    
    path += ` Q ${midX} ${prev.y + 30}, ${current.x + 30} ${current.y + 30}`;
  }
  
  return path;
});

// Methods
async function loadLessonProgress() {
  isLoading.value = true; // Activar indicador de carga
  
  const nodes: LessonNode[] = [];
  let previousCompleted = true;
  
  for (let i = 0; i < allLessons.value.length; i++) {
    const lesson = allLessons.value[i];
    
    // Obtener progreso de la lección
    let progress = null;
    try {
      progress = await getLessonProgress(lesson.id);
    } catch (err) {
      console.error(`Error loading progress for lesson ${lesson.id}:`, err);
    }
    
    const completed = progress?.completed || false;
    const available = i === 0 || previousCompleted;
    
    nodes.push({
      lesson,
      x: 0,
      y: 0,
      completed,
      available,
      current: !completed && available,
      score: progress?.score || null
    });
    
    previousCompleted = completed;
  }
  
  lessonNodes.value = nodes;
  
  await nextTick();
  calculateNodePositions();
  
  // Pequeño delay para asegurar que todo se renderice
  setTimeout(() => {
    isLoading.value = false; // Desactivar indicador de carga
  }, 500);
}

function calculateNodePositions() {
  if (!mapContainer.value) return;
  
  const containerWidth = mapContainer.value.clientWidth || 800;
  const padding = 60; // Padding interno para evitar overflow
  const verticalSpacing = 150;
  const horizontalAmplitude = Math.min(150, (containerWidth - padding * 2) / 4);
  const centerX = containerWidth / 2 - 35; // 35 = half node size (70px / 2)
  
  svgWidth.value = containerWidth;
  svgHeight.value = lessonNodes.value.length * verticalSpacing + 200;
  
  lessonNodes.value.forEach((node, index) => {
    // Crear patrón de zigzag más pronunciado
    const yPos = 100 + index * verticalSpacing;
    const xOffset = Math.sin(index * 0.8) * horizontalAmplitude;
    const xPos = Math.max(padding, Math.min(containerWidth - padding - 70, centerX + xOffset));
    
    node.x = xPos;
    node.y = yPos;
  });
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
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: #FFD700;
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: #2ecc71;
  animation-delay: -0.6s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 1.2rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  font-weight: 500;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: dotBounce 1.4s infinite ease-in-out both;
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
  border: 2px solid #3498db;
  color: #3498db;
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
  background: #3498db;
  color: white;
  transform: translateX(-5px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-fullscreen {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  z-index: 1000;
}

.btn-fullscreen:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
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
  background: linear-gradient(90deg, #3498db 0%, #2ecc71 100%);
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

.progress-text {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-star {
  color: #f39c12;
  animation: star-twinkle 2s ease-in-out infinite;
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
  background: linear-gradient(180deg, #3498db, #2ecc71);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.map-scroll-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2980b9, #27ae60);
}

.map-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 600px;
}

.path-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  width: 100%;
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
  filter: drop-shadow(0 0 12px rgba(52, 152, 219, 0.8)) url(#glow);
  stroke-width: 14;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: path-glow 3s ease-in-out infinite;
}

@keyframes path-glow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(52, 152, 219, 0.8)); }
  50% { filter: drop-shadow(0 0 20px rgba(46, 204, 113, 1)); }
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
  opacity: 0.5;
  filter: grayscale(60%);
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
  background: radial-gradient(circle, rgba(46, 204, 113, 0.5) 0%, transparent 70%);
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
  overflow: hidden;
}

.node-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.lesson-node:hover .node-circle::before {
  left: 100%;
}

.lesson-node.completed .node-circle {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  animation: completed-pulse 3s infinite;
  box-shadow: 0 6px 25px rgba(243, 156, 18, 0.6);
}

.lesson-node.available .node-circle {
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.5);
}

.lesson-node.current .node-circle {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  animation: current-bounce 1.2s ease-in-out infinite, current-glow 2s ease-in-out infinite;
  box-shadow: 0 8px 30px rgba(46, 204, 113, 0.8);
  border-color: #FFD700;
  border-width: 6px;
}

.lesson-node.locked .node-circle {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

@keyframes completed-pulse {
  0%, 100% {
    box-shadow: 0 6px 25px rgba(243, 156, 18, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 35px rgba(243, 156, 18, 0.9);
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
    box-shadow: 0 8px 30px rgba(46, 204, 113, 0.8);
  }
  50% {
    box-shadow: 0 12px 45px rgba(255, 215, 0, 1);
  }
}

.node-icon {
  font-size: 2rem;
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
  border: 3px solid rgba(52, 152, 219, 0.2);
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

.score-display {
  margin: 1rem 0;
  padding: 0.75rem;
  background: linear-gradient(135deg, #fff9e6, #fff3cc);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px solid #f39c12;
}

.trophy-icon {
  color: #f39c12;
  font-size: 1.3rem;
  animation: trophy-bounce 1s ease-in-out infinite;
}

@keyframes trophy-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.score-value {
  color: #f39c12;
  font-weight: 800;
  font-size: 1.3rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-play {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 0.75rem;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  font-size: 1rem;
}

.btn-play:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.6);
}

.btn-play:active {
  transform: translateY(-1px) scale(1.02);
}

.btn-play.completed {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4);
}

.btn-play.completed:hover {
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.6);
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
