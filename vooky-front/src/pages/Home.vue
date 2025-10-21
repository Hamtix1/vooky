<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-emoji">🎮</span>
            Aprende Jugando con
            <span class="title-highlight">Vooky</span>
          </h1>
          <p class="hero-subtitle">
            Plataforma educativa interactiva que combina audio, imágenes y diversión para crear experiencias de aprendizaje inolvidables
          </p>
          <div class="hero-actions">
            <router-link 
              v-if="!isAuthenticated" 
              :to="{ name: 'Login' }" 
              class="btn-primary"
            >
              <font-awesome-icon icon="play" class="btn-icon" />
              Comenzar Ahora
            </router-link>
            <router-link 
              v-else 
              :to="{ name: 'Courses' }" 
              class="btn-primary"
            >
              <font-awesome-icon icon="book" class="btn-icon" />
              Ver Mis Cursos
            </router-link>
            <button class="btn-secondary">
              <font-awesome-icon icon="info-circle" class="btn-icon" />
              Saber Más
            </button>
          </div>
        </div>
        <div class="hero-image">
          <div class="floating-card card-1">🎯</div>
          <div class="floating-card card-2">🎨</div>
          <div class="floating-card card-3">🎵</div>
          <div class="floating-card card-4">🏆</div>
        </div>
      </div>
      <div class="hero-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" transform="scale(1, -1)">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">¿Por qué elegir Vooky?</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div v-if="loadingStats" class="stats-loading">
          <div class="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.active_users }}+</div>
            <div class="stat-label">Estudiantes Activos</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.available_courses }}+</div>
            <div class="stat-label">Cursos Disponibles</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.satisfaction_rate }}%</div>
            <div class="stat-label">Tasa de Participación</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatNumber(stats.completed_lessons) }}+</div>
            <div class="stat-label">Lecciones Completadas</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">¿Listo para comenzar tu aventura de aprendizaje?</h2>
          <p class="cta-subtitle">Únete a miles de estudiantes que ya están aprendiendo de forma divertida</p>
          <router-link 
            v-if="!isAuthenticated" 
            :to="{ name: 'Login' }" 
            class="btn-cta"
          >
            <font-awesome-icon icon="rocket" class="btn-icon" />
            Iniciar Ahora - Es Gratis
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getPublicStats, type PublicStats } from '@/services/statsService';

const auth = useAuthStore();
const isAuthenticated = computed(() => auth.isAuthenticated);

// Estados para estadísticas
const loadingStats = ref(true);
const stats = ref<PublicStats>({
  active_users: 0,
  available_courses: 0,
  satisfaction_rate: 0,
  completed_lessons: 0,
});

const features = [
  {
    icon: '🎮',
    title: 'Aprendizaje Interactivo',
    description: 'Juegos educativos que combinan audio e imágenes para una experiencia inmersiva'
  },
  {
    icon: '🏆',
    title: 'Sistema de Logros',
    description: 'Gana puntos, desbloquea niveles y completa desafíos mientras aprendes'
  },
  {
    icon: '📊',
    title: 'Progreso Visible',
    description: 'Sigue tu avance con estadísticas detalladas y reportes de rendimiento'
  },
  {
    icon: '🎯',
    title: 'Contenido Adaptativo',
    description: 'Lecciones que se ajustan a tu ritmo y nivel de conocimiento'
  },
  {
    icon: '🎵',
    title: 'Audio Inmersivo',
    description: 'Pronunciación nativa y efectos de sonido que refuerzan el aprendizaje'
  },
  {
    icon: '✨',
    title: 'Interfaz Intuitiva',
    description: 'Diseño moderno y fácil de usar para todas las edades'
  }
];

// Formatear números grandes
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Cargar estadísticas al montar el componente
onMounted(async () => {
  try {
    const data = await getPublicStats();
    stats.value = data;
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    // Mantener valores por defecto en caso de error
  } finally {
    loadingStats.value = false;
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section - Colores Vooky */
.hero {
  background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 50%, #FF5598 100%);
  padding: 4rem 2rem 8rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-text {
  color: white;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  animation: slideInLeft 0.8s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.title-emoji {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

.title-highlight {
  background: linear-gradient(135deg, #FFA726 0%, #FFB74D 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  text-shadow: 0 4px 20px rgba(255, 167, 38, 0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.8;
  margin: 0 0 2rem 0;
  opacity: 0.95;
  animation: slideInLeft 0.8s ease 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  animation: slideInLeft 0.8s ease 0.4s both;
}

.btn-primary,
.btn-secondary,
.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #FF5598 0%, #F50057 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(255, 85, 152, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 85, 152, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.btn-icon {
  font-size: 1.2rem;
}

.hero-image {
  position: relative;
  height: 400px;
  animation: slideInRight 0.8s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.floating-card {
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
}

.card-1 { top: 0; left: 0; animation-delay: 0s; }
.card-2 { top: 0; right: 0; animation-delay: 0.5s; }
.card-3 { bottom: 0; left: 0; animation-delay: 1s; }
.card-4 { bottom: 0; right: 0; animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.hero-wave svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 60px;
}

/* Features Section */
.features {
  padding: 5rem 2rem;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 3rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(139, 195, 74, 0.2);
  border-color: #8BC34A;
  background: linear-gradient(135deg, #f8f9fa 0%, #E8F5E9 100%);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.feature-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
}

/* Stats Section - Colores Vooky */
.stats {
  background: linear-gradient(135deg, #29B6F6 0%, #0288D1 100%);
  padding: 4rem 2rem;
  color: white;
}

.stats-loading {
  text-align: center;
  padding: 2rem;
}

.stats-loading .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-loading p {
  color: white;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #FFA726 0%, #FFD54F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* CTA Section */
.cta {
  padding: 5rem 2rem;
  background: white;
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.cta-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
}

.btn-cta {
  background: linear-gradient(135deg, #8BC34A 0%, #689F38 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(139, 195, 74, 0.4);
  font-size: 1.2rem;
  padding: 1.25rem 2.5rem;
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(139, 195, 74, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-image {
    height: 300px;
  }

  .floating-card {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }
}
</style>
