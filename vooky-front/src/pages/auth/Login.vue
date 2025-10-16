<template>
  <div class="login-container">
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="login-card">
      <div class="card-header">
        <div class="logo">🎮</div>
        <h1 class="login-title">Bienvenido</h1>
        <p class="login-subtitle">Inicia sesión en Vooky</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">
            <font-awesome-icon icon="envelope" class="label-icon" />
            Correo Electrónico
          </label>
          <div class="input-wrapper">
            <font-awesome-icon icon="user" class="input-icon" />
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="tu@correo.com" 
              required 
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">
            <font-awesome-icon icon="lock" class="label-icon" />
            Contraseña
          </label>
          <div class="input-wrapper">
            <font-awesome-icon icon="key" class="input-icon" />
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
            />
          </div>
        </div>

        <transition name="shake">
          <div v-if="error" class="error-message">
            <font-awesome-icon icon="exclamation-circle" class="error-icon" />
            <span>{{ error }}</span>
          </div>
        </transition>

        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading" class="btn-loading">
            <span class="spinner"></span>
            Ingresando...
          </span>
          <span v-else class="btn-content">
            <font-awesome-icon icon="sign-in-alt" class="btn-icon" />
            Iniciar Sesión
          </span>
        </button>
      </form>

      <div class="card-footer">
        <p class="footer-text">
          ¿No tienes cuenta? 
          <a href="#" class="footer-link">Regístrate aquí</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore, type User } from "@/store/auth";
import api from "@/config/api";

// Tipado para la respuesta de la API de login
interface LoginResponse {
  token: string;
  user: User;
}

const router = useRouter();
const route = useRoute();

// Estado del formulario
const email = ref("");
const password = ref("");

// Estado de la UI
const loading = ref(false);
const error = ref<string | null>(null);

const auth = useAuthStore();

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.post<LoginResponse>("/login", {
      email: email.value,
      password: password.value,
    });

    // Usamos la acción del store que centraliza toda la lógica de login
    auth.login(res.data.user, res.data.token);

    // Redirige al usuario a la página que intentaba visitar antes,
    // o al dashboard por defecto.
    const redirectPath = route.query.redirect as string || '/dashboard/courses';
    router.push(redirectPath);

  } catch (err: any) {
    // Manejo de errores de la API más específico
    if (err.response && err.response.data && err.response.data.errors) {
      // Si Laravel devuelve errores de validación
      error.value = Object.values(err.response.data.errors).join(' ');
    } else if (err.response && err.response.data && err.response.data.message) {
      // Si es un error general con mensaje
      error.value = err.response.data.message;
    } else {
      // Un error genérico de red o credenciales
      error.value = 'Credenciales incorrectas o problema de conexión.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  overflow: hidden;
}

/* Animated Background */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  top: -250px;
  left: -250px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  bottom: -200px;
  right: -200px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #e74c3c 0%, #f39c12 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(100px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-50px, 50px) scale(0.9);
  }
}

/* Login Card */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  margin: 2rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideUp 0.6s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  padding: 3rem 2.5rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.logo {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.login-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Form */
.login-form {
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  color: #667eea;
  font-size: 1rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 1.1rem;
  pointer-events: none;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #667eea;
}

.form-group input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e6ed;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: #bdc3c7;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  color: #c0392b;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  border: 2px solid #f8d7da;
  animation: shake 0.5s ease;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.shake-enter-active {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Submit Button */
.btn-submit {
  width: 100%;
  padding: 1.1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-submit:hover::before {
  left: 100%;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-content,
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-icon {
  font-size: 1.2rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Card Footer */
.card-footer {
  padding: 1.5rem 2.5rem 2.5rem;
  text-align: center;
  background: rgba(248, 249, 250, 0.5);
}

.footer-text {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.footer-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 500px) {
  .login-card {
    margin: 1rem;
  }

  .card-header {
    padding: 2rem 1.5rem 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 2rem;
  }

  .logo {
    font-size: 3rem;
  }
}
</style>