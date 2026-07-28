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
  daThich?: boolean;
}

export interface BinhLuanResponse {
  binhLuanId: number;
  baiVietId: number;
  nguoiDungId: number;
  nguoiDung?: string;
  noiDung: string;
  thoiGianTao: string;
}

export const getPostsApi = async (): Promise<ApiResponse<BaiVietResponse[]>> => {
  const response = await api.get<ApiResponse<BaiVietResponse[]>>('/posts');
  return response.data;
};

export const likePostApi = async (postId: number): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(`/posts/${postId}/like`);
  return response.data;
};

export const unlikePostApi = async (postId: number): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/posts/${postId}/like`);
  return response.data;
};

export const getCommentsApi = async (postId: number): Promise<ApiResponse<BinhLuanResponse[]>> => {
  const response = await api.get<ApiResponse<BinhLuanResponse[]>>(`/posts/${postId}/comments`);
  return response.data;
};

export const addCommentApi = async (postId: number, noiDung: string): Promise<ApiResponse<BinhLuanResponse>> => {
  const response = await api.post<ApiResponse<BinhLuanResponse>>(`/posts/${postId}/comments`, { noiDung });
  return response.data;
};

export const sharePostApi = async (postId: number): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(`/posts/${postId}/share`);
  return response.data;
};
