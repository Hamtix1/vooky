<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Editar Subcategoría' : 'Nueva Subcategoría' }}</h2>
        <button class="btn-close" @click="close" aria-label="Cerrar">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Nombre -->
        <div class="form-group">
          <label for="name">Nombre <span class="required">*</span></label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Ej: Rojo, Grande, Pequeño"
            required
            maxlength="255"
          />
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label for="description">Descripción (opcional)</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Descripción de la subcategoría"
            rows="3"
            maxlength="500"
          ></textarea>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Acciones -->
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="close">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { createSubcategory, updateSubcategory, type Subcategory, type SubcategoryFormData } from '@/services/subcategoryService';

const props = defineProps<{
  show: boolean;
  courseSlug: string;
  subcategory?: Subcategory | null;
}>();

const emit = defineEmits<{
  close: [];
  created: [];
  updated: [];
}>();

const formData = ref<SubcategoryFormData>({
  name: '',
  description: ''
});

const loading = ref(false);
const error = ref('');
const isEditing = ref(false);

// Resetear formulario cuando se abre/cierra el modal
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.subcategory) {
      isEditing.value = true;
      formData.value = {
        name: props.subcategory.name,
        description: props.subcategory.description || ''
      };
    } else {
      isEditing.value = false;
      formData.value = {
        name: '',
        description: ''
      };
    }
    error.value = '';
  }
});

async function handleSubmit() {
  loading.value = true;
  error.value = '';

  try {
    if (isEditing.value && props.subcategory) {
      await updateSubcategory(props.courseSlug, props.subcategory.id, formData.value);
      emit('updated');
    } else {
      await createSubcategory(props.courseSlug, formData.value);
      emit('created');
    }
    close();
  } catch (err) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    error.value = axiosError.response?.data?.message || 'Error al guardar la subcategoría';
  } finally {
    loading.value = false;
  }
}

function close() {
  emit('close');
}
</script>

<style scoped>
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: min(500px, 90vw);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #95a5a6;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fee;
  border-left: 4px solid #e74c3c;
  border-radius: 8px;
  color: #c0392b;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
