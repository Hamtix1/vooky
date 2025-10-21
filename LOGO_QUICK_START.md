# 🎨 GUÍA RÁPIDA: Cómo Subir tu Logo y Actualizar Colores

## 📁 PASO 1: Sube tu Logo

### **Ubicación:**
```
c:\laragon\www\vooky\vooky-front\public\images\logos\
```

### **Archivos a subir:**

#### **Mínimo necesario:**
- ✅ `logo-full.png` → Logo completo (con texto)
- ✅ `logo-icon.png` → Solo el ícono/símbolo (para favicon)

#### **Opcional (recomendado):**
- `logo-light.png` → Versión para fondos oscuros
- `logo-dark.png` → Versión para fondos claros
- `logo-full.svg` → Versión vectorial (mejor calidad)

---

## 🎨 PASO 2: Extrae los Colores de tu Logo

### **Herramienta recomendada:**
1. Ve a: https://coolors.co/image-picker
2. Sube tu logo
3. Copia los códigos HEX de 3-5 colores principales

### **Colores a identificar:**

```
🎨 Color Primario (el más importante de tu logo):
   Ejemplo: #2563eb

🎨 Color Secundario (acento o complementario):
   Ejemplo: #f97316

🎨 Color de Acento (para botones/CTAs):
   Ejemplo: #10b981
```

---

## ⚙️ PASO 3: Actualiza las Variables CSS

### **Archivo a editar:**
```
c:\laragon\www\vooky\vooky-front\src\assets\styles\theme.css
```

### **Qué cambiar:**

Busca la sección `/* COLORES PRINCIPALES */` (línea ~10) y reemplaza:

```css
:root {
  /* Color Primario - Usar el color principal del logo */
  --color-primary: #TU_COLOR_AQUÍ;           /* ← CAMBIAR */
  --color-primary-light: #VERSION_CLARA;     /* ← CAMBIAR */
  --color-primary-dark: #VERSION_OSCURA;     /* ← CAMBIAR */
  --color-primary-rgb: 52, 152, 219;         /* ← CAMBIAR (mismo color en RGB) */
  
  /* Color Secundario - Usar color complementario del logo */
  --color-secondary: #TU_COLOR_AQUÍ;         /* ← CAMBIAR */
  --color-secondary-light: #VERSION_CLARA;   /* ← CAMBIAR */
  --color-secondary-dark: #VERSION_OSCURA;   /* ← CAMBIAR */
  
  /* Color de Acento - Para CTAs y elementos destacados */
  --color-accent: #TU_COLOR_AQUÍ;            /* ← CAMBIAR */
}
```

### **Cómo generar versiones claras y oscuras:**

#### **Versión Clara** (light):
- En Coolors.co: Mueve el slider de luminosidad +20%
- En Photoshop/GIMP: Aumenta brillo +20%
- Manualmente: Convierte HEX a HSL, suma 20 a L, reconvierte a HEX

#### **Versión Oscura** (dark):
- En Coolors.co: Mueve el slider de luminosidad -20%
- En Photoshop/GIMP: Reduce brillo -20%
- Manualmente: Convierte HEX a HSL, resta 20 a L, reconvierte a HEX

#### **Formato RGB:**
Si tu color es `#3498db`:
- R = 52, G = 152, B = 219
- Escribe: `--color-primary-rgb: 52, 152, 219;`

---

## 🖼️ PASO 4: Activa el Logo en el Componente

### **Archivo a editar:**
```
c:\laragon\www\vooky\vooky-front\src\components\common\AppLogo.vue
```

### **Qué cambiar:**

Busca la línea ~76 y cambia `false` por `true`:

```typescript
// Computed para mostrar imagen o fallback
const showImage = computed(() => {
  // Cambiar a true cuando subas tu logo
  return true && !imageError.value  // ← CAMBIAR false → true
})
```

---

## 🔄 PASO 5: Actualiza el Theme Color

### **Archivo a editar:**
```
c:\laragon\www\vooky\vooky-front\index.html
```

### **Qué cambiar:**

Busca la línea ~35 y reemplaza con tu color primario:

```html
<!-- Theme Color - ACTUALIZAR con color primario de tu logo -->
<meta name="theme-color" content="#TU_COLOR_PRIMARIO">
```

---

## ✅ CHECKLIST COMPLETO

### **Subir Archivos:**
- [ ] `logo-full.png` → `/public/images/logos/`
- [ ] `logo-icon.png` → `/public/images/logos/`
- [ ] `logo-light.png` (opcional)
- [ ] `logo-dark.png` (opcional)

