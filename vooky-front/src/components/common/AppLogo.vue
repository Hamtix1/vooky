<template>
  <div :class="['app-logo', sizeClass, { 'logo-clickable': clickable }]">
    <component
      :is="clickable ? 'router-link' : 'div'"
      :to="clickable ? { name: 'Home' } : undefined"
      class="logo-container"
    >
      <!-- Logo Image (Actualizar src cuando subas tu logo) -->
      <img 
        v-if="showImage"
        :src="logoSrc" 
        :alt="altText"
        class="logo-image"
        @error="handleImageError"
      />
      
      <!-- Fallback: Icono + Texto (mientras no haya logo subido) -->
      <div v-else class="logo-fallback">
        <div class="logo-icon">🎮</div>
        <span v-if="showText" class="logo-text">{{ brandName }}</span>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  /** Tamaño del logo */
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  /** Variante del logo (light para fondos oscuros, dark para claros) */
  variant?: 'default' | 'light' | 'dark' | 'icon'
  /** Si el logo debe ser clickable (redirige a Home) */
  clickable?: boolean
  /** Si debe mostrar el texto junto al logo */
  showText?: boolean
  /** Nombre de la marca (fallback) */
  brandName?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  clickable: true,
  showText: true,
  brandName: 'Vooky'
})

// Estado para controlar si la imagen falló al cargar
const imageError = ref(false)

// Computed para determinar la clase de tamaño
const sizeClass = computed(() => `logo-${props.size}`)

// Computed para determinar qué logo usar
const logoSrc = computed(() => {
  // 🎨 ACTUALIZAR ESTAS RUTAS cuando subas tu logo
  const logoMap = {
    'default': '/images/logos/logo-full.png',
    'light': '/images/logos/logo-light.png',
    'dark': '/images/logos/logo-dark.png',
    'icon': '/images/logos/logo-icon.png'
  }
  
  return logoMap[props.variant]
})

// Computed para mostrar imagen o fallback
const showImage = computed(() => {
  // Cambiar a true cuando subas tu logo
  // Por ahora usa fallback (icono + texto)
  return true && !imageError.value
})

// Texto alternativo para accesibilidad
const altText = computed(() => {
  return `${props.brandName} Logo`
})

// Manejar error de carga de imagen
const handleImageError = () => {
  console.warn('No se pudo cargar el logo, usando fallback')
  imageError.value = true
}
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo-clickable .logo-container:hover {
  transform: scale(1.05);
  cursor: pointer;
}

/* ============================================
   LOGO IMAGE
   ============================================ */

.logo-image {
  display: block;
  object-fit: contain;
  transition: all 0.3s ease;
}

/* ============================================
   FALLBACK (Mientras no hay logo)
   ============================================ */

.logo-fallback {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 2rem;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3498db 0%, #9b59b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* ============================================
   TAMAÑOS
   ============================================ */

/* Small - Para navbar mobile, footer */
.logo-small .logo-image {
  height: 32px;
  width: auto;
}

.logo-small .logo-icon {
  font-size: 1.5rem;
}

.logo-small .logo-text {
  font-size: 1.1rem;
}

/* Medium - Para navbar desktop (default) */
.logo-medium .logo-image {
  height: 48px;
  width: auto;
}

.logo-medium .logo-icon {
  font-size: 2rem;
}

.logo-medium .logo-text {
  font-size: 1.5rem;
}

/* Large - Para login, splash screen */
.logo-large .logo-image {
  height: 80px;
  width: auto;
}

.logo-large .logo-icon {
  font-size: 3.5rem;
}

.logo-large .logo-text {
  font-size: 2.5rem;
}

/* XLarge - Para pantallas de bienvenida */
.logo-xlarge .logo-image {
  height: 120px;
  width: auto;
}

.logo-xlarge .logo-icon {
  font-size: 5rem;
}

.logo-xlarge .logo-text {
  font-size: 3.5rem;
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .logo-medium .logo-image {
    height: 40px;
  }
  
  .logo-medium .logo-text {
    font-size: 1.25rem;
  }
  
  .logo-large .logo-image {
    height: 60px;
  }
}
</style>
