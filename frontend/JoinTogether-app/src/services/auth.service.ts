import api from './api';
import type { LoginRequest, RegisterRequest, ApiResponse, LoginResponseData } from '../types/auth';

export const loginApi = async (data: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
  const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', data);
  return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/register', data);
  return response.data;
};
