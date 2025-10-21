# Sistema de Perfil de Usuario y Ranking Global

Implementación del sistema de gestión de perfil de usuario y ranking global para la plataforma Vooky.

## Características Implementadas

### 1. Perfil de Usuario (`/profile`)

**Vista de Perfil**:
- Visualización de estadísticas personales
- Formulario de edición de información personal
- Cambio de contraseña seguro

**Estadísticas Mostradas**:
- 🏆 **Puntuación Global**: Suma total de todos los `game_score` obtenidos
- 📚 **Lecciones Completadas**: Conteo total de lecciones finalizadas
- 🎯 **Precisión Promedio**: Promedio de `accuracy` en todas las lecciones
- 📊 **Posición en Ranking**: Posición del usuario en el ranking global

**Datos Editables**:
- Nombre de usuario
- Correo electrónico
- Contraseña (requiere contraseña actual para cambiarla)

### 2. Ranking Global (`/ranking`)

**Características**:
- Top 10 usuarios con mayor puntuación global
- Diseño tipo podio para los primeros 3 lugares:
  - 🥇 Primer lugar (fondo dorado)
  - 🥈 Segundo lugar (fondo plateado)
  - 🥉 Tercer lugar (fondo bronce)
- Tarjeta destacada mostrando la posición del usuario actual
- Información de cada usuario:
  - Nombre
  - Puntuación total
  - Lecciones completadas
  - Precisión promedio

### 3. Navegación Mejorada

**Navbar**:
- Nuevo enlace "Ranking" en la barra de navegación
- Avatar del usuario clickeable que redirige al perfil
- Icono de trofeo para acceso rápido al ranking

## Arquitectura Técnica

### Backend (Laravel)

#### Controlador: `UserProfileController.php`

**Endpoints**:

1. `GET /api/profile`
   - Retorna perfil del usuario autenticado
   - Incluye estadísticas calculadas (game_score total, lecciones completadas, accuracy promedio)

2. `PUT /api/profile`
   - Actualiza información del usuario
   - Validaciones:
     - Nombre: string, máx 255 caracteres
     - Email: único, formato válido
     - Contraseña: mínimo 8 caracteres, confirmación requerida
     - Contraseña actual: requerida para cambiar contraseña

3. `GET /api/ranking`
   - Retorna top 10 usuarios con mayor puntaje
   - Excluye administradores del ranking
   - Calcula posición automáticamente (1-10)

4. `GET /api/profile/ranking`
   - Retorna posición del usuario autenticado en el ranking global
   - Calcula posición comparando con todos los usuarios

**Cálculos de Base de Datos**:

```php
// Puntuación global
$globalScore = DB::table('lesson_user')
    ->where('user_id', $user->id)
    ->sum('game_score');

// Lecciones completadas
$completedLessons = DB::table('lesson_user')
    ->where('user_id', $user->id)
    ->count();

// Accuracy promedio
$avgAccuracy = DB::table('lesson_user')
    ->where('user_id', $user->id)
    ->avg('accuracy');

// Ranking con JOIN
$topUsers = DB::table('users')
    ->select(
        'users.id',
        'users.name',
        DB::raw('COALESCE(SUM(lesson_user.game_score), 0) as total_score'),
        DB::raw('COUNT(lesson_user.lesson_id) as completed_lessons'),
        DB::raw('COALESCE(AVG(lesson_user.accuracy), 0) as average_accuracy')
    )
    ->leftJoin('lesson_user', 'users.id', '=', 'lesson_user.user_id')
    ->where('users.role', '!=', 'admin')
    ->groupBy('users.id', 'users.name')
    ->orderByDesc('total_score')
    ->limit(10)
    ->get();
```

#### Rutas (api.php)

```php
Route::middleware('auth:sanctum')->group(function () {
    // Perfil de usuario
    Route::get('/profile', [UserProfileController::class, 'show']);
    Route::put('/profile', [UserProfileController::class, 'update']);
    Route::get('/profile/ranking', [UserProfileController::class, 'myRanking']);
    
    // Ranking global
    Route::get('/ranking', [UserProfileController::class, 'ranking']);
});
```

