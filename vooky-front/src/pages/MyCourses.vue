<template>
  <div class="my-courses">
    <div class="page-header">
      <h1>Mis Cursos</h1>
      <p class="subtitle">Cursos en los que estás inscrito</p>
    </div>

    <div v-if="loading" class="loading">
      <font-awesome-icon icon="spinner" spin size="2x" />
      <p>Cargando tus cursos...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <font-awesome-icon icon="exclamation-triangle" />
      <p>{{ error }}</p>
      <button @click="fetchEnrollments" class="btn-retry">
        <font-awesome-icon icon="redo" /> Reintentar
      </button>
    </div>

    <div v-else class="courses-container">
      <!-- Active Enrollments -->
      <div v-if="activeEnrollments.length > 0" class="section">
        <h2 class="section-title">
          <font-awesome-icon icon="book-open" class="icon-active" />
          Cursos Activos
        </h2>
        <div class="courses-grid">
          <div 
            v-for="enrollment in activeEnrollments" 
            :key="enrollment.id" 
            class="course-card active"
          >
            <div class="card-header">
              <h3>{{ enrollment.course?.title }}</h3>
              <span class="badge badge-active">Activo</span>
            </div>
            <p v-if="enrollment.course?.description" class="course-description">
              {{ enrollment.course.description }}
            </p>
            <div class="card-footer">
              <div class="enrollment-info">
                <font-awesome-icon icon="calendar" />
                <span>Inscrito: {{ formatDate(enrollment.enrolled_at) }}</span>
              </div>
              <router-link 
                :to="{ name: 'CourseShow', params: { slug: enrollment.course?.slug } }" 
                class="btn-view"
              >
                <font-awesome-icon icon="play" />
                Continuar
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Enrollments -->
      <div v-if="pendingEnrollments.length > 0" class="section">
        <h2 class="section-title">
          <font-awesome-icon icon="clock" class="icon-pending" />
          Cursos Pendientes de Activación
        </h2>
        <div class="courses-grid">
          <div 
            v-for="enrollment in pendingEnrollments" 
            :key="enrollment.id" 
            class="course-card pending"
          >
            <div class="card-header">
              <h3>{{ enrollment.course?.title }}</h3>
              <span class="badge badge-pending">Pendiente</span>
            </div>
            <p v-if="enrollment.course?.description" class="course-description">
              {{ enrollment.course.description }}
            </p>
            <div class="card-footer">
              <div class="enrollment-info">
                <font-awesome-icon icon="info-circle" />
                <span>La matrícula se generará en las próximas 24 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inactive Enrollments -->
      <div v-if="inactiveEnrollments.length > 0" class="section">
        <h2 class="section-title">
          <font-awesome-icon icon="ban" class="icon-inactive" />
          Cursos Inactivos
        </h2>
        <div class="courses-grid">
          <div 
            v-for="enrollment in inactiveEnrollments" 
            :key="enrollment.id" 
            class="course-card inactive"
          >
            <div class="card-header">
              <h3>{{ enrollment.course?.title }}</h3>
              <span class="badge badge-inactive">Inactivo</span>
            </div>
            <p v-if="enrollment.course?.description" class="course-description">
              {{ enrollment.course.description }}
            </p>
            <div class="card-footer">
              <div class="enrollment-info warning">
                <font-awesome-icon icon="exclamation-triangle" />
                <span>Curso desactivado por pagos pendientes</span>
              </div>
              <router-link to="/tuition-fees" class="btn-payment">
                <font-awesome-icon icon="credit-card" />
                Ver Matrículas
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- No Enrollments -->
      <div v-if="enrollments.length === 0" class="no-data">
        <font-awesome-icon icon="inbox" size="3x" />
        <h3>No estás inscrito en ningún curso</h3>
        <p>Contacta con tu administrador para inscribirte en un curso</p>
        <router-link to="/" class="btn-home">
          <font-awesome-icon icon="home" />
          Ir al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getMyEnrollments, type Enrollment } from '@/services/enrollmentService';

const enrollments = ref<Enrollment[]>([]);
const loading = ref(true);
const error = ref('');

const activeEnrollments = computed(() => 
  enrollments.value.filter(e => e.status === 'active')
);

const pendingEnrollments = computed(() => 
  enrollments.value.filter(e => e.status === 'pending')
);

const inactiveEnrollments = computed(() => 
  enrollments.value.filter(e => e.status === 'inactive')
);

const fetchEnrollments = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    enrollments.value = await getMyEnrollments();
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 'Error al cargar tus cursos';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

onMounted(fetchEnrollments);
</script>

<style scoped>
.my-courses {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.loading,
.error-message,
.no-data {
  text-align: center;
  padding: 3rem 1rem;
}

.loading svg,
.error-message svg,
.no-data svg {
  margin-bottom: 1rem;
}

.loading {
  color: #3498db;
}

.error-message {
  color: #e74c3c;
}

.error-message p {
  margin-bottom: 1rem;
}

.btn-retry,
.btn-home {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-retry:hover,
.btn-home:hover {
  background-color: #2980b9;
}

.section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-active {
  color: #27ae60;
}

.icon-pending {
  color: #f39c12;
}

.icon-inactive {
  color: #e74c3c;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.course-card.active {
  border-left: 4px solid #27ae60;
}

.course-card.pending {
  border-left: 4px solid #f39c12;
}

.course-card.inactive {
  border-left: 4px solid #e74c3c;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-active {
  background-color: #d5f4e6;
  color: #27ae60;
}

.badge-pending {
  background-color: #fef5e7;
  color: #f39c12;
}

.badge-inactive {
  background-color: #fadbd8;
  color: #e74c3c;
}

.course-description {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.enrollment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.enrollment-info.warning {
  color: #e74c3c;
}

.btn-view,
.btn-payment {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-view {
  background-color: #3498db;
  color: white;
}

.btn-view:hover {
  background-color: #2980b9;
}

.btn-payment {
  background-color: #f39c12;
  color: white;
}

.btn-payment:hover {
  background-color: #e67e22;
}

.no-data {
  padding: 4rem 2rem;
}

.no-data svg {
  color: #bdc3c7;
}

.no-data h3 {
  color: #7f8c8d;
  margin: 1rem 0;
}

.no-data p {
  color: #95a5a6;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-view,
  .btn-payment {
    width: 100%;
    justify-content: center;
  }
}
</style>
