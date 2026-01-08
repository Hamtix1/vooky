# Implementación del Sistema de Subcategorías

## 📋 Resumen

Se ha implementado un sistema de subcategorías para resolver la ambigüedad en las preguntas del juego educativo. Ahora las imágenes pueden tener múltiples subcategorías, y el sistema aplica reglas estrictas para evitar que aparezcan juntas imágenes que causen confusión al usuario.

## 🗄️ Estructura de Base de Datos

### Nueva Tabla: `subcategories`
```sql
- id (PK)
- name (string) - Ej: "rojo", "grande", "pequeño"
- description (string, nullable)
- category_id (FK) - Pertenece a una categoría
- timestamps
```

### Nueva Tabla Pivot: `image_subcategory`
```sql
- id (PK)
- image_id (FK)
- subcategory_id (FK)
- timestamps
- UNIQUE(image_id, subcategory_id) - Evita duplicados
```

## 🔗 Relaciones de Modelos

### `Category`
```php
public function subcategories(): HasMany
public function images(): HasMany
```

### `Subcategory`
```php
public function category(): BelongsTo
public function images(): BelongsToMany
```

### `Image`
```php
public function category(): BelongsTo
public function subcategories(): BelongsToMany
```

## 🎮 Reglas Anti-Ambigüedad

El sistema aplica las siguientes reglas al generar preguntas:

### ✅ Regla 1: Categorías Diferentes
Si dos imágenes son de **categorías diferentes** → **Siempre válido** (no hay ambigüedad)

### ✅ Regla 2: Misma Categoría - Análisis por Subcategorías

#### a) Correcta con subcategoría + Candidata con DIFERENTES subcategorías → ✅ **VÁLIDO**
- Audio: "libro rojo" (subcategoría: rojo)
- Imagen incorrecta: "libro azul" (subcategoría: azul)
- **Resultado**: Subcategorías diferentes, usuario debe elegir específicamente "rojo"

#### b) Comparten AL MENOS UNA subcategoría → ❌ **NO VÁLIDO**
- Imagen 1: "libro rojo grande" (subcategorías: rojo, grande)
- Imagen 2: "libro rojo pequeño" (subcategorías: rojo, pequeño)
- **Problema**: Comparten "rojo", causaría ambigüedad si audio dice "libro rojo"

#### c) Correcta con subcategoría + Candidata SIN subcategoría → ✅ **VÁLIDO**
- Audio: "libro rojo" (subcategoría: rojo)
- Imagen incorrecta: "libro" (sin subcategoría, genérica)
- **Resultado**: Usuario debe elegir específicamente el libro rojo

#### d) Correcta SIN subcategoría + Candidata CON subcategoría → ❌ **NO VÁLIDO**
- Audio: "libro" (sin subcategoría, genérico)
- Imagen incorrecta: "libro rojo" (subcategoría: rojo)
- **Problema**: Ambas representan "libro", ambigüedad

#### e) Ninguna tiene subcategoría → ❌ **NO VÁLIDO**
- Imagen 1: "libro" (genérica)
- Imagen 2: "libro" (genérica)
- **Problema**: No es útil como pregunta, son idénticas conceptualmente

## 💻 Implementación en el Código

### LessonGameController.php

#### Método `canImagesAppearTogether($correctImage, $candidateImage)`
Valida si dos imágenes pueden aparecer juntas según las reglas.

```php
// Verifica:
1. Si son la misma imagen → NO
2. Si son de diferentes categorías → SÍ
3. Si son misma categoría:
   a. Comparten AL MENOS UNA subcategoría → NO (ambigüedad)
   b. Ambas tienen subcategorías DIFERENTES → SÍ (válido)
   c. Correcta tiene + Candidata no tiene → SÍ (válido)
   d. Correcta no tiene + Candidata tiene → NO (ambigüedad)
   e. Ninguna tiene subcategorías → NO (no útil)
```

#### Método `findValidIncorrectImage($correctImage, $allImages)`
Encuentra una imagen incorrecta válida con prioridades:

```php
1. Prioridad 1: Diferente categoría
2. Prioridad 2: Misma categoría pero válida (pasa reglas)
3. Fallback: Cualquier imagen diferente
```

#### Método `findValidIncorrectImageSameCategory($correctImage, $categoryImages)`
Variante específica para preguntas de misma categoría.

### Modificaciones en Generación de Preguntas

