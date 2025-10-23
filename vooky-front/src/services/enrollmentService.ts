import api from '@/config/api';

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'active' | 'inactive' | 'pending';
  enrolled_at: string;
  expires_at: string | null;
  custom_monthly_fee: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  course?: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    monthly_fee: number;
    requires_payment: boolean;
  };
}

export interface EnrollmentFilters {
  status?: 'active' | 'inactive' | 'pending';
  user_id?: number;
  course_id?: number;
}

// [ADMIN] Obtener todas las inscripciones
export async function getAllEnrollments(filters?: EnrollmentFilters): Promise<Enrollment[]> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.user_id) params.append('user_id', filters.user_id.toString());
  if (filters?.course_id) params.append('course_id', filters.course_id.toString());
  
  const queryString = params.toString();
  const url = queryString ? `admin/enrollments?${queryString}` : 'admin/enrollments';
  
  const response = await api.get(url);
  return response.data;
}

// [ADMIN] Inscribir un usuario en un curso
export async function enrollUser(userId: number, courseId: number, customMonthlyFee?: number): Promise<Enrollment> {
  const response = await api.post('admin/enrollments', {
    user_id: userId,
    course_id: courseId,
    custom_monthly_fee: customMonthlyFee
  });
  return response.data.enrollment;
}

// [ADMIN] Desinscribir un usuario de un curso
export async function unenrollUser(userId: number, courseId: number): Promise<void> {
  await api.delete('admin/enrollments', {
    data: {
      user_id: userId,
      course_id: courseId
    }
  });
}

// [ADMIN] Actualizar el estado de una inscripción
export async function updateEnrollmentStatus(enrollmentId: number, status: 'active' | 'inactive' | 'pending'): Promise<Enrollment> {
  const response = await api.put(`admin/enrollments/${enrollmentId}/status`, { status });
  return response.data.enrollment;
}

// [USER] Obtener mis inscripciones
export async function getMyEnrollments(): Promise<Enrollment[]> {
  const response = await api.get('my-enrollments');
  return response.data;
}
