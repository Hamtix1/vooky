import api from '@/config/api';
import type { Badge, UserBadge } from '@/types/badge';

export async function getBadges(): Promise<Badge[]> {
  const response = await api.get('/badges');
  return response.data;
}

export async function getBadge(id: number): Promise<Badge> {
  const response = await api.get(`/badges/${id}`);
  return response.data;
}

export async function getBadgesByCourse(courseId: number): Promise<Badge[]> {
  const response = await api.get(`/courses/${courseId}/badges`);
  return response.data;
}

export async function createBadge(data: FormData): Promise<Badge> {
  const response = await api.post('/badges', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function updateBadge(id: number, data: FormData): Promise<Badge> {
  const response = await api.post(`/badges/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteBadge(id: number): Promise<void> {
  await api.delete(`/badges/${id}`);
}

export async function getUserBadges(userId?: number): Promise<UserBadge[]> {
  const endpoint = userId ? `/users/${userId}/badges` : '/profile/badges';
  const response = await api.get(endpoint);
  return response.data;
}
