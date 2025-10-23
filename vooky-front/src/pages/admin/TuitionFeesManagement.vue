<template>
  <div class="tuition-management">
    <div class="page-header">
      <h1>
        <font-awesome-icon icon="credit-card" />
        Gestión de Matrículas
      </h1>
      <p class="subtitle">Administrar pagos y matrículas de todos los usuarios</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Filtrar por estado:</label>
        <select v-model="filterStatus" @change="applyFilters" class="filter-select">
          <option value="">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="overdue">Vencidos</option>
          <option value="paid">Pagados</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Buscar:</label>
        <input 
          v-model="searchQuery" 
          @input="applyFilters"
          type="text" 
          placeholder="Usuario o curso..."
          class="filter-input"
        />
      </div>
    </div>

    <!-- Statistics -->
    <div v-if="statistics" class="statistics-grid">
      <div class="stat-card stat-pending">
        <div class="stat-icon">
          <font-awesome-icon icon="clock" />
        </div>
        <div class="stat-info">
          <h3>{{ statistics.pending }}</h3>
          <p>Pendientes</p>
          <span class="stat-amount">${{ formatAmount(statistics.total_amount.pending) }}</span>
        </div>
      </div>

      <div class="stat-card stat-overdue">
        <div class="stat-icon">
          <font-awesome-icon icon="exclamation-triangle" />
        </div>
        <div class="stat-info">
          <h3>{{ statistics.overdue }}</h3>
          <p>Vencidos</p>
          <span class="stat-amount">${{ formatAmount(statistics.total_amount.overdue) }}</span>
        </div>
      </div>

      <div class="stat-card stat-paid">
        <div class="stat-icon">
          <font-awesome-icon icon="check-circle" />
        </div>
        <div class="stat-info">
          <h3>{{ statistics.paid }}</h3>
          <p>Pagados</p>
          <span class="stat-amount">${{ formatAmount(statistics.total_amount.paid) }}</span>
        </div>
      </div>

      <div class="stat-card stat-total">
        <div class="stat-icon">
          <font-awesome-icon icon="chart-line" />
        </div>
        <div class="stat-info">
          <h3>{{ statistics.total_fees }}</h3>
          <p>Total</p>
          <span class="stat-amount">Este mes: {{ statistics.this_month.pending + statistics.this_month.paid }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <font-awesome-icon icon="spinner" spin size="2x" />
      <p>Cargando matrículas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <font-awesome-icon icon="exclamation-circle" />
      <p>{{ error }}</p>
      <button @click="fetchData" class="btn-retry">
        <font-awesome-icon icon="redo" /> Reintentar
      </button>
    </div>

    <!-- Tuition Fees List -->
    <div v-else-if="filteredFees.length > 0" class="fees-container">
      <div class="fees-table-container">
        <table class="fees-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Curso</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Método Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="fee in filteredFees" 
              :key="fee.id"
              :class="{
                'row-pending': fee.status === 'pending',
                'row-overdue': fee.status === 'overdue',
                'row-paid': fee.status === 'paid'
              }"
            >
              <td>
                <div class="user-info">
                  <font-awesome-icon icon="user" />
                  <div>
                    <strong>{{ fee.enrollment.user?.name }}</strong>
                    <small>{{ fee.enrollment.user?.email }}</small>
                  </div>
                </div>
              </td>
              <td>
                <strong>{{ fee.enrollment.course.title }}</strong>
              </td>
              <td class="amount">
                ${{ formatAmount(fee.amount) }}
              </td>
              <td :class="{ 'text-danger': isOverdue(fee) }">
                {{ formatDate(fee.due_date) }}
                <div v-if="isOverdue(fee) && fee.status !== 'paid'" class="overdue-badge">
                  <font-awesome-icon icon="exclamation-triangle" />
                  Vencido
                </div>
              </td>
              <td>
                <span 
                  class="status-badge"
                  :class="`status-${fee.status}`"
                >
                  {{ getStatusLabel(fee.status) }}
                </span>
              </td>
              <td>
                <span v-if="fee.payment_method">{{ fee.payment_method }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="openEditModal(fee)"
                    class="btn-action btn-edit"
                    title="Editar factura"
                  >
                    <font-awesome-icon icon="pencil-alt" />
                  </button>
                  <button
                    v-if="fee.status !== 'paid'"
                    @click="openPaymentModal(fee)"
                    class="btn-action btn-pay"
                    title="Marcar como pagado"
                  >
                    <font-awesome-icon icon="check" />
                  </button>
                  <button
                    @click="viewDetails(fee)"
                    class="btn-action btn-view"
                    title="Ver detalles"
                  >
                    <font-awesome-icon icon="eye" />
                  </button>
                  <button
                    @click="confirmDelete(fee)"
                    class="btn-action btn-delete"
                    title="Eliminar factura"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="no-data">
      <font-awesome-icon icon="inbox" size="3x" />
      <h3>No hay matrículas registradas</h3>
      <p>No se encontraron matrículas con los filtros aplicados</p>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Pago</h2>
          <button class="icon-button" @click="showPaymentModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedFee" class="payment-summary">
            <p><strong>Usuario:</strong> {{ selectedFee.enrollment.user?.name }}</p>
            <p><strong>Curso:</strong> {{ selectedFee.enrollment.course.title }}</p>
            <p><strong>Monto:</strong> ${{ formatAmount(selectedFee.amount) }}</p>
            <p><strong>Vencimiento:</strong> {{ formatDate(selectedFee.due_date) }}</p>
          </div>

          <div class="form-group">
            <label for="paymentMethod">Método de Pago *</label>
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
          <button type="button" class="btn-primary" @click="confirmPayment" :disabled="processing || !paymentMethod">
            {{ processing ? 'Registrando...' : 'Registrar Pago' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="showDetailsModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detalles de la Matrícula</h2>
          <button class="icon-button" @click="showDetailsModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedFee">
          <div class="details-grid">
            <div class="detail-item">
              <label>ID:</label>
              <span>{{ selectedFee.id }}</span>
            </div>
            <div class="detail-item">
              <label>Usuario:</label>
              <span>{{ selectedFee.enrollment.user?.name }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ selectedFee.enrollment.user?.email }}</span>
            </div>
            <div class="detail-item">
              <label>Curso:</label>
              <span>{{ selectedFee.enrollment.course.title }}</span>
            </div>
            <div class="detail-item">
              <label>Monto:</label>
              <span class="amount">${{ formatAmount(selectedFee.amount) }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha de vencimiento:</label>
              <span>{{ formatDate(selectedFee.due_date) }}</span>
            </div>
            <div class="detail-item">
              <label>Estado:</label>
              <span class="status-badge" :class="`status-${selectedFee.status}`">
                {{ getStatusLabel(selectedFee.status) }}
              </span>
            </div>
            <div v-if="selectedFee.paid_at" class="detail-item">
              <label>Fecha de pago:</label>
              <span>{{ formatDate(selectedFee.paid_at) }}</span>
            </div>
            <div v-if="selectedFee.payment_method" class="detail-item">
              <label>Método de pago:</label>
              <span>{{ selectedFee.payment_method }}</span>
            </div>
            <div v-if="selectedFee.notes" class="detail-item full-width">
              <label>Notas:</label>
              <p>{{ selectedFee.notes }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showDetailsModal = false">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Fee Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <font-awesome-icon icon="pencil-alt" />
            Editar Factura
          </h2>
          <button class="icon-button" @click="showEditModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedFee">
          <div class="edit-summary">
            <p><strong>Usuario:</strong> {{ selectedFee.enrollment.user?.name }}</p>
            <p><strong>Curso:</strong> {{ selectedFee.enrollment.course.title }}</p>
          </div>

          <div class="form-group">
            <label for="editAmount">Monto *</label>
            <input 
              id="editAmount" 
              v-model.number="editForm.amount"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="Ingrese el monto"
            />
          </div>

          <div class="form-group">
            <label for="editDueDate">Fecha de Vencimiento *</label>
            <input 
              id="editDueDate" 
              v-model="editForm.due_date"
              type="date"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="editStatus">Estado *</label>
            <select 
              id="editStatus" 
              v-model="editForm.status"
              class="form-control"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="overdue">Vencido</option>
            </select>
          </div>

          <div v-if="editForm.status === 'paid'" class="form-group">
            <label for="editPaymentMethod">Método de Pago</label>
            <select 
              id="editPaymentMethod" 
              v-model="editForm.payment_method"
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
            <label for="editNotes">Notas</label>
            <textarea 
              id="editNotes"
              v-model="editForm.notes"
              class="form-control"
              rows="3"
              placeholder="Observaciones adicionales..."
            ></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showEditModal = false" :disabled="processing">
            Cancelar
          </button>
          <button type="button" class="btn-primary" @click="confirmEdit" :disabled="processing || !isEditFormValid">
            {{ processing ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="toast success">
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="error" class="toast error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAllFees, markFeeAsPaid, updateFee, deleteFee, getFeeStatistics, type TuitionFee, type TuitionFeeStatistics } from '@/services/tuitionFeeService';

const fees = ref<TuitionFee[]>([]);
const statistics = ref<TuitionFeeStatistics | null>(null);
const loading = ref(true);
const processing = ref(false);
const error = ref('');
const successMessage = ref('');

const filterStatus = ref(''); // Por defecto mostrar todos
const searchQuery = ref('');

const showPaymentModal = ref(false);
const showDetailsModal = ref(false);
const showEditModal = ref(false);
const selectedFee = ref<TuitionFee | null>(null);
const paymentMethod = ref('');
const paymentNotes = ref('');

// Formulario de edición
const editForm = ref({
  amount: 0,
  due_date: '',
  status: 'pending' as 'pending' | 'paid' | 'overdue',
  payment_method: '',
  notes: ''
});

const isEditFormValid = computed(() => {
  return editForm.value.amount > 0 && editForm.value.due_date !== '';
});

const filteredFees = computed(() => {
  let result = fees.value;

  // Filtrar por estado
  if (filterStatus.value) {
    result = result.filter(fee => fee.status === filterStatus.value);
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(fee => 
      fee.enrollment.user?.name.toLowerCase().includes(query) ||
      fee.enrollment.user?.email.toLowerCase().includes(query) ||
      fee.enrollment.course.title.toLowerCase().includes(query)
    );
  }

  return result;
});

const fetchData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [feesData, statsData] = await Promise.all([
      getAllFees(),
      getFeeStatistics()
    ]);

    fees.value = feesData;
    statistics.value = statsData;
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 'Error al cargar las matrículas';
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  // Los filtros se aplican automáticamente a través del computed
};

const openPaymentModal = (fee: TuitionFee) => {
  selectedFee.value = fee;
  paymentMethod.value = '';
  paymentNotes.value = '';
  showPaymentModal.value = true;
};

const viewDetails = (fee: TuitionFee) => {
  selectedFee.value = fee;
  showDetailsModal.value = true;
};

const openEditModal = (fee: TuitionFee) => {
  selectedFee.value = fee;
  editForm.value = {
    amount: parseFloat(fee.amount),
    due_date: fee.due_date.split('T')[0], // Formato YYYY-MM-DD
    status: fee.status,
    payment_method: fee.payment_method || '',
    notes: fee.notes || ''
  };
  showEditModal.value = true;
};

const confirmEdit = async () => {
  if (!selectedFee.value || !isEditFormValid.value) return;

  processing.value = true;
  error.value = '';

  try {
    await updateFee(selectedFee.value.id, {
      amount: editForm.value.amount,
      due_date: editForm.value.due_date,
      status: editForm.value.status,
      payment_method: editForm.value.payment_method || undefined,
      notes: editForm.value.notes || undefined
    });

    // Actualizar datos
    await fetchData();

    successMessage.value = 'Factura actualizada exitosamente';
    showEditModal.value = false;
    selectedFee.value = null;

    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 'Error al actualizar la factura';
    
    setTimeout(() => {
      error.value = '';
    }, 5000);
  } finally {
    processing.value = false;
  }
};

const confirmDelete = async (fee: TuitionFee) => {
  if (!confirm(`¿Estás seguro de eliminar esta factura?\n\nUsuario: ${fee.enrollment.user?.name}\nCurso: ${fee.enrollment.course.title}\nMonto: $${formatAmount(fee.amount)}`)) {
    return;
  }

  processing.value = true;
  error.value = '';

  try {
    await deleteFee(fee.id);

    // Actualizar datos
    await fetchData();

    successMessage.value = 'Factura eliminada exitosamente';

    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 'Error al eliminar la factura';
    
    setTimeout(() => {
      error.value = '';
    }, 5000);
  } finally {
    processing.value = false;
  }
};

const confirmPayment = async () => {
  if (!selectedFee.value || !paymentMethod.value) return;

  processing.value = true;
  error.value = ''; // Limpiar errores previos

  try {
    console.log('Marcando matrícula como pagada:', selectedFee.value.id);
    console.log('Método de pago:', paymentMethod.value);
    
    await markFeeAsPaid(selectedFee.value.id, {
      payment_method: paymentMethod.value,
      notes: paymentNotes.value || undefined
    });

    // Actualizar datos
    await fetchData();

    successMessage.value = 'Pago registrado exitosamente. El curso ha sido activado.';
    showPaymentModal.value = false;
    selectedFee.value = null;
    paymentMethod.value = '';
    paymentNotes.value = '';

    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 'Error al registrar el pago';
    
    setTimeout(() => {
      error.value = '';
    }, 5000);
  } finally {
    processing.value = false;
  }
};

const formatAmount = (amount: string) => {
  return parseFloat(amount).toLocaleString('es-CL');
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    overdue: 'Vencido'
  };
  return labels[status] || status;
};

const isOverdue = (fee: TuitionFee) => {
  return new Date(fee.due_date) < new Date() && fee.status !== 'paid';
};

onMounted(fetchData);
</script>

<style scoped>
.tuition-management {
  max-width: 1400px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Filters */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3498db;
}

/* Statistics */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-pending .stat-icon {
  background-color: #fef5e7;
  color: #f39c12;
}

.stat-overdue .stat-icon {
  background-color: #fadbd8;
  color: #e74c3c;
}

.stat-paid .stat-icon {
  background-color: #d5f4e6;
  color: #27ae60;
}

.stat-total .stat-icon {
  background-color: #ebf5fb;
  color: #3498db;
}

.stat-info h3 {
  font-size: 2rem;
  margin: 0;
  color: #2c3e50;
}

.stat-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stat-amount {
  font-size: 0.85rem;
  color: #95a5a6;
}

/* Table */
.fees-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.fees-table {
  width: 100%;
  border-collapse: collapse;
}

.fees-table thead {
  background-color: #f8f9fa;
}

.fees-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
}

.fees-table td {
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.fees-table tbody tr:hover {
  background-color: #f8f9fa;
}

.row-pending {
  border-left: 4px solid #f39c12;
}

.row-overdue {
  border-left: 4px solid #e74c3c;
  background-color: #fff5f5;
}

.row-paid {
  border-left: 4px solid #27ae60;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info svg {
  color: #7f8c8d;
}

.user-info div {
  display: flex;
  flex-direction: column;
}

.user-info small {
  color: #95a5a6;
  font-size: 0.85rem;
}

.amount {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.text-danger {
  color: #e74c3c;
  font-weight: 600;
}

.text-muted {
  color: #95a5a6;
}

.overdue-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #e74c3c;
  margin-top: 0.25rem;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-pending {
  background-color: #fef5e7;
  color: #f39c12;
}

.status-badge.status-overdue {
  background-color: #fadbd8;
  color: #e74c3c;
}

.status-badge.status-paid {
  background-color: #d5f4e6;
  color: #27ae60;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #7f8c8d;
}

.btn-action:hover {
  transform: translateY(-2px);
}

.btn-action.btn-pay {
  color: #27ae60;
}

.btn-action.btn-pay:hover {
  background-color: #e8f8f5;
}

.btn-action.btn-edit {
  color: #f39c12;
}

.btn-action.btn-edit:hover {
  background-color: #fef5e7;
}

.btn-action.btn-view {
  color: #3498db;
}

.btn-action.btn-view:hover {
  background-color: #ebf5fb;
}

.btn-action.btn-delete {
  color: #e74c3c;
}

.btn-action.btn-delete:hover {
  background-color: #fadbd8;
}

/* States */
.loading,
.error-message,
.no-data {
  text-align: center;
  padding: 4rem 2rem;
}

.loading {
  color: #3498db;
}

.error-message {
  color: #e74c3c;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-retry:hover {
  background-color: #2980b9;
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
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.icon-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0.25rem;
  line-height: 1;
}

.icon-button:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #ecf0f1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.payment-summary {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.payment-summary p {
  margin: 0.5rem 0;
}

.edit-summary {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #f39c12;
}

.edit-summary p {
  margin: 0.5rem 0;
  color: #5d4037;
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
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background-color: #d5dbdb;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 500;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detail-item span,
.detail-item p {
  color: #2c3e50;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

.toast.success {
  background: #27ae60;
}

.toast.error {
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .tuition-management {
    padding: 1rem;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .fees-table-container {
    overflow-x: auto;
  }

  .fees-table {
    min-width: 800px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
