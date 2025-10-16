# 🎮 Vooky - Plataforma Educativa de Juegos

<div align="center">

![Vooky Logo](https://via.placeholder.com/200x200/667eea/ffffff?text=VOOKY)

**Plataforma educativa interactiva basada en juegos de emparejamiento audio-visual**

[![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Documentación](#-documentación)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 🎯 Descripción

Vooky es una **plataforma educativa dual** que crea experiencias de aprendizaje gamificadas donde los usuarios progresan a través de cursos mediante lecciones interactivas. El sistema utiliza juegos de emparejamiento audio-visual para hacer el aprendizaje más entretenido y efectivo.

### ¿Qué hace Vooky único?

- 🎮 **Gamificación Total**: Mapa de progreso estilo videojuego con nodos desbloqueables
- 🔊 **Aprendizaje Audio-Visual**: Emparejamiento de sonidos con imágenes
- 📊 **Seguimiento de Progreso**: Sistema de puntuación y estadísticas detalladas
- 🎨 **UI Moderna**: Diseño con gradientes, animaciones y efectos glassmorphism
- 👥 **Multi-Rol**: Interfaces diferenciadas para admin/padres/usuarios
- 📱 **Responsive**: Funciona perfectamente en desktop, tablet y móvil

---

## ✨ Características

### Para Administradores

- ✅ **Gestión de Cursos**: Crear, editar y eliminar cursos completos
- ✅ **Niveles y Lecciones**: Estructura jerárquica con contenido progresivo
- ✅ **Categorías**: Organización de contenido por temas
- ✅ **Biblioteca de Media**: Upload de imágenes y archivos de audio
- ✅ **Panel de Control**: Vista completa del progreso de usuarios
- ✅ **CRUD Completo**: Interfaces intuitivas para todo el contenido

### Para Usuarios

- 🎮 **Mapa de Juego Interactivo**: Navegación visual tipo videojuego
- 🎯 **Lecciones Progresivas**: Desbloqueo de contenido por día
- 🔊 **Juegos de Emparejamiento**: Audio + imagen con múltiples modos
- 📈 **Sistema de Progreso**: Puntuación, estrellas y logros
- 🔄 **Retry System**: Opción de reintentar lecciones fallidas
- 🏆 **Requisito de Aprobación**: 75% de aciertos para pasar
- ⚠️ **Game Over**: 5 errores consecutivos = fin del juego

### Mecánicas del Juego

1. **Tres Modos de Preguntas**:
   - `combinadas`: Mezcla de categorías
   - `enlace_categoria`: Misma categoría
   - `mixto`: Combinación de ambos

2. **Sistema de Puntuación**:
   - Respuestas correctas suman puntos
   - Progreso guardado automáticamente
   - Estadísticas detalladas por lección

3. **Progresión**:
   - Contenido desbloqueado día a día
   - Lecciones anteriores siempre disponibles
   - Sistema de niveles acumulativo

---

## 🏗️ Arquitectura

```
vooky/
├── vooky-back/          # Backend Laravel 10
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── storage/
│
├── vooky-front/         # Frontend Vue 3 + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── router/
│   └── public/
│
└── Documentation/       # Archivos .md de implementación
```

### Modelo de Datos

```
Course (Curso)
  ├── Levels (Niveles)
  │     ├── Lessons (Lecciones)
  │     │     └── Questions (Audio + Images)
  │     └── Images (organizadas por día)
  └── Categories (Categorías)
        └── Images
```

**Relaciones Clave**:
- `Course` → `hasMany(Level)` → `hasMany(Lesson)`
- `Level` → `hasMany(Image)` (campo `dia` para liberación)
- `User` ↔ `Lesson` (pivot `lesson_user` con puntuaciones)
- `Category` → `hasMany(Image)`

---

## 💻 Requisitos

### Software Necesario

- **PHP**: >= 8.1
- **Composer**: >= 2.0
- **Node.js**: >= 18.0
- **npm** o **yarn**: >= 8.0
- **MySQL**: >= 8.0 o **PostgreSQL**: >= 13.0
- **Git**: >= 2.0

### Opcional

- **Laragon** (Windows) o **Laravel Valet** (Mac) para entorno local
- **VS Code** con extensiones recomendadas

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/vooky.git
cd vooky
```

### 2. Backend Setup (Laravel)

```bash
cd vooky-back

# Instalar dependencias
composer install

# Copiar archivo de entorno
cp .env.example .env

# Generar key de aplicación
php artisan key:generate

# Configurar base de datos en .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=vooky
# DB_USERNAME=root
# DB_PASSWORD=

# Ejecutar migraciones y seeders
php artisan migrate --seed

# Crear enlace simbólico para storage
php artisan storage:link

# Iniciar servidor
php artisan serve
```

### 3. Frontend Setup (Vue 3)

```bash
cd ../vooky-front

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Configurar URL del backend en .env
# VITE_API_BASE_URL=http://localhost:8000

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Usuario Admin**: Creado por `AdminUserSeeder`

---

## 📖 Uso

### Crear un Curso

1. Inicia sesión como administrador
2. Ve a "Cursos" → "Crear Curso"
3. Completa nombre y descripción
4. Crea niveles con `dia` progresivo
5. Agrega lecciones a cada nivel
6. Sube imágenes y audios por categoría

### Jugar una Lección

1. Inicia sesión como usuario
2. Selecciona un curso
3. Haz clic en un nodo desbloqueado del mapa
4. Completa el juego de emparejamiento
5. Alcanza 75%+ para aprobar

### Gestionar Categorías

1. Abre la vista de un curso (admin)
2. Clic en "Gestionar Categorías"
3. Crear, editar o eliminar categorías
4. Asociar imágenes a categorías

---

## 📁 Estructura del Proyecto

### Backend (Laravel)

```
vooky-back/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── CourseController.php
│   │   │   ├── LevelController.php
│   │   │   ├── LessonController.php
│   │   │   ├── LessonGameController.php
│   │   │   ├── CategoryController.php
│   │   │   └── ImageController.php
│   │   └── Middleware/
│   │       └── Authenticate.php
│   └── Models/
│       ├── Course.php
│       ├── Level.php
│       ├── Lesson.php
│       ├── Category.php
│       ├── Image.php
│       ├── Audio.php
│       └── User.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── AdminUserSeeder.php
└── routes/
    └── api.php
```

### Frontend (Vue 3)

```
vooky-front/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── CourseGameMap.vue
│   │   │   └── LessonGame.vue
│   │   └── dashboard/
│   │       ├── CategoryCreateModal.vue
│   │       └── ImageAudioUploadModal.vue
│   ├── pages/
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   └── dashboard/
│   │       ├── Courses.vue
│   │       ├── CourseShow.vue
│   │       ├── CreateCourse.vue
│   │       ├── EditCourse.vue
│   │       └── CreateLevel.vue
│   ├── services/
│   │   ├── courseService.ts
│   │   ├── categoryService.ts
│   │   └── lessonGameService.ts
│   ├── stores/
│   │   └── authStore.ts
│   ├── router/
│   │   └── index.ts
│   └── utils/
│       └── urlHelper.ts
└── public/
    └── sounds/
```

---

## 🛠️ Tecnologías

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Laravel | 10.x | Framework PHP |
| MySQL | 8.0+ | Base de datos |
| Sanctum | 3.x | Autenticación API |
| Spatie MediaLibrary | 10.x | Gestión de archivos |

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Vue.js | 3.3+ | Framework JavaScript |
| TypeScript | 5.0+ | Tipado estático |
| Vite | 4.x | Build tool |
| Pinia | 2.x | State management |
| Vue Router | 4.x | Routing |
| Axios | 1.x | HTTP client |
| Font Awesome | 6.x | Iconografía |

### DevOps

- **Git** para control de versiones
- **NPM** para gestión de paquetes frontend
- **Composer** para gestión de paquetes backend
- **ESLint** + **Prettier** para code quality

---

## 📚 Documentación

Archivos de documentación específica:

- [`COURSE_GAME_MAP_IMPLEMENTATION.md`](COURSE_GAME_MAP_IMPLEMENTATION.md) - Implementación del mapa de juego
- [`LESSON_GAME_IMPLEMENTATION.md`](LESSON_GAME_IMPLEMENTATION.md) - Mecánicas del juego de lecciones
- [`CATEGORY_MANAGEMENT_IMPLEMENTATION.md`](CATEGORY_MANAGEMENT_IMPLEMENTATION.md) - Sistema de gestión de categorías

### Convenciones de Código

#### Backend (Laravel)
```php
// Generación automática de slugs
static::booted() {
    static::creating(function ($course) {
        $course->slug = Str::slug($course->title);
    });
}

// Eager loading para optimización
Course::with(['levels.lessons', 'categories'])->get();
```

#### Frontend (Vue 3 + TypeScript)
```typescript
// Componentes con Composition API
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props tipados
const props = defineProps<{
  courseSlug: string;
  category?: Category | null;
}>();

// Refs reactivos
const loading = ref(false);
const data = ref<Course[]>([]);
</script>
```

### URLs Centralizadas
```typescript
// Usar helpers en lugar de construir URLs manualmente
import { getImageUrl, getAudioUrl } from '@/utils/urlHelper';

const imageUrl = getImageUrl(image.url);
const audioUrl = getAudioUrl(audio.file_path);
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: amazing feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guía de Commits

Usa commits descriptivos siguiendo el formato:

```
Add: nueva característica
Fix: corrección de bug
Update: actualización de código existente
Remove: eliminación de código/archivos
Docs: cambios en documentación
Style: cambios de estilo (no afectan lógica)
Refactor: refactorización de código
Test: agregar o actualizar tests
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Hamtix** - *Desarrollo inicial* - [@Hamtix1](https://github.com/Hamtix1)

---

## 🙏 Agradecimientos

- Laravel community por el excelente framework
- Vue.js team por Vue 3 y Composition API
- Font Awesome por los iconos
- Todos los contribuidores que hacen este proyecto posible

---

## 📞 Contacto

¿Preguntas? ¿Sugerencias? ¿Bugs?

- **GitHub Issues**: [Crear Issue](https://github.com/tu-usuario/vooky/issues)
- **Email**: tu-email@ejemplo.com

---

<div align="center">

**Hecho con ❤️ y ☕ por el equipo Vooky**

[![GitHub](https://img.shields.io/badge/GitHub-Hamtix1-181717?style=for-the-badge&logo=github)](https://github.com/Hamtix1)

</div>
