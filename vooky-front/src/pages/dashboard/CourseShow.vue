<template>
  <div class="course-show-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Cargando curso...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="reloadCourse">
        <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="loading" />
        Reintentar
      </button>
    </div>

    <!-- Vista de Mapa de Juego para usuarios normales -->
    <CourseGameMap 
      v-else-if="course && !isAdmin" 
      :course="course"
      @back="goToCourses"
    />

    <!-- Vista de Administración para admins -->
    <div v-else-if="course && isAdmin" class="admin-view">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <router-link :to="{ name: 'Courses' }" class="btn-back">
              <font-awesome-icon :icon="['fas', 'home']" />
              Volver
            </router-link>
            <div class="course-info">
              <h1 class="course-title">
                <span class="title-icon">🎓</span>
                {{ course.title }}
              </h1>
              <p class="course-description">{{ course.description }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-manage-categories" @click="toggleCategoriesPanel">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="btn-icon" />
              Gestionar Categorías
              <span class="category-count">{{ categories.length }}</span>
            </button>
            <button class="btn-category" @click="openCategoryModal">
              <font-awesome-icon :icon="['fas', 'plus']" class="btn-icon" />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <!-- Categories Panel (Collapsible) -->
      <transition name="slide-down">
        <div v-if="showCategoriesPanel" class="categories-panel">
          <div class="panel-container">
            <div class="panel-header">
              <h3 class="panel-title">
                <font-awesome-icon :icon="['fas', 'layer-group']" />
                Categorías del Curso
                <span class="count-badge-small">{{ categories.length }}</span>
              </h3>
              <button class="btn-close-panel" @click="toggleCategoriesPanel">
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
            
            <!-- Categories List -->
            <div v-if="categories.length > 0" class="categories-grid">
              <div 
                v-for="(category, index) in categories" 
                :key="category.id" 
                class="category-item"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <div class="category-icon">🏷️</div>
                <div class="category-info">
                  <h4 class="category-name">{{ category.name }}</h4>
                  <span class="category-id">ID: {{ category.id }}</span>
                </div>
                <div class="category-actions">
                  <button class="btn-edit-cat" @click="editCategory(category)" title="Editar">
                    <font-awesome-icon :icon="['fas', 'pencil-alt']" />
                  </button>
                  <button class="btn-delete-cat" @click="deleteCategory(category.id)" title="Eliminar">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-else class="categories-empty">
              <div class="empty-icon-small">🏷️</div>
              <p>No hay categorías creadas para este curso</p>
              <button class="btn-add-first" @click="openCategoryModal">
                <font-awesome-icon :icon="['fas', 'plus']" />
                Crear Primera Categoría
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Levels Section -->
      <div class="page-container">
        <div class="section-header">
          <h2 class="section-title">
            <font-awesome-icon :icon="['fas', 'layer-group']" class="section-icon" />
            Niveles del Curso
            <span class="count-badge">{{ course.levels?.length || 0 }}</span>
          </h2>
          <router-link 
            :to="{ name: 'CreateLevel', params: { slug: course.slug } }" 
            class="btn-create-level"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
            Crear Nivel
          </router-link>
        </div>

        <!-- Empty State -->
        <div v-if="!course.levels || course.levels.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No hay niveles</h3>
          <p>Comienza creando el primer nivel de este curso</p>
          <router-link 
            :to="{ name: 'CreateLevel', params: { slug: course.slug } }" 
            class="btn-create-empty"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
            Crear Primer Nivel
          </router-link>
        </div>

        <!-- Levels List -->
        <div v-else class="levels-container">
          <div 
            v-for="(level, index) in course.levels" 
            :key="level.id" 
            class="level-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- Level Header -->
            <div class="level-header" @click="toggleLevel(level.id)">
              <div class="level-header-left">
                <div class="level-number">{{ index + 1 }}</div>
                <div class="level-info">
                  <h3 class="level-title">{{ level.title }}</h3>
                  <div class="level-stats">
                    <span class="stat">
                      <font-awesome-icon :icon="['fas', 'book']" />
                      {{ level.lessons?.length || 0 }} lecciones
                    </span>
                    <span class="stat" v-if="level.images">
                      <font-awesome-icon :icon="['fas', 'image']" />
                      {{ level.images.length }} imágenes
                    </span>
                  </div>
                </div>
              </div>
              <div class="level-header-right">
                <button class="btn-icon-action btn-edit" @click.stop="editLevel(level.id)" title="Editar nivel">
                  <font-awesome-icon :icon="['fas', 'pencil-alt']" />
                </button>
                <button class="btn-icon-action btn-delete" @click.stop="handleDeleteLevel(level.id)" title="Eliminar nivel">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
                <span class="expand-arrow" :class="{ expanded: expandedLevelId === level.id }">
                  <font-awesome-icon :icon="['fas', 'chevron-down']" />
                </span>
              </div>
            </div>

            <!-- Level Content (Expanded) -->
            <transition name="expand">
              <div v-if="expandedLevelId === level.id" class="level-content">
                <!-- Action Bar -->
                <div class="action-bar">
                  <router-link
                    :to="{ name: 'CreateLesson', params: { slug: course.slug, levelId: level.id } }"
                    class="btn-action-primary"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" />
                    Crear Lección
                  </router-link>
                  <button class="btn-action-secondary" @click.stop="openUploadModal(level.id)">
                    <font-awesome-icon :icon="['fas', 'image']" />
                    Subir Imagen
                  </button>
                </div>

                <!-- Lessons List -->
                <div v-if="level.lessons && level.lessons.length > 0" class="lessons-grid">
                  <div
                    v-for="(lesson, lIndex) in level.lessons"
                    :key="lesson.id"
                    class="lesson-card"
                    :style="{ animationDelay: `${lIndex * 0.05}s` }"
                    @click="goToLesson(lesson.id)"
                  >
                    <div class="lesson-badge-container">
                      <span class="lesson-type-badge">{{ lesson.content_type }}</span>
                      <span class="lesson-day-badge" v-if="lesson.dia">Día {{ lesson.dia }}</span>
                    </div>
                    <h4 class="lesson-title">{{ lesson.title }}</h4>
                    <div class="lesson-actions-row">
                      <button class="btn-lesson-action btn-edit" @click.stop="editLesson(lesson.id)" title="Editar">
                        <font-awesome-icon :icon="['fas', 'pencil-alt']" />
                      </button>
                      <button class="btn-lesson-action btn-delete" @click.stop="handleDeleteLesson(level.id, lesson.id)" title="Eliminar">
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="no-content">
                  <p>📖 Este nivel aún no tiene lecciones</p>
                </div>

                <!-- Images List (Admin Only) -->
                <div v-if="level.images && level.images.length > 0" class="images-section">
                  <h4 class="subsection-title">
                    <font-awesome-icon :icon="['fas', 'image']" />
                    Imágenes del Nivel
                  </h4>
                  <div class="images-grid">
                    <div
                      v-for="img in level.images"
                      :key="img.id"
                      class="image-card"
                      @click="playAudio(getFullUrl(img.audio_url))"
                    >
                      <div class="image-wrapper">
                        <img :src="getFullUrl(img.url)" :alt="img.description || 'Imagen'" class="level-image" />
                        <div class="image-overlay">
                          <font-awesome-icon :icon="['fas', 'volume-up']" class="play-icon" />
                        </div>
                      </div>
                      <div class="image-meta">
                        <p class="image-description">{{ img.description || 'Sin descripción' }}</p>
                        <span class="image-day">Día {{ img.dia }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para subir imagen/audio -->
    <ImageAudioUploadModal
      v-if="showUploadModal"
      :show="showUploadModal"
      :levelId="uploadLevelId as number"
      :categories="categories"
      @close="closeUploadModal"
      @uploaded="handleUploaded"
    />

    <!-- Modal para crear/editar categoría -->
    <CategoryCreateModal
      v-if="showCategoryModal && course"
      :course-slug="course.slug"
      :category="editingCategory"
      @close="closeCategoryModal"
      @created="fetchCategories"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { getCourseBySlug, deleteLevel, deleteLesson, type Course } from '@/services/courseService';
import { getCategoriesByCourse, type Category } from '@/services/categoryService';
import { getMyEnrollments, type Enrollment } from '@/services/enrollmentService';
import { getFullUrl } from '@/utils/urlHelper';
import ImageAudioUploadModal from '@/components/dashboard/ImageAudioUploadModal.vue';
import CategoryCreateModal from '@/components/dashboard/CategoryCreateModal.vue';
import CourseGameMap from '@/components/game/CourseGameMap.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const course = ref<Course | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const expandedLevelId = ref<number | null>(null);
const showUploadModal = ref(false);
const uploadLevelId = ref<number|null>(null);
const showCategoryModal = ref(false);
const showCategoriesPanel = ref(false);
const categories = ref<Category[]>([]);
const audioRef = ref<HTMLAudioElement|null>(null);
const editingCategory = ref<Category | null>(null);
const userEnrollment = ref<Enrollment | null>(null);
const checkingEnrollment = ref(false);

const isAdmin = computed(() => auth.getUserRole === 'admin');
const isEnrolled = computed(() => !!userEnrollment.value);
const enrollmentStatus = computed(() => userEnrollment.value?.status || null);

async function fetchCategories() {
  if (!isAdmin.value || !course.value) return;
  try {
    categories.value = await getCategoriesByCourse(course.value.slug);
  } catch {
    if (isAdmin.value) error.value = 'No se pudieron cargar las categorías.';
  }
}

async function checkEnrollment(courseId: number) {
  if (isAdmin.value) {
    // Los admins tienen acceso a todos los cursos
    userEnrollment.value = null;
    return true;
  }

  try {
    checkingEnrollment.value = true;
    const enrollments = await getMyEnrollments();
    const enrollment = enrollments.find(e => e.course_id === courseId);
    
    userEnrollment.value = enrollment || null;
    
    if (!enrollment) {
      error.value = '🔒 No estás inscrito en este curso. Contacta al administrador para inscribirte.';
      return false;
    }
    
    if (enrollment.status !== 'active') {
      if (enrollment.status === 'pending') {
        error.value = '⏳ Tu inscripción está pendiente. Realiza el pago de la matrícula para activar el curso.';
      } else if (enrollment.status === 'inactive') {
        error.value = '⚠️ Tu acceso al curso ha sido suspendido. Contacta al administrador para más información.';
      }
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error al verificar inscripción:', err);
    error.value = 'Error al verificar tu inscripción. Por favor, intenta más tarde.';
    return false;
  } finally {
    checkingEnrollment.value = false;
  }
}

onMounted(async () => {
  const slug = route.params.slug as string;
  if (!slug) {
    error.value = "No se ha especificado un curso.";
    loading.value = false;
    return;
  }

  try {
    course.value = await getCourseBySlug(slug);
    
    // Verificar inscripción antes de cargar el resto
    const hasAccess = await checkEnrollment(course.value.id);
    
    if (!hasAccess) {
      loading.value = false;
      return;
    }
    
    await fetchCategories();
  } catch (err) {
    console.error("Error al cargar el curso o categorías:", err);
    error.value = "No se pudo encontrar el curso solicitado o las categorías.";
  } finally {
    loading.value = false;
  }
});

const toggleLevel = (levelId: number) => {
  expandedLevelId.value = expandedLevelId.value === levelId ? null : levelId;
};

const handleDeleteLevel = async (levelId: number) => {
  if (!course.value) return;
  if (confirm('¿Estás seguro de que quieres eliminar este nivel y todas sus lecciones?')) {
    try {
      await deleteLevel(course.value.id, levelId);
      course.value.levels = course.value.levels?.filter(level => level.id !== levelId);
    } catch (err) {
      console.error('Error al eliminar el nivel:', err);
      alert('No se pudo eliminar el nivel.');
    }
  }
};

const handleDeleteLesson = async (levelId: number, lessonId: number) => {
  if (!course.value) return;
  if (confirm('¿Estás seguro de que quieres eliminar esta lección?')) {
    try {
      await deleteLesson(levelId, lessonId);
      const level = course.value.levels?.find(l => l.id === levelId);
      if (level) {
        level.lessons = level.lessons?.filter(lesson => lesson.id !== lessonId);
      }
    } catch (err) {
      console.error('Error al eliminar la lección:', err);
      alert('No se pudo eliminar la lección.');
    }
  }
};

const editLevel = (levelId: number) => {
  if (!course.value) return
  router.push({
    name: 'EditLevel',
    params: {
      slug: course.value.slug,
      levelId
    }
  })
};

const editLesson = (lessonId: number) => {
  if (!course.value) return;
  router.push({
    name: 'EditLesson',
    params: {
      slug: course.value.slug,
      levelId: expandedLevelId.value,
      lessonId: lessonId
    }
  });
};

const goToLesson = (_lessonId: number) => {
  // TODO: Implementar navegación a la página de la lección si es necesario
};

function goToCourses() {
  router.push({ name: 'Courses' });
}

async function reloadCourse() {
  if (!course.value?.slug) return;
  loading.value = true;
  error.value = null;
  try {
    course.value = await getCourseBySlug(course.value.slug);
    await fetchCategories();
  } catch (err) {
    console.error("Error al recargar el curso:", err);
    error.value = "No se pudo cargar el curso.";
  } finally {
    loading.value = false;
  }
}

function openUploadModal(levelId: number) {
  uploadLevelId.value = levelId;
  showUploadModal.value = true;
}

function closeUploadModal() {
  showUploadModal.value = false;
  uploadLevelId.value = null;
}

function openCategoryModal() {
  editingCategory.value = null; // Reset para crear nueva
  showCategoryModal.value = true;
}

function closeCategoryModal() {
  showCategoryModal.value = false;
  editingCategory.value = null;
}

function toggleCategoriesPanel() {
  showCategoriesPanel.value = !showCategoriesPanel.value;
}

function editCategory(category: Category) {
  editingCategory.value = category;
  showCategoryModal.value = true;
}

async function deleteCategory(categoryId: number) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Esto podría afectar las imágenes asociadas.')) {
    return;
  }
  
  try {
    const api = (await import('@/config/api')).default;
    await api.delete(`/categories/${categoryId}`);
    await fetchCategories();
    // Mostrar mensaje de éxito
    alert('Categoría eliminada correctamente');
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    alert('No se pudo eliminar la categoría. Es posible que tenga imágenes asociadas.');
  }
}

function handleUploaded() {
  // Recargar el curso para mostrar la nueva imagen/audio
  if (course.value?.slug) {
    getCourseBySlug(course.value.slug).then(c => course.value = c);
  }
}
function playAudio(audioUrl: string) {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
  }
  audioRef.value = new Audio(audioUrl);
  audioRef.value.play();
}
</script>

