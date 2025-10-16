<template>
  <div class="edit-level-container">
    <h1>🛠️ Editar Nivel</h1>

    <div v-if="course && level">
      <p>Editando nivel <strong>{{ level.title }}</strong> del curso: <strong>{{ course.title }}</strong></p>
    </div>

    <div v-if="loadingData" class="feedback-message">Cargando información...</div>
    <div v-if="errorMessage" class="feedback-message error">{{ errorMessage }}</div>

    <form v-if="!loadingData && course && level" @submit.prevent="handleSubmit" class="level-form">
      <div class="form-group">
        <label for="title">Título</label>
        <input id="title" v-model="title" type="text" placeholder="Ej: Nivel 1 - Básico" required />
      </div>

      <div class="form-group">
        <label for="description">Descripción (opcional)</label>
        <textarea id="description" v-model="description" rows="4" placeholder="Describe brevemente el objetivo del nivel"></textarea>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourseBySlug, updateLevel, type Course, type Level, type LevelPayload } from '@/services/courseService'

const route = useRoute()
const router = useRouter()

const course = ref<Course | null>(null)
const level = ref<Level | null>(null)
const loadingData = ref(true)
const errorMessage = ref<string | null>(null)

const title = ref('')
const description = ref<string>('')

const loading = ref(false)
const error = ref<string | null>(null)

const courseSlug = route.params.slug as string
const levelId = String(route.params.levelId)

onMounted(async () => {
  try {
    const fetchedCourse = await getCourseBySlug(courseSlug)
    course.value = fetchedCourse
    const foundLevel = fetchedCourse.levels?.find(l => String(l.id) === levelId) || null
    level.value = foundLevel
    if (!level.value) throw new Error('Nivel no encontrado en este curso.')

    title.value = level.value.title
    description.value = level.value.description ?? ''
  } catch (err) {
    console.error('Error al cargar datos del nivel:', err)
    errorMessage.value = 'No se pudo cargar la información del nivel.'
  } finally {
    loadingData.value = false
  }
})

const handleSubmit = async () => {
  if (!level.value) {
    error.value = 'No se ha cargado la información del nivel.'
    return
  }

  loading.value = true
  error.value = null
  const payload: LevelPayload = {
    title: title.value,
    description: description.value || undefined,
  }
  try {
  await updateLevel(courseSlug, level.value.id, payload)
    router.push({ name: 'CourseShow', params: { slug: courseSlug } })
  } catch (err) {
    console.error('Error al actualizar el nivel:', err)
    error.value = 'No se pudo guardar el nivel. Revisa los datos e inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-level-container {
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

.level-form {
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
