<template>
  <div class="admin-users">
    <div class="page-header">
      <h1>Gestión de Usuarios</h1>
      <button class="btn-primary" @click="openCreateModal">
        <font-awesome-icon icon="plus" />
        <span>Nuevo Usuario</span>
      </button>
    </div>

    <div v-if="loading" class="feedback-message">Cargando usuarios...</div>
    <div v-if="error" class="feedback-message error">{{ error }}</div>

    <!-- Tabla de usuarios -->
    <div v-if="!loading && users.length > 0" class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role === 'admin' ? 'Administrador' : 'Padre' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-edit" @click="openEditModal(user)" title="Editar usuario">
                  <font-awesome-icon icon="pencil-alt" />
                </button>
                <router-link 
                  :to="{ name: 'UserEnrollments', params: { userId: user.id } }" 
                  class="btn-action btn-enrollments"
                  title="Gestionar matrículas"
                >
                  <font-awesome-icon icon="graduation-cap" />
                </router-link>
                <button 
                  class="btn-action btn-delete" 
                  @click="confirmDelete(user)" 
                  title="Eliminar usuario"
                  :disabled="user.id === auth.user?.id"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && users.length === 0" class="no-users">
      No hay usuarios registrados
    </div>

    <!-- Modal para crear/editar usuario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
          <button class="icon-button" @click="closeModal" aria-label="Cerrar">✕</button>
        </div>
        <form @submit.prevent="saveUser" class="user-form">
          <div class="form-group">
            <label for="name">Nombre <span class="required">*</span></label>
            <input id="name" v-model="formData.name" type="text" required placeholder="Nombre completo" />
          </div>
          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input id="email" v-model="formData.email" type="email" required placeholder="correo@ejemplo.com" />
          </div>
          <div class="form-group" v-if="!editingUser">
            <label for="password">Contraseña <span class="required">*</span></label>
            <input 
              id="password" 
              v-model="formData.password" 
              type="password" 
              :required="!editingUser" 
              minlength="6" 
              placeholder="Mínimo 6 caracteres" 
            />
          </div>
          <div class="form-group">
            <label for="role">Rol <span class="required">*</span></label>
            <select id="role" v-model="formData.role" required>
              <option value="parent">Padre</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div v-if="formError" class="feedback error">{{ formError }}</div>
          <div v-if="formSuccess" class="feedback success">{{ formSuccess }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal" :disabled="saving">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Confirmar Eliminación</h2>
          <button class="icon-button" @click="showDeleteModal = false" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete?.name }}</strong>?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showDeleteModal = false" :disabled="deleting">
            Cancelar
          </button>
          <button type="button" class="btn-danger" @click="deleteUser" :disabled="deleting">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/config/api'
import { useAuthStore } from '@/store/auth'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'parent'
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'admin' | 'parent'
}

const auth = useAuthStore()
const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)

// Form data
const formData = ref<UserFormData>({
  name: '',
  email: '',
  password: '',
  role: 'parent'
})

const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const formSuccess = ref('')

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('admin/users')
    users.value = response.data.data || response.data
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al cargar usuarios'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingUser.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'parent'
  }
  formError.value = ''
  formSuccess.value = ''
  showModal.value = true
}

const openEditModal = (user: User) => {
  editingUser.value = user
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role
  }
  formError.value = ''
  formSuccess.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'parent'
  }
  formError.value = ''
  formSuccess.value = ''
}

const saveUser = async () => {
  saving.value = true
  formError.value = ''
  formSuccess.value = ''
  
  try {
    if (editingUser.value) {
      // Actualizar usuario existente
      const payload: Partial<UserFormData> = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role
      }
      // Solo incluir password si se proporcionó uno nuevo
      if (formData.value.password) {
        payload.password = formData.value.password
      }
      
      await api.put(`admin/users/${editingUser.value.id}`, payload)
      formSuccess.value = 'Usuario actualizado correctamente'
    } else {
      // Crear nuevo usuario
      await api.post('admin/users', formData.value)
      formSuccess.value = 'Usuario creado correctamente'
    }
    
    await fetchUsers()
    setTimeout(() => {
      closeModal()
    }, 1500)
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    formError.value = errorResponse.response?.data?.message || 'Error al guardar usuario'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  deleting.value = true
  try {
    await api.delete(`admin/users/${userToDelete.value.id}`)
    await fetchUsers()
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (e: unknown) {
    const errorResponse = e as { response?: { data?: { message?: string } } }
    error.value = errorResponse.response?.data?.message || 'Error al eliminar usuario'
  } finally {
    deleting.value = false
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #2c3e50;
}

.feedback-message {
  text-align: center;
  padding: 1.5rem;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.feedback-message.error {
  color: #e74c3c;
  background-color: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background-color: #f8f9fa;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #34495e;
}

.users-table tbody tr:hover {
  background-color: #f8f9fa;
}

.role-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.role-badge.admin {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-badge.parent {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.4rem 0.65rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: transparent;
}

.btn-action.btn-edit {
  color: #3498db;
}

.btn-action.btn-edit:hover {
  background-color: #eef7fd;
}

.btn-action.btn-enrollments {
  color: #27ae60;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-action.btn-enrollments:hover {
  background-color: #e8f8f5;
}

.btn-action.btn-delete {
  color: #e74c3c;
}

.btn-action.btn-delete:hover:not(:disabled) {
  background-color: #fdecea;
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.no-users {
  text-align: center;
  padding: 3rem;
  color: #888;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: min(540px, 92vw);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  width: min(420px, 92vw);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.icon-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background-color: #f0f0f0;
  color: #2c3e50;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select {
  padding: 0.75rem 0.9rem;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.feedback {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
}

.feedback.error {
  color: #c0392b;
  background: #fdecea;
  border: 1px solid #f5c6cb;
}

.feedback.success {
  color: #2e7d32;
  background: #eaf7ed;
  border: 1px solid #a5d6a7;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #34495e;
}

.warning-text {
  color: #e67e22;
  font-weight: 600;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2e86c1;
}

.btn-primary:disabled {
  background: #a9d6f5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e6e8;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .admin-users {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 600px;
  }
}
</style>
