<template>
  <div class="user-enrollments">
    <div v-if="loading" class="feedback-message">Cargando información...</div>
    <div v-if="error" class="feedback-message error">{{ error }}</div>

    <div v-if="!loading && user" class="content">
      <!-- Header -->
      <div class="page-header">
        <div>
          <router-link :to="{ name: 'Users' }" class="btn-back">
            &larr; Volver a Usuarios
          </router-link>
          <h1>Cursos de {{ user.name }}</h1>
          <p class="user-email">{{ user.email }}</p>
        </div>
      </div>

      <!-- Enrolled Courses Section -->
      <div class="section">
        <div class="section-header">
          <h2>Cursos Inscritos</h2>
        </div>

        <div v-if="enrolledCourses.length > 0" class="courses-grid">
          <div v-for="course in enrolledCourses" :key="course.id" class="course-card enrolled">
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <p v-if="course.description">{{ course.description }}</p>
            </div>
            <button 
              class="btn-unenroll" 
              @click="confirmUnenroll(course)"
              :disabled="processing"
            >
              <font-awesome-icon icon="times" />
              Desinscribir
            </button>
          </div>
        </div>

        <div v-else class="no-data">
          Este usuario no está inscrito en ningún curso
        </div>
      </div>

      <!-- Available Courses Section -->
      <div class="section">
        <div class="section-header">
          <h2>Cursos Disponibles</h2>
        </div>

        <div v-if="availableCourses.length > 0" class="courses-grid">
          <div v-for="course in availableCourses" :key="course.id" class="course-card available">
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <p v-if="course.description">{{ course.description }}</p>
            </div>
            <button 
              class="btn-enroll" 
              @click="enrollCourse(course)"
              :disabled="processing"
            >
              <font-awesome-icon icon="plus" />
              Inscribir
            </button>
          </div>
        </div>

        <div v-else class="no-data">
          No hay cursos disponibles para inscribir
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="toast success">
        {{ successMessage }}
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Confirmar Desinscripción</h2>
          <button class="icon-button" @click="showConfirmModal = false" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas desinscribir a <strong>{{ user?.name }}</strong> del curso <strong>{{ courseToUnenroll?.title }}</strong>?</p>
          <p class="warning-text">Se perderá todo el progreso del usuario en este curso.</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showConfirmModal = false" :disabled="processing">
            Cancelar
          </button>
          <button type="button" class="btn-danger" @click="unenrollCourse" :disabled="processing">
            {{ processing ? 'Desinscribiendo...' : 'Desinscribir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/config/api'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'parent'
}

interface Course {
  id: number
  title: string
  slug: string
  description: string | null
}

const route = useRoute()
const userId = Number(route.params.userId)

const user = ref<User | null>(null)
const allCourses = ref<Course[]>([])
const userCourseIds = ref<number[]>([])
const loading = ref(true)
const processing = ref(false)
const error = ref('')
const successMessage = ref('')

const showConfirmModal = ref(false)
const courseToUnenroll = ref<Course | null>(null)

const enrolledCourses = computed(() => {
  return allCourses.value.filter(course => userCourseIds.value.includes(course.id))
})

const availableCourses = computed(() => {
  return allCourses.value.filter(course => !userCourseIds.value.includes(course.id))
})

const fetchData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Fetch user details
    const userResponse = await api.get(`admin/users/${userId}`)
    user.value = userResponse.data.data || userResponse.data
    
    // Fetch all courses
    const coursesResponse = await api.get('courses')
    allCourses.value = coursesResponse.data.data || coursesResponse.data
    
    // Fetch user's enrolled courses
    const enrollmentsResponse = await api.get(`admin/users/${userId}/courses`)
    const enrolledData = enrollmentsResponse.data.data || enrollmentsResponse.data
    userCourseIds.value = enrolledData.map((c: Course) => c.id)
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al cargar la información'
  } finally {
    loading.value = false
  }
}

const enrollCourse = async (course: Course) => {
  processing.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    await api.post(`admin/users/${userId}/enroll/${course.id}`)
    userCourseIds.value.push(course.id)
    successMessage.value = `Usuario inscrito exitosamente en "${course.title}"`
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al inscribir usuario'
  } finally {
    processing.value = false
  }
}

const confirmUnenroll = (course: Course) => {
  courseToUnenroll.value = course
  showConfirmModal.value = true
}

const unenrollCourse = async () => {
  if (!courseToUnenroll.value) return
  
  processing.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    await api.delete(`admin/users/${userId}/unenroll/${courseToUnenroll.value.id}`)
    userCourseIds.value = userCourseIds.value.filter(id => id !== courseToUnenroll.value!.id)
    successMessage.value = `Usuario desinscrito exitosamente de "${courseToUnenroll.value.title}"`
    showConfirmModal.value = false
    courseToUnenroll.value = null
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al desinscribir usuario'
  } finally {
    processing.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.user-enrollments {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

.feedback-message {
  text-align: center;
  padding: 1.5rem;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.feedback-message.error {
  color: #e74c3c;
  background-color: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  margin-bottom: 1rem;
}

.btn-back {
  display: inline-block;
  margin-bottom: 1rem;
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.btn-back:hover {
  color: #2980b9;
}

.page-header h1 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.75rem;
  color: #2c3e50;
}

.user-email {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.course-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.course-card.enrolled {
  background: #eef7fd;
  border: 2px solid #d6eaf8;
}

.course-card.available {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.course-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.btn-enroll,
.btn-unenroll {
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-enroll {
  background: #3498db;
  color: white;
}

.btn-enroll:hover:not(:disabled) {
  background: #2e86c1;
}

.btn-unenroll {
  background: #e74c3c;
  color: white;
}

.btn-unenroll:hover:not(:disabled) {
  background: #c0392b;
}

.btn-enroll:disabled,
.btn-unenroll:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
  font-style: italic;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #2ecc71;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: min(540px, 92vw);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
}

.modal-small {
  width: min(420px, 92vw);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.icon-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background-color: #f0f0f0;
  color: #2c3e50;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #34495e;
}

.warning-text {
  color: #e67e22;
  font-weight: 600;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e6e8;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

@media (max-width: 768px) {
  .user-enrollments {
    padding: 1rem;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }

  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
