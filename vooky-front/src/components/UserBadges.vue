<template>
  <div class="user-badges">
    <h2>
      <font-awesome-icon icon="trophy" />
      Mis Insignias
    </h2>

    <div v-if="loading" class="loading">
      <font-awesome-icon icon="spinner" spin />
      Cargando insignias...
    </div>

    <div v-else-if="userBadges.length === 0" class="empty-badges">
      <font-awesome-icon icon="trophy" size="3x" />
      <p>Aún no has obtenido ninguna insignia</p>
      <p class="hint">¡Completa lecciones para ganar insignias!</p>
    </div>

    <div v-else class="badges-showcase">
      <div v-for="userBadge in userBadges" :key="userBadge.id" class="badge-item">
        <div class="badge-shine">
          <img :src="getBadgeImageUrl(userBadge.badge.image)" :alt="userBadge.badge.name" />
        </div>
        <h3>{{ userBadge.badge.name }}</h3>
        <p class="badge-desc">{{ userBadge.badge.description }}</p>
        <p class="earned-date">
          <font-awesome-icon icon="check-circle" />
          Obtenida: {{ formatDate(userBadge.earned_at) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserBadges } from '@/services/badgeService';
import type { UserBadge } from '@/types/badge';

const userBadges = ref<UserBadge[]>([]);
const loading = ref(false);

onMounted(async () => {
  await loadUserBadges();
});

async function loadUserBadges() {
  loading.value = true;
  try {
    userBadges.value = await getUserBadges();
  } catch (error) {
    console.error('Error al cargar insignias del usuario:', error);
  } finally {
    loading.value = false;
  }
}

function getBadgeImageUrl(image: string): string {
  if (image.startsWith('http')) {
    return image;
  }
  return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${image}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
.user-badges {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-badges h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-badges {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-badges svg {
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-badges .hint {
  color: #667eea;
  font-weight: 600;
  margin-top: 0.5rem;
}

.badges-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.badge-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  transition: transform 0.3s;
  position: relative;
  overflow: hidden;
}

.badge-item:hover {
  transform: translateY(-5px) scale(1.02);
}

.badge-item::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: rotate(45deg) translateY(-100%);
  }
  100% {
    transform: rotate(45deg) translateY(100%);
  }
}

.badge-shine {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.badge-shine img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.badge-item h3 {
  color: #2c3e50;
  margin: 0.5rem 0;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

.badge-desc {
  color: #555;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  position: relative;
  z-index: 1;
}

.earned-date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #667eea;
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}
</style>
