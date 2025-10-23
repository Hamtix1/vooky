import api from '@/config/api';

export interface TuitionFee {
  id: number;
  enrollment_id: number;
  amount: string;
  due_date: string;
  paid_at: string | null;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  enrollment: {
    id: number;
    user_id: number;
    course_id: number;
    status: 'active' | 'inactive' | 'pending';
    enrolled_at: string;
    course: {
      id: number;
      title: string;
      description: string;
      monthly_fee: string;
      requires_payment: boolean;
    };
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface TuitionFeeStatistics {
  total_fees: number;
  pending: number;
  paid: number;
  overdue: number;
  total_amount: {
    pending: string;
    paid: string;
    overdue: string;
  };
  this_month: {
    pending: number;
    paid: number;
  };
}

/**
 * Obtener todas las matrículas del usuario autenticado
 */
export async function getUserFees(): Promise<TuitionFee[]> {
  const response = await api.get('/tuition-fees');
  return response.data;
}

/**
 * Obtener matrículas pendientes del usuario autenticado
 */
export async function getUserPendingFees(): Promise<TuitionFee[]> {
  const response = await api.get('/tuition-fees/pending');
  return response.data;
}

/**
 * Obtener todas las matrículas (admin)
 */
export async function getAllFees(filters?: {
  status?: string;
  user_id?: number;
  course_id?: number;
}): Promise<TuitionFee[]> {
  const response = await api.get('/admin/tuition-fees', { params: filters });
  return response.data;
}

/**
 * Crear matrícula manualmente (admin)
 */
export async function createFee(data: {
  enrollment_id: number;
  amount: number;
  due_date: string;
}): Promise<TuitionFee> {
  const response = await api.post('/admin/tuition-fees', data);
  return response.data.fee;
}

/**
 * Actualizar matrícula (admin)
 */
export async function updateFee(
  feeId: number,
  data: Partial<{
    amount: number;
    due_date: string;
    status: string;
    payment_method: string;
    notes: string;
  }>
): Promise<TuitionFee> {
  const response = await api.put(`/admin/tuition-fees/${feeId}`, data);
  return response.data.fee;
}

/**
 * Marcar matrícula como pagada (admin)
 */
export async function markFeeAsPaid(
  feeId: number,
  data?: {
    payment_method?: string;
    notes?: string;
  }
): Promise<TuitionFee> {
  const response = await api.post(`/admin/tuition-fees/${feeId}/mark-paid`, data || {});
  return response.data.fee;
}

/**
 * Eliminar matrícula (admin)
 */
export async function deleteFee(feeId: number): Promise<void> {
  await api.delete(`/admin/tuition-fees/${feeId}`);
}

/**
 * Obtener estadísticas de matrículas (admin)
 */
export async function getFeeStatistics(): Promise<TuitionFeeStatistics> {
  const response = await api.get('/admin/tuition-fees/statistics');
  return response.data;
}
