<template>
  <nav class="navbar">
    <div class="navbar-container">
            <div class="navbar-brand">
        <AppLogo size="medium" :clickable="true" :showText="true" />
      </div>

      <!-- Botón hamburguesa para móviles -->
      <button 
        class="hamburger-btn" 
        @click="toggleMobileMenu"
        :class="{ 'active': showMobileMenu }"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <ul class="navbar-links" :class="{ 'mobile-menu-open': showMobileMenu }">
        <li>
          <router-link :to="{ name: 'Home' }" class="nav-link" @click="closeMobileMenu">
            <font-awesome-icon icon="home" class="link-icon" />
            <span>Inicio</span>
          </router-link>
        </li>

        <template v-if="isAuthenticated">
          <li>
            <router-link :to="{ name: 'Courses' }" class="nav-link" @click="closeMobileMenu">
              <font-awesome-icon icon="book" class="link-icon" />
              <span>Cursos</span>
            </router-link>
          </li>
          
          <li v-if="!isAdmin">
            <router-link :to="{ name: 'Ranking' }" class="nav-link" @click="closeMobileMenu">
              <font-awesome-icon icon="trophy" class="link-icon" />
              <span>Ranking</span>
            </router-link>
          </li>
          
          <li v-if="!isAdmin">
            <router-link :to="{ name: 'MyCourses' }" class="nav-link" @click="closeMobileMenu">
              <font-awesome-icon icon="book-open" class="link-icon" />
              <span>Mis Cursos</span>
            </router-link>
          </li>
          
          <li v-if="!isAdmin">
            <router-link :to="{ name: 'TuitionFees' }" class="nav-link" @click="closeMobileMenu">
              <font-awesome-icon icon="credit-card" class="link-icon" />
              <span>Matrículas</span>
            </router-link>
          </li>
          
          <!-- Menú desplegable de Usuarios para Administradores -->
          <li v-if="isAdmin" class="dropdown"
              @mouseenter="openDropdown('users')"
              @mouseleave="closeDropdown('users')">
            <div class="nav-link dropdown-trigger"
                 @click="toggleDropdown('users')">
              <font-awesome-icon icon="users" class="link-icon" />
              <span>Usuarios</span>
              <font-awesome-icon :icon="showUsersDropdown ? 'chevron-up' : 'chevron-down'" class="dropdown-icon" />
            </div>
            <ul class="dropdown-menu" v-show="showUsersDropdown">
              <li>
                <router-link :to="{ name: 'Users' }" class="dropdown-item" @click="closeMobileMenu">
                  <font-awesome-icon icon="users" class="dropdown-item-icon" />
                  <span>Lista de Usuarios</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Ranking' }" class="dropdown-item" @click="closeMobileMenu">
                  <font-awesome-icon icon="trophy" class="dropdown-item-icon" />
                  <span>Ranking de Usuarios</span>
                </router-link>
              </li>
            </ul>
          </li>
          
          <!-- Menú desplegable de Gestión para Administradores -->
          <li v-if="isAdmin" class="dropdown"
              @mouseenter="openDropdown('management')"
              @mouseleave="closeDropdown('management')">
            <div class="nav-link dropdown-trigger"
                 @click="toggleDropdown('management')">
              <font-awesome-icon icon="cog" class="link-icon" />
              <span>Gestión</span>
              <font-awesome-icon :icon="showManagementDropdown ? 'chevron-up' : 'chevron-down'" class="dropdown-icon" />
            </div>
            <ul class="dropdown-menu" v-show="showManagementDropdown">
              <li>
                <router-link :to="{ name: 'AdminTuitionFees' }" class="dropdown-item" @click="closeMobileMenu">
                  <font-awesome-icon icon="money-check-alt" class="dropdown-item-icon" />
                  <span>Gestión de Pagos</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'BadgeManagement' }" class="dropdown-item" @click="closeMobileMenu">
                  <font-awesome-icon icon="trophy" class="dropdown-item-icon" />
                  <span>Insignias</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'CategoryManager' }" class="dropdown-item" @click="closeMobileMenu">
                  <font-awesome-icon icon="layer-group" class="dropdown-item-icon" />
                  <span>Categorías</span>
                </router-link>
              </li>
            </ul>
          </li>
        </template>

        <li v-if="!isAuthenticated">
          <router-link :to="{ name: 'Login' }" class="nav-link login-link" @click="closeMobileMenu">
            <font-awesome-icon icon="sign-in-alt" class="link-icon" />
            <span>Iniciar Sesión</span>
          </router-link>
        </li>
      </ul>

      <!-- Overlay para menú móvil -->
      <div 
        v-if="showMobileMenu" 
        class="mobile-menu-overlay" 
        @click="closeMobileMenu"
      ></div>

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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AppLogo from '@/components/common/AppLogo.vue'

