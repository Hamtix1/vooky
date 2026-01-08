<template>
  <div v-if="show" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upload-title">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="upload-title">{{ isEditing ? 'Editar Imagen y Audio' : 'Subir Imagen y Audio' }}</h2>
        <button class="icon-button" @click="close" aria-label="Cerrar">
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Image uploader -->
        <div class="uploader">
          <label class="uploader-label">
            Imagen 
            <span v-if="!isEditing" class="required">*</span>
            <span v-else class="optional">(dejar vacío para mantener la actual)</span>
          </label>
          <div
            class="dropzone"
            :class="{ 'is-dragover': imageDragging }"
            @dragover.prevent="imageDragging = true"
            @dragleave.prevent="imageDragging = false"
            @drop.prevent="onImageDrop"
            @click="triggerImageFile"
          >
            <input 
              ref="imageInput" 
              type="file" 
              accept="image/*" 
              @change="onImageChange" 
              style="display: none;" 
            />
            <div class="dropzone-content">
              <div v-if="!imagePreviewUrl" class="dropzone-placeholder">
                <div class="drop-icon">🖼️</div>
                <p>Arrastra y suelta una imagen o haz clic para seleccionar</p>
              </div>
              <div v-else class="preview">
                <img :src="imagePreviewUrl" alt="Vista previa de la imagen" />
                <div v-if="imageFile" class="file-meta">{{ imageFile.name }}</div>
                <div v-else-if="isEditing" class="file-meta">Imagen actual (click para cambiar)</div>
              </div>
            </div>
          </div>
          <div v-if="imageError" class="inline-error">{{ imageError }}</div>
        </div>

        <!-- Audio uploader -->
        <div class="uploader">
          <label class="uploader-label">
            Audio 
            <span v-if="!isEditing" class="required">*</span>
            <span v-else class="optional">(dejar vacío para mantener el actual)</span>
          </label>
          <div
            class="dropzone"
            :class="{ 'is-dragover': audioDragging }"
            @dragover.prevent="audioDragging = true"
            @dragleave.prevent="audioDragging = false"
            @drop.prevent="onAudioDrop"
            @click="triggerAudioFile"
          >
            <input 
              ref="audioInput" 
              type="file" 
              accept="audio/*" 
              @change="onAudioChange" 
              style="display: none;" 
            />
            <div class="dropzone-content">
              <div v-if="!audioPreviewUrl" class="dropzone-placeholder">
                <div class="drop-icon">🔊</div>
                <p>Arrastra y suelta un audio o haz clic para seleccionar</p>
              </div>
              <div v-else class="preview audio-preview">
                <audio :src="audioPreviewUrl" controls preload="metadata"></audio>
                <div v-if="audioFile" class="file-meta">{{ audioFile.name }}</div>
                <div v-else-if="isEditing" class="file-meta">Audio actual (click para cambiar)</div>
              </div>
            </div>
          </div>
          <div v-if="audioError" class="inline-error">{{ audioError }}</div>
        </div>

        <!-- Details grid -->
        <div class="details-grid">
          <div class="form-group">
            <label for="description">Descripción</label>
            <input id="description" v-model="description" type="text" placeholder="Descripción opcional" />
          </div>
          <div class="form-group">
            <label for="dia">Día <span class="required">*</span></label>
            <input id="dia" v-model.number="dia" type="number" min="1" required placeholder="Número de día" />
          </div>
          <div class="form-group full">
            <label for="category">Categoría <span class="required">*</span></label>
            
            <!-- Search input -->
            <div class="category-search-wrapper">
              <div class="search-input-container">
                <span class="search-icon">🔍</span>
                <input 
                  v-model="categorySearchQuery" 
                  type="text" 
                  placeholder="Buscar categoría..." 
                  class="category-search-input"
                  @focus="showCategoryDropdown = true"
                />
                <button 
                  v-if="categorySearchQuery" 
                  type="button"
                  @click="clearCategorySearch" 
                  class="clear-search-btn"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              </div>
              
              <!-- Custom dropdown -->
              <div 
                v-if="showCategoryDropdown" 
                class="category-dropdown"
                @click.stop
              >
                <div 
                  v-if="filteredCategories.length > 0"
                  class="category-options"
                >
                  <div
                    v-for="cat in filteredCategories"
                    :key="cat.id"
                    class="category-option"
                    :class="{ selected: categoryId === cat.id }"
                    @click="selectCategory(cat.id, cat.name)"
                  >
                    <span class="category-icon">🏷️</span>
                    <span class="category-name">{{ cat.name }}</span>
                    <span v-if="categoryId === cat.id" class="check-icon">✓</span>
                  </div>
                </div>
                <div v-else class="no-results">
                  <span class="no-results-icon">🔍</span>
                  <p>No se encontraron categorías</p>
                </div>
              </div>
            </div>
            
            <!-- Selected category display -->
            <div v-if="selectedCategoryName" class="selected-category">
              <span class="selected-label">Seleccionada:</span>
              <span class="selected-name">{{ selectedCategoryName }}</span>
            </div>
          </div>

          <!-- Subcategorías (opcional, multiselección) -->
          <div class="form-group full">
            <label for="subcategories">Subcategorías (opcional)</label>
            <div class="subcategories-selector">
              <div v-if="availableSubcategories.length === 0" class="no-subcategories">
                <span class="info-icon">ℹ️</span>
                <p>No hay subcategorías disponibles para esta categoría</p>
              </div>
              <div v-else class="subcategories-grid">
                <label
                  v-for="subcat in availableSubcategories"
                  :key="subcat.id"
                  class="subcategory-checkbox"
                  :class="{ selected: selectedSubcategoryIds.includes(subcat.id) }"
                >
                  <input
                    type="checkbox"
                    :value="subcat.id"
                    v-model="selectedSubcategoryIds"
                  />
                  <span class="subcategory-label">{{ subcat.name }}</span>
                  <span v-if="subcat.description" class="subcategory-desc">{{ subcat.description }}</span>
                </label>
              </div>
              <div v-if="selectedSubcategoryIds.length > 0" class="selected-subcategories">
                <span class="selected-count">{{ selectedSubcategoryIds.length }} seleccionada(s)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress and feedback -->
        <div v-if="uploadProgress > 0" class="progress">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
          <span class="progress-text">{{ Math.round(uploadProgress) }}%</span>
        </div>
        <div v-if="error" class="feedback error">{{ error }}</div>
        <div v-if="success" class="feedback success">¡Imagen y audio subidos correctamente!</div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="close" :disabled="loading">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="loading || !canSubmit">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{ loading ? (isEditing ? 'Actualizando...' : 'Subiendo...') : (isEditing ? 'Actualizar' : 'Subir') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onBeforeUnmount, onMounted, computed } from 'vue';
