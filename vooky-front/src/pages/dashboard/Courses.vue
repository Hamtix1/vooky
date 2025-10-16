<template>
  <div class="courses-page">
    <!-- Header con gradiente -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="title-icon">📚</span>
            Mis Cursos
          </h1>
          <p class="page-subtitle">Explora y gestiona tus cursos de aprendizaje</p>
        </div>
        <router-link v-if="isAdmin" :to="{ name: 'CreateCourse' }" class="btn-create">
          <font-awesome-icon icon="plus" class="btn-icon" />
          Nuevo Curso
        </router-link>
      </div>
    </div>

    <div class="page-container">
      <!-- Estado de carga con spinner -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Cargando cursos...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="reloadCourses" class="btn-retry">Reintentar</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="courses.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h2>No hay cursos disponibles</h2>
        <p>Comienza creando tu primer curso</p>
        <router-link v-if="isAdmin" :to="{ name: 'CreateCourse' }" class="btn-create-empty">
          <font-awesome-icon icon="plus" />
          Crear Primer Curso
        </router-link>
      </div>

      <!-- Grid de cursos -->
      <div v-else class="courses-container">
        <div class="course-card" 
             v-for="(course, index) in courses" 
             :key="course.id"
             :style="{ animationDelay: `${index * 0.1}s` }"
             @click="goToCourse(course.slug)">
          
          <div class="card-gradient"></div>
          
          <div class="card-header">
            <div class="course-icon">🎓</div>
            <div class="course-badge" v-if="isAdmin">Admin</div>
          </div>

          <div class="card-body">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description" v-if="course.description">
              {{ truncateDescription(course.description, 80) }}
            </p>
          </div>

          <div class="card-footer">
            <div class="course-stats">
              <div class="stat-item">
                <font-awesome-icon icon="layer-group" class="stat-icon" />
                <span>{{ course.levels?.length || 0 }} Niveles</span>
              </div>
            </div>

            <div class="card-actions" @click.stop>
              <router-link 
                v-if="isAdmin" 
                :to="{ name: 'EditCourse', params: { slug: course.slug } }" 
                class="btn-action btn-edit"
                title="Editar curso">
                <font-awesome-icon icon="pencil-alt" />
              </router-link>
              <button class="btn-action btn-view" @click="goToCourse(course.slug)" title="Ver curso">
                <font-awesome-icon icon="arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "@/store/auth";
import { getCourses, type Course } from "@/services/courseService";

const auth = useAuthStore();
const router = useRouter();

const courses = ref<Course[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const isAdmin = computed(() => auth.getUserRole === 'admin');

const goToCourse = (slug: string) => {
  router.push({ name: 'CourseShow', params: { slug } });
};

const truncateDescription = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const loadCourses = async () => {
  loading.value = true;
  error.value = null;
  try {
    courses.value = await getCourses();
  } catch (err: any) {
    console.error("Error al cargar los cursos:", err);
    error.value = "No se pudieron cargar los cursos. Por favor, inténtalo más tarde.";
  } finally {
    loading.value = false;
  }
};

const reloadCourses = () => {
  loadCourses();
};

onMounted(() => {
  loadCourses();
});
</script>

<style scoped>
.courses-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-text {
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.title-icon {
  font-size: 3rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.page-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.95;
}

.btn-create {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #2c3e50;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  white-space: nowrap;
}

.btn-create:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Page Container */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #667eea;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.2rem;
  font-weight: 600;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #e74c3c;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.btn-retry {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-create-empty {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-create-empty:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

/* Courses Grid */
.courses-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* Course Card */
.course-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  animation: fadeInUp 0.6s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
}

.card-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #FFD700 100%);
}

.card-header {
  padding: 1.5rem 1.5rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-icon {
  font-size: 3rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #2c3e50;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  padding: 1rem 1.5rem;
}

.course-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.course-description {
  font-size: 0.95rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
}

.card-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
}

.course-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
}

.stat-icon {
  font-size: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-edit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-edit:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 16px rgba(243, 156, 18, 0.4);
}

.btn-view {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-view:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 2rem;
  }

  .btn-create {
    width: 100%;
    justify-content: center;
  }

  .courses-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .page-container {
    padding: 1.5rem 1rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .courses-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>