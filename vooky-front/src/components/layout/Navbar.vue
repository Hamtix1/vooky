<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <AppLogo size="medium" :clickable="true" :showText="true" />
      </div>

      <ul class="navbar-links">
        <li>
          <router-link :to="{ name: 'Home' }" class="nav-link">
            <font-awesome-icon icon="home" class="link-icon" />
            <span>Inicio</span>
          </router-link>
        </li>

        <template v-if="isAuthenticated">
          <li>
            <router-link :to="{ name: 'Courses' }" class="nav-link">
              <font-awesome-icon icon="book" class="link-icon" />
              <span>Cursos</span>
            </router-link>
          </li>
          
          <li>
            <router-link :to="{ name: 'Ranking' }" class="nav-link">
              <font-awesome-icon icon="trophy" class="link-icon" />
              <span>Ranking</span>
            </router-link>
          </li>
          
          <li v-if="isAdmin">
            <router-link :to="{ name: 'BadgeManagement' }" class="nav-link">
              <font-awesome-icon icon="trophy" class="link-icon" />
              <span>Insignias</span>
            </router-link>
          </li>
          
          <li v-if="isAdmin">
            <router-link :to="{ name: 'Users' }" class="nav-link">
              <font-awesome-icon icon="users" class="link-icon" />
              <span>Usuarios</span>
            </router-link>
          </li>
        </template>

        <li v-if="!isAuthenticated">
          <router-link :to="{ name: 'Login' }" class="nav-link login-link">
            <font-awesome-icon icon="sign-in-alt" class="link-icon" />
            <span>Iniciar Sesión</span>
          </router-link>
        </li>
      </ul>

      <div class="navbar-user" v-if="isAuthenticated">
        <div class="user-info" @click="goToProfile">
          <div class="user-avatar">
            {{ user?.name?.charAt(0).toUpperCase() }}
          </div>
          <span class="user-name">{{ user?.name }}</span>
        </div>
        <button @click="handleLogout" class="logout-button">
          <font-awesome-icon icon="sign-out-alt" class="btn-icon" />
          <span>Salir</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AppLogo from '@/components/common/AppLogo.vue'

// Instanciar el store y el router
const auth = useAuthStore()
const router = useRouter()

// Crear propiedades computadas para mantener el template limpio
// Estas propiedades son reactivas y se actualizarán automáticamente cuando el estado del store cambie.
const isAuthenticated = computed(() => auth.isAuthenticated)
const user = computed(() => auth.user)
const isAdmin = computed(() => auth.getUserRole === 'admin')

// Función para manejar el logout
const handleLogout = async () => {
  // Llama a la acción de logout del store, que limpia el estado y localStorage
  auth.logout()

  // Redirige al usuario a la página de Login
  router.push({ name: 'Login' })
}

// Función para ir al perfil
const goToProfile = () => {
  router.push({ name: 'UserProfile' })
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 100%);
  box-shadow: 0 4px 20px rgba(139, 195, 74, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  gap: 2rem;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  font-weight: 800;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.brand-link:hover {
  transform: scale(1.05);
}

.brand-icon {
  font-size: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.brand-text {
  background: linear-gradient(135deg, #fff 0%, #FFD700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
}

.navbar-links {
  list-style: none;
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  flex: 1;
  justify-content: center;
}

.navbar-links li {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.3s ease;
  z-index: -1;
}

.nav-link:hover::before {
  left: 0;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-link.router-link-exact-active {
  color: white;
  background: rgba(255, 255, 255, 0.25);
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  border-bottom: 3px solid #FFA726;
}

.link-icon {
  font-size: 1.1rem;
}

.login-link {
  background: rgba(255, 85, 152, 0.2);
  border: 2px solid rgba(255, 85, 152, 0.5);
}

.login-link:hover {
  background: rgba(255, 85, 152, 0.3);
  border-color: #FF5598;
  box-shadow: 0 4px 15px rgba(255, 85, 152, 0.4);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFA726 0%, #FF5598 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 4px 10px rgba(255, 167, 38, 0.4);
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.logout-button:hover {
  background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.logout-button:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
  }

  .navbar-links {
    flex-direction: column;
    width: 100%;
    order: 3;
    gap: 0.25rem;
  }

  .navbar-user {
    flex-wrap: wrap;
  }

  .user-name {
    display: none;
  }

  .nav-link span {
    font-size: 0.9rem;
  }
}
</style>
