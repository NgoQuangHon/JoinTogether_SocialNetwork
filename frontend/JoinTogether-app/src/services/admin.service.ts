import api from './api';
import type { ApiResponse } from '../types/auth';

export interface AdminUser {
  nguoiDungId: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  trangThai?: string;
  ngayTao?: string;
  taiKhoan?: { tenDangNhap: string; trangThai: string; daXacThuc: boolean };
}

export const getUsersApi = async (
  limit = 20,
  offset = 0,
): Promise<ApiResponse<{ rows: AdminUser[]; total: number }>> => {
  const res = await api.get<ApiResponse<{ rows: AdminUser[]; total: number }>>(
    '/admin/accounts',
    { params: { limit, offset } },
  );
  return res.data;
};

export const getUserByIdApi = async (id: number): Promise<ApiResponse<AdminUser>> => {
  const res = await api.get<ApiResponse<AdminUser>>(`/admin/accounts/${id}`);
  return res.data;
};

export const updateUserApi = async (
  id: number,
  data: { hoTen?: string; email?: string; soDienThoai?: string; trangThai?: string },
): Promise<ApiResponse<AdminUser>> => {
  const res = await api.put<ApiResponse<AdminUser>>(`/admin/accounts/${id}`, data);
  return res.data;
};

export const lockAccountApi = async (id: number): Promise<ApiResponse<any>> => {
  const res = await api.put<ApiResponse<any>>(`/admin/accounts/${id}/lock`);
  return res.data;
};

export const unlockAccountApi = async (id: number): Promise<ApiResponse<any>> => {
  const res = await api.put<ApiResponse<any>>(`/admin/accounts/${id}/unlock`);
  return res.data;
};

export const getAuditLogsApi = async (
  limit = 50,
  offset = 0,
): Promise<ApiResponse<any[]>> => {
  const res = await api.get<ApiResponse<any[]>>('/admin/audit-logs', {
    params: { limit, offset },
  });
  return res.data;
};