#### `generateMixedCategoryQuestions()`
- Usa Collections en lugar de arrays
- Aplica `findValidIncorrectImage()` para cada pregunta
- Prioriza imágenes de diferente categoría

#### `generateSameCategoryQuestions()`
- Usa `findValidIncorrectImageSameCategory()`
- Si no encuentra válida en misma categoría, hace fallback a mixto
- Aplica las mismas reglas anti-ambigüedad

### ImageResource.php
Incluye subcategorías en la respuesta API:

```php
'subcategories' => $this->whenLoaded('subcategories', [...])
```

## 🚀 Uso del Sistema

### 1. Crear Subcategorías
```php
$subcategory = Subcategory::create([
    'name' => 'rojo',
    'category_id' => $categoryId
]);
```

### 2. Asignar Subcategorías a Imágenes
```php
$image->subcategories()->attach($subcategoryId);
// O múltiples:
$image->subcategories()->attach([1, 2, 3]);
```

### 3. El Sistema Automáticamente
- Carga subcategorías al generar preguntas
- Aplica reglas anti-ambigüedad
- Evita combinaciones problemáticas

## 📊 Ejemplos Prácticos

### Ejemplo 1: Subcategorías Diferentes (Misma Categoría) ✅
```
Audio: "libro rojo" (subcategoría: rojo)
Opciones:
- Imagen A: libro rojo (correcta)
- Imagen B: libro azul (subcategoría: azul)
Resultado: VÁLIDO - Subcategorías diferentes, clara distinción
```

### Ejemplo 2: Con Subcategoría vs Sin Subcategoría ✅
```
Audio: "libro rojo" (subcategoría: rojo)
Opciones:
- Imagen A: libro rojo (correcta)
- Imagen B: libro (genérica, sin subcategoría)
Resultado: VÁLIDO - Usuario debe elegir específicamente el rojo
```

### Ejemplo 3: Sin Subcategoría vs Con Subcategoría ❌
```
Audio: "libro" (sin subcategoría, genérico)
Opciones:
- Imagen A: libro (correcta)
- Imagen B: libro rojo (subcategoría: rojo)
Resultado: NO VÁLIDO - Ambiguo, "libro rojo" también es un "libro"
```

### Ejemplo 4: Comparten Subcategoría ❌
```
Audio: "libro rojo grande" (subcategorías: rojo, grande)
Opciones:
- Imagen A: libro rojo grande (correcta)
- Imagen B: libro rojo pequeño (subcategorías: rojo, pequeño)
Resultado: NO VÁLIDO - Comparten "rojo", si audio dice "libro rojo" es ambiguo
```

### Ejemplo 5: Ambas Genéricas ❌
```
Audio: "libro" (sin subcategoría)
Opciones:
- Imagen A: libro (correcta)
- Imagen B: libro (también sin subcategoría)
Resultado: NO VÁLIDO - No es útil, son conceptualmente idénticas
```

### Ejemplo 6: Categorías Diferentes ✅
```
Audio: "libro rojo" (categoría: libros, subcategoría: rojo)
Opciones:
- Imagen A: libro rojo (correcta)
- Imagen B: manzana roja (categoría: frutas, subcategoría: rojo)
Resultado: VÁLIDO - Diferentes categorías, siempre válido
```

## 🔧 Migraciones Aplicadas

```bash
php artisan migrate
```

Tablas creadas:
- `subcategories` (2025_11_04_193507)
- `image_subcategory` (2025_11_04_193537)

## 📝 Notas Importantes

1. **Relación Many-to-Many**: Una imagen puede tener múltiples subcategorías
2. **Opcional**: Las imágenes pueden NO tener subcategorías (genéricas)
3. **Eager Loading**: Las subcategorías se cargan con `->with(['subcategories'])`
4. **API Response**: Incluye array de subcategorías cuando están cargadas
5. **Backward Compatible**: Imágenes sin subcategorías siguen funcionando

## 🎯 Beneficios

✅ Elimina ambigüedad en preguntas  
✅ Permite imágenes genéricas y específicas  
✅ Flexible: múltiples subcategorías por imagen  
✅ Validación automática al generar preguntas  
✅ Mejora experiencia de usuario (preguntas más claras)  

## 🔜 Próximos Pasos

- [ ] Crear interfaz UI para gestionar subcategorías
- [ ] Agregar CRUD de subcategorías en panel admin
- [ ] Permitir asignar subcategorías al subir imágenes
- [ ] Agregar estadísticas de uso de subcategorías
