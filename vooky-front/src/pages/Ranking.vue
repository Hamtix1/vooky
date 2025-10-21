<template>
  <div class="ranking-container">
    <div class="ranking-header">
      <h1>🏆 Ranking Global</h1>
      <p class="subtitle">Los mejores 10 jugadores de Vooky</p>
    </div>

    <!-- Mi Posición -->
    <div v-if="myRanking" class="my-position-card">
      <div class="my-position-content">
        <div class="position-badge">
          <span class="position-number">#{{ myRanking.position }}</span>
          <span class="position-label">Tu Posición</span>
        </div>
        <div class="my-score">
          <span class="score-value">{{ myRanking.total_score.toLocaleString() }}</span>
          <span class="score-label">puntos</span>
        </div>
      </div>
      <button @click="goToProfile" class="btn-profile">
        Ver Mi Perfil →
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando ranking...</p>
    </div>

    <!-- Ranking List -->
    <div v-else-if="ranking.length > 0" class="ranking-list">
      <div
        v-for="user in ranking"
        :key="user.id"
        :class="['ranking-item', `position-${user.position}`, { 'is-me': isCurrentUser(user.id) }]"
      >
        <!-- Medalla/Posición -->
        <div class="position-indicator">
          <span v-if="user.position === 1" class="medal gold">🥇</span>
          <span v-else-if="user.position === 2" class="medal silver">🥈</span>
          <span v-else-if="user.position === 3" class="medal bronze">🥉</span>
          <span v-else class="position-number">#{{ user.position }}</span>
        </div>

        <!-- Información del Usuario -->
        <div class="user-info">
          <div class="user-name">
            {{ user.name }}
            <span v-if="isCurrentUser(user.id)" class="you-badge">Tú</span>
          </div>
          <div class="user-stats">
            <span class="stat">
              <span class="stat-icon">📚</span>
              {{ user.completed_lessons }} lecciones
            </span>
            <span class="stat">
              <span class="stat-icon">🎯</span>
              {{ user.average_accuracy.toFixed(1) }}%
            </span>
          </div>
        </div>

        <!-- Puntuación -->
        <div class="user-score">
          <div class="score-value">{{ user.total_score.toLocaleString() }}</div>
          <div class="score-label">puntos</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">🏆</div>
      <h2>No hay usuarios en el ranking</h2>
      <p>Sé el primero en completar lecciones y ganar puntos</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="loadRanking" class="btn-retry">Reintentar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRanking, getMyRanking, type RankingUser, type MyRankingResponse } from '@/services/userProfileService';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const ranking = ref<RankingUser[]>([]);
const myRanking = ref<MyRankingResponse | null>(null);
const loading = ref(true);
const error = ref('');

// Verificar si es el usuario actual
function isCurrentUser(userId: number): boolean {
  return authStore.user?.id === userId;
}

// Cargar ranking
async function loadRanking() {
  loading.value = true;
  error.value = '';
  
  try {
    const [rankingData, myRankingData] = await Promise.all([
      getRanking(),
      getMyRanking(),
    ]);
    
    ranking.value = rankingData.ranking;
    myRanking.value = myRankingData;
  } catch (err) {
    console.error('Error al cargar ranking:', err);
    error.value = 'Error al cargar el ranking. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

// Ir al perfil
function goToProfile() {
  router.push('/profile');
}

onMounted(() => {
  loadRanking();
});
</script>

<style scoped>
.ranking-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.ranking-header {
  text-align: center;
  margin-bottom: 2rem;
}

.ranking-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Mi Posición */
.my-position-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.my-position-content {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.position-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.position-number {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}

.position-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.my-score {
  display: flex;
  flex-direction: column;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.btn-profile {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-profile:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Ranking List */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ranking-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ranking-item.is-me {
  border: 2px solid #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

/* Podio - Primeros 3 lugares */
.ranking-item.position-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
}

.ranking-item.position-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 4px 20px rgba(192, 192, 192, 0.3);
}

.ranking-item.position-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a15c 100%);
  box-shadow: 0 4px 20px rgba(205, 127, 50, 0.3);
}

.position-indicator {
  flex-shrink: 0;
  width: 60px;
  text-align: center;
}

.medal {
  font-size: 2.5rem;
}

.position-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff655;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.you-badge {
  background: #667eea;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.user-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon {
  font-size: 1rem;
}

.user-score {
  flex-shrink: 0;
  text-align: right;
}

.user-score .score-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
}

.user-score .score-label {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Estados */
.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #7f8c8d;
}

.error-state p {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .ranking-container {
    padding: 1rem;
  }

  .my-position-card {
    flex-direction: column;
    text-align: center;
  }

  .my-position-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .btn-profile {
    width: 100%;
  }

  .ranking-item {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }

  .position-indicator {
    width: 100%;
  }

  .user-info {
    width: 100%;
  }

  .user-stats {
    justify-content: center;
  }

  .user-score {
    width: 100%;
  }
}
</style>
