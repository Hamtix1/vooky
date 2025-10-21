import api from '@/config/api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface UserStats {
  global_score: number;
  completed_lessons: number;
  average_accuracy: number;
}

export interface ProfileResponse {
  user: UserProfile;
  stats: UserStats;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface RankingUser {
  position: number;
  id: number;
  name: string;
  total_score: number;
  completed_lessons: number;
  average_accuracy: number;
}

export interface RankingResponse {
  ranking: RankingUser[];
}

export interface MyRankingResponse {
  position: number;
  total_score: number;
}

/**
 * Obtener perfil del usuario autenticado con estadísticas
 */
export async function getProfile(): Promise<ProfileResponse> {
  const response = await api.get('/profile');
  return response.data;
}

/**
 * Actualizar perfil del usuario (nombre, email, contraseña)
 */
export async function updateProfile(data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> {
  const response = await api.put('/profile', data);
  return response.data;
}

/**
 * Obtener ranking global de los mejores 10 usuarios
 */
export async function getRanking(): Promise<RankingResponse> {
  const response = await api.get('/ranking');
  return response.data;
}

/**
 * Obtener posición del usuario autenticado en el ranking
 */
export async function getMyRanking(): Promise<MyRankingResponse> {
  const response = await api.get('/profile/ranking');
  return response.data;
}
