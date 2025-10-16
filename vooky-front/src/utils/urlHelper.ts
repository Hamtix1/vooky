/**
 * Helper para construir URLs completas desde rutas relativas del backend
 * Usa la variable de entorno VITE_API_BASE_URL configurada en .env
 */

/**
 * Obtiene la URL base del API sin el sufijo /api/
 * Ejemplo: http://vooky.test/api/ -> http://vooky.test
 */
export function getBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL as string;
  if (!apiUrl) {
    console.warn('VITE_API_BASE_URL no está definida en el archivo .env');
    return '';
  }
  return apiUrl.replace(/\/api\/?$/, '');
}

/**
 * Convierte una URL relativa del storage de Laravel a una URL completa
 * @param url - URL relativa (ej: /storage/images/foto.jpg) o completa (ej: http://...)
 * @returns URL completa
 */
export function getFullUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Si ya es una URL completa, retornarla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const baseUrl = getBaseUrl();
  
  // Si la URL comienza con /, agregarla directamente
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  
  // Si no, agregar / antes
  return `${baseUrl}/${url}`;
}

/**
 * Alias específico para URLs de imágenes
 * @param url - URL de imagen relativa o completa
 * @returns URL completa de la imagen
 */
export function getImageUrl(url: string | null | undefined): string {
  return getFullUrl(url);
}

/**
 * Alias específico para URLs de audio
 * @param url - URL de audio relativa o completa
 * @returns URL completa del audio
 */
export function getAudioUrl(url: string | null | undefined): string {
  return getFullUrl(url);
}
