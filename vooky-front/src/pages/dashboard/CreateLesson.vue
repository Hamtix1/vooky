<template>
  <div class="create-lesson-container">
    <h1>✨ Crear Nueva Lección</h1>

    <div v-if="course && level">
      <p>Añadiendo lección al nivel: <strong>{{ level.title }}</strong> del curso: <strong>{{ course.title }}</strong>
      </p>
    </div>

    <div v-if="loadingCourse" class="feedback-message">Cargando información...</div>
    <div v-if="errorCourse" class="feedback-message error">{{ errorCourse }}</div>

    <form v-if="course && level" @submit.prevent="handleSubmit" class="lesson-form">
      <div class="form-group">
        <label for="title">Título de la Lección</label>
        <input id="title" v-model="title" type="text" placeholder="Ej: Lección 1 - Saludos básicos" required />
      </div>

      <div class="form-group">
        <label for="contentType">Tipo de Lección</label>
        <select id="contentType" v-model="contentType" required>
          <option value="Combinado">Combinado</option>
          <option value="Enlace de categorías">Enlace de categorías</option>
          <option value="Mixto">Mixto</option>
        </select>
      </div>

      <!-- El campo 'content' no es necesario según la nueva especificación -->

      <div class="form-group">
        <label for="dia">Día de la lección</label>
        <input id="dia" v-model.number="dia" type="number" :min="1" :max="maxDia" :placeholder="`Min: 1, Max: ${maxDia}`" required />
        <small v-if="maxDia">El día debe estar entre 1 y {{ maxDia }} (según imágenes del nivel).</small>
      </div>

      <div v-if="error" class="feedback-message error">{{ error }}</div>

      <button type="submit" :disabled="loading" class="btn-submit">
        {{ loading ? 'Creando...' : 'Crear Lección' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCourseBySlug, createLesson, type Course, type Level, type LessonPayload, ContentType } from '@/services/courseService';

// Router y ruta
const route = useRoute();
const router = useRouter();

// Datos
const course = ref<Course | null>(null);
const level = ref<Level | null>(null);
const loadingCourse = ref(true);
const errorCourse = ref<string | null>(null);

// Datos del formulario
const title = ref('');
// content eliminado: ya no es necesario
const contentType = ref<ContentType>(ContentType.Combinado);
const dia = ref<number | null>(null);

const maxDia = computed(() => {
  if (!level.value || !level.value.images || level.value.images.length === 0) return 0
  return Math.max(...level.value.images.map(img => img.dia || 0), 0)
})

// Estado de la petición
const loading = ref(false);
const error = ref<string | null>(null);

// Obtenemos los parámetros de la URL
const courseSlug = route.params.slug as string;
const levelId = Number(route.params.levelId);

// Cargar los datos del curso y encontrar el nivel
onMounted(async () => {
  try {
    const fetchedCourse = await getCourseBySlug(courseSlug);
    course.value = fetchedCourse;

    const foundLevel = fetchedCourse.levels?.find(l => l.id === levelId);
    if (foundLevel) {
      level.value = foundLevel;
    } else {
      throw new Error('Nivel no encontrado en este curso.');
    }

  } catch (err) {
    console.error("Error al cargar los datos:", err);
    errorCourse.value = "No se pudo encontrar la información necesaria para crear la lección.";
  } finally {
    loadingCourse.value = false;
  }
});

// Manejador del envío del formulario
const handleSubmit = async () => {
  if (!level.value) {
    error.value = "La información del nivel no se ha cargado correctamente.";
    return;
  }

  loading.value = true;
  error.value = null;

  const lessonData: LessonPayload = {
    title: title.value,
    content_type: contentType.value,
    dia: dia.value,
  };
  // Validación: dia requerido y no puede exceder maxDia (si hay imágenes)
  if (!dia.value || dia.value < 1) {
    error.value = 'El campo día es obligatorio y debe ser mayor o igual a 1.'
    loading.value = false
    return
  }

  if (maxDia.value > 0 && dia.value > maxDia.value) {
    error.value = `El día no puede ser mayor a ${maxDia.value} (máximo según las imágenes del nivel).`
    loading.value = false
    return
  }
  try {
    await createLesson(level.value.id, lessonData);
    // Redirigir a la página del curso después de la creación exitosa
    router.push({ name: 'CourseShow', params: { slug: courseSlug } });
  } catch (err) {
    console.error("Error al crear la lección:", err);
    error.value = "No se pudo crear la lección. Revisa los datos e inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-lesson-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.feedback-message {
  text-align: center;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
}

.feedback-message.error {
  color: #e74c3c;
  background-color: #fdd;
}

.lesson-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.btn-submit {
  padding: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-submit:disabled {
  background-color: #a9d6f5;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  background-color: #2980b9;
}
</style>