<style scoped>
.course-show-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 6rem 2rem;
  color: #667eea;
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
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
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
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
}

.btn-retry:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(231, 76, 60, 0.5);
}

/* Admin View */
.admin-view {
  min-height: 100vh;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-left {
  flex: 1;
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

.course-info {
  color: white;
}

.course-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  font-size: 3rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.course-description {
  font-size: 1.2rem;
  opacity: 0.95;
  margin: 0;
  line-height: 1.6;
}

.btn-category {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #2c3e50;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  cursor: pointer;
  white-space: nowrap;
}

.btn-category:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-manage-categories {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  white-space: nowrap;
}

.btn-manage-categories:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.category-count {
  background: white;
  color: #667eea;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 800;
  min-width: 25px;
  text-align: center;
}

/* Categories Panel */
.categories-panel {
  background: white;
  margin: 0 auto;
  max-width: 1400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 0 0 20px 20px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 600px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}

.panel-container {
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.panel-title svg {
  color: #667eea;
  font-size: 1.6rem;
}

.count-badge-small {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.btn-close-panel {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.btn-close-panel:hover {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-item {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease both;
  position: relative;
  overflow: hidden;
}

.category-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #FFD700 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-item:hover::before {
  transform: scaleX(1);
}

.category-item:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.category-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.3rem 0;
}

.category-id {
  font-size: 0.85rem;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit-cat,
.btn-delete-cat {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.btn-edit-cat {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.btn-edit-cat:hover {
  transform: scale(1.2) rotate(15deg);
}

.btn-delete-cat {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.btn-delete-cat:hover {
  transform: scale(1.2);
}

/* Categories Empty State */
.categories-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.empty-icon-small {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.categories-empty p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-add-first {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-add-first:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Page Container */
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
}

.section-icon {
  color: #667eea;
  font-size: 2.2rem;
}

.count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.btn-create-level {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
}

.btn-create-level:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(46, 204, 113, 0.5);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 6rem;
  margin-bottom: 2rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.empty-state p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2.5rem;
}

.btn-create-empty {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-create-empty:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

/* Levels Container */
.levels-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Level Card */
.level-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.level-card:hover {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

/* Level Header */
.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.8rem 2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-left: 5px solid transparent;
}

.level-header:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
  border-left-color: #667eea;
}

.level-header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.level-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  flex-shrink: 0;
}

.level-info {
  flex: 1;
}

.level-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.level-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #667eea;
  font-weight: 600;
}

.stat svg {
  font-size: 1rem;
}

.level-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon-action {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-icon-action.btn-edit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-icon-action.btn-edit:hover {
  transform: scale(1.15) rotate(15deg);
  box-shadow: 0 6px 16px rgba(243, 156, 18, 0.4);
}

.btn-icon-action.btn-delete {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-icon-action.btn-delete:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
}

.expand-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  transition: all 0.3s ease;
  margin-left: 0.5rem;
}

.expand-arrow.expanded {
  background: #667eea;
  color: white;
  transform: rotate(180deg);
}

/* Level Content */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.level-content {
  padding: 0 2rem 2rem;
  border-top: 1px solid #f0f0f0;
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 0;
  flex-wrap: wrap;
}

.btn-action-primary,
.btn-action-secondary {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-action-primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-action-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.btn-action-secondary {
  background: white;
  color: #2c3e50;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-action-secondary:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Lessons Grid */
.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.lesson-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease both;
  position: relative;
  overflow: hidden;
}

.lesson-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #FFD700 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.lesson-card:hover::before {
  transform: scaleX(1);
}

.lesson-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.lesson-badge-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.lesson-type-badge,
.lesson-day-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lesson-type-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.lesson-day-badge {
  background: rgba(255, 215, 0, 0.2);
  color: #d68000;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.lesson-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.lesson-actions-row {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-lesson-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.btn-lesson-action.btn-edit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.btn-lesson-action.btn-edit:hover {
  transform: scale(1.2) rotate(15deg);
}

.btn-lesson-action.btn-delete {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.btn-lesson-action.btn-delete:hover {
  transform: scale(1.2);
}

.no-content {
  text-align: center;
  padding: 3rem 2rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Images Section */
.images-section {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px dashed #e9ecef;
}

.subsection-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.subsection-title svg {
  color: #667eea;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.image-card {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease both;
}

.image-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;
}

.level-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-card:hover .level-image {
  transform: scale(1.1);
}

.play-icon {
  color: white;
  font-size: 2.5rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.image-meta {
  padding: 0.75rem 0;
}

.image-description {
  font-size: 0.9rem;
  color: #2c3e50;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-day {
  display: inline-block;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-category {
    width: 100%;
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-create-level {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .course-title {
    font-size: 2rem;
  }

  .page-container {
    padding: 1.5rem 1rem;
  }

  .level-header {
    padding: 1.5rem 1rem;
  }

  .level-number {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .level-title {
    font-size: 1.2rem;
  }

  .level-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .level-content {
    padding: 0 1rem 1.5rem;
  }

  .lessons-grid {
    grid-template-columns: 1fr;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .action-bar {
    flex-direction: column;
  }

  .btn-action-primary,
  .btn-action-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
