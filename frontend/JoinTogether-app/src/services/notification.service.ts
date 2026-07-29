import api from './api';
import type { ApiResponse } from '../types/auth';
import type { ThongBao } from '../types/connection';

export const getNotificationsApi = async (limit = 20, offset = 0): Promise<ApiResponse<ThongBao[]>> => {
  const response = await api.get<ApiResponse<ThongBao[]>>('/notifications', { params: { limit, offset } });
  return response.data;
};

export const deleteNotificationApi = async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/notifications/${id}`);
  return response.data;
};
