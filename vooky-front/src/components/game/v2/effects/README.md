# 🎮 Game Effects - Efectos Visuales para el Juego

Esta carpeta contiene componentes de efectos visuales para mejorar la experiencia del juego en Vooky.

## 📁 Componentes Disponibles

### 1. **ParticleExplosion.vue**
Explosión de partículas en todas direcciones.

**Props:**
- `x: number` - Posición X del centro
- `y: number` - Posición Y del centro
- `color?: string` - Color de las partículas (default: '#FFD700')
- `particleCount?: number` - Cantidad de partículas (default: 20)
- `trigger?: number` - Número que incrementa para activar

**Uso:**
```vue
<ParticleExplosion
  :x="200"
  :y="300"
  color="#2ecc71"
  :particle-count="30"
  :trigger="explosionTrigger"
/>
```

---

### 2. **FloatingText.vue**
Texto flotante que aparece y desaparece con animación.

**Props:**
- `message: string` - Texto a mostrar
- `x?: number` - Posición X (default: centro)
- `y?: number` - Posición Y (default: centro)
- `type?: 'success' | 'error' | 'combo' | 'score' | 'info'` - Tipo de mensaje
- `icon?: string` - Emoji o ícono opcional
- `value?: string | number` - Valor adicional (ej: puntos)
- `size?: 'small' | 'medium' | 'large'` - Tamaño del texto
- `duration?: number` - Duración en ms (default: 2000)
- `trigger?: number` - Trigger para mostrar

**Uso:**
```vue
<FloatingText
  message="¡Excelente!"
  :x="300"
  :y="200"
  type="success"
  icon="✓"
  value="+100"
  size="large"
  :trigger="textTrigger"
/>
```

---

### 3. **RippleEffect.vue**
Ondas concéntricas que se expanden desde un punto.

**Props:**
- `x: number` - Posición X
- `y: number` - Posición Y
- `variant?: 'success' | 'error' | 'neutral' | 'combo'` - Estilo
- `duration?: number` - Duración en ms (default: 1000)
- `trigger?: number` - Trigger para activar

**Uso:**
```vue
<RippleEffect
  :x="250"
  :y="350"
  variant="success"
  :trigger="rippleTrigger"
/>
```

---

### 4. **ScreenFlash.vue**
Flash de pantalla completa con diferentes colores.

**Props:**
- `type?: 'success' | 'error' | 'white' | 'gold'` - Tipo de flash
- `duration?: number` - Duración en ms (default: 500)
- `intensity?: number` - Intensidad 0-1 (default: 0.3)
- `trigger?: number` - Trigger para activar

**Uso:**
```vue
<ScreenFlash
  type="success"
  :duration="600"
  :intensity="0.4"
  :trigger="flashTrigger"
/>
```

---

### 5. **Confetti.vue**
Confeti cayendo desde la parte superior.

**Props:**
- `count?: number` - Cantidad de confeti (default: 50)
- `duration?: number` - Duración en ms (default: 3000)
- `trigger?: number` - Trigger para lanzar

**Uso:**
```vue
<Confetti
  :count="100"
  :trigger="confettiTrigger"
/>
```

---

### 6. **EffectsManager.vue** ⭐ (Recomendado)
Gestor centralizado de todos los efectos con métodos helper.

**Métodos Expuestos:**

#### Efectos Básicos:
- `triggerExplosion(x, y, color?, particleCount?)`
- `showFloatingText(message, x, y, options?)`
- `triggerRipple(x, y, variant?)`
- `flash(type?, duration?)`
- `launchConfetti(count?)`

#### Efectos Combinados:
- `correctAnswer(x, y)` - Ripple verde + texto "¡Correcto!"
- `incorrectAnswer(x, y)` - Ripple rojo + flash + texto "Incorrecto"
- `comboAchieved(x, y, comboCount)` - Explosión + ripple + texto combo
- `scoreGained(x, y, points)` - Texto de puntos pequeño
- `levelComplete()` - Flash dorado + confeti + mensaje de éxito
- `gameOver()` - Flash rojo + mensaje game over

**Uso:**
```vue
<template>
  <div class="game-container">
    <!-- Tu juego aquí -->
    <EffectsManager ref="effectsRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { EffectsManager } from '@/components/game/v2/effects';

const effectsRef = ref();

function handleCorrectAnswer(event: MouseEvent) {
  effectsRef.value?.correctAnswer(event.clientX, event.clientY);
}

function handleCombo(count: number) {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  effectsRef.value?.comboAchieved(x, y, count);
}

function handleLevelComplete() {
  effectsRef.value?.levelComplete();
}
</script>
```

---

## 🎨 Ejemplos de Uso

