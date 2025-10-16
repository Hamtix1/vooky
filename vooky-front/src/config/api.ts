import axios from "axios";

const api = axios.create({
  // Usamos variables de entorno para la URL base, con un fallback para desarrollo.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://vooky-back.test/api/",
  withCredentials: true, // Necesario para que las cookies de Sanctum funcionen con CORS
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// Interceptor para agregar token si hay autenticación
api.interceptors.request.use((config) => {
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error("Error al procesar datos de autenticación desde localStorage:", error);
  }
  return config;
});

export default api;
