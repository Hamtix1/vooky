<template>
  <div class="edit-lesson-container">
    <h1>✏️ Editar Lección</h1>

    <div v-if="course && level">
      <p>Editando lección del nivel: <strong>{{ level.title }}</strong> del curso: <strong>{{ course.title }}</strong></p>
    </div>

    <div v-if="loadingData" class="feedback-message">Cargando información...</div>
    <div v-if="errorMessage" class="feedback-message error">{{ errorMessage }}</div>

    <form v-if="!loadingData && course && level" @submit.prevent="handleSubmit" class="lesson-form">
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

      <div class="form-group">
        <label for="dia">Día de la lección</label>
        <input id="dia" v-model.number="dia" type="number" :min="1" :max="maxDia" :placeholder="`Min: 1, Max: ${maxDia}`" required />
        <small v-if="maxDia">El día debe estar entre 1 y {{ maxDia }} (según imágenes del nivel).</small>
      </div>

      <div v-if="error" class="feedback-message error">{{ error }}</div>

      <div class="btn-row">
        <button type="button" class="btn-cancel" @click="$router.back()">Cancelar</button>
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourseBySlug, getLesson, updateLesson, type Course, type Level, type LessonPayload, ContentType } from '@/services/courseService'

// Router / Ruta
const route = useRoute()
const router = useRouter()

// Datos de contexto
const course = ref<Course | null>(null)
const level = ref<Level | null>(null)
const loadingData = ref(true)
const errorMessage = ref<string | null>(null)

// Formulario
const title = ref('')
const contentType = ref<ContentType>(ContentType.Combinado)
const dia = ref<number | null>(null)

// Cálculo de maxDia a partir de imágenes del nivel
const maxDia = computed(() => {
  if (!level.value || !level.value.images || level.value.images.length === 0) return 1
  return Math.max(...level.value.images.map(img => img.dia || 0), 1)
})

// Estado de petición de guardado
const loading = ref(false)
const error = ref<string | null>(null)

// Params
const courseSlug = route.params.slug as string
const levelId = String(route.params.levelId)
const lessonId = String(route.params.lessonId)

// Cargar datos necesarios
onMounted(async () => {
  try {
    // Cargar curso y nivel
    const fetchedCourse = await getCourseBySlug(courseSlug)
    course.value = fetchedCourse
    const foundLevel = fetchedCourse.levels?.find(l => String(l.id) === levelId) || null
    level.value = foundLevel
    if (!level.value) throw new Error('Nivel no encontrado en este curso.')

    // Cargar lección
    const lesson = await getLesson(levelId, lessonId)
    title.value = lesson.title
    contentType.value = lesson.content_type
    dia.value = lesson.dia ?? 1
  } catch (err) {
    console.error('Error al cargar datos de edición:', err)
    errorMessage.value = 'No se pudo cargar la información para editar la lección.'
  } finally {
    loadingData.value = false
  }
})

// Guardar cambios
const handleSubmit = async () => {
  if (!level.value) {
    error.value = 'No se ha cargado la información del nivel.'
    return
  }

  // Validaciones mínimas
  if (!dia.value || dia.value < 1) {
    error.value = 'El campo día es obligatorio y debe ser mayor o igual a 1.'
    return
  }
  if (maxDia.value > 0 && dia.value > maxDia.value) {
    error.value = `El día no puede ser mayor a ${maxDia.value} (máximo según las imágenes del nivel).`
    return
  }

  loading.value = true
  error.value = null
  const payload: LessonPayload = {
    title: title.value,
    content_type: contentType.value,
    dia: dia.value,
  }
  try {
    await updateLesson(level.value.id.toString(), lessonId, payload)
    router.push({ name: 'CourseShow', params: { slug: courseSlug } })
  } catch (err) {
    console.error('Error al actualizar la lección:', err)
    error.value = 'No se pudo guardar la lección. Revisa los datos e inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-lesson-container {
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

.btn-row {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-submit {
  padding: 0.9rem 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
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

.btn-cancel {
  padding: 0.9rem 1.2rem;
  background-color: #f3f4f6;
  color: #333;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}
</style>