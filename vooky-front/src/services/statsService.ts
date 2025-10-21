import api from '@/config/api';

export interface PublicStats {
  active_users: number;
  available_courses: number;
  satisfaction_rate: number;
  completed_lessons: number;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
  };
  courses: {
    total: number;
    with_enrollments: number;
  };
  lessons: {
    total: number;
    completed: number;
    in_progress: number;
  };
  engagement: {
    total_enrollments: number;
    completion_rate: number;
    average_accuracy: number;
  };
  recent_activity: {
    last_7_days: number;
    today: number;
  };
}

/**
 * Obtener estadísticas públicas de la plataforma
 */
export async function getPublicStats(): Promise<PublicStats> {
  const response = await api.get('/stats/public');
  return response.data;
}

/**
 * Obtener estadísticas del dashboard (solo admin)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/stats/dashboard');
  return response.data;
}
