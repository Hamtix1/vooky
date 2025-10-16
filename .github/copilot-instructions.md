# Vooky - Plataforma Educativa de Juegos

## Resumen de Arquitectura

Vooky es una **plataforma educativa de doble aplicación** con backend Laravel separado (`vooky-back/`) y frontend Vue 3 (`vooky-front/`). El sistema crea **experiencias de aprendizaje basadas en juegos** donde los usuarios progresan a través de cursos mediante lecciones interactivas con juegos de emparejamiento audio-visual.

### Jerarquía del Modelo de Datos Central
```
Course → Level → Lesson → Questions (Audio + Images)
       ↘ Category → Images (organizadas por level.dia)
```

**Relaciones clave:**
- `Course.hasMany(Level).hasMany(Lesson)` - Progresión estructurada
- `Level.hasMany(Image)` con campo `dia` para liberación diaria de contenido  
- `User.belongsToMany(Lesson, 'lesson_user')` - Seguimiento de progreso con puntuaciones
- Las categorías agrupan imágenes dentro de cursos para generar preguntas

## Flujos de Trabajo de Desarrollo

### Backend (Laravel)
- **Migraciones de base de datos**: Usar `php artisan migrate`
- **Lógica del juego**: `LessonGameController` genera preguntas filtrando imágenes según el tipo de lección (`combinadas`, `enlace_categoria`, `mixto`)
- **Seguimiento de progreso**: tabla pivot `lesson_user` almacena `score`, `correct_answers`, `total_questions`
- **Autenticación API**: Basada en Sanctum con acceso por roles (`admin`/`parent`)

### Frontend (Vue 3 + TypeScript)
- **Gestión de estado**: Store Pinia con autenticación persistente (`useAuthStore`)
- **UI del juego**: `CourseGameMap.vue` - Mapa de niveles basado en SVG con nodos de progreso tipo videojuego
- **Desarrollo**: `npm run dev` (Vite con HMR)
- **Build**: `npm run build` para producción

### Comandos Clave
```bash
# Configuración backend
cd vooky-back && composer install && php artisan key:generate
php artisan migrate --seed

# Configuración frontend  
cd vooky-front && npm install && npm run dev

# Desarrollo
# Backend: php artisan serve (o usar Laragon)
# Frontend: npm run dev
```

## Patrones Específicos del Proyecto

### Implementación de Mecánicas de Juego
- **Generación de Preguntas**: Imágenes filtradas por `level_id < actual OR (level_id = actual AND dia <= lesson.dia)`
- **Tipos de Contenido**: Tres modos distintos de preguntas mezclando emparejamientos de misma/diferente categoría
- **Estados de Progreso**: Las lecciones tienen estados visuales (disponible/completada/bloqueada/actual) en el mapa del juego
- **Integración de Audio**: Cada pregunta empareja archivos de audio con selección de imágenes
- **Modo Pantalla Completa**: Botón en `LessonGame.vue` para experiencia inmersiva sin distracciones, con soporte cross-browser (Chrome, Firefox, Safari, IE11)

### Vistas Basadas en Roles
- **Admin**: Interfaz CRUD completa con listas expandibles
- **Parent/Usuario**: Interfaz de mapa de juego con contenido bloqueado por progresión
- La autenticación determina el renderizado de UI en `CourseShow.vue` y componentes relacionados

### Convenciones de Laravel
- **Generación de slug**: Automática en modelo Course usando `static::booted()`
- **Eager loading**: Los controladores usan `.with()` para optimización de relaciones
- **Respuestas resource**: La API retorna datos estructurados para consumo del frontend

### Arquitectura de Componentes Vue
- **Componentes de juego**: Ubicados en `src/components/game/`
- **Estado global**: Auth persistida en localStorage, restaurada al inicializar app
- **Font Awesome**: Iconos registrados globalmente para consistencia de UI
- **Basado en eventos**: Comunicación padre-hijo vía `$emit` para navegación

### Convenciones de Almacenamiento de Archivos
- Archivos de audio: Almacenados en sistema de storage público de Laravel
- Imágenes: Asociadas con categorías y niveles para entrega organizada de contenido
- Documentos de implementación: Archivos `.md` a nivel raíz documentan características principales
- **URLs centralizadas**: Usar helpers en `src/utils/urlHelper.ts` (`getImageUrl`, `getAudioUrl`, `getFullUrl`) en lugar de construir URLs manualmente con `VITE_API_BASE_URL`

## Notas de Desarrollo
- Archivo batch específico de Windows (`migrate.bat`) para operaciones de base de datos
- Integración con Laragon asumida para entorno PHP local
- Modo estricto de TypeScript habilitado para seguridad de tipos en frontend
- Rutas API siguen convenciones de recursos Laravel con middleware basado en roles