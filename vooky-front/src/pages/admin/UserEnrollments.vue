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

        <div v-if="enrollments.length > 0" class="courses-grid">
          <div v-for="enrollment in enrollments" :key="enrollment.id" class="course-card enrolled enrolled-modern">
            <div class="course-info">
              <div class="course-header-row">
                <h3 class="course-title">{{ enrollment.course?.title }}</h3>
                <span :class="`enrollment-status-badge status-${enrollment.status}`">
                  <font-awesome-icon :icon="enrollment.status === 'active' ? 'check-circle' : enrollment.status === 'inactive' ? 'ban' : 'clock'" />
                  {{ enrollment.status === 'active' ? 'Activo' : enrollment.status === 'inactive' ? 'Inactivo' : 'Pendiente' }}
                </span>
              </div>
              <p v-if="enrollment.course?.description" class="course-description">{{ enrollment.course.description }}</p>
            </div>
            <div class="course-actions-row">
              <div class="status-control">
                <label for="status-select" class="status-label">Estado:</label>
                <select 
                  :id="`status-select-${enrollment.id}`"
                  :value="enrollment.status"
                  @change="changeEnrollmentStatus(enrollment, ($event.target as HTMLSelectElement).value)"
                  :disabled="processing"
                  class="status-select"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
              <button 
                class="btn-unenroll" 
                @click="confirmUnenroll(enrollment.course)"
                :disabled="processing"
              >
                <font-awesome-icon icon="times" />
                Desinscribir
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          Este usuario no está inscrito en ningún curso
        </div>
      </div>
      <!-- ...existing code... -->

      <!-- Tuition Fees Section -->
      <div v-if="enrolledCourses.length > 0" class="section">
        <div class="section-header">
          <h2>
            <font-awesome-icon icon="credit-card" />
            Matrículas y Pagos
          </h2>
        </div>

        <div v-if="loadingFees" class="loading-fees">
          <font-awesome-icon icon="spinner" spin />
          Cargando matrículas...
        </div>

        <div v-else-if="tuitionFees.length > 0" class="fees-list">
          <div 
            v-for="fee in tuitionFees" 
            :key="fee.id" 
            class="fee-card"
            :class="{ 
              'fee-pending': fee.status === 'pending',
              'fee-overdue': fee.status === 'overdue',
              'fee-paid': fee.status === 'paid'
            }"
          >
            <div class="fee-header">
              <div class="fee-course">
                <h4>{{ fee.enrollment.course.title }}</h4>
                <span 
                  class="fee-status-badge" 
                  :class="`status-${fee.status}`"
                >
                  {{ getStatusLabel(fee.status) }}
                </span>
              </div>
              <div class="fee-amount">
                ${{ formatAmount(fee.amount) }}
              </div>
            </div>

            <div class="fee-details">
              <div class="fee-info-row">
                <span class="fee-label">
                  <font-awesome-icon icon="calendar" />
                  Vencimiento:
                </span>
                <span :class="{ 'text-danger': isOverdue(fee) }">
                  {{ formatDate(fee.due_date) }}
                </span>
              </div>

              <div v-if="fee.paid_at" class="fee-info-row">
                <span class="fee-label">
                  <font-awesome-icon icon="check-circle" />
                  Pagado:
                </span>
                <span>{{ formatDate(fee.paid_at) }}</span>
              </div>

              <div v-if="fee.payment_method" class="fee-info-row">
                <span class="fee-label">Método:</span>
                <span>{{ fee.payment_method }}</span>
              </div>

              <div v-if="fee.notes" class="fee-info-row">
                <span class="fee-label">Notas:</span>
                <span>{{ fee.notes }}</span>
              </div>
            </div>

            <div v-if="fee.status !== 'paid'" class="fee-actions">
              <button 
                @click="openPaymentModal(fee)"
                class="btn-mark-paid"
                :disabled="processing"
              >
                <font-awesome-icon icon="check" />
                Marcar como Pagado
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          No hay matrículas generadas para este usuario
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
              @click="openEnrollModal(course)"
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

    <!-- Enroll Modal -->
    <div v-if="showEnrollModal" class="modal-overlay" @click.self="showEnrollModal = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Inscribir en Curso</h2>
          <button class="icon-button" @click="showEnrollModal = false" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="courseToEnroll" class="enroll-summary">
            <p><strong>Usuario:</strong> {{ user?.name }}</p>
            <p><strong>Curso:</strong> {{ courseToEnroll.title }}</p>
            <p><strong>Precio del curso:</strong> ${{ courseToEnroll.monthly_fee?.toFixed(2) || '0.00' }}</p>
          </div>

          <div class="form-group">
            <label for="customFee">
              Precio Mensual Personalizado (opcional)
              <span class="help-text">Dejar vacío para usar el precio del curso</span>
            </label>
            <input 
              id="customFee"
              type="number"
              v-model.number="customMonthlyFee"
              class="form-control"
              placeholder="Ej: 7500.00"
              step="0.01"
              min="0"
            />
            <p class="fee-info" v-if="customMonthlyFee">
              Se cobrará: <strong>${{ customMonthlyFee.toFixed(2) }}</strong> mensuales
            </p>
            <p class="fee-info" v-else>
              Se cobrará el precio del curso: <strong>${{ courseToEnroll?.monthly_fee?.toFixed(2) || '0.00' }}</strong>
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showEnrollModal = false" :disabled="processing">
            Cancelar
          </button>
          <button type="button" class="btn-primary" @click="enrollCourse" :disabled="processing">
            {{ processing ? 'Inscribiendo...' : 'Inscribir Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Pago</h2>
          <button class="icon-button" @click="showPaymentModal = false" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedFee" class="payment-summary">
            <p><strong>Curso:</strong> {{ selectedFee.enrollment.course.title }}</p>
            <p><strong>Monto:</strong> ${{ formatAmount(selectedFee.amount) }}</p>
            <p><strong>Vencimiento:</strong> {{ formatDate(selectedFee.due_date) }}</p>
          </div>

          <div class="form-group">
            <label for="paymentMethod">Método de Pago</label>
            <select 
              id="paymentMethod" 
              v-model="paymentMethod"
              class="form-control"
            >
              <option value="">Seleccionar...</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="paymentNotes">Notas (opcional)</label>
            <textarea 
              id="paymentNotes"
              v-model="paymentNotes"
              class="form-control"
              rows="3"
              placeholder="Número de transacción, observaciones, etc."
            ></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showPaymentModal = false" :disabled="processing">
            Cancelar
          </button>
          <button type="button" class="btn-primary" @click="confirmPayment" :disabled="processing">
            {{ processing ? 'Registrando...' : 'Registrar Pago' }}
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
import { enrollUser, unenrollUser, getAllEnrollments, type Enrollment, updateEnrollmentStatus } from '@/services/enrollmentService'
// Cambiar estado de inscripción
const changeEnrollmentStatus = async (enrollment: Enrollment, newStatus: string) => {
  if (processing.value) return

  try {
    processing.value = true
    error.value = ''
    successMessage.value = ''

    await updateEnrollmentStatus(enrollment.id, newStatus as 'active' | 'inactive' | 'pending')

    // Actualizar el estado localmente
    const index = enrollments.value.findIndex(e => e.id === enrollment.id)
    if (index !== -1) {
      enrollments.value[index].status = newStatus as 'active' | 'inactive' | 'pending'
    }

    successMessage.value = 'Estado de la inscripción actualizado exitosamente'
  } catch (err: unknown) {
    const errorObj = err as { response?: { data?: { message?: string } } }
    error.value = errorObj.response?.data?.message || 'Error al actualizar el estado'
  } finally {
    processing.value = false
  }
}
import { getAllFees, markFeeAsPaid, type TuitionFee } from '@/services/tuitionFeeService'

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
  monthly_fee?: number
  requires_payment?: boolean
}

const route = useRoute()
const userId = Number(route.params.userId)

const user = ref<User | null>(null)
const allCourses = ref<Course[]>([])
const enrollments = ref<Enrollment[]>([])
const tuitionFees = ref<TuitionFee[]>([])
const loading = ref(true)
const loadingFees = ref(false)
const processing = ref(false)
const error = ref('')
const successMessage = ref('')

const showConfirmModal = ref(false)
const courseToUnenroll = ref<Course | null>(null)

const showEnrollModal = ref(false)
const courseToEnroll = ref<Course | null>(null)
const customMonthlyFee = ref<number | null>(null)

const enrolledCourses = computed(() => {
  const enrolledIds = enrollments.value.map(e => e.course_id)
  return allCourses.value.filter(course => enrolledIds.includes(course.id))
})

const availableCourses = computed(() => {
  const enrolledIds = enrollments.value.map(e => e.course_id)
  return allCourses.value.filter(course => !enrolledIds.includes(course.id))
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
    
    // Fetch user's enrollments using the new system
    enrollments.value = await getAllEnrollments({ user_id: userId })
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al cargar la información'
  } finally {
    loading.value = false
  }
}

const openEnrollModal = (course: Course) => {
  courseToEnroll.value = course
  // Pre-cargar el precio del curso (puede ser modificado por el admin)
  customMonthlyFee.value = course.monthly_fee || null
  showEnrollModal.value = true
}

const enrollCourse = async () => {
  if (!courseToEnroll.value) return
  
  processing.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const enrollment = await enrollUser(
      userId, 
      courseToEnroll.value.id,
      customMonthlyFee.value || undefined
    )
    enrollments.value.push(enrollment)
    
    const feeInfo = customMonthlyFee.value 
      ? `Precio personalizado: $${customMonthlyFee.value.toFixed(2)}`
      : `Precio del curso: $${courseToEnroll.value.monthly_fee?.toFixed(2) || '0.00'}`
    
    successMessage.value = `Usuario inscrito exitosamente en "${courseToEnroll.value.title}". ${feeInfo}. Primera matrícula generada con vencimiento mañana a la 1:00 AM.`
    
    showEnrollModal.value = false
    courseToEnroll.value = null
    customMonthlyFee.value = null
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
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
    await unenrollUser(userId, courseToUnenroll.value.id)
    enrollments.value = enrollments.value.filter(e => e.course_id !== courseToUnenroll.value!.id)
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

// Funciones para matrículas
const fetchTuitionFees = async () => {
  loadingFees.value = true
  try {
    tuitionFees.value = await getAllFees({ user_id: userId })
  } catch (e: unknown) {
    console.error('Error al cargar matrículas:', e)
  } finally {
    loadingFees.value = false
  }
}

const showPaymentModal = ref(false)
const selectedFee = ref<TuitionFee | null>(null)
const paymentMethod = ref('')
const paymentNotes = ref('')

const openPaymentModal = (fee: TuitionFee) => {
  selectedFee.value = fee
  paymentMethod.value = ''
  paymentNotes.value = ''
  showPaymentModal.value = true
}

const confirmPayment = async () => {
  if (!selectedFee.value) return
  
  processing.value = true
  
  try {
    await markFeeAsPaid(selectedFee.value.id, {
      payment_method: paymentMethod.value || undefined,
      notes: paymentNotes.value || undefined
    })
    
    // Actualizar la lista de matrículas
    await fetchTuitionFees()
    
    // Actualizar las inscripciones para reflejar el cambio de estado
    await fetchData()
    
    successMessage.value = 'Pago registrado exitosamente. El curso ha sido activado.'
    showPaymentModal.value = false
    selectedFee.value = null
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al registrar el pago'
  } finally {
    processing.value = false
  }
}

// Funciones de formato
const formatAmount = (amount: string) => {
  return parseFloat(amount).toLocaleString('es-CL')
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    overdue: 'Vencido'
  }
  return labels[status] || status
}

const isOverdue = (fee: TuitionFee) => {
  return new Date(fee.due_date) < new Date() && fee.status === 'pending'
}

onMounted(async () => {
  await fetchData()
  if (enrollments.value.length > 0) {
    await fetchTuitionFees()
  }
})
</script>

<style scoped>
/* Selector de estado moderno para inscripciones */
.status-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.status-label {
  font-weight: 500;
  color: #2c3e50;
  margin-right: 0.5rem;
  font-size: 0.95rem;
}
.status-select {
  padding: 0.5rem 1.2rem 0.5rem 0.75rem;
  border: 1.5px solid #d6eaf8;
  border-radius: 8px;
  background: #f8fbfd;
  color: #2c3e50;
  font-size: 0.98rem;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(52,152,219,0.07);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  cursor: pointer;
}
.status-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px #d6eaf8;
}
.status-select:disabled {
  background: #f4f6f7;
  color: #b2bec3;
  cursor: not-allowed;
}
/* Modern enrolled course card styles */
.enrolled-modern {
  background: linear-gradient(90deg, #eef7fd 80%, #eaf6fa 100%);
  border: 2px solid #d6eaf8;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.08);
  padding: 1.5rem 1.25rem;
}
.course-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.course-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.enrollment-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  box-shadow: 0 1px 4px rgba(52, 152, 219, 0.07);
}
.enrollment-status-badge.status-active {
  background: #d5f4e6;
  color: #27ae60;
}
.enrollment-status-badge.status-inactive {
  background: #fadbd8;
  color: #e74c3c;
}
.enrollment-status-badge.status-pending {
  background: #fef5e7;
  color: #f39c12;
}
.course-description {
  margin: 0.5rem 0 0;
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
}
.course-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}
.status-control {
  min-width: 180px;
  flex: 1 1 180px;
}
.btn-unenroll {
  flex: 0 0 auto;
  margin-left: auto;
  margin-top: 0;
}
@media (max-width: 600px) {
  .course-actions-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .btn-unenroll {
    margin-left: 0;
    width: 100%;
  }
  .status-control {
    width: 100%;
    min-width: 0;
  }
}
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

