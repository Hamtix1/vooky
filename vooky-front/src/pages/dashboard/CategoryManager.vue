<template>
  <div class="category-manager-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="title-icon">🏷️</span>
            Categorías
          </h1>
          <p class="page-subtitle">Administra las categorías de tus cursos</p>
        </div>
        <button class="btn-create" @click="openModal()">
          <font-awesome-icon :icon="['fas', 'plus']" class="btn-icon" />
          Nueva Categoría
        </button>
      </div>
    </div>

    <div class="page-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Cargando categorías...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="fetchCategories">
          <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="loading" />
          Reintentar
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!categories.length" class="empty-state">
        <div class="empty-icon">🏷️</div>
        <h2>No hay categorías</h2>
        <p>Comienza creando tu primera categoría</p>
        <button class="btn-create-empty" @click="openModal()">
          <font-awesome-icon :icon="['fas', 'plus']" class="btn-icon" />
          Crear Categoría
        </button>
      </div>

      <!-- Categories Table -->
      <div v-else class="table-container">
        <table class="category-table">
          <thead>
            <tr>
              <th class="th-id">
                <font-awesome-icon :icon="['fas', 'layer-group']" class="th-icon" />
                ID
              </th>
              <th class="th-name">
                <font-awesome-icon :icon="['fas', 'graduation-cap']" class="th-icon" />
                Nombre
              </th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cat, index) in categories" :key="cat.id" :style="{ animationDelay: `${index * 0.05}s` }" class="table-row">
              <td class="td-id">
                <span class="id-badge">{{ cat.id }}</span>
              </td>
              <td class="td-name">
                <span class="category-name">{{ cat.name }}</span>
              </td>
              <td class="td-actions">
                <button class="btn-action btn-edit" @click="openModal(cat)" title="Editar">
                  <font-awesome-icon :icon="['fas', 'pencil-alt']" />
                </button>
                <button class="btn-action btn-delete" @click="deleteCategory(cat.id)" title="Eliminar">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal" type="button">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
          
          <div class="modal-header">
            <div class="modal-icon">🏷️</div>
            <h2 class="modal-title">
              {{ editingCategory ? 'Editar' : 'Nueva' }} Categoría
            </h2>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label for="name" class="form-label">
                <font-awesome-icon :icon="['fas', 'graduation-cap']" class="label-icon" />
                Nombre de la Categoría
                <span class="required">*</span>
              </label>
              <input 
                id="name" 
                v-model="form.name" 
                type="text" 
                required 
                placeholder="Ej: Matemáticas, Ciencias, Arte..."
                class="form-input"
                maxlength="50"
              />
              <div class="character-counter">{{ form.name.length }}/50</div>
            </div>

            <div v-if="errorModal" class="error-message">
              <font-awesome-icon :icon="['fas', 'times']" />
              {{ errorModal }}
            </div>

            <div class="modal-actions">
              <button type="submit" :disabled="loadingModal" class="btn-submit">
                <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="loadingModal" />
                <font-awesome-icon :icon="['fas', 'plus']" v-else />
                {{ editingCategory ? 'Actualizar' : 'Crear' }}
              </button>
              <button type="button" @click="closeModal" class="btn-cancel">
                <font-awesome-icon :icon="['fas', 'times']" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getCategories } from '@/services/categoryService';
import api from '@/config/api';

interface Category {
  id: number;
  name: string;
}

const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref('');

const showModal = ref(false);
const editingCategory = ref<Category|null>(null);
const loadingModal = ref(false);
const errorModal = ref('');
const form = reactive({ name: '' });

async function fetchCategories() {
  loading.value = true;
  error.value = '';
  try {
    categories.value = await getCategories();
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Error al cargar las categorías.';
  } finally {
    loading.value = false;
  }
}

function openModal(cat?: Category) {
  if (cat) {
    editingCategory.value = cat;
    form.name = cat.name;
  } else {
    editingCategory.value = null;
    form.name = '';
  }
  errorModal.value = '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingCategory.value = null;
  form.name = '';
  errorModal.value = '';
}

async function handleSubmit() {
  errorModal.value = '';
  loadingModal.value = true;
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value.id}`, { name: form.name });
    } else {
      await api.post('/categories', { name: form.name });
    }
    await fetchCategories();
    closeModal();
  } catch (err: any) {
    errorModal.value = err?.response?.data?.message || 'Error al guardar la categoría.';
  } finally {
    loadingModal.value = false;
  }
}

async function deleteCategory(id: number) {
  if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
  try {
    await api.delete(`/categories/${id}`);
    await fetchCategories();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Error al eliminar la categoría.');
  }
}

onMounted(fetchCategories);
</script>

<style scoped>
.category-manager-page {
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
  border: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  white-space: nowrap;
  cursor: pointer;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
  border: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  cursor: pointer;
}

.btn-create-empty:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Category Table */
.category-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.category-table thead {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.category-table th {
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #667eea;
}

.th-icon {
  margin-right: 0.5rem;
  color: #667eea;
}

.th-id {
  width: 100px;
}

.th-actions {
  width: 150px;
  text-align: center;
}

.table-row {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  transform: translateX(5px);
}

.category-table td {
  padding: 1.2rem 1.5rem;
  color: #2c3e50;
}

.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 40px;
}

.category-name {
  font-weight: 600;
  font-size: 1.05rem;
  color: #2c3e50;
}

.td-actions {
  text-align: center;
}

/* Action Buttons */
.btn-action {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.3rem;
  font-size: 0.9rem;
}

.btn-edit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-edit:hover {
  transform: scale(1.15) rotate(15deg);
  box-shadow: 0 6px 16px rgba(243, 156, 18, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-delete:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
}

/* Modal Styles */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close:hover {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 20px 20px 0 0;
  text-align: center;
}

.modal-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.modal-title {
  margin: 0;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(to right, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-form {
  padding: 2rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.label-icon {
  color: #667eea;
}

.required {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.character-counter {
  text-align: right;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  display: block;
}

.error-message {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: shake 0.5s ease;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-submit, .btn-cancel {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-submit:hover::before {
  left: 100%;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(127, 140, 141, 0.3);
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(127, 140, 141, 0.4);
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

  .page-container {
    padding: 1.5rem 1rem;
  }

  .table-container {
    overflow-x: auto;
    padding: 1rem;
  }

  .category-table {
    min-width: 500px;
  }

  .modal-content {
    min-width: auto;
    width: 100%;
    margin: 0 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
