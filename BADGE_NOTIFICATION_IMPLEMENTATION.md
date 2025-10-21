# Implementación de Notificación de Insignias

## Resumen
Sistema completo de insignias con animación que se muestra cuando un usuario obtiene una insignia al completar una lección.

## Flujo de Funcionamiento

### 1. Backend - Otorgamiento de Insignia
**Ubicación:** `vooky-back/app/Http/Controllers/LessonGameController.php`

```php
// Método submitResults (línea 316-320)
$newBadges = [];
if ($passedNow && !$wasAlreadyCompleted) {
    $newBadges = $this->checkAndAwardBadges($user->id, $lesson->level->course_id);
}

// Retorno en respuesta JSON (línea 333)
return response()->json([
    // ...
    'new_badges' => $newBadges, // Array con las insignias recién obtenidas
]);
```

**Método `checkAndAwardBadges()` (líneas 345-382):**
1. Cuenta las lecciones completadas del usuario en el curso
2. Busca insignias que el usuario califica pero no tiene
3. Asigna cada insignia mediante `$badge->users()->attach($userId, ['earned_at' => now()])`
4. Retorna array con datos de las insignias: id, name, description, image, lessons_required

**Condiciones para otorgar:**
- Usuario aprobó la lección (75% o más de aciertos)
- Es la primera vez que completa esta lección
- Tiene suficientes lecciones completadas para la insignia
- No tiene la insignia aún

### 2. Frontend - Recepción y Visualización

#### A. Servicio (`lessonGameService.ts`)
```typescript
export interface GameResult {
  // ...
  new_badges?: Array<{
    id: number;
    name: string;
    description: string;
    image?: string;
    lessons_required: number;
  }>;
}
```

#### B. Componente de Juego (`LessonGame.vue`)

**Variables de estado:**
```typescript
const showBadgeNotification = ref(false);
const earnedBadge = ref<Badge | null>(null);
```

**Lógica de detección (función `finishGame()`):**
```typescript
const result = await saveLessonResult(/* ... */);

// Verificar si hay nuevas insignias
if (result.new_badges && result.new_badges.length > 0) {
  earnedBadge.value = result.new_badges[0];
  showBadgeNotification.value = true;
}
```

**Template:**
```vue
<BadgeNotification 
  v-model="showBadgeNotification"
  :badge="earnedBadge"
/>
```

#### C. Componente de Notificación (`BadgeNotification.vue`)

**Características:**
- **Modal de pantalla completa** con overlay oscuro
- **Animación de entrada:** Escala desde 0.5 con rotación
- **Confetti animado:** 50 piezas con colores aleatorios cayendo
- **Sonido:** Reproduce `powerup.mp3` al mostrar
- **Auto-cierre:** Se cierra automáticamente después de 8 segundos
- **Cierre manual:** Botón "Continuar"

**Elementos visuales:**
- Imagen de la insignia con efecto de brillo pulsante
- Título: "¡Nueva Insignia Obtenida!"
- Nombre de la insignia (dorado)
- Descripción
- Requisito: "X lecciones completadas"

**Efectos CSS:**
- `pulse`: Animación del contenedor de la insignia
- `scaleIn`: Entrada con rotación y escala
- `scaleOut`: Salida con rotación inversa
- `confettiFall`: Caída de confetti con rotación

## Archivos Modificados

### Backend
1. `app/Models/Badge.php`
   - Corregido: `->withPivot('earned_at')` en lugar de `->withTimestamp()`
   
2. `app/Http/Controllers/LessonGameController.php`
   - Método `checkAndAwardBadges()` retorna `image` en lugar de `icon`/`color`

### Frontend
1. `src/services/lessonGameService.ts`
   - Agregado `new_badges` a interfaz `GameResult`

2. `src/components/game/LessonGame.vue`
   - Importado `BadgeNotification`
   - Variables: `showBadgeNotification`, `earnedBadge`
   - Lógica en `finishGame()` para detectar y mostrar insignias
   - Template: Componente `<BadgeNotification>`

3. `src/components/BadgeNotification.vue`
   - Función `createConfetti()` para generar confetti animado
   - Función `playBadgeSound()` para reproducir sonido
   - Estilos CSS para confetti
   - Auto-cierre aumentado a 8 segundos

4. `src/main.ts`
   - Agregados iconos: `faArrowRight`, `faPlay`

## Flujo Completo de Usuario

1. Usuario completa una lección con 75%+ de aciertos (primera vez)
2. Backend verifica lecciones completadas y otorga insignia(s) si califica
3. Frontend recibe `new_badges` en la respuesta
4. Se muestra la pantalla de resultados
5. **Inmediatamente se muestra la animación de insignia:**
   - Overlay oscuro con fade in
   - Contenido escala con rotación
   - Confetti comienza a caer
   - Sonido de power-up se reproduce
   - Usuario ve la insignia brillante con su información
6. Después de 8 segundos se cierra automáticamente (o antes si presiona "Continuar")
7. Usuario vuelve a ver la pantalla de resultados normal

## Notas Técnicas

- Si el usuario obtiene múltiples insignias a la vez, solo se muestra la primera (se puede mejorar para mostrarlas secuencialmente)
- El confetti se genera dinámicamente con JavaScript para mejor rendimiento
- El sonido usa la API nativa de Audio HTML5
- La animación está optimizada con CSS animations en lugar de JavaScript
- El componente es reutilizable y puede usarse en otros contextos

## Testing

Para probar:
1. Crear una insignia con requisito de 1 lección en el admin
2. Completar una lección por primera vez con 75%+ de aciertos
3. Verificar que aparece la animación con confetti y sonido
4. Verificar que la insignia aparece en el perfil del usuario
