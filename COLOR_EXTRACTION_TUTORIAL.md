# 🎨 Tutorial: Cómo Extraer Colores de tu Logo

## Método 1: Coolors.co (Recomendado - Más Fácil)

### **Paso a Paso:**

1. **Abre el sitio:**
   ```
   https://coolors.co/image-picker
   ```

2. **Sube tu logo:**
   - Click en "Browse image"
   - Selecciona tu archivo `logo-full.png`
   - Espera a que cargue

3. **Extrae la paleta:**
   - El sitio generará automáticamente una paleta de 5 colores
   - Verás algo como:
   ```
   #2563eb  #60a5fa  #1e40af  #f97316  #10b981
   ```

4. **Ajusta si es necesario:**
   - Puedes hacer click en cada color para ajustarlo
   - Usa el slider de saturación/luminosidad
   - Click en "Export" → "Copy URL" para guardar

5. **Identifica tu paleta:**
   ```
   Color más oscuro → Primario Dark
   Color medio → Primario
   Color más claro → Primario Light
   Otros colores → Secundario, Acento
   ```

---

## Método 2: Adobe Color (Más Profesional)

### **Paso a Paso:**

1. **Abre el sitio:**
   ```
   https://color.adobe.com/create/image
   ```

2. **Sube tu logo:**
   - Click en "Upload image"
   - Selecciona tu logo

3. **Selecciona modo de color:**
   - Colorful (recomendado)
   - Bright
   - Muted
   - Deep
   - Dark

4. **Copia los códigos HEX:**
   - Verás 5 colores generados
   - Click en cada uno para copiar el código HEX
   - Ejemplo: `#2563EB`

---

## Método 3: Photoshop / GIMP

### **En Photoshop:**

1. Abre tu logo en Photoshop
2. Selecciona la herramienta "Eyedropper" (Cuentagotas) - Tecla `I`
3. Haz click en cada color importante de tu logo
4. El color seleccionado aparece en el panel "Color"
5. Copia el código HEX que aparece (ejemplo: `#2563EB`)

### **En GIMP (Gratis):**

1. Abre tu logo en GIMP
2. Ve a: Windows → Dockable Dialogs → Colors
3. Selecciona la herramienta "Color Picker" (Pipeta)
4. Haz click en cada color de tu logo
5. El código HEX aparece en el panel de colores
6. Copia el código (formato: `2563eb` → agrega `#` al inicio)

---

## Método 4: VS Code Extension

### **Usar ColorPick Eyedropper:**

1. **Instalar extensión:**
   - Abre VS Code
   - Ve a Extensions (`Ctrl + Shift + X`)
   - Busca "ColorPick Eyedropper"
   - Instala

2. **Usar:**
   - Abre tu logo en VS Code
   - Presiona `Ctrl + Shift + P`
   - Escribe "ColorPick"
   - Selecciona "ColorPick: Pick Color from Screen"
   - Click en el color de tu logo
   - El código HEX se copiará automáticamente

---

## Método 5: Navegador Web (Rápido)

### **Usando DevTools de Chrome:**

1. Arrastra tu logo a una pestaña del navegador
2. Presiona `F12` para abrir DevTools
3. Click en "Elements"
4. Inspecciona la imagen
5. En "Styles", verás opciones de color
6. O usa extensión "ColorZilla":
   - Instala desde Chrome Web Store
   - Click en el ícono de ColorZilla
   - Click en "Pick Color from Page"
   - Click en el color deseado del logo

---

## 🎯 Identificar los 3 Colores Principales

### **Regla General:**

```
1. COLOR PRIMARIO (Principal)
   → El color que más se repite en tu logo
   → El que define tu marca
   → Usualmente el más oscuro o llamativo
   
2. COLOR SECUNDARIO (Complemento)
   → El segundo color más importante
   → Complementa al primario
   → A menudo es un contraste
   
3. COLOR ACENTO (Destacado)
   → Para elementos que necesitan atención
   → Botones, CTAs, badges
   → Puede ser el más brillante
```

### **Ejemplo con Logo de Ejemplo:**

```
Logo tiene: Azul oscuro, Azul claro, Naranja

Identificación:
├─ Primario: Azul oscuro (#1e40af) ← Más prominente
├─ Secundario: Azul claro (#60a5fa) ← Complemento
└─ Acento: Naranja (#f97316) ← Para destacar
```

---

## 🌈 Generar Versiones Claras y Oscuras

### **Método Automático (Coolors.co):**

1. Entra a: https://coolors.co/2563eb
   (Reemplaza `2563eb` con tu color)

2. Verás tu color en el centro

3. **Para versión CLARA:**
   - Mueve el slider "Lightness" hacia arriba (+20%)
   - Copia el nuevo código HEX

4. **Para versión OSCURA:**
   - Mueve el slider "Lightness" hacia abajo (-20%)
   - Copia el nuevo código HEX

### **Método Manual (Calculadora):**

Si tu color es: `#2563eb`

1. Convierte a HSL: 
   - Usa: https://www.rapidtables.com/convert/color/hex-to-hsl.html
   - Resultado: `hsl(221, 83%, 53%)`

2. **Para versión CLARA:**
   - Suma 20 al valor L (Lightness)
   - `hsl(221, 83%, 73%)` → Convierte a HEX → `#60a5fa`

3. **Para versión OSCURA:**
   - Resta 20 al valor L
   - `hsl(221, 83%, 33%)` → Convierte a HEX → `#1e40af`

---

## 🔢 Convertir HEX a RGB

### **Método Online:**

1. Usa: https://www.rapidtables.com/convert/color/hex-to-rgb.html
2. Ingresa tu color HEX: `#2563eb`
3. Obtienes: `rgb(37, 99, 235)`
4. Copia solo los números: `37, 99, 235`

### **Método Manual:**

```
HEX: #2563eb

Divide en pares:
25 → Convierte a decimal → 37 (R)
63 → Convierte a decimal → 99 (G)
eb → Convierte a decimal → 235 (B)

Resultado: 37, 99, 235
```

---

## 📋 Plantilla para Copiar

### **Completa esta plantilla con tus colores:**

```css
/* ==================================
   MIS COLORES DE MARCA
   ================================== */

/* COLOR PRIMARIO */
--color-primary: #______;        /* Tu color principal aquí */
--color-primary-light: #______;  /* Versión +20% brillo */
--color-primary-dark: #______;   /* Versión -20% brillo */
--color-primary-rgb: ___, ___, ___; /* RGB del color primario */

/* COLOR SECUNDARIO */
--color-secondary: #______;      /* Tu color secundario aquí */
--color-secondary-light: #______; /* +20% brillo */
--color-secondary-dark: #______;  /* -20% brillo */

/* COLOR ACENTO */
--color-accent: #______;         /* Tu color de acento aquí */
--color-accent-light: #______;   /* +20% brillo */
--color-accent-dark: #______;    /* -20% brillo */
```

---

## 🎨 Ejemplo Completo

### **Logo con Azul, Naranja y Verde:**

**Colores Extraídos:**
```
Azul primario:   #2563eb
Naranja:         #f97316  
Verde:           #10b981
```

**Paleta Completa Generada:**

```css
:root {
  /* COLOR PRIMARIO - Azul */
  --color-primary: #2563eb;
  --color-primary-light: #60a5fa;     /* Azul +20% brillo */
  --color-primary-dark: #1e40af;      /* Azul -20% brillo */
  --color-primary-rgb: 37, 99, 235;   /* RGB */
  
  /* COLOR SECUNDARIO - Naranja */
  --color-secondary: #f97316;
  --color-secondary-light: #fb923c;   /* Naranja +20% */
  --color-secondary-dark: #ea580c;    /* Naranja -20% */
  
  /* COLOR ACENTO - Verde */
  --color-accent: #10b981;
  --color-accent-light: #34d399;      /* Verde +20% */
  --color-accent-dark: #059669;       /* Verde -20% */
}
```

---

## ✅ Verificación Final

### **Checklist antes de implementar:**

- [ ] Tengo 3 colores identificados (Primario, Secundario, Acento)
- [ ] Generé versión CLARA de cada color (+20% brillo)
- [ ] Generé versión OSCURA de cada color (-20% brillo)
- [ ] Convertí el color primario a RGB
- [ ] Verifiqué que los códigos empiezan con `#`
- [ ] Verifiqué que son 6 caracteres después del `#`
- [ ] Probé los colores en: https://coolors.co/palette

---

## 🎯 Recursos Útiles

### **Herramientas Online:**
- **Coolors.co:** https://coolors.co/image-picker
- **Adobe Color:** https://color.adobe.com/create/image
- **HEX to RGB:** https://www.rapidtables.com/convert/color/hex-to-rgb.html
- **HEX to HSL:** https://www.rapidtables.com/convert/color/hex-to-hsl.html
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

### **Extensiones de Navegador:**
- **ColorZilla** (Chrome/Firefox): Eyedropper tool
- **ColorPick Eyedropper** (VS Code): Pick colors from screen

### **Software Gratuito:**
- **GIMP:** https://www.gimp.org/downloads/
- **Krita:** https://krita.org/en/download/

---

## 💡 Tips Profesionales

### **1. Contraste:**
Verifica que tus colores tengan buen contraste para accesibilidad:
```
Usa: https://webaim.org/resources/contrastchecker/
Mínimo: 4.5:1 para texto normal
Mínimo: 3:1 para texto grande
```

### **2. Armonía:**
Asegúrate de que tus colores funcionen juntos:
```
Colores análogos: Están cerca en el círculo cromático
Colores complementarios: Están opuestos
Tríada: Forman un triángulo equilátero
```

### **3. Consistencia:**
Usa los mismos colores en todos lados:
```
Logo → Variables CSS → UI Components → Marketing
```

---

## 📞 Siguiente Paso

**Una vez que tengas tus colores:**

1. Copia esta plantilla completa:
```css
/* COLOR PRIMARIO */
--color-primary: #TU_COLOR;
--color-primary-light: #VERSION_CLARA;
--color-primary-dark: #VERSION_OSCURA;
--color-primary-rgb: R, G, B;

/* COLOR SECUNDARIO */
--color-secondary: #TU_COLOR;
--color-secondary-light: #VERSION_CLARA;
--color-secondary-dark: #VERSION_OSCURA;

/* COLOR ACENTO */
--color-accent: #TU_COLOR;
--color-accent-light: #VERSION_CLARA;
--color-accent-dark: #VERSION_OSCURA;
```

2. Compártela conmigo completa

3. Yo la integraré en `theme.css`

4. ¡Tu app tendrá tu branding! 🎨
