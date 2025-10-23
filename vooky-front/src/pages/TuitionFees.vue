<template>
  <div class="tuition-fees-page">
    <div class="page-header">
      <h1>💳 Mis Matrículas</h1>
      <p class="subtitle">Gestiona tus pagos mensuales</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando matrículas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="loadFees" class="btn-retry">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Pendientes / Vencidas -->
      <div v-if="pendingFees.length > 0" class="fees-section">
        <h2 class="section-title">
          <span class="icon">⏰</span>
          Pagos Pendientes
          <span class="badge-count">{{ pendingFees.length }}</span>
        </h2>
        
        <div class="fees-grid">
          <div 
            v-for="fee in pendingFees" 
            :key="fee.id" 
            class="fee-card"
            :class="{ 'overdue': fee.status === 'overdue' }"
          >
            <div class="fee-header">
              <div class="course-info">
                <h3>{{ fee.enrollment.course.title }}</h3>
                <span 
                  class="status-badge" 
                  :class="fee.status"
                >
                  {{ statusLabel(fee.status) }}
                </span>
              </div>
              <div class="amount">
                ${{ formatAmount(fee.amount) }}
              </div>
            </div>

            <div class="fee-details">
              <div class="detail-item">
                <span class="label">Fecha de vencimiento:</span>
                <span class="value" :class="{ 'overdue-text': fee.status === 'overdue' }">
                  {{ formatDate(fee.due_date) }}
                </span>
              </div>
              
              <div v-if="fee.status === 'overdue'" class="overdue-warning">
                <font-awesome-icon icon="exclamation-triangle" />
                <span>Este pago está vencido. Tu curso puede estar desactivado.</span>
              </div>
            </div>

            <div class="fee-actions">
              <button class="btn-contact" @click="contactAdmin">
                <font-awesome-icon icon="envelope" />
                Contactar Administrador
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagadas -->
      <div v-if="paidFees.length > 0" class="fees-section">
        <h2 class="section-title">
          <span class="icon">✅</span>
          Pagos Realizados
          <span class="badge-count success">{{ paidFees.length }}</span>
        </h2>
        
        <div class="fees-grid">
          <div 
            v-for="fee in paidFees" 
            :key="fee.id" 
            class="fee-card paid"
          >
            <div class="fee-header">
              <div class="course-info">
                <h3>{{ fee.enrollment.course.title }}</h3>
                <span class="status-badge paid">Pagado</span>
              </div>
              <div class="amount">
                ${{ formatAmount(fee.amount) }}
              </div>
            </div>

            <div class="fee-details">
              <div class="detail-item">
                <span class="label">Fecha de pago:</span>
                <span class="value">{{ formatDate(fee.paid_at!) }}</span>
              </div>
              <div v-if="fee.payment_method" class="detail-item">
                <span class="label">Método de pago:</span>
                <span class="value">{{ fee.payment_method }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin matrículas -->
      <div v-if="allFees.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h2>No tienes matrículas registradas</h2>
        <p>Inscríbete en un curso para comenzar tu aprendizaje</p>
        <router-link to="/dashboard/courses" class="btn-primary">
          <font-awesome-icon icon="graduation-cap" />
          Ver Cursos
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getUserFees, type TuitionFee } from '@/services/tuitionFeeService';

const loading = ref(true);
const error = ref('');
const allFees = ref<TuitionFee[]>([]);

const pendingFees = computed(() => 
  allFees.value.filter(fee => fee.status === 'pending' || fee.status === 'overdue')
);

const paidFees = computed(() => 
  allFees.value.filter(fee => fee.status === 'paid')
);

function formatAmount(amount: string): string {
  return parseFloat(amount).toFixed(2);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    overdue: 'Vencido'
  };
  return labels[status] || status;
}

function contactAdmin() {
  // Implementar lógica de contacto (email, chat, etc.)
  alert('Por favor contacta al administrador para procesar tu pago.');
}

async function loadFees() {
  try {
    loading.value = true;
    error.value = '';
    allFees.value = await getUserFees();
  } catch (err) {
    console.error('Error al cargar matrículas:', err);
    error.value = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cargar las matrículas';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadFees();
});
</script>

<style scoped>
.tuition-fees-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

/* Loading & Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e9ecef;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* Sections */
.fees-section {
  margin-bottom: 3rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.section-title .icon {
  font-size: 1.75rem;
}

.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.75rem;
  background: #ff6b6b;
  color: white;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 700;
}

.badge-count.success {
  background: #51cf66;
}

/* Fee Cards Grid */
.fees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.fee-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ffc107;
  transition: all 0.3s;
}

.fee-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.fee-card.overdue {
  border-left-color: #ff6b6b;
  background: linear-gradient(to right, #fff5f5 0%, white 10%);
}

.fee-card.paid {
  border-left-color: #51cf66;
  background: linear-gradient(to right, #f0fdf4 0%, white 10%);
  opacity: 0.85;
}

.fee-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f5;
}

.course-info h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.fee-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.detail-item .label {
  color: #7f8c8d;
}

.detail-item .value {
  color: #2c3e50;
  font-weight: 600;
}

.overdue-text {
  color: #ff6b6b !important;
}

.overdue-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff3f3;
  border-radius: 8px;
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.75rem;
}

.fee-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-contact {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-contact:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .tuition-fees-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .fees-grid {
    grid-template-columns: 1fr;
  }
}
</style>
