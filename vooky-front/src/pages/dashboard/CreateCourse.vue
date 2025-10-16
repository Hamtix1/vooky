<template>
  <div class="create-course-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <router-link :to="{ name: 'Courses' }" class="btn-back">
          <font-awesome-icon :icon="['fas', 'home']" />
          Volver
        </router-link>
        <h1 class="page-title">
          <span class="title-icon">🎓</span>
          Crear Nuevo Curso
        </h1>
        <p class="page-subtitle">Completa la información para crear un curso educativo</p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="handleCreateCourse" class="course-form">
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
            v-model="title" 
            placeholder="Ej: Inglés para Principiantes, Matemáticas Divertidas..."
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
            Descripción
          </label>
          <textarea 
            id="description" 
            v-model="description" 
            rows="6"
            placeholder="Describe de qué trata el curso, qué aprenderán los estudiantes, nivel recomendado..."
            class="form-textarea"
            maxlength="500"
          ></textarea>
          <div class="character-counter">{{ description.length }}/500</div>
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
          <button type="submit" :disabled="loading" class="btn-submit">
            <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="loading" />
            <font-awesome-icon :icon="['fas', 'plus']" v-else />
            {{ loading ? 'Creando...' : 'Crear Curso' }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { createCourse } from '@/services/courseService';

// Refs para los datos del formulario
const title = ref('');
const description = ref('');

// Refs para el estado de la UI
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const router = useRouter();

const handleCreateCourse = async () => {
    
    // Reiniciar estado
    loading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
        // Llama a la función del servicio que hemos creado antes
        const newCourse = await createCourse({
            title: title.value,
            description: description.value,
        });

        // Muestra un mensaje de éxito
        successMessage.value = `¡Curso "${newCourse.title}" creado con éxito! Redirigiendo...`;

        // Espera un momento para que el usuario vea el mensaje y luego redirige
        setTimeout(() => {
            router.push({ name: 'Courses' });
        }, 2000);

    } catch (err: unknown) {
        // Manejo de errores desde la API
        let message = 'Ocurrió un error al crear el curso.';
        if (axios.isAxiosError(err) && err.response?.data) {
            if (err.response.data.errors) {
                // Concatena todos los mensajes de error de validación
                message = Object.values(err.response.data.errors).flat().join(' ');
            }
            message = err.response.data?.message || message;
        }
        error.value = message;

    } finally {
        // Se ejecuta siempre, tanto si hay éxito como si hay error
        loading.value = false;
    }
};
</script>

<style scoped>
.create-course-page {
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
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
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
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
  box-shadow: 0 12px 35px rgba(46, 204, 113, 0.5);
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

  .character-counter {
    float: none;
    display: block;
  }
}
</style>