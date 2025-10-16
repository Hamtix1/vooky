<template>
  <div class="edit-course-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <router-link :to="{ name: 'Courses' }" class="btn-back">
          <font-awesome-icon :icon="['fas', 'home']" />
          Volver
        </router-link>
        <h1 class="page-title">
          <span class="title-icon">✏️</span>
          Editar Curso
        </h1>
        <p class="page-subtitle">Modifica la información del curso</p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Cargando datos del curso...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !course" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <router-link :to="{ name: 'Courses' }" class="btn-retry">
          <font-awesome-icon :icon="['fas', 'home']" />
          Volver a Cursos
        </router-link>
      </div>

      <!-- Edit Form -->
      <form v-else-if="course" @submit.prevent="handleUpdate" class="course-form">
        <!-- Title Field -->
        <div class="form-group">
          <label for="title" class="form-label">
            <font-awesome-icon :icon="['fas', 'graduation-cap']" class="label-icon" />
            Título del Curso
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="title" 
            v-model="course.title" 
            placeholder="Ej: Inglés para Principiantes, Matemáticas Divertidas..."
            required 
            class="form-input"
            maxlength="100"
          />
          <div class="character-counter">{{ course.title?.length || 0 }}/100</div>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description" class="form-label">
            <font-awesome-icon :icon="['fas', 'book']" class="label-icon" />
            Descripción
          </label>
          <textarea 
            id="description" 
            v-model="course.description" 
            rows="6"
            placeholder="Describe de qué trata el curso, qué aprenderán los estudiantes, nivel recomendado..."
            class="form-textarea"
            maxlength="500"
          ></textarea>
          <div class="character-counter">{{ course.description?.length || 0 }}/500</div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <font-awesome-icon :icon="['fas', 'times']" />
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          <font-awesome-icon :icon="['fas', 'check']" />
          {{ successMessage }}
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" :disabled="submitting" class="btn-submit">
            <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="submitting" />
            <font-awesome-icon :icon="['fas', 'check']" v-else />
            {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
          <router-link :to="{ name: 'Courses' }" class="btn-cancel">
            <font-awesome-icon :icon="['fas', 'times']" />
            Cancelar
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCourseBySlug, updateCourse, type Course } from '@/services/courseService';

const route = useRoute();
const router = useRouter();

// Estado del componente
const course = ref<Course | null>(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const slug = route.params.slug as string;

// Cargar los datos del curso al montar el componente
onMounted(async () => {
    if (!slug) {
        error.value = "No se ha especificado un curso para editar.";
        loading.value = false;
        return;
    }

    try {
        // Hacemos una copia del objeto para no mutar el original directamente
        // hasta que el usuario guarde.
        const data = await getCourseBySlug(slug);
        course.value = { ...data };
    } catch (err) {
        console.error("Error al cargar el curso:", err);
        error.value = "No se pudieron cargar los datos del curso. Es posible que no exista.";
    } finally {
        loading.value = false;
    }
});

// Manejar la actualización del formulario
const handleUpdate = async () => {
    if (!course.value) return;

    submitting.value = true;
    error.value = null;
    successMessage.value = null;

    try {
        await updateCourse(slug, course.value);
        successMessage.value = "¡Curso actualizado con éxito! Redirigiendo...";

        // Redirigir al usuario de vuelta a la lista después de 2 segundos
        setTimeout(() => {
            router.push({ name: 'Courses' });
        }, 2000);

    } catch (err) {
        console.error("Error al actualizar el curso:", err);
        error.value = "Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.";
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.edit-course-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-5px);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
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
  color: white;
  opacity: 0.95;
}

/* Form Container */
.form-container {
  max-width: 800px;
  margin: -3rem auto 0;
  padding: 2rem;
  position: relative;
  z-index: 10;
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 6rem 2rem;
  color: #f39c12;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.spinner-large {
  width: 80px;
  height: 80px;
  border: 6px solid rgba(243, 156, 18, 0.2);
  border-top-color: #f39c12;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.3rem;
  font-weight: 600;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 6rem 2rem;
  color: #e74c3c;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-state p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.btn-retry {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  text-decoration: none;
}

.btn-retry:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.course-form {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Form Groups */
.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.05rem;
}

.label-icon {
  color: #f39c12;
  font-size: 1.1rem;
}

.required {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.1);
  transform: translateY(-2px);
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
  line-height: 1.6;
}

.character-counter {
  text-align: right;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
  background: #f8f9fa;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  display: block;
}

/* Error Message */
.error-message {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
  color: #e74c3c;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  animation: shake 0.5s ease;
  border-left: 4px solid #e74c3c;
}

/* Success Message */
.success-message {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%);
  color: #27ae60;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  animation: fadeIn 0.5s ease;
  border-left: 4px solid #27ae60;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
}

.btn-submit,
.btn-cancel {
  flex: 1;
  padding: 1.2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.05rem;
  text-decoration: none;
}

.btn-submit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
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

.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(243, 156, 18, 0.5);
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

  .page-title {
    font-size: 2rem;
  }

  .form-container {
    padding: 1.5rem 1rem;
    margin-top: -2rem;
  }

  .course-form {
    padding: 2rem 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit,
  .btn-cancel {
    width: 100%;
  }
}
</style>