import api from '@/config/api';
import type { Subcategory } from '@/services/subcategoryService';
import type { Image } from '@/services/imageService';
import { getFullUrl } from '@/utils/urlHelper';

// Strongly-typed props for better template inference
const props = defineProps<{
  show: boolean;
  levelId: number;
  categories: { id: number; name: string }[];
  subcategories: Subcategory[];
  editingImage?: Image | null;
}>();
const emit = defineEmits(['close', 'uploaded']);

// Template refs for file inputs
const imageInput = ref<HTMLInputElement | null>(null);
const audioInput = ref<HTMLInputElement | null>(null);

const imageFile = ref<File|null>(null);
const audioFile = ref<File|null>(null);
const imagePreviewUrl = ref<string | null>(null);
const audioPreviewUrl = ref<string | null>(null);
const description = ref('');
const dia = ref<number | null>(null);
const categoryId = ref<number|null>(null);
const categorySearchQuery = ref('');
const showCategoryDropdown = ref(false);
const selectedCategoryName = ref('');
const selectedSubcategoryIds = ref<number[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref(false);
const uploadProgress = ref(0);
const imageDragging = ref(false);
const audioDragging = ref(false);
const imageError = ref('');
const audioError = ref('');

const isEditing = computed(() => !!props.editingImage);

const canSubmit = computed(() => {
  // En modo edición, no se requieren archivos nuevos (pueden ser opcionales)
  if (isEditing.value) {
    return !!categoryId.value && !!dia.value && !loading.value;
  }
  // En modo creación, se requieren ambos archivos
  return !!imageFile.value && !!audioFile.value && !!categoryId.value && !!dia.value && !loading.value;
});

const filteredCategories = computed(() => {
  const query = categorySearchQuery.value.toLowerCase().trim();
  
  let result = props.categories;
  
  // Filter by search query
  if (query) {
    result = result.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  }
  
  // Sort alphabetically
  return result.slice().sort((a, b) => 
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  );
});

// Todas las subcategorías del curso ordenadas alfabéticamente
const availableSubcategories = computed(() => {
  return props.subcategories
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
});

function selectCategory(id: number, name: string) {
  categoryId.value = id;
  selectedCategoryName.value = name;
  showCategoryDropdown.value = false;
  categorySearchQuery.value = '';
}

function clearCategorySearch() {
  categorySearchQuery.value = '';
  showCategoryDropdown.value = true;
}

function onImageChange(e: Event) {
  console.log('onImageChange triggered', e);
  const input = e.target as HTMLInputElement;
  const files = input.files;
  console.log('Files selected:', files);
  imageError.value = '';
  
  if (!files || !files[0]) {
    imageFile.value = null;
    if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = null;
    return;
  }
  
  const file = files[0];
  console.log('Image file:', file);
  if (!file.type.startsWith('image/')) {
    imageError.value = 'El archivo debe ser una imagen.';
    imageFile.value = null;
    if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = null;
    input.value = ''; // Reset input
    return;
  }
  
  imageFile.value = file;
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
  imagePreviewUrl.value = URL.createObjectURL(file);
  console.log('Image preview URL:', imagePreviewUrl.value);
  imageDragging.value = false;
}

function onAudioChange(e: Event) {
  console.log('onAudioChange triggered', e);
  const input = e.target as HTMLInputElement;
  const files = input.files;
  console.log('Files selected:', files);
  audioError.value = '';
  
  if (!files || !files[0]) {
    audioFile.value = null;
    if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
    audioPreviewUrl.value = null;
    return;
  }
  
  const file = files[0];
  console.log('Audio file:', file);
  if (!file.type.startsWith('audio/')) {
    audioError.value = 'El archivo debe ser un audio.';
    audioFile.value = null;
    if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
    audioPreviewUrl.value = null;
    input.value = ''; // Reset input
    return;
  }
  
  audioFile.value = file;
  if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
  audioPreviewUrl.value = URL.createObjectURL(file);
  console.log('Audio preview URL:', audioPreviewUrl.value);
  audioDragging.value = false;
}

function onImageDrop(e: DragEvent) {
  const files = e.dataTransfer?.files;
  if (!files || !files[0]) return;
  const file = files[0];
  if (!file.type.startsWith('image/')) {
    imageError.value = 'El archivo debe ser una imagen.';
    return;
  }
  imageFile.value = file;
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
  imagePreviewUrl.value = URL.createObjectURL(file);
  imageDragging.value = false;
}

function onAudioDrop(e: DragEvent) {
  const files = e.dataTransfer?.files;
  if (!files || !files[0]) return;
  const file = files[0];
  if (!file.type.startsWith('audio/')) {
    audioError.value = 'El archivo debe ser un audio.';
    return;
  }
  audioFile.value = file;
  if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
  audioPreviewUrl.value = URL.createObjectURL(file);
  audioDragging.value = false;
}

function triggerImageFile() {
  console.log('triggerImageFile called', imageInput.value);
  imageInput.value?.click();
}

function triggerAudioFile() {
  console.log('triggerAudioFile called', audioInput.value);
  audioInput.value?.click();
}

async function handleSubmit() {
  error.value = '';
  success.value = false;
  
  // Validaciones
  if (!isEditing.value && (!imageFile.value || !audioFile.value)) {
    error.value = 'Debes seleccionar una imagen y un audio.';
    return;
  }
  if (dia.value === null || dia.value === undefined) {
    error.value = 'El campo día es obligatorio.';
    return;
  }
  if (categoryId.value === null || categoryId.value === undefined) {
    error.value = 'La categoría es obligatoria.';
    return;
  }
  
  loading.value = true;
  try {
    const formData = new FormData();
    
    // Solo agregar archivos si se seleccionaron nuevos
    if (imageFile.value) formData.append('url', imageFile.value);
    if (audioFile.value) formData.append('audio_url', audioFile.value);
    
    formData.append('level_id', String(props.levelId));
    if (description.value) formData.append('description', description.value);
    if (dia.value !== null && dia.value !== undefined) formData.append('dia', String(dia.value));
    formData.append('category_id', String(categoryId.value));
    
    // Agregar subcategorías seleccionadas
    if (selectedSubcategoryIds.value.length > 0) {
      selectedSubcategoryIds.value.forEach(id => {
        formData.append('subcategory_ids[]', String(id));
      });
    }
    
    uploadProgress.value = 0;
    
    let response;
    if (isEditing.value && props.editingImage) {
      // Modo edición: PUT con method spoofing
      formData.append('_method', 'PUT');
      response = await api.post(`/images/${props.editingImage.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          uploadProgress.value = Math.min(99, (evt.loaded / evt.total) * 100);
        }
      });
    } else {
      // Modo creación: POST
      response = await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          uploadProgress.value = Math.min(99, (evt.loaded / evt.total) * 100);
        }
      });
    }
    
    uploadProgress.value = 100;
    success.value = true;
    emit('uploaded');
    setTimeout(() => {
      close();
    }, 1200);
  } catch (err: unknown) {
    type ErrorResponse = { response?: { data?: { message?: string } } };
    const maybe = err as ErrorResponse;
    error.value = maybe.response?.data?.message ?? 'Error al procesar los archivos.';
  } finally {
    loading.value = false;
  }
}

function close() {
  emit('close');
  
  // Reset files
  imageFile.value = null;
  audioFile.value = null;
  
  // Reset file inputs using refs
  if (imageInput.value) imageInput.value.value = '';
  if (audioInput.value) audioInput.value.value = '';
  
  // Revoke URLs
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
  if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
  imagePreviewUrl.value = null;
  audioPreviewUrl.value = null;
  
  // Reset form
  description.value = '';
  dia.value = null;
  categoryId.value = null;
  categorySearchQuery.value = '';
  showCategoryDropdown.value = false;
  selectedCategoryName.value = '';
  selectedSubcategoryIds.value = [];
  error.value = '';
  success.value = false;
  uploadProgress.value = 0;
  imageDragging.value = false;
  audioDragging.value = false;
  imageError.value = '';
  audioError.value = '';
}

watch(() => props.show, (val) => {
  console.log('🔔 Modal show cambió:', val, 'editingImage:', props.editingImage);
  if (!val) {
    close();
  } else if (val && props.editingImage) {
    // Modo edición: cargar datos de la imagen
    console.log('✨ Llamando a loadImageData()...');
    loadImageData();
  } else if (val && !props.editingImage) {
    console.log('➕ Modo creación (sin editingImage)');
  }
});

// Watcher adicional para editingImage - se ejecuta cuando cambia
watch(() => props.editingImage, (newImage) => {
  console.log('🔄 editingImage cambió:', newImage);
  if (newImage && props.show) {
    console.log('✨ Cargando datos desde watcher de editingImage...');
    loadImageData();
  }
}, { immediate: false });

// Hook onMounted - se ejecuta cuando el componente se monta
onMounted(() => {
  console.log('🚀 Modal montado - editingImage:', props.editingImage, 'show:', props.show);
  if (props.editingImage && props.show) {
    console.log('✨ Cargando datos desde onMounted...');
    loadImageData();
  }
});

// Cargar datos de la imagen para edición
function loadImageData() {
  if (!props.editingImage) return;
  
  const img = props.editingImage;
  console.log('🔄 MODAL - Cargando datos de imagen para edición:', img);
  console.log('📋 Categorías disponibles:', props.categories);
  
  // Cargar campos básicos
  description.value = img.description || '';
  dia.value = img.dia;
  categoryId.value = img.category_id;
  
  console.log('📝 Valores cargados:', {
    description: description.value,
    dia: dia.value,
    categoryId: categoryId.value
  });
  
  // Buscar el nombre de la categoría
  console.log('🔍 Buscando categoría con ID:', img.category_id, 'en', props.categories.length, 'categorías');
  const category = props.categories.find(c => c.id === img.category_id);
  if (category) {
    selectedCategoryName.value = category.name;
    console.log('✅ 🏷️ Categoría encontrada:', category.name);
  } else {
    console.error('❌ Categoría NO encontrada para ID:', img.category_id);
    console.error('❌ Categorías disponibles:', props.categories.map(c => ({ id: c.id, name: c.name })));
  }
  
  // Cargar subcategorías seleccionadas
  if (img.subcategories && img.subcategories.length > 0) {
    selectedSubcategoryIds.value = img.subcategories.map(sub => sub.id);
    console.log('✅ Subcategorías cargadas:', {
      ids: selectedSubcategoryIds.value,
      nombres: img.subcategories.map(sub => sub.name)
    });
  } else {
    selectedSubcategoryIds.value = [];
    console.log('⚠️ No hay subcategorías para esta imagen');
  }
  
  // Mostrar preview de la imagen existente
  imagePreviewUrl.value = getFullUrl(img.url);
  audioPreviewUrl.value = getFullUrl(img.audio_url);
  
  console.log('📸 URLs generadas:', {
    imagen: imagePreviewUrl.value,
    audio: audioPreviewUrl.value
  });
  console.log('🔊 URL de audio:', audioPreviewUrl.value);
  console.log('📝 Descripción:', description.value);
  console.log('📅 Día:', dia.value);
  console.log('🏷️ Categoría ID:', categoryId.value, '- Nombre:', selectedCategoryName.value);
  
  // No se cargan archivos porque son opcionales en edición
  imageFile.value = null;
  audioFile.value = null;
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.category-search-wrapper')) {
    showCategoryDropdown.value = false;
  }
};

// Add/remove click listener
watch(showCategoryDropdown, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
  if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
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
  background: #fff;
  padding: 0;
  border-radius: 16px;
  width: min(720px, 92vw);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  margin-bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.icon-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
}

.icon-button:hover { 
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  transform: rotate(90deg);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.uploader-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #e74c3c;
  font-size: 1.1rem;
}

.optional {
  color: #7f8c8d;
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 400;
}

.dropzone {
  border: 3px dashed #d1d5db;
  border-radius: 12px;
  background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.dropzone::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s ease;
}

.dropzone:hover::before {
  left: 100%;
}

.dropzone:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.02);
}

.dropzone.is-dragover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-style: solid;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  transform: scale(1.05);
}

.dropzone-content {
  padding: 1.5rem;
  text-align: center;
  width: 100%;
}

.dropzone-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.dropzone-placeholder .drop-icon {
  font-size: 3.5rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.dropzone-placeholder p {
  margin: 0;
  color: #6b7280;
  font-weight: 500;
}

.preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: fadeIn 0.3s ease;
}

.preview img {
  max-width: 100%;
  max-height: 220px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
}

.preview img:hover {
  transform: scale(1.05);
}

.audio-preview audio {
  width: 100%;
  border-radius: 12px;
}

.file-meta {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.details-grid .full { 
  grid-column: 1 / -1; 
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

/* Category Search Styles */
.category-search-wrapper {
  position: relative;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  pointer-events: none;
  opacity: 0.5;
}

.category-search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem !important;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.category-search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: #ecf0f1;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.clear-search-btn:hover {
  background: #bdc3c7;
  color: #2c3e50;
  transform: scale(1.1);
}

.category-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-height: 280px;
  overflow-y: auto;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-options {
  padding: 0.5rem;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-option:hover {
  background: #f8f9fa;
}

.category-option.selected {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 3px solid #667eea;
}

.category-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  color: #2c3e50;
  font-weight: 500;
}

.check-icon {
  color: #667eea;
  font-weight: bold;
  font-size: 1.2rem;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #95a5a6;
}

.no-results-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.no-results p {
  margin: 0;
  font-size: 0.95rem;
}

.selected-category {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 3px solid #667eea;
}

.selected-label {
  color: #7f8c8d;
  font-size: 0.85rem;
  font-weight: 600;
}

.selected-name {
  color: #2c3e50;
  font-weight: 600;
  flex: 1;
}

/* Subcategories Styles */
.subcategories-selector {
  margin-top: 0.5rem;
}

.no-subcategories {
  padding: 1.5rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6b7280;
}

.info-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.no-subcategories p {
  margin: 0;
  font-size: 0.9rem;
}

.subcategories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.subcategory-checkbox {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.subcategory-checkbox:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.subcategory-checkbox.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-width: 2px;
}

.subcategory-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.subcategory-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.subcategory-desc {
  font-size: 0.8rem;
  color: #6b7280;
}

.selected-subcategories {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #eff6ff;
  border-radius: 6px;
  text-align: center;
}

.selected-count {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
}

.inline-error { 
  color: #e74c3c; 
  font-size: 0.9rem; 
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.progress {
  position: relative;
  width: 100%;
  height: 12px;
  background: #ecf0f1;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #2ecc71 100%);
  transition: width 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.progress-text {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  text-align: center;
}

.feedback {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideUp 0.3s ease;
}

.feedback.error { 
  color: #c0392b; 
  background: linear-gradient(135deg, #fdecea 0%, #fadbd8 100%);
  border: 2px solid #f5c6cb;
}

.feedback.success { 
  color: #2e7d32; 
  background: linear-gradient(135deg, #eaf7ed 0%, #d4edda 100%);
  border: 2px solid #a5d6a7;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-primary { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
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

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover { 
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-primary:disabled { 
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary { 
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover { 
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95vw;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>
