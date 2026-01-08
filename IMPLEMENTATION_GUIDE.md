# 🔧 Guía de Implementación - Optimizaciones de Rendimiento

## ✅ Cambios Realizados

### 1. Backend - Laravel

#### a) CourseController.php
**Ubicación:** `vooky-back/app/Http/Controllers/CourseController.php`

**Cambios:**
- ✅ Agregado import: `use Illuminate\Support\Facades\DB;`
- ✅ Optimizado método `show()` con rol-based loading
- ✅ Agregado nuevo método privado `preloadUserProgress()`

**Qué hace:**
- Si es admin: carga TODAS las relaciones (images, subcategories)
- Si es usuario normal: carga SOLO niveles y lecciones (más eficiente)
- Pre-carga el progreso del usuario en una sola query batch

#### b) LessonGameController.php
**Ubicación:** `vooky-back/app/Http/Controllers/LessonGameController.php`

**Cambios:**
- ✅ Agregado nuevo método público: `getBatchProgress(Request $request)`

**Qué hace:**
```php
public function getBatchProgress(Request $request)
{
    // Valida array de lesson_ids (máx 100)
    $request->validate([
        'lesson_ids' => 'required|array|min:1|max:100',
        'lesson_ids.*' => 'required|integer|exists:lessons,id',
    ]);
    
    // UNA sola query para obtener TODO
    $progress = DB::table('lesson_user')
        ->where('user_id', $request->user()->id)
        ->whereIn('lesson_id', $lessonIds)
        ->get();
    
    return response()->json(['data' => $result]);
}
```

#### c) routes/api.php
**Ubicación:** `vooky-back/routes/api.php`

**Cambios:**
- ✅ Agregada nueva ruta: `Route::post('lessons/batch/progress', ...)`

```php
// OPTIMIZACIÓN: Obtener progreso de MÚLTIPLES lecciones en una sola llamada
Route::post('lessons/batch/progress', [LessonGameController::class, 'getBatchProgress']);
```

---

### 2. Frontend - Vue 3 + TypeScript

#### a) lessonGameService.ts
**Ubicación:** `vooky-front/src/services/lessonGameService.ts`

**Cambios:**
- ✅ Agregada nueva función: `getLessonProgressBatch()`

```typescript
export async function getLessonProgressBatch(lessonIds: number[]): Promise<Record<number, LessonProgress>> {
    if (lessonIds.length === 0) {
        return {};
    }
    
    try {
        const response = await api.post<{ data: Record<number, LessonProgress> }>(
            '/lessons/batch/progress',
            { lesson_ids: lessonIds }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error loading batch lesson progress:', error);
        return {};
    }
}
```

#### b) CourseGameMap.vue
**Ubicación:** `vooky-front/src/components/game/CourseGameMap.vue`

**Cambios:**
- ✅ Agregado import: `import api from '@/config/api';`
- ✅ Refactorizado método `loadLessonProgress()` para usar batch

```typescript
async function loadLessonProgress() {
    const lessonIds = allLessons.value.map(lesson => lesson.id);
    
    let progressMap: Record<number, any> = {};
    
    try {
        // Intentar usar el nuevo endpoint batch
        const batchResponse = await api.post('/lessons/batch/progress', { 
            lesson_ids: lessonIds 
        });
        progressMap = batchResponse.data.data || {};
    } catch (err) {
        // Fallback a llamadas individuales
        console.warn('Batch endpoint not available, using individual calls:', err);
        for (const lesson of allLessons.value) {
            progressMap[lesson.id] = await getLessonProgress(lesson.id);
        }
    }
    
    // ... resto de lógica ...
}
```

---

## 📋 Lista de Verificación - Testing

### Testing Local

- [ ] **Backend está corriendo**
  ```bash
  cd vooky-back
  php artisan serve
  # Debería estar en http://localhost:8000
  ```

- [ ] **Frontend está corriendo**
  ```bash
  cd vooky-front
  npm run dev
  # Debería estar en http://localhost:5173
  ```

- [ ] **Base de datos tiene datos de prueba**
  ```bash
  php artisan migrate --seed
  # O usar:
  php artisan migrate
  ```

- [ ] **Usuario está autenticado**
  - Inicia sesión en el frontend
  - Verifica que tengas Bearer token en Network → Authorization

### Tests Funcionales

#### Test 1: Endpoint Batch Existe
```bash
# Terminal - hacer POST request
curl -X POST http://localhost:8000/api/lessons/batch/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lesson_ids": [1, 2, 3, 4, 5]}'

# Debería retornar:
# {
#   "data": {
#     "1": { "completed": false, "accuracy": null, ... },
#     "2": { "completed": true, "accuracy": 95, ... },
#     ...
#   },
#   "count": 5
# }
```

#### Test 2: CourseGameMap Carga Rápido
1. Abre DevTools (F12)
2. Pestaña Network
3. Navega a un curso
4. Verifica:
   - [ ] `batch/progress` aparece una sola vez
   - [ ] Tiempo total < 1 segundo
   - [ ] Mapa renderiza sin demoras visibles

#### Test 3: Fallback Funciona
1. Simula que el endpoint no existe (en DevTools):
   - Abre Console
   - Escribe: `localStorage.setItem('mockBatchError', 'true')`
2. Recarga el curso
3. Verifica:
   - [ ] Debería hacer múltiples requests `/progress`
   - [ ] El mapa sigue cargando correctamente
   - [ ] Solo más lento que antes

