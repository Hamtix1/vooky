import { defineStore } from "pinia";
import api from "@/config/api"; // Importamos la instancia de Axios

// Interfaz más completa, alineada con tu backend
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "parent"; // Sincronizado con los roles de tu migración
}

// Definimos el estado
interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore("auth", {
  // --- STATE ---
  // El estado es ahora más simple. Solo guardamos el usuario y el token.
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  // --- GETTERS ---
  // Derivamos el estado a partir de los datos principales.
  getters: {
    // La fuente de la verdad para saber si está autenticado
    isAuthenticated: (state): boolean => !!state.token && !!state.user,

    // El rol del usuario, con un fallback seguro
    getUserRole: (state): User['role'] | null => state.user?.role || null,
  },

  // --- ACTIONS ---
  actions: {
    /**
     * Gestiona el proceso de login.
     * Guarda el token y el usuario, y configura el header de Axios.
     */
    login(userData: User, token: string) {
      this.user = userData;
      this.token = token;

      // Configura el header de Axios para todas las futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Guardar en localStorage
      localStorage.setItem("auth", JSON.stringify({
        user: userData,
        token: token,
      }));
    },

    /**
     * Gestiona el proceso de logout.
     * Limpia el estado, el localStorage y el header de Axios.
     */
    logout() {
      this.user = null;
      this.token = null;

      // Elimina el header de autorización de Axios
      delete api.defaults.headers.common['Authorization'];

      localStorage.removeItem("auth");
    },

    /**
     * Intenta cargar la sesión desde localStorage cuando la app se inicia.
     * Esencial para que el login persista después de recargar la página.
     */
    loadFromStorage() {
      const saved = localStorage.getItem("auth");
      if (saved) {
        const { user, token } = JSON.parse(saved);
        if (user && token) {
          // Llama a la acción de login para realizar todas las configuraciones necesarias
          this.login(user, token);
        }
      }
    }
  }
});