### Frontend (Vue 3 + TypeScript)

#### Servicio: `userProfileService.ts`

**Interfaces**:

```typescript
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface UserStats {
  global_score: number;
  completed_lessons: number;
  average_accuracy: number;
}

export interface RankingUser {
  position: number;
  id: number;
  name: string;
  total_score: number;
  completed_lessons: number;
  average_accuracy: number;
}
```

**Funciones**:
- `getProfile()`: Obtener perfil y estadísticas
- `updateProfile(data)`: Actualizar perfil
- `getRanking()`: Obtener top 10
- `getMyRanking()`: Obtener mi posición

#### Componente: `UserProfile.vue`

**Secciones**:

1. **Tarjetas de Estadísticas**:
   - Puntuación global (fondo morado degradado)
   - Lecciones completadas
   - Precisión promedio
   - Posición en ranking (clickeable, redirige a `/ranking`)

2. **Formulario de Edición**:
   - Campos de texto para nombre y email
   - Sección separada para cambio de contraseña
   - Validación en tiempo real
   - Mensajes de éxito/error

3. **Validaciones**:
   - Solo envía campos modificados
   - Verifica contraseña actual antes de cambiarla
   - Manejo de errores del servidor

#### Componente: `Ranking.vue`

**Características**:

1. **Mi Posición** (tarjeta destacada):
   - Fondo degradado morado
   - Muestra posición y puntuación
   - Botón para ir al perfil

2. **Lista de Ranking**:
   - Items con efectos hover
   - Diseño especial para top 3 (podio)
   - Badge "Tú" para identificar usuario actual
   - Estadísticas: lecciones y accuracy

3. **Estados**:
   - Loading (spinner)
   - Empty state (sin usuarios)
   - Error state (con botón retry)

#### Router

```typescript
{
  path: '/profile',
  name: 'UserProfile',
  component: () => import('@/pages/UserProfile.vue'),
  meta: { requiresAuth: true, roles: ['admin', 'parent'] },
},
{
  path: '/ranking',
  name: 'Ranking',
  component: () => import('@/pages/Ranking.vue'),
  meta: { requiresAuth: true, roles: ['admin', 'parent'] },
}
```

## Flujo de Usuario

### Ver Perfil

1. Usuario hace clic en su avatar en la navbar
2. Navega a `/profile`
3. Sistema carga datos del usuario y estadísticas
4. Usuario puede editar nombre, email o contraseña
5. Al guardar, se valida y actualiza en el servidor
6. Mensaje de éxito/error se muestra al usuario

### Consultar Ranking

1. Usuario hace clic en "Ranking" en navbar o en tarjeta de posición en perfil
2. Navega a `/ranking`
3. Sistema carga top 10 usuarios y posición del usuario actual
4. Usuario puede ver su posición destacada
5. Lista muestra los mejores 10 con diseño tipo podio
6. Usuario puede hacer clic en "Ver Mi Perfil" para volver

### Cambiar Contraseña

1. En perfil, usuario llena formulario de contraseña:
   - Contraseña actual
   - Nueva contraseña
   - Confirmación de nueva contraseña
2. Sistema valida en backend:
   - Verifica contraseña actual
   - Valida formato (mín 8 caracteres)
   - Verifica que las nuevas contraseñas coincidan
3. Si todo es correcto, actualiza contraseña
4. Campos de contraseña se limpian automáticamente

## Seguridad

### Validaciones Backend

- **Email único**: Verifica que el email no esté en uso por otro usuario
- **Contraseña actual requerida**: No se puede cambiar contraseña sin proporcionar la actual
- **Hash de contraseñas**: Todas las contraseñas se hashean con bcrypt
- **Validación de longitud**: Contraseñas mínimo 8 caracteres

### Autorización

