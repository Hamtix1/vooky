import api from '@/config/api';

export interface Category {
  id: number;
  course_id: number;
  name: string;
}

interface ApiResponse<T> {
  data: T;
}

/**
 * Obtiene las categorías de un curso específico
 */
export async function getCategoriesByCourse(courseSlug: string): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>(`/courses/${courseSlug}/categories`);
  return response.data.data || response.data;
}

/**
 * Crea una nueva categoría para un curso específico
 */
export async function createCategory(courseSlug: string, name: string): Promise<Category> {
  const response = await api.post<ApiResponse<Category>>(`/courses/${courseSlug}/categories`, { name });
  return response.data.data || response.data;
}

/**
 * Actualiza una categoría de un curso
 */
export async function updateCategory(courseSlug: string, categoryId: number, name: string): Promise<Category> {
  const response = await api.put<ApiResponse<Category>>(`/courses/${courseSlug}/categories/${categoryId}`, { name });
  return response.data.data || response.data;
}

/**
 * Elimina una categoría de un curso
 */
export async function deleteCategory(courseSlug: string, categoryId: number): Promise<void> {
  await api.delete(`/courses/${courseSlug}/categories/${categoryId}`);
}
