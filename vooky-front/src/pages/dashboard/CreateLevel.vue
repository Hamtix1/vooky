<template>
  <div class="create-level-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <router-link :to="{ name: 'CourseShow', params: { slug: courseSlug } }" class="btn-back">
          <font-awesome-icon :icon="['fas', 'home']" />
          Volver al Curso
        </router-link>
        <h1 class="page-title">
          <span class="title-icon">✨</span>
          Crear Nuevo Nivel
        </h1>
        <p v-if="course" class="page-subtitle">
          Añadiendo nivel al curso: <strong>{{ course.title }}</strong>
        </p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <!-- Loading State -->
      <div v-if="loadingCourse" class="loading-state">
        <div class="spinner-large"></div>
        <p>Cargando información del curso...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorCourse" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ errorCourse }}</p>
        <router-link :to="{ name: 'Courses' }" class="btn-retry">
          <font-awesome-icon :icon="['fas', 'home']" />
          Volver a Cursos
        </router-link>
      </div>

      <!-- Create Form -->
      <form v-else-if="course" @submit.prevent="handleSubmit" class="level-form">
        <!-- Title Field -->
        <div class="form-group">
          <label for="title" class="form-label">
            <font-awesome-icon :icon="['fas', 'layer-group']" class="label-icon" />
            Título del Nivel
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="title" 
            v-model="title" 
            placeholder="Ej: Nivel 1 - Lo Básico, Nivel Intermedio..."
            required 
            class="form-input"
            maxlength="100"
          />
          <div class="character-counter">{{ title.length }}/100</div>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description" class="form-label">
            <font-awesome-icon :icon="['fas', 'book']" class="label-icon" />
            Descripción (Opcional)
          </label>
          <textarea 
            id="description" 
            v-model="description" 
            rows="4"
            placeholder="Ej: Aprende tus primeras palabras y frases básicas..."
            class="form-textarea"
            maxlength="300"
          ></textarea>
          <div class="character-counter">{{ description.length }}/300</div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <font-awesome-icon :icon="['fas', 'times']" />
          {{ error }}
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-submit">
            <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="loading" />
            <font-awesome-icon :icon="['fas', 'plus']" v-else />
            {{ loading ? 'Creando...' : 'Crear Nivel' }}
          </button>
          <router-link :to="{ name: 'CourseShow', params: { slug: courseSlug } }" class="btn-cancel">
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
import { createLevel, getCourseBySlug, type Course, type LevelPayload } from '@/services/courseService';

// Router y ruta
const route = useRoute();
const router = useRouter();

// Datos del curso
const course = ref<Course | null>(null);
const loadingCourse = ref(true);
const errorCourse = ref<string | null>(null);

// Datos del formulario
const title = ref('');
const description = ref('');

// Estado de la petición
const loading = ref(false);
const error = ref<string | null>(null);

// Obtenemos el slug de la URL
const courseSlug = route.params.slug as string;

// Cargar los datos del curso para obtener su ID
onMounted(async () => {
  if (!courseSlug) {
    errorCourse.value = "No se ha especificado un slug de curso.";
    loadingCourse.value = false;
    return;
  }
  try {
    course.value = await getCourseBySlug(courseSlug);
  } catch (err) {
    console.error("Error al cargar el curso:", err);
    errorCourse.value = "No se pudo encontrar el curso para añadir el nivel.";
  } finally {
    loadingCourse.value = false;
  }
});

// Manejador del envío del formulario
const handleSubmit = async () => {
  if (!course.value) {
    error.value = "El curso no se ha cargado correctamente.";
    return;
  }

  loading.value = true;
  error.value = null;

  const levelData: LevelPayload = {
    title: title.value,
    description: description.value,
  };

  try {
    await createLevel(course.value.slug, levelData);
    // Redirigir a la página del curso después de la creación exitosa
    router.push({ name: 'CourseShow', params: { slug: courseSlug } });
  } catch (err) {
    console.error("Error al crear el nivel:", err);
    error.value = "No se pudo crear el nivel. Revisa los datos e inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-level-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 700px;
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

.page-subtitle strong {
  background: linear-gradient(to right, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

/* Form Container */
.form-container {
  max-width: 700px;
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
  color: #667eea;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.spinner-large {
  width: 80px;
  height: 80px;
  border: 6px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
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

.level-form {
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
  color: #667eea;
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
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
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

.btn-submit:hover:not(:disabled) {
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

  .page-title {
    font-size: 2rem;
  }

  .form-container {
    padding: 1.5rem 1rem;
    margin-top: -2rem;
  }

  .level-form {
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