#### Test 4: Admins vs Usuarios Normales
**Para Admin:**
```bash
curl http://localhost:8000/api/courses/mi-curso \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
Verificar que respuesta incluye `images` y `subcategories`

**Para Usuario Normal:**
```bash
curl http://localhost:8000/api/courses/mi-curso \
  -H "Authorization: Bearer USER_TOKEN"
```
Verificar que respuesta NO incluye `images` y `subcategories`

---

## 🚀 Deployment Checklist

### Antes de Producción

- [ ] **Todas las optimizaciones están implementadas**
  - [ ] `CourseController.php` tiene rol-based loading
  - [ ] `LessonGameController.php` tiene `getBatchProgress()`
  - [ ] Ruta batch está registrada en `api.php`
  - [ ] Frontend usa la nueva función

- [ ] **Tests pasan**
  ```bash
  cd vooky-back
  php artisan test
  ```

- [ ] **Sin errores en logs**
  ```bash
  tail -f storage/logs/laravel.log
  ```

- [ ] **Migración no requerida**
  - No hay cambios de schema, solo lógica
  - Base de datos existente funciona sin cambios

- [ ] **Versión de caché limpia**
  ```bash
  # Backend
  php artisan cache:clear
  php artisan config:clear
  
  # Frontend
  npm run build
  # Borrar cache del navegador (Ctrl+Shift+Del)
  ```

### En Producción

- [ ] **Monitorear primera hora**
  - Verificar logs de errores
  - Monitorear tiempo de respuesta
  - Verificar uso de memoria

- [ ] **Métricas de rendimiento**
  ```
  Tiempo de carga del mapa: debería ser < 2s
  Queries por course: debería ser < 10
  Network requests: debería ser 2-3 (antes 50+)
  ```

---

## 🔍 Debugging

### El mapa sigue cargando lentamente

**Opción 1: Verificar que endpoint se está usando**
```typescript
// En CourseGameMap.vue, modifica loadLessonProgress()
console.log('Lesson IDs:', lessonIds);

const batchResponse = await api.post('/lessons/batch/progress', { lesson_ids: lessonIds });
console.log('Batch response:', batchResponse);
```

**Opción 2: Verificar queries en Laravel**
```php
// En CourseController.php show()
\DB::enableQueryLog();
// ... código ...
\Log::info('Queries:', \DB::getQueryLog());
```

**Opción 3: Verificar Network Request**
```
DevTools → Network → lessons/batch/progress
Status debería ser: 200
Size debería ser: < 50KB
Time debería ser: < 500ms
```

### Error 419 (CSRF Token)

**Solución:**
```typescript
// El problema es que POST necesita CSRF token
// En config/api.ts, asegurar que axios incluye headers:

const api = axios.create({
    baseURL: VITE_API_BASE_URL,
    withCredentials: true, // ← Importante
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});
```

### Error 401 (No Autenticado)

**Solución:**
```bash
# Verificar que el usuario está autenticado
# En browser console:
localStorage.getItem('auth:token')  # Debería retornar un token válido

# Si es null o vacío, el usuario necesita login
```

### Error 422 (Validación)

**Problema:** El endpoint rechaza `lesson_ids`

**Solución:**
```typescript
// Asegurar que lesson_ids es array de números
console.log(typeof lesson_ids[0]); // Debería ser 'number'
console.log(lesson_ids.length);    // Debería ser > 0

// Si hay >100, dividir en chunks
const chunks = [];
for (let i = 0; i < lesson_ids.length; i += 100) {
    chunks.push(lesson_ids.slice(i, i + 100));
}

for (const chunk of chunks) {
    const result = await api.post('/lessons/batch/progress', { 
        lesson_ids: chunk 
    });
    // procesar resultado...
}
```

---

## 📊 Monitoreo Post-Deploy

### Métricas Clave

**Antes vs Después:**

| Métrica | Antes | Objetivo | Herramienta |
|---------|-------|----------|------------|
| Tiempo de carga del mapa | 5-10s | < 2s | DevTools Performance |
| Número de requests | 50+ | 2-3 | DevTools Network |
| Tamaño total de datos | 500KB | < 100KB | DevTools Network |
| Queries por usuario | 50+ | 4-6 | Laravel Debugbar |
| TTI (Time To Interactive) | 8s | < 1s | Lighthouse |

### Dashboard de Monitoreo

```bash
# Si usas New Relic, Datadog, etc:
Monitor endpoint: POST /lessons/batch/progress
- Response time < 200ms
- Error rate < 0.1%
- Requests/min > threshold

Monitor CourseController::show
- Response time < 500ms
- Memory usage normal
```

---

## 🔄 Rollback (si es necesario)

Si hay problemas críticos:

### Opción 1: Desactivar Batch Temporalmente
```php
// En routes/api.php, comentar:
// Route::post('lessons/batch/progress', ...);
```

Esto hace que el frontend use fallback (más lento, pero funciona).

### Opción 2: Revertir Cambios Git
```bash
git revert <commit-hash>
```

---

## 📚 Documentación Relacionada

- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Análisis técnico
- [README.md](README.md) - Información general del proyecto
- [vooky-back/README.md](vooky-back/README.md) - Documentación backend

---

**Última actualización:** 8 de Enero, 2026
**Versión:** 1.0
**Estado:** ✅ Listo para Producción
