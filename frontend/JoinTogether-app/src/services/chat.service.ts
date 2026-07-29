import api from './api';
import type { ApiResponse } from '../types/auth';

export interface PhongTroChuyen {
  phongId: number;
  hoatDongId: number;
  tenPhong: string;
  trangThai: string; // 'ACTIVE' | 'CLOSED'
  activityStatus?: string;
}

export interface TinNhan {
  tinNhanId: number;
  phongId: number;
  nguoiGuiId: number;
  nguoiGui?: string;
  noiDung: string;
  guiLuc?: string;
  thoiGianTao?: string;
  created_at?: string;
}

export const getOrCreateRoomApi = async (hoatDongId: number): Promise<ApiResponse<PhongTroChuyen>> => {
  const response = await api.get<ApiResponse<PhongTroChuyen>>(`/chat/rooms/${hoatDongId}`);
  return response.data;
};

export const getMessagesApi = async (phongId: number, limit = 50, offset = 0): Promise<ApiResponse<TinNhan[]>> => {
  const response = await api.get<ApiResponse<TinNhan[]>>(`/chat/rooms/${phongId}/messages`, {
    params: { limit, offset },
  });
  return response.data;
};

export const sendMessageApi = async (phongId: number, noiDung: string): Promise<ApiResponse<TinNhan>> => {
  const response = await api.post<ApiResponse<TinNhan>>(`/chat/rooms/${phongId}/messages`, { noiDung });
  return response.data;
};

export const getUserRoomsApi = async (): Promise<ApiResponse<PhongTroChuyen[]>> => {
  const response = await api.get<ApiResponse<PhongTroChuyen[]>>('/chat/rooms');
  return response.data;
};

export const deleteMessageApi = async (tinNhanId: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/chat/messages/${tinNhanId}`);
  return response.data;
};
