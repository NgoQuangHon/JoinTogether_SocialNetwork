import api from './api';
import type { ApiResponse } from '../types/auth';

export const getSuggestionsApi = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>('/connections/suggestions');
  return response.data;
};
