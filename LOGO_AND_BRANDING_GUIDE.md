# 📁 Guía de Logos y Branding - Vooky

## 🎨 Dónde Colocar tu Logo

### **Ubicación Principal del Logo**

Coloca tu logo en una de estas carpetas:

#### **Opción 1: Public (Recomendado para logos)**
```
📁 vooky-front/public/images/logos/
  ├── logo-full.png          ← Logo completo con texto
  ├── logo-full.svg          ← Versión SVG (mejor calidad)
  ├── logo-icon.png          ← Solo el ícono/símbolo
  ├── logo-icon.svg          ← Ícono en SVG
  ├── logo-light.png         ← Versión para fondos oscuros
  └── logo-dark.png          ← Versión para fondos claros
```

#### **Opción 2: Assets (Para logos procesados por Vite)**
```
📁 vooky-front/src/assets/images/
  └── (mismos archivos que arriba)
```

---

## 📐 Formatos Recomendados

### **1. Logo Completo** (con texto)
- **Tamaño:** 400px - 600px de ancho
- **Formatos:** PNG (transparente) y SVG
- **Uso:** Navbar, Login, Splash Screen

### **2. Logo Ícono** (solo símbolo)
- **Tamaño:** 256x256px o 512x512px
- **Formatos:** PNG (transparente) y SVG
- **Uso:** Favicon, App Icons, Loading States

### **3. Variantes de Color**
- **Light:** Para usar sobre fondos oscuros
- **Dark:** Para usar sobre fondos claros
- **Monocromo:** Versión en blanco/negro

---

## 🎯 Dónde Aparecerá el Logo

### **1. Navbar Principal**
```vue
📄 vooky-front/src/components/layout/Navbar.vue
Línea: ~15-25 (Logo en esquina superior izquierda)

Actual:
<div class="logo">Vooky</div>

Actualizar a:
<img src="/images/logos/logo-full.png" alt="Vooky" class="logo-img">
```

### **2. Página de Login**
```vue
📄 vooky-front/src/pages/auth/LoginPage.vue
Línea: ~10-20 (Centro superior del formulario)

Agregar:
<div class="login-logo">
  <img src="/images/logos/logo-full.png" alt="Vooky">
</div>
```

### **3. Favicon (Pestaña del navegador)**
```html
📄 vooky-front/index.html
Línea: ~6-10

Actualizar:
<link rel="icon" type="image/png" href="/images/logos/logo-icon.png">
```

### **4. Loading Screen**
```vue
📄 vooky-front/src/App.vue
Agregar componente de carga con logo animado
```

### **5. Game Over / Results Screen**
```vue
📄 vooky-front/src/components/game/LessonGame.vue
Agregar logo sutil en esquina o watermark
```

---

## 🎨 Extracción de Colores del Logo

### **Paso 1: Subir el Logo**
Una vez que subas tu logo a `/public/images/logos/`, necesitaremos extraer la paleta de colores.

### **Paso 2: Identificar Colores**
Busca los siguientes colores en tu logo:

```
🎨 Color Primario (principal del logo):
   Ejemplo: #3498db → Actualizar var(--color-primary)

🎨 Color Secundario (acento/complemento):
   Ejemplo: #9b59b6 → Actualizar var(--color-secondary)

🎨 Color de Acento (CTAs/botones):
   Ejemplo: #e74c3c → Actualizar var(--color-accent)
```

### **Paso 3: Actualizar Variables CSS**
Editar `vooky-front/src/assets/styles/theme.css`:

```css
:root {
  /* Reemplazar con colores de tu logo */
  --color-primary: #TU_COLOR_PRINCIPAL;
  --color-primary-light: #VERSION_CLARA;
  --color-primary-dark: #VERSION_OSCURA;
  
  --color-secondary: #TU_COLOR_SECUNDARIO;
  --color-accent: #TU_COLOR_ACENTO;
}
```

---

## 🛠️ Herramientas para Extraer Colores

### **Opción 1: Online (Recomendado)**
- **Coolors.co** → https://coolors.co/image-picker
  * Sube tu logo y genera paleta automática
  
