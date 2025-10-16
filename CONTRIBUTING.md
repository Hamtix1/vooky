# Guía de Contribución - Vooky

¡Gracias por tu interés en contribuir a Vooky! 🎉

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guía de Estilo](#guía-de-estilo)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

---

## 📜 Código de Conducta

Este proyecto y todos sus participantes están regidos por un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamiento inaceptable.

### Nuestros Estándares

**Comportamientos que contribuyen a crear un ambiente positivo:**

- ✅ Usar lenguaje acogedor e inclusivo
- ✅ Ser respetuoso de diferentes puntos de vista y experiencias
- ✅ Aceptar críticas constructivas con gracia
- ✅ Enfocarse en lo que es mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros de la comunidad

**Comportamientos inaceptables:**

- ❌ Uso de lenguaje o imágenes sexualizadas
- ❌ Trolling, comentarios insultantes o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin permiso
- ❌ Otras conductas que podrían considerarse inapropiadas en un entorno profesional

---

## 🤝 ¿Cómo puedo contribuir?

### Reportar Bugs

Los bugs se rastrean como [GitHub Issues](https://github.com/tu-usuario/vooky/issues). Antes de crear un issue:

1. **Busca si ya existe** - Revisa si alguien ya reportó el mismo problema
2. **Crea un issue claro** - Usa el template de bug report
3. **Proporciona información detallada**:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots (si aplica)
   - Información del entorno (OS, PHP, Node versions)

#### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
Qué debería suceder.

**Screenshots**
Si aplica, agrega screenshots.

**Entorno:**
 - OS: [e.g. Windows 11]
 - PHP: [e.g. 8.2]
 - Node: [e.g. 18.17]
 - Navegador: [e.g. Chrome 119]

**Contexto Adicional**
Cualquier otra información relevante.
```

### Sugerir Mejoras

Las mejoras también se rastrean como GitHub Issues. Para sugerir una mejora:

1. **Verifica que no exista** - Busca en issues abiertos/cerrados
2. **Usa el template** - Feature request template
3. **Sé específico** - Explica claramente el beneficio

#### Template de Feature Request

```markdown
**¿Tu feature está relacionado con un problema?**
Descripción clara del problema. Ej: "Siempre me frustro cuando [...]"

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que suceda.

**Describe alternativas que consideraste**
Descripción de soluciones o features alternativas.

**Contexto Adicional**
Screenshots, mockups, o explicaciones adicionales.
```

---

## 🔄 Proceso de Desarrollo

### 1. Fork el Repositorio

```bash
# Haz fork desde GitHub UI, luego:
git clone https://github.com/TU-USUARIO/vooky.git
cd vooky
```

### 2. Crea una Rama

```bash
# Para features
git checkout -b feature/nombre-descriptivo

# Para fixes
git checkout -b fix/descripcion-del-bug

# Para docs
git checkout -b docs/que-documentas
```

### 3. Configura el Entorno

```bash
# Backend
cd vooky-back
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Frontend
cd ../vooky-front
npm install
cp .env.example .env
npm run dev
```

### 4. Haz tus Cambios

- ✍️ Escribe código limpio y bien documentado
- 🧪 Agrega tests si aplica
- 📝 Actualiza documentación si es necesario
- 🎨 Sigue las guías de estilo del proyecto

### 5. Prueba tus Cambios

```bash
# Backend tests
cd vooky-back
php artisan test

# Frontend tests
cd vooky-front
npm run test

# Lint
npm run lint
```

### 6. Commit

```bash
git add .
git commit -m "Add: descripción clara del cambio"
```

### 7. Push

```bash
git push origin feature/nombre-descriptivo
```

### 8. Crea Pull Request

Ve a GitHub y crea un Pull Request desde tu rama hacia `main`.

---

## 🎨 Guía de Estilo

### PHP (Laravel Backend)

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ExampleController extends Controller
{
    /**
     * Documentación del método
     */
    public function index()
    {
        // PSR-12 coding standard
        // Nombres descriptivos
        // Inyección de dependencias
        
        return response()->json([
            'data' => $data
        ]);
    }
}
```

**Convenciones:**
- PSR-12 coding standard
- Nombres de variables en `camelCase`
- Nombres de clases en `PascalCase`
- Constantes en `UPPER_CASE`
- Usar type hints
- DocBlocks para métodos públicos

### TypeScript/Vue (Frontend)

```typescript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props tipados
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

// Refs con tipos
const loading = ref<boolean>(false);
const items = ref<Item[]>([]);

// Computed con tipo inferido
const total = computed(() => items.value.length);

// Funciones tipadas
async function fetchData(): Promise<void> {
  loading.value = true;
  try {
    // Logic here
  } finally {
    loading.value = false;
  }
}
</script>
```

**Convenciones:**
- Composition API con `<script setup>`
- TypeScript estricto
- Nombres de componentes en `PascalCase`
- Props y emits tipados
- Variables reactivas con nombres descriptivos
- Comentarios para lógica compleja

### CSS/Estilos

```css
/* Usar variables CSS */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}

/* BEM naming */
.component-name {
  /* Propiedades */
}

.component-name__element {
  /* Elemento */
}

.component-name--modifier {
  /* Modificador */
}

/* Mobile-first responsive */
@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}
```

---

## 💬 Commits

### Formato de Commit

```
Tipo: Descripción corta (máx 50 caracteres)

Descripción detallada opcional (máx 72 caracteres por línea)

Footer opcional (referencias a issues, breaking changes)
```

### Tipos de Commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `Add` | Nueva característica | `Add: user profile page` |
| `Fix` | Corrección de bug | `Fix: game over not triggering correctly` |
| `Update` | Actualización de código | `Update: improve loading animation` |
| `Remove` | Eliminación de código | `Remove: deprecated auth method` |
| `Refactor` | Refactorización | `Refactor: extract game logic to service` |
| `Style` | Cambios de estilo | `Style: format code with prettier` |
| `Docs` | Documentación | `Docs: add API endpoint documentation` |
| `Test` | Tests | `Test: add unit tests for courseService` |
| `Chore` | Mantenimiento | `Chore: update dependencies` |

### Ejemplos de Buenos Commits

```bash
# Feature completo
git commit -m "Add: category management panel in CourseShow

- Collapsible panel with slide-down animation
- Grid layout with category cards
- Edit and delete functionality
- Empty state with CTA button
- Responsive design for mobile/tablet/desktop

Resolves #123"

# Bug fix
git commit -m "Fix: game over not triggering after 5 errors

The consecutive error counter was being reset incorrectly
when switching between questions. Now it persists correctly
throughout the game session.

Fixes #456"

# Simple update
git commit -m "Update: improve CategoryModal loading state"
```

---

## 🔀 Pull Requests

### Checklist antes de PR

- [ ] ✅ Código sigue las guías de estilo
- [ ] 🧪 Tests agregados/actualizados y pasando
- [ ] 📝 Documentación actualizada
- [ ] 🔍 Sin warnings de lint
- [ ] ♻️ Sin código comentado innecesario
- [ ] 🎨 Commits limpios y descriptivos
- [ ] 📋 Issue relacionado linkado

### Template de Pull Request

```markdown
## Descripción
Descripción clara de los cambios.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa cambios incompatibles)
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas que hiciste.

## Screenshots (si aplica)
Agrega screenshots de los cambios visuales.

## Checklist
- [ ] Mi código sigue las guías de estilo
- [ ] Hice self-review de mi código
- [ ] Comenté código complejo
- [ ] Actualicé la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] Agregué tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan localmente

## Issues Relacionados
Fixes #123
Related to #456
```

### Proceso de Review

1. **Automated Checks**: CI/CD debe pasar
2. **Code Review**: Al menos 1 aprobación requerida
3. **Testing**: Revisor prueba los cambios
4. **Feedback**: Discusión y mejoras
5. **Merge**: Squash and merge cuando esté listo

---

## 🐛 Reportar Bugs

### Información a Incluir

**Siempre proporciona:**
- Versión de PHP y Node.js
- Sistema Operativo
- Navegador y versión
- Pasos exactos para reproducir
- Logs de error (Laravel y browser console)

**Opcional pero útil:**
- Database dump (anonimizado)
- Network tab screenshots
- Video de la reproducción

### Severidad de Bugs

- 🔴 **Critical**: Sistema no funciona, pérdida de datos
- 🟠 **High**: Feature principal rota
- 🟡 **Medium**: Feature secundaria afectada
- 🟢 **Low**: Issue cosmético o menor

---

## 💡 Sugerir Mejoras

### Features Bienvenidos

- 🎮 Nuevos tipos de juegos educativos
- 📊 Estadísticas y analytics mejorados
- 🎨 Mejoras de UI/UX
- ⚡ Optimizaciones de performance
- 🌐 Internacionalización (i18n)
- ♿ Mejoras de accesibilidad
- 📱 Features mobile-first

### Áreas de Mejora

1. **Backend**
   - Tests coverage
   - API documentation
   - Performance optimization
   - Security enhancements

2. **Frontend**
   - Component library
   - Animation system
   - State management patterns
   - PWA features

3. **DevOps**
   - CI/CD pipelines
   - Docker containers
   - Deployment scripts
   - Monitoring

---

## 📞 Contacto

¿Preguntas sobre contribución?

- 💬 **GitHub Discussions**: Para preguntas generales
- 🐛 **GitHub Issues**: Para bugs y features
- 📧 **Email**: dev@vooky.com

---

## 🎉 Reconocimientos

Todos los contribuidores serán reconocidos en:
- README.md (sección Contributors)
- CHANGELOG.md
- Release notes

¡Gracias por ayudar a hacer Vooky mejor! 🚀

---

**Última actualización**: Octubre 2025
