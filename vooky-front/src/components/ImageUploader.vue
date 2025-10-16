<template>
  <div class="image-uploader-container">
    <h2>✨ Subir Imagen</h2>

    <form @submit.prevent="handleSubmit" class="upload-form">
      <div class="form-group">
        <label for="image">Selecciona una imagen</label>
        <input type="file" id="image" accept="image/*" @change="handleFileChange" required />
      </div>

      <div class="form-group">
        <label for="description">Descripción (opcional)</label>
        <textarea id="description" v-model="description" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label for="dia">Día</label>
        <input type="number" id="dia" v-model.number="dia" required />
      </div>

      <div class="form-group">
        <label for="category">Categoría (opcional)</label>
        <input type="text" id="category" v-model="category" />
      </div>

      <div v-if="error" class="feedback-message error">{{ error }}</div>

      <button type="submit" :disabled="loading" class="btn-submit">
        {{ loading ? 'Subiendo...' : 'Subir Imagen' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { uploadMedia } from '@/services/courseService'; // Assuming you have this service

const file = ref<File | null>(null);
const description = ref('');
const dia = ref<number | null>(null);
const category = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length) {
    file.value = target.files[0];
  } else {
    file.value = null;
  }
};

const handleSubmit = async () => {
  if (!file.value || !dia.value) {
    error.value = 'Por favor, selecciona un archivo y especifica el día.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Replace with actual levelId - you'll likely pass this as a prop
    const levelId = 1;
    await uploadMedia(file.value, description.value, levelId, dia.value, category.value);
    alert('Imagen subida con éxito!'); // Replace with a better success message
    // Reset form
    file.value = null;
    description.value = '';
    dia.value = null;
    category.value = '';
  } catch (err) {
    console.error('Error al subir la imagen:', err);
    error.value = 'No se pudo subir la imagen. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.image-uploader-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>