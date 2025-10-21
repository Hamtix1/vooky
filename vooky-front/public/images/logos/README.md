# IMPORTANTE: Coloca tus archivos de logo aquí

## 📁 Estructura Recomendada:

```
logos/
├── logo-full.png       ← Logo completo (con texto) - REQUERIDO
├── logo-icon.png       ← Solo el ícono/símbolo - REQUERIDO
├── logo-light.png      ← Versión para fondos oscuros (opcional)
├── logo-dark.png       ← Versión para fondos claros (opcional)
├── logo-full.svg       ← Versión vectorial (opcional pero recomendado)
└── logo-icon.svg       ← Ícono vectorial (opcional)
```

## 📏 Especificaciones:

### Logo Completo (logo-full.png)
- **Formato:** PNG con transparencia
- **Tamaño recomendado:** 400-600px de ancho
- **Altura:** Proporcional (máx 200px)
- **Uso:** Navbar, Login, Footer

### Logo Ícono (logo-icon.png)
- **Formato:** PNG con transparencia
- **Tamaño recomendado:** 512x512px o 256x256px
- **Aspecto:** Cuadrado
- **Uso:** Favicon, App Icons, Loading

## 🎨 Formatos Soportados:
- PNG (recomendado - con transparencia)
- SVG (óptimo - escala perfecta)
- JPG (solo si el logo tiene fondo)

## ⚠️ DESPUÉS DE SUBIR:

1. Actualiza `AppLogo.vue` (línea 76): cambia `false` → `true`
2. Actualiza `theme.css` con los colores de tu logo
3. Refresca el navegador con `Ctrl + F5`

Ver: LOGO_QUICK_START.md para instrucciones completas
