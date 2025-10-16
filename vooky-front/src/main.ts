import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// --- INICIO: Configuración de Font Awesome ---
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faPencilAlt, 
  faPlus, 
  faTrash, 
  faGraduationCap, 
  faBook, 
  faTimes, 
  faExpand, 
  faCompress,
  faEye,
  faHome,
  faUsers,
  faSignInAlt,
  faEnvelope,
  faLock,
  faUser,
  faKey,
  faLayerGroup,
  faSpinner,
  faChevronDown,
  faImage,
  faVolumeUp,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

// Añade los iconos que vayas a usar a la librería
library.add(
  faPencilAlt, 
  faPlus, 
  faTrash, 
  faGraduationCap, 
  faBook, 
  faTimes, 
  faExpand, 
  faCompress,
  faEye,
  faHome,
  faUsers,
  faSignInAlt,
  faEnvelope,
  faLock,
  faUser,
  faKey,
  faLayerGroup,
  faSpinner,
  faChevronDown,
  faImage,
  faVolumeUp,
  faCheck
)
// --- FIN: Configuración de Font Awesome ---

// Importa el store de autenticación
import { useAuthStore } from '@/store/auth'

// 1. Crea la aplicación
const app = createApp(App)

// Registra el componente de Font Awesome globalmente para poder usarlo en cualquier parte
app.component('font-awesome-icon', FontAwesomeIcon)

// 2. Crea y usa Pinia (PRIMERO)
const pinia = createPinia()
app.use(pinia)

// --- PASO CLAVE DE INICIALIZACIÓN (AHORA ANTES DE USAR EL ROUTER) ---
// Se obtiene una instancia del store DESPUÉS de que Pinia haya sido instalado
const authStore = useAuthStore()

// Llama a la acción para intentar cargar la sesión desde el almacenamiento local
// Esto restaurará el estado del usuario y configurará el token en Axios si existe.
try {
  authStore.loadFromStorage()
} catch (error) {
  console.error("No se pudo cargar la sesión desde el almacenamiento:", error);
  // Opcionalmente, se puede forzar un logout para limpiar cualquier dato corrupto
  authStore.logout();
}
// ------------------------------------

// 3. Usa el router (DESPUÉS de cargar el store)
app.use(router)

// 4. Monta la aplicación
app.mount('#app')