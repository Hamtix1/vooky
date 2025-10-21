<template>
  <div class="badges-page">
    <div class="page-header">
      <h1>
        <font-awesome-icon icon="trophy" />
        Insignias
      </h1>
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon icon="plus" />
        Nueva Insignia
      </button>
    </div>

    <div v-if="loading" class="loading">
      <font-awesome-icon icon="spinner" spin size="2x" />
      <p>Cargando insignias...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadBadges" class="btn btn-secondary">Reintentar</button>
    </div>

    <div v-else class="badges-grid">
      <div v-for="badge in badges" :key="badge.id" class="badge-card">
        <div class="badge-image">
          <img :src="getBadgeImageUrl(badge.image)" :alt="badge.name" />
        </div>
        <div class="badge-info">
          <h3>{{ badge.name }}</h3>
          <p class="badge-description">{{ badge.description }}</p>
          <p class="badge-course">
            <font-awesome-icon icon="book" />
            {{ badge.course?.title || 'Curso desconocido' }}
          </p>
          <p class="badge-requirement">
            <font-awesome-icon icon="check-circle" />
            {{ badge.lessons_required }} lecciones requeridas
          </p>
        </div>
        <div class="badge-actions">
          <button @click="openEditModal(badge)" class="btn btn-sm btn-secondary">
            <font-awesome-icon icon="pencil-alt" />
            Editar
          </button>
          <button @click="confirmDelete(badge)" class="btn btn-sm btn-danger">
            <font-awesome-icon icon="trash" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && badges.length === 0" class="empty-state">
      <font-awesome-icon icon="trophy" size="4x" />
      <p>No hay insignias creadas aún</p>
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon icon="plus" />
        Crear Primera Insignia
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingBadge ? 'Editar Insignia' : 'Nueva Insignia' }}</h2>
          <button @click="closeModal" class="btn-close">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <form @submit.prevent="saveBadge" class="badge-form">
          <div class="form-group">
            <label for="course">Curso *</label>
            <select v-model="formData.course_id" id="course" required>
              <option value="">Seleccionar curso...</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="name">Nombre de la Insignia *</label>
            <input
              v-model="formData.name"
              type="text"
              id="name"
              required
              placeholder="Ej: Principiante, Experto, Maestro"
            />
          </div>

          <div class="form-group">
            <label for="description">Descripción *</label>
            <textarea
              v-model="formData.description"
              id="description"
              required
              rows="3"
              placeholder="Describe cómo obtener esta insignia"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="lessons_required">Lecciones Requeridas *</label>
            <input
              v-model.number="formData.lessons_required"
              type="number"
              id="lessons_required"
              required
              min="0"
              placeholder="Número de lecciones que debe completar"
            />
          </div>

          <div class="form-group">
            <label for="image">Imagen de la Insignia *</label>
            <input
              @change="handleImageChange"
              type="file"
              id="image"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
              :required="!editingBadge"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <font-awesome-icon v-if="saving" icon="spinner" spin />
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBadges, createBadge, updateBadge, deleteBadge } from '@/services/badgeService';
import { getCourses, type Course } from '@/services/courseService';
import type { Badge, BadgeFormData } from '@/types/badge';

const badges = ref<Badge[]>([]);
const courses = ref<Course[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const showModal = ref(false);
const editingBadge = ref<Badge | null>(null);
const imagePreview = ref('');

const formData = ref<BadgeFormData>({
  course_id: 0,
  name: '',
  description: '',
  image: null,
  lessons_required: 0,
});

onMounted(async () => {
  await loadBadges();
  await loadCourses();
});

async function loadBadges() {
  loading.value = true;
  error.value = '';
  try {
    badges.value = await getBadges();
  } catch (err) {
    error.value = 'Error al cargar las insignias';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function loadCourses() {
  try {
    courses.value = await getCourses();
  } catch (err) {
    console.error('Error al cargar cursos:', err);
  }
}

function openCreateModal() {
  editingBadge.value = null;
  formData.value = {
    course_id: 0,
    name: '',
    description: '',
    image: null,
    lessons_required: 0,
  };
  imagePreview.value = '';
  showModal.value = true;
}

function openEditModal(badge: Badge) {
  editingBadge.value = badge;
  formData.value = {
    course_id: badge.course_id,
    name: badge.name,
    description: badge.description,
    image: badge.image,
    lessons_required: badge.lessons_required,
  };
  imagePreview.value = getBadgeImageUrl(badge.image);
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingBadge.value = null;
  imagePreview.value = '';
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    formData.value.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

async function saveBadge() {
  saving.value = true;
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('course_id', formData.value.course_id.toString());
    formDataToSend.append('name', formData.value.name);
    formDataToSend.append('description', formData.value.description || '');
    formDataToSend.append('lessons_required', formData.value.lessons_required.toString());
    
    if (formData.value.image instanceof File) {
      formDataToSend.append('image', formData.value.image);
    } else if (!editingBadge.value) {
      // Si es nueva insignia y no hay imagen, mostrar error
      alert('Por favor selecciona una imagen para la insignia');
      saving.value = false;
      return;
    }

    if (editingBadge.value) {
      formDataToSend.append('_method', 'PUT');
      await updateBadge(editingBadge.value.id, formDataToSend);
    } else {
      await createBadge(formDataToSend);
    }

    await loadBadges();
    closeModal();
  } catch (err) {
    console.error('Error al guardar insignia:', err);
    const error = err as Error & { response?: { data?: { message?: string } } };
    const errorMsg = error.response?.data?.message || error.message || 'Error al guardar la insignia';
    alert(errorMsg);
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(badge: Badge) {
  if (confirm(`¿Estás seguro de eliminar la insignia "${badge.name}"?`)) {
    try {
      await deleteBadge(badge.id);
      await loadBadges();
    } catch (err) {
      console.error('Error al eliminar insignia:', err);
      alert('Error al eliminar la insignia');
    }
  }
}

function getBadgeImageUrl(image: string): string {
  if (image.startsWith('http')) {
    return image;
  }
  return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${image}`;
}
</script>

<style scoped>
.badges-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.badge-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s;
}

.badge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.badge-image {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 8px;
}

.badge-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.badge-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.badge-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.badge-course,
.badge-requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
  margin: 0.25rem 0;
}

.badge-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.badge-actions button {
  flex: 1;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading svg,
.empty-state svg {
  color: #667eea;
  margin-bottom: 1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fee;
  border-radius: 8px;
  color: #c33;
}

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
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.badge-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #eee;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
