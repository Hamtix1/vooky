<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditMode ? '✏️ Editar Categoría' : '📁 Nueva Categoría' }}</h2>
        <button class="icon-button" @click="$emit('close')" aria-label="Cerrar">
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="category-form">
        <div class="form-group">
          <label for="name">Nombre de la categoría <span class="required">*</span></label>
          <input 
            id="name" 
            v-model="name" 
            type="text" 
            required 
            placeholder="Ej: Animales, Frutas, Colores..."
            maxlength="50"
            autocomplete="off"
          />
          <span class="char-count">{{ name.length }}/50</span>
        </div>

        <div v-if="error" class="feedback error">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <div v-if="success" class="feedback success">
          <span class="success-icon">✓</span>
          {{ success }}
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('close')" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="loading || !name.trim()">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar Categoría' : 'Crear Categoría') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { createCategory, updateCategory, type Category } from '@/services/categoryService';

const props = defineProps<{
  courseSlug: string;
  category?: Category | null;
}>();

const emit = defineEmits(['close', 'created']);
const name = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

// Modo edición si se proporciona una categoría
const isEditMode = computed(() => !!props.category);

// Cargar nombre de la categoría si estamos editando
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    name.value = newCategory.name;
  } else {
    name.value = '';
  }
}, { immediate: true });

async function handleSubmit() {
  if (!name.value.trim()) return;
  
  error.value = '';
  success.value = '';
  loading.value = true;
  
  try {
    if (isEditMode.value && props.category) {
      // Modo edición
      await updateCategory(props.courseSlug, props.category.id, name.value.trim());
      success.value = 'Categoría actualizada correctamente';
    } else {
      // Modo creación
      await createCategory(props.courseSlug, name.value.trim());
      success.value = 'Categoría creada correctamente';
    }
    
    setTimeout(() => {
      emit('created');
      emit('close');
    }, 1000);
  } catch (err: unknown) {
    const errorResponse = err as { response?: { data?: { message?: string } } };
    error.value = errorResponse.response?.data?.message || 
      `Error al ${isEditMode.value ? 'actualizar' : 'crear'} la categoría.`;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.icon-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.icon-button:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
  color: #e74c3c;
  transform: rotate(90deg);
}

.category-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.char-count {
  position: absolute;
  right: 0.75rem;
  bottom: 3rem;
  font-size: 0.75rem;
  color: #9ca3af;
  pointer-events: none;
  font-weight: 600;
  background: white;
  padding: 0 0.25rem;
}

.feedback {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feedback.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.feedback.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.error-icon,
.success-icon {
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
