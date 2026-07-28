import api from './api';
import type { ApiResponse } from '../types/auth';

export const getSuggestionsApi = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>('/connections/suggestions');
  return response.data;
};

export const followUserApi = async (userId: number): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/connections/${userId}/follow`);
  return response.data;
};

export const unfollowUserApi = async (userId: number): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/connections/${userId}/follow`);
  return response.data;
};
