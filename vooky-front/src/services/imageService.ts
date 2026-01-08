import api from '@/config/api';

export interface Image {
  id: number;
  url: string;
  audio_url: string;
  description?: string;
  dia: number;
  level_id: number;
  category_id: number;
  subcategories?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Eliminar una imagen
 */
export async function deleteImage(imageId: number): Promise<void> {
  await api.delete(`/images/${imageId}`);
}

/**
 * Actualizar una imagen existente
 */
export async function updateImage(imageId: number, formData: FormData): Promise<Image> {
  const response = await api.post(`/images/${imageId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      _method: 'PUT' // Laravel method spoofing
    }
  });
  return response.data;
}
