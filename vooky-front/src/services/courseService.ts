import api from "@/config/api";

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export enum ContentType {
  Combinado = 'Combinado',
  EnlaceCategorias = 'Enlace de categorías',
  Mixto = 'Mixto',
}

// --- INTERFACES (Definen la "forma" de los datos que recibes) ---

export interface Lesson {
  id: number;
  title: string;
  content_type: ContentType;
  dia?: number | null;
}

export interface Image {
  id: number;
  url: string;
  audio_url: string;
  description: string;
  dia: number;
  category_id: number;
  level_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Level {
  id: number;
  title: string;
  description: string | null;
  lessons?: Lesson[];
  images?: Image[];
}

export interface Course {
  id: number;
  title: string;
  slug: string; // <-- Añadir esta línea
  description: string;
  created_at?: string; // <-- Añadido para coincidir con la nueva respuesta
  levels?: Level[];
}

// --- PAYLOADS (Definen la "forma" de los datos que envías) ---

export interface CoursePayload {
  title: string;
  description?: string;
}

export interface LevelPayload {
  title: string;
  description?: string;
}

export interface LessonPayload {
  title: string;
  content_type: ContentType;
  dia?: number | null;
}

// --- FUNCIONES DE SERVICIO ---

/**
 * Obtiene la lista completa de cursos. Gracias a la configuración del backend,
 * cada curso ya incluye un array con sus niveles.
 */
export const getCourses = async (): Promise<Course[]> => {
  try {
    const { data } = await api.get<ApiResponse<Course[]>>("/courses");
    return data.data;
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    throw error;
  }
};

/**
 * Obtiene un único curso por su ID. Gracias a la configuración del backend,
 * la respuesta incluye los niveles y las lecciones anidadas.
 */
export const getCourseById = async (courseId: number): Promise<Course> => {
  try {
    // Asumimos que la respuesta para un solo curso también viene envuelta
    const { data } = await api.get<ApiResponse<Course>>(`/courses/${courseId}`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener el curso con ID ${courseId}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo curso.
 */
export const createCourse = async (courseData: CoursePayload): Promise<Course> => {
  try {
    const { data } = await api.post<ApiResponse<Course>>('/courses', courseData);
    return data.data;
  } catch (error) {
    console.error("Error al crear el curso:", error);
    throw error;
  }
};

/**
 * Elimina un curso por su ID.
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
  try {
    await api.delete(`/courses/${courseId}`);
  } catch (error) {
    console.error(`Error al eliminar el curso ${courseId}:`, error);
    throw error;
  }
};

/**
 * Obtiene específicamente los niveles de un curso.
 */
export const getCourseLevels = async (courseId: number): Promise<Level[]> => {
  try {
    const { data } = await api.get<ApiResponse<Level[]>>(`/courses/${courseId}/levels`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener los niveles del curso ${courseId}:`, error);
    throw error;
  }
};

/**
 * Obtiene los datos de un curso específico por su slug.
 * @param slug - El slug del curso a obtener.
 * @returns Una promesa que se resuelve con los datos del curso.
 */
export const getCourseBySlug = async (slug: string): Promise<Course> => {
  try {
    const { data } = await api.get<ApiResponse<Course>>(`/courses/${slug}`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener el curso con slug ${slug}:`, error);
    // Lanza el error para que el componente que llama pueda manejarlo.
    throw error;
  }
};

/**
 * Actualiza un curso existente.
 * @param slug - El slug del curso a actualizar.
 * @param courseData - Un objeto con los campos del curso a modificar.
 * @returns Una promesa que se resuelve con los datos del curso actualizado.
 */
export const updateCourse = async (slug: string, courseData: Partial<Course>): Promise<Course> => {
  try {
    const { data } = await api.put<ApiResponse<Course>>(`/courses/${slug}`, courseData);
    return data.data;
  } catch (error) {
    console.error(`Error al actualizar el curso con slug ${slug}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo nivel para un curso específico.
 * @param courseSlug - El slug del curso al que pertenece el nivel.
 * @param levelData - El contenido del nivel a crear.
 * @returns Una promesa que se resuelve con los datos del nivel creado.
 */
export const createLevel = async (courseSlug: string, levelData: LevelPayload): Promise<Level> => {
  try {
    // NOTA: Esto asume que el endpoint del backend ahora acepta un slug en lugar de un ID.
    const { data } = await api.post<ApiResponse<Level>>(`/courses/${courseSlug}/levels`, levelData);
    return data.data;
  } catch (error) {
    console.error(`Error al crear un nivel para el curso con slug ${courseSlug}:`, error);
    throw error;
  }
};

/**
 * Actualiza un nivel existente.
 */
export const updateLevel = async (courseSlug: string, levelId: number, levelData: LevelPayload): Promise<Level> => {
  try {
    const { data } = await api.put<ApiResponse<Level>>(`/courses/${courseSlug}/levels/${levelId}`, levelData);
    return data.data;
  } catch (error) {
    console.error(`Error al actualizar el nivel ${levelId}:`, error);
    throw error;
  }
};

/**
 * Elimina un nivel de un curso.
 */
export const deleteLevel = async (courseSlug: string, levelId: number): Promise<void> => {
  try {
    await api.delete(`/courses/${courseSlug}/levels/${levelId}`);
  } catch (error) {
    console.error(`Error al eliminar el nivel ${levelId} del curso ${courseSlug}:`, error);
    throw error;
  }
};

/**
 * Elimina una lección de un nivel.
 */
export const deleteLesson = async (levelId: number, lessonId: number): Promise<void> => {
  try {
    await api.delete(`/levels/${levelId}/lessons/${lessonId}`);
  } catch (error) {
    console.error(`Error al eliminar la lección ${lessonId} del nivel ${levelId}:`, error);
    throw error;
  }
};

/**
 * Obtiene una lección específica.
 */
export const getLesson = async (levelId: string, lessonId: string): Promise<Lesson> => {
  try {
    const { data } = await api.get<ApiResponse<Lesson>>(`/levels/${levelId}/lessons/${lessonId}`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener la lección ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Actualiza una lección existente.
 */
export const updateLesson = async (levelId: string, lessonId: string, lessonData: LessonPayload): Promise<Lesson> => {
  try {
    const { data } = await api.put<ApiResponse<Lesson>>(`/levels/${levelId}/lessons/${lessonId}`, lessonData);
    return data.data;
  } catch (error) {
    console.error(`Error al actualizar la lección ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Obtiene un nivel específico con sus lecciones e imágenes.
 */
// Nota: No existe endpoint plano GET /levels/:id en el backend actual.
// Para obtener información de un nivel, usa getCourseBySlug y filtra por levelId.

/**
 * Crea una nueva lección para un nivel específico.
 */
export const createLesson = async (levelId: number, lessonData: LessonPayload): Promise<Lesson> => {
  try {
    const { data } = await api.post<ApiResponse<Lesson>>(`/levels/${levelId}/lessons`, lessonData);
    return data.data;
  } catch (error) {
    console.error(`Error al crear una lección para el nivel ${levelId}:`, error);
    throw error;
  }
};

/**
 * Uploads media (image or audio) associated with a lesson.
 */
export const uploadMedia = async (
    file: File,
    description: string,
    levelId: number,
    dia: number,
    category: string
): Promise<Image> => {
    const formData = new FormData();
    formData.append('url', file);
    formData.append('description', description);
    formData.append('level_id', String(levelId));
    formData.append('dia', String(dia));
    formData.append('category', category);

    try {
        const { data } = await api.post<ApiResponse<Image>>('/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.data;
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        throw error;
    }
};