// Instanciar el store y el router
const auth = useAuthStore()
const router = useRouter()

// Estado para los menús desplegables
const showUsersDropdown = ref(false)
const showManagementDropdown = ref(false)
const showMobileMenu = ref(false)

// Abrir/cerrar dropdowns por hover (escritorio) o clic (móvil)
function openDropdown(type: 'users' | 'management') {
  if (window.innerWidth > 768) {
    if (type === 'users') showUsersDropdown.value = true
    if (type === 'management') showManagementDropdown.value = true
  }
}
function closeDropdown(type: 'users' | 'management') {
  if (window.innerWidth > 768) {
    if (type === 'users') showUsersDropdown.value = false
    if (type === 'management') showManagementDropdown.value = false
  }
}
function toggleDropdown(type: 'users' | 'management') {
  if (window.innerWidth <= 768) {
    if (type === 'users') showUsersDropdown.value = !showUsersDropdown.value
    if (type === 'management') showManagementDropdown.value = !showManagementDropdown.value
  }
}

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

// Función para toggle del menú móvil
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  // Cerrar menús desplegables cuando se abre el menú móvil
  if (showMobileMenu.value) {
    showUsersDropdown.value = false
    showManagementDropdown.value = false
  }
}

// Función para cerrar el menú móvil
const closeMobileMenu = () => {
  showMobileMenu.value = false
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

/* Dropdown styles */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
  user-select: none;
}

.dropdown-icon {
  font-size: 0.8rem;
  margin-left: 0.25rem;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0.5rem 0;
  min-width: 220px;
  z-index: 1000;
  animation: slideDown 0.3s ease;
  border: 2px solid rgba(139, 195, 74, 0.2);
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

.dropdown-menu li {
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 100%);
  color: white;
}

.dropdown-item.router-link-exact-active {
  background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 100%);
  color: white;
  font-weight: 700;
}

.dropdown-item-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
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

/* Hamburger Menu */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  .hamburger-btn {
    display: flex;
  }

  .navbar-container {
    position: relative;
    padding: 0.75rem 1rem;
  }

  .navbar-links {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    background: linear-gradient(135deg, #8BC34A 0%, #29B6F6 100%);
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 5rem 1rem 2rem;
    gap: 0.5rem;
    transition: left 0.3s ease;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
  }

  .navbar-links.mobile-menu-open {
    left: 0;
  }

  .navbar-links li {
    width: 100%;
    margin: 0;
  }

  .nav-link {
    justify-content: flex-start;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 0.25rem;
  }

  .dropdown {
    width: 100%;
  }

  .dropdown-menu {
    position: static;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    box-shadow: none;
    margin: 0.5rem 0;
    border-radius: 8px;
  }

  .dropdown-item {
    padding: 0.75rem 1.5rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .navbar-user {
    position: absolute;
    top: 0.75rem;
    right: 4rem;
    flex-wrap: nowrap;
  }

  .user-name {
    display: none;
  }

  .nav-link span {
    font-size: 0.9rem;
  }
}
</style>