/* Tuition Fees Styles */
.loading-fees {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.fees-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fee-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #bdc3c7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.fee-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.fee-card.fee-pending {
  border-left-color: #f39c12;
}

.fee-card.fee-overdue {
  border-left-color: #e74c3c;
  background-color: #fff5f5;
}

.fee-card.fee-paid {
  border-left-color: #27ae60;
  background-color: #f0fff4;
}

.fee-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.fee-course {
  flex: 1;
}

.fee-course h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.fee-status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.fee-status-badge.status-pending {
  background-color: #fef5e7;
  color: #f39c12;
}

.fee-status-badge.status-overdue {
  background-color: #fadbd8;
  color: #e74c3c;
}

.fee-status-badge.status-paid {
  background-color: #d5f4e6;
  color: #27ae60;
}

.fee-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.fee-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.fee-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.fee-label {
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-danger {
  color: #e74c3c;
  font-weight: 600;
}

.fee-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.btn-mark-paid {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-mark-paid:hover:not(:disabled) {
  background-color: #229954;
}

.btn-mark-paid:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Payment Modal Styles */
.payment-summary {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.payment-summary p {
  margin: 0.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.btn-primary {
  background: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.enroll-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.enroll-summary p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.help-text {
  display: block;
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 0.25rem;
}

.fee-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
  border-radius: 4px;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-control[type="number"] {
  font-size: 1.1rem;
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

  .fee-header {
    flex-direction: column;
    gap: 1rem;
  }

  .fee-amount {
    font-size: 1.25rem;
  }
}
</style>
