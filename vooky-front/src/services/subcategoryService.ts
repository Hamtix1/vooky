import api from '@/config/api';

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  course_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface SubcategoryFormData {
  name: string;
  description?: string;
}

/**
 * Obtener todas las subcategorías de un curso
 */
export async function getSubcategoriesByCourse(courseSlug: string): Promise<Subcategory[]> {
  const response = await api.get(`/courses/${courseSlug}/subcategories`);
  return response.data;
}

/**
 * Crear una nueva subcategoría
 */
export async function createSubcategory(courseSlug: string, data: SubcategoryFormData): Promise<Subcategory> {
  const response = await api.post(`/courses/${courseSlug}/subcategories`, data);
  return response.data.subcategory;
}

/**
 * Actualizar una subcategoría
 */
export async function updateSubcategory(courseSlug: string, subcategoryId: number, data: SubcategoryFormData): Promise<Subcategory> {
  const response = await api.put(`/courses/${courseSlug}/subcategories/${subcategoryId}`, data);
  return response.data.subcategory;
}

/**
 * Eliminar una subcategoría
 */
export async function deleteSubcategory(courseSlug: string, subcategoryId: number): Promise<void> {
  await api.delete(`/courses/${courseSlug}/subcategories/${subcategoryId}`);
}
