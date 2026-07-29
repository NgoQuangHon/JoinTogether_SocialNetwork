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

export const verifyEmailApi = async (taiKhoanId: number, maXacThuc: string): Promise<ApiResponse<LoginResponseData>> => {
  const response = await api.post<ApiResponse<LoginResponseData>>('/auth/verify-email', { taiKhoanId, maXacThuc });
  return response.data;
};

export const resendCodeApi = async (taiKhoanId: number): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/resend-code', { taiKhoanId });
  return response.data;
};

export const requestPasswordResetApi = async (email: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/request-password-reset', { email });
  return response.data;
};

export const resetPasswordApi = async (data: { email: string; maXacThuc: string; matKhauMoi: string }): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/reset-password', data);
  return response.data;
};