### Ejemplo 1: Respuesta Correcta
```typescript
// En el juego, cuando el usuario acierta
function onCorrectAnswer(clickX: number, clickY: number) {
  effectsRef.value?.correctAnswer(clickX, clickY);
  effectsRef.value?.scoreGained(clickX, clickY, 10);
}
```

### Ejemplo 2: Combo Achievement
```typescript
// Cuando el jugador logra un combo
function onComboReached(comboCount: number) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  effectsRef.value?.comboAchieved(centerX, centerY, comboCount);
}
```

### Ejemplo 3: Nivel Completado
```typescript
// Cuando se completa el nivel con éxito
function onLevelComplete() {
  effectsRef.value?.levelComplete();
  
  // Mostrar puntuación final después de 1 segundo
  setTimeout(() => {
    effectsRef.value?.showFloatingText(
      'Puntuación Final',
      window.innerWidth / 2,
      window.innerHeight / 2,
      {
        type: 'score',
        icon: '🏆',
        value: finalScore,
        size: 'large'
      }
    );
  }, 1000);
}
```

### Ejemplo 4: Game Over
```typescript
// Cuando el jugador pierde
function onGameOver() {
  effectsRef.value?.gameOver();
}
```

### Ejemplo 5: Efectos Personalizados
```typescript
// Crear tus propias combinaciones
function celebrateAchievement() {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  
  effectsRef.value?.flash('gold', 800);
  effectsRef.value?.triggerExplosion(x, y, '#FFD700', 40);
  effectsRef.value?.launchConfetti(100);
  effectsRef.value?.showFloatingText(
    '¡LOGRO DESBLOQUEADO!',
    x,
    y - 50,
    {
      type: 'success',
      icon: '🏅',
      size: 'large'
    }
  );
}
```

---

## 🎯 Integración con LessonGame.vue

```vue
<template>
  <div class="lesson-game">
    <!-- Contenido del juego -->
    
    <!-- Gestor de efectos -->
    <EffectsManager ref="effectsRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { EffectsManager } from '@/components/game/v2/effects';

const effectsRef = ref();

// Cuando se hace clic en una imagen
function handleImageClick(event: MouseEvent, isCorrect: boolean) {
  const x = event.clientX;
  const y = event.clientY;
  
  if (isCorrect) {
    effectsRef.value?.correctAnswer(x, y);
    
    // Si hay combo
    if (currentCombo > 1) {
      effectsRef.value?.comboAchieved(x, y, currentCombo);
    }
    
    // Mostrar puntos ganados
    effectsRef.value?.scoreGained(x, y, pointsEarned);
  } else {
    effectsRef.value?.incorrectAnswer(x, y);
  }
}

// Al completar la lección
function onLessonComplete() {
  if (score >= passingScore) {
    effectsRef.value?.levelComplete();
  } else {
    effectsRef.value?.gameOver();
  }
}
</script>
```

---

## 🎨 Personalización de Colores

Los colores por defecto son:

- **Success**: `#2ecc71` (verde)
- **Error**: `#e74c3c` (rojo)
- **Combo**: `#f39c12` (naranja)
- **Score**: `#3498db` (azul)
- **Gold**: `#FFD700` (dorado)

Puedes cambiarlos pasando el prop `color` a ParticleExplosion o modificando los estilos en cada componente.

---

## ⚡ Optimización

- Los efectos se autodestruyen después de terminar su animación
- Usa el `EffectsManager` para gestionar múltiples efectos eficientemente
- Los componentes son ligeros y no afectan el rendimiento del juego
- Todas las animaciones usan CSS transforms para mejor performance

---

## 🐛 Troubleshooting

**Problema**: Los efectos no aparecen
- Verifica que el `ref` del EffectsManager esté correctamente conectado
- Asegúrate de llamar a `.value` al acceder a métodos del ref

**Problema**: Los efectos aparecen en posiciones incorrectas
- Usa `event.clientX` y `event.clientY` para obtener coordenadas del mouse
- Para centrar, usa `window.innerWidth / 2` y `window.innerHeight / 2`

**Problema**: Múltiples efectos se superponen
- Los z-index están configurados correctamente (9990-9999)
- Si necesitas más control, ajusta el z-index en cada componente

---

## 📊 Jerarquía de Z-Index

```
9999 - ParticleExplosion
9998 - FloatingText
9997 - RippleEffect
9996 - ScreenFlash
9995 - Confetti
9990 - EffectsManager (contenedor)
```

---

## 🚀 Próximas Mejoras

- [ ] Efectos de sonido integrados
- [ ] Más variantes de animaciones
- [ ] Sistema de partículas más avanzado
- [ ] Efectos de rastro (trail effects)
- [ ] Shake/vibración de elementos
- [ ] Transiciones entre estados

---

**Creado**: Octubre 17, 2025  
**Versión**: 1.0.0  
**Autor**: GitHub Copilot para Vooky