- Todos los endpoints requieren autenticación (`auth:sanctum`)
- Solo el usuario propietario puede ver/editar su perfil
- Administradores excluidos del ranking (opcional)

### Validaciones Frontend

- Campos requeridos marcados
- Validación de formato de email
- Confirmación de contraseña
- Solo envía datos modificados al servidor
- Manejo seguro de errores de validación

## Estilos y UX

### Design System

**Colores**:
- Morado degradado: `#667eea → #764ba2` (principal)
- Rosa degradado: `#f093fb → #f5576c` (ranking)
- Dorado: Primer lugar
- Plateado: Segundo lugar
- Bronce: Tercer lugar

**Interacciones**:
- Hover en tarjetas: `translateY(-2px)` + shadow
- Transiciones suaves: `0.2s - 0.3s`
- Efectos de blur y backdrop-filter
- Animaciones de spinner para loading

### Responsive

- Grid adaptativo para estadísticas
- Formularios 100% ancho en móvil
- Navbar con menú hamburguesa (ya implementado)
- Tarjetas apiladas verticalmente en pantallas pequeñas

## Testing

### Casos de Prueba

**Perfil**:
- ✅ Cargar perfil con estadísticas correctas
- ✅ Actualizar nombre exitosamente
- ✅ Actualizar email (único)
- ✅ Cambiar contraseña con contraseña actual correcta
- ❌ Intentar cambiar contraseña sin proporcionar actual
- ❌ Intentar usar email ya registrado
- ✅ Cancelar cambios restaura valores originales

**Ranking**:
- ✅ Cargar top 10 usuarios
- ✅ Mostrar posición correcta del usuario
- ✅ Excluir administradores del ranking
- ✅ Ordenar por puntuación descendente
- ✅ Mostrar badge "Tú" en usuario actual
- ✅ Navegar al perfil desde ranking

## Mejoras Futuras

### Funcionalidades Propuestas

1. **Estadísticas Avanzadas**:
   - Gráficos de progreso temporal
   - Comparación con promedio de usuarios
   - Racha de días jugados consecutivos
   - Logros y medallas desbloqueables

2. **Perfil Extendido**:
   - Foto de perfil
   - Biografía
   - Cursos favoritos
   - Historial de partidas

3. **Ranking Mejorado**:
   - Ranking por curso
   - Ranking semanal/mensual/anual
   - Búsqueda de usuarios
   - Paginación para ver más allá del top 10
   - Filtros por rango de edad

4. **Social**:
   - Seguir a otros usuarios
   - Retos entre amigos
   - Compartir logros
   - Chat o mensajería

5. **Gamificación**:
   - Niveles de usuario (Novato → Experto → Maestro)
   - Títulos especiales por logros
   - Insignias por completar cursos
   - Eventos especiales con recompensas

## Archivos Creados/Modificados

### Backend
- ✅ `app/Http/Controllers/UserProfileController.php` (nuevo)
- ✅ `routes/api.php` (modificado)

### Frontend
- ✅ `src/services/userProfileService.ts` (nuevo)
- ✅ `src/pages/UserProfile.vue` (nuevo)
- ✅ `src/pages/Ranking.vue` (nuevo)
- ✅ `src/router/index.ts` (modificado)
- ✅ `src/components/layout/Navbar.vue` (modificado)
- ✅ `src/main.ts` (modificado - iconos)

### Documentación
- ✅ `USER_PROFILE_RANKING_IMPLEMENTATION.md` (nuevo)

## Comandos de Desarrollo

```bash
# Backend
cd vooky-back
php artisan serve

# Frontend
cd vooky-front
npm run dev
```

## Notas Importantes

- Los administradores pueden acceder a perfil y ranking pero no aparecen en el ranking público
- Las contraseñas se hashean automáticamente en el modelo User de Laravel
- El puntaje global es la suma de TODOS los game_scores, no solo el mejor de cada lección
- La precisión promedio se calcula sobre todas las lecciones completadas
- El ranking se actualiza en tiempo real al cargar la página
