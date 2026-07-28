import api from './api';
import type { ApiResponse } from '../types/auth';

export interface BaiVietResponse {
  baiVietId: number;
  nguoiDungId: number;
  nguoiDung?: string;
  hoatDongId?: number;
  hoatDongLienQuan?: string;
  noiDung: string;
  hinhAnh?: string;
  soLuotThich: number;
  soBinhLuan: number;
  soLuotChiaSe: number;
  thoiGianTao: string;
}

export const getPostsApi = async (): Promise<ApiResponse<BaiVietResponse[]>> => {
  const response = await api.get<ApiResponse<BaiVietResponse[]>>('/posts');
  return response.data;
};