- **Adobe Color** → https://color.adobe.com/create/image
  * Extrae paletas profesionales

### **Opción 2: Software**
- **GIMP / Photoshop:** Usar herramienta de cuentagotas
- **Figma:** Importar logo y usar color picker

### **Opción 3: Código (VS Code)**
- **ColorPick Eyedropper Extension**
  * Selecciona colores directamente de imágenes

---

## 📝 Checklist de Implementación

### **Subir Logos:**
- [ ] Logo completo PNG en `/public/images/logos/logo-full.png`
- [ ] Logo completo SVG en `/public/images/logos/logo-full.svg` (opcional)
- [ ] Logo ícono PNG en `/public/images/logos/logo-icon.png`
- [ ] Variante light (si logo es oscuro)
- [ ] Variante dark (si logo es claro)

### **Extraer Colores:**
- [ ] Identificar color primario del logo
- [ ] Identificar color secundario
- [ ] Identificar color de acento
- [ ] Generar versiones claras de cada color (+20% brillo)
- [ ] Generar versiones oscuras de cada color (-20% brillo)

### **Actualizar CSS:**
- [ ] Editar `theme.css` con colores nuevos
- [ ] Actualizar `--color-primary` y variantes
- [ ] Actualizar `--color-secondary` y variantes
- [ ] Actualizar `--color-accent` y variantes
- [ ] Actualizar degradados si es necesario

### **Implementar Logo en Componentes:**
- [ ] Navbar principal
- [ ] Login page
- [ ] Favicon en `index.html`
- [ ] Loading screen
- [ ] Footer (si aplica)
- [ ] Error pages (404, etc.)

---

## 🎨 Ejemplo de Paleta (Ajustar con tu Logo)

```css
/* Ejemplo: Logo con azul y naranja */
:root {
  /* Color Primario - Azul del logo */
  --color-primary: #2563eb;        /* Azul principal */
  --color-primary-light: #60a5fa;  /* Azul claro */
  --color-primary-dark: #1e40af;   /* Azul oscuro */
  
  /* Color Secundario - Naranja del logo */
  --color-secondary: #f97316;      /* Naranja */
  --color-secondary-light: #fb923c;
  --color-secondary-dark: #ea580c;
  
  /* Color de Acento - Verde (complementario) */
  --color-accent: #10b981;
  
  /* Degradado Hero usando colores del logo */
  --gradient-hero: linear-gradient(135deg, #2563eb 0%, #f97316 100%);
}
```

---

## 📸 Capturas Recomendadas para Compartir

Después de implementar, toma screenshots de:

1. **Navbar con logo**
2. **Login page con logo**
3. **Game UI con branding**
4. **Mobile view con logo**
5. **Favicon en pestaña del navegador**

---

## 🚀 Próximos Pasos

1. **Ahora:** Sube tu logo a `/public/images/logos/`
2. **Después:** Extrae 3-5 colores principales
3. **Luego:** Comparte los códigos HEX de los colores
4. **Finalmente:** Actualizaré todo el tema automáticamente

---

## 💡 Tips de Branding

### **Consistencia:**
- Usa el mismo logo en todas las páginas
- Mantén proporciones consistentes
- Usa las variantes correctas (light/dark) según el fondo

### **Optimización:**
- Comprime PNGs con TinyPNG
- Usa SVG cuando sea posible (mejor calidad)
- Mantén tamaños razonables (<100KB)

### **Accesibilidad:**
- Asegúrate de que el logo tenga buen contraste
- Incluye atributo `alt` descriptivo
- Prueba en modo oscuro

---

## 📞 Siguiente Acción

**¡Sube tu logo ahora!**

Colócalo en:
```
📁 c:\laragon\www\vooky\vooky-front\public\images\logos\
```

Y luego comparte:
1. Los colores principales (códigos HEX)
2. Si prefieres usar el logo en navbar, login, o ambos
3. Si tienes variantes light/dark

¡Entonces actualizaré todo el tema para que combine perfectamente con tu logo! 🎨
