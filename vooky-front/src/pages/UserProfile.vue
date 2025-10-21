<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Mi Perfil</h1>
      <p class="subtitle">Gestiona tu información personal y contraseña</p>
    </div>

    <!-- Estadísticas del Usuario -->
    <div class="stats-section">
      <div class="stat-card global-score">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.global_score.toLocaleString() }}</div>
          <div class="stat-label">Puntuación Global</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.completed_lessons }}</div>
          <div class="stat-label">Lecciones Completadas</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.average_accuracy.toFixed(1) }}%</div>
          <div class="stat-label">Precisión Promedio</div>
        </div>
      </div>

      <div class="stat-card ranking-card" @click="goToRanking">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">#{{ myRanking.position }}</div>
          <div class="stat-label">Tu Posición</div>
        </div>
        <div class="ranking-action">Ver Ranking →</div>
      </div>
    </div>

    <!-- Insignias del Usuario -->
    <UserBadges />

    <!-- Formulario de Edición -->
    <div class="profile-form-section">
      <h2>Información Personal</h2>
      
      <form @submit.prevent="handleSubmit" class="profile-form">
        <!-- Nombre -->
        <div class="form-group">
          <label for="name">Nombre</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: errors.name }"
            placeholder="Tu nombre"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="tu@email.com"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <!-- Cambiar Contraseña -->
        <div class="password-section">
          <h3>Cambiar Contraseña</h3>
          <p class="hint">Deja estos campos en blanco si no deseas cambiar tu contraseña</p>
          
          <div class="form-group">
            <label for="current_password">Contraseña Actual</label>
            <input
              id="current_password"
              v-model="formData.current_password"
              type="password"
              class="form-input"
              :class="{ error: errors.current_password }"
              placeholder="Tu contraseña actual"
            />
            <span v-if="errors.current_password" class="error-message">{{ errors.current_password }}</span>
          </div>

          <div class="form-group">
            <label for="password">Nueva Contraseña</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Mínimo 8 caracteres"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirmar Nueva Contraseña</label>
            <input
              id="password_confirmation"
              v-model="formData.password_confirmation"
              type="password"
              class="form-input"
              :class="{ error: errors.password_confirmation }"
              placeholder="Repite la nueva contraseña"
            />
            <span v-if="errors.password_confirmation" class="error-message">{{ errors.password_confirmation }}</span>
          </div>
        </div>

        <!-- Mensajes -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="error-message-global">
          {{ errorMessage }}
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn-secondary" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile, updateProfile, getMyRanking, type UserStats, type UpdateProfileData } from '@/services/userProfileService';
import UserBadges from '@/components/UserBadges.vue';

const router = useRouter();

// Estado del perfil
const stats = ref<UserStats>({
  global_score: 0,
  completed_lessons: 0,
  average_accuracy: 0,
});

const myRanking = ref({
  position: 0,
  total_score: 0,
});

// Formulario
const formData = ref<UpdateProfileData>({
  name: '',
  email: '',
  current_password: '',
  password: '',
  password_confirmation: '',
});

const originalData = ref({
  name: '',
  email: '',
});

// Estados
const loading = ref(false);
const errors = ref<Record<string, string>>({});
const successMessage = ref('');
const errorMessage = ref('');

// Cargar datos del perfil
async function loadProfile() {
  try {
    const [profileData, rankingData] = await Promise.all([
      getProfile(),
      getMyRanking(),
    ]);
    
    stats.value = profileData.stats;
    formData.value.name = profileData.user.name;
    formData.value.email = profileData.user.email;
    originalData.value.name = profileData.user.name;
    originalData.value.email = profileData.user.email;
    
    myRanking.value = rankingData;
  } catch (error: any) {
    console.error('Error al cargar perfil:', error);
    errorMessage.value = 'Error al cargar los datos del perfil';
  }
}

// Enviar formulario
async function handleSubmit() {
  loading.value = true;
  errors.value = {};
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // Preparar datos para enviar (solo lo que cambió)
    const dataToSend: UpdateProfileData = {};
    
    if (formData.value.name !== originalData.value.name) {
      dataToSend.name = formData.value.name;
    }
    
    if (formData.value.email !== originalData.value.email) {
      dataToSend.email = formData.value.email;
    }
    
    // Si hay contraseña nueva, incluir todos los campos de contraseña
    if (formData.value.password) {
      dataToSend.current_password = formData.value.current_password;
      dataToSend.password = formData.value.password;
      dataToSend.password_confirmation = formData.value.password_confirmation;
    }

    // Si no hay cambios, mostrar mensaje
    if (Object.keys(dataToSend).length === 0) {
      errorMessage.value = 'No hay cambios para guardar';
      loading.value = false;
      return;
    }

    const response = await updateProfile(dataToSend);
    
    // Actualizar datos originales
    originalData.value.name = response.user.name;
    originalData.value.email = response.user.email;
    
    // Limpiar campos de contraseña
    formData.value.current_password = '';
    formData.value.password = '';
    formData.value.password_confirmation = '';
    
    successMessage.value = response.message;
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    
    if (error.response?.data?.errors) {
      // Errores de validación
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach(key => {
        errors.value[key] = Array.isArray(serverErrors[key]) 
          ? serverErrors[key][0] 
          : serverErrors[key];
      });
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Error al actualizar el perfil';
    }
  } finally {
    loading.value = false;
  }
}

// Resetear formulario
function resetForm() {
  formData.value.name = originalData.value.name;
  formData.value.email = originalData.value.email;
  formData.value.current_password = '';
  formData.value.password = '';
  formData.value.password_confirmation = '';
  errors.value = {};
  successMessage.value = '';
  errorMessage.value = '';
}

// Ir al ranking
function goToRanking() {
  router.push('/ranking');
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Estadísticas */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.global-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.ranking-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  cursor: pointer;
  position: relative;
}

.ranking-action {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.85rem;
  opacity: 0.9;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Formulario */
.profile-form-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-form-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.profile-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input.error {
  border-color: #e74c3c;
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.password-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.password-section h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.hint {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error-message-global {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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
  background: #f0f0f0;
  color: #2c3e50;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .profile-form-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