### **Extraer Colores:**
- [ ] Identificar color primario (código HEX)
- [ ] Identificar color secundario (código HEX)
- [ ] Identificar color de acento (código HEX)
- [ ] Generar versiones claras (+20% brillo)
- [ ] Generar versiones oscuras (-20% brillo)
- [ ] Convertir color primario a RGB

### **Actualizar Código:**
- [ ] Editar `theme.css` → Variables `--color-primary*`
- [ ] Editar `theme.css` → Variables `--color-secondary*`
- [ ] Editar `theme.css` → Variables `--color-accent*`
- [ ] Editar `theme.css` → Variable `--color-primary-rgb`
- [ ] Editar `AppLogo.vue` → Cambiar `false` → `true` (línea 76)
- [ ] Editar `index.html` → Actualizar `theme-color`

### **Verificar:**
- [ ] El logo aparece en el Navbar
- [ ] El favicon se muestra en la pestaña del navegador
- [ ] Los colores se aplican en toda la app
- [ ] Los botones usan los nuevos colores
- [ ] Los degradados combinan con tu logo

---

## 📸 VISTA PREVIA

### **Dónde verás tu logo:**

```
1. Navbar (Todas las páginas)
   └─ Esquina superior izquierda
   └─ Tamaño: Medium (48px altura)

2. Favicon (Pestaña del navegador)
   └─ Icono pequeño en la pestaña
   └─ Tamaño: 32x32px

3. Login Page (Cuando la crees)
   └─ Centro superior del formulario
   └─ Tamaño: Large (80px altura)

4. Loading Screens
   └─ Centro de la pantalla
   └─ Tamaño: XLarge (120px altura)
```

---

## 🎯 EJEMPLO COMPLETO

### **Si tu logo tiene estos colores:**
- **Azul:** `#2563eb` (primario)
- **Naranja:** `#f97316` (secundario)
- **Verde:** `#10b981` (acento)

### **Actualiza `theme.css` así:**

```css
:root {
  /* Color Primario */
  --color-primary: #2563eb;
  --color-primary-light: #60a5fa;    /* Azul +20% brillo */
  --color-primary-dark: #1e40af;     /* Azul -20% brillo */
  --color-primary-rgb: 37, 99, 235;  /* RGB del azul */
  
  /* Color Secundario */
  --color-secondary: #f97316;
  --color-secondary-light: #fb923c;  /* Naranja +20% */
  --color-secondary-dark: #ea580c;   /* Naranja -20% */
  
  /* Color de Acento */
  --color-accent: #10b981;
  --color-accent-light: #34d399;     /* Verde +20% */
  --color-accent-dark: #059669;      /* Verde -20% */
}
```

---

## 🚀 RESULTADO ESPERADO

Después de seguir estos pasos:

✅ **Navbar:** Muestra tu logo en lugar del icono 🎮  
✅ **Favicon:** Muestra tu ícono en la pestaña del navegador  
✅ **Colores:** Toda la app usa los colores de tu logo  
✅ **Degradados:** Los fondos combinan con tu branding  
✅ **Botones:** Usan tu color primario y acento  
✅ **Estados:** Success/Warning/Danger mantienen colores estándar  

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **El logo no aparece:**
1. Verifica que el archivo esté en `/public/images/logos/`
2. Verifica que cambiaste `false → true` en `AppLogo.vue`
3. Refresca la página con `Ctrl + F5` (limpiar caché)

### **Los colores no cambian:**
1. Verifica que guardaste `theme.css`
2. Asegúrate de que `main.ts` importa `theme.css` (ya está configurado)
3. Refresca la página

### **El favicon no se ve:**
1. Los favicons a veces tardan en actualizarse
2. Cierra completamente el navegador y vuelve a abrir
3. Limpia la caché del navegador

---

## 📞 SIGUIENTE PASO

**Una vez que subas tu logo, comparte:**

1. ✅ Confirmación de que los archivos están en `/public/images/logos/`
2. ✅ Los 3-5 códigos HEX de colores principales
3. ✅ Screenshot del logo (para verificar visualmente)

**Entonces actualizaré automáticamente:**
- Variables CSS con tus colores exactos
- Versiones claras y oscuras optimizadas
- Degradados que combinen perfectamente
- Theme color del navegador

---

## 🎨 ARCHIVOS PREPARADOS

Ya están creados y listos:

✅ `/public/images/logos/` → Carpeta para tus logos  
✅ `AppLogo.vue` → Componente reutilizable del logo  
✅ `theme.css` → Variables CSS centralizadas  
✅ `Navbar.vue` → Actualizado para usar AppLogo  
✅ `index.html` → Meta tags y favicon configurados  
✅ `main.ts` → Importa theme.css automáticamente  

**¡Solo falta que subas tu logo y me des los colores!** 🚀
