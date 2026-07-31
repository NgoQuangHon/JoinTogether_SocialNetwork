import api from './api';
import type { ApiResponse } from '../types/auth';

export interface PhongTroChuyen {
  phongId: number;
  tenPhong: string;
  hoatDongId?: number;
  otherUserId?: number;
  loaiPhong?: 'NHOM' | 'RIENG_TU';
  trangThai?: 'ACTIVE' | 'CLOSED';
  activityStatus?: string;
  hetHanLuc?: string | null;
  isFriend?: boolean;
  myProposal?: 'NONE' | 'AGREED' | 'DECLINED';
  otherProposal?: 'NONE' | 'AGREED' | 'DECLINED';
}

export interface TinNhan {
  tinNhanId: number;
  phongId: number;
  nguoiGuiId: number;
  nguoiGui?: string;
  nguoiGuiName?: string;
  noiDung: string;
  guiLuc?: string;
  thoiGianTao?: string;
  thoiGianGui?: string;
}

export const getOrCreateRoomApi = async (hoatDongId: number): Promise<ApiResponse<PhongTroChuyen>> => {
  const response = await api.get<ApiResponse<PhongTroChuyen>>(`/chat/rooms/${hoatDongId}`);
  return response.data;
};

export const getOrCreatePrivateRoomApi = async (targetUserId: number): Promise<ApiResponse<PhongTroChuyen>> => {
  const response = await api.get<ApiResponse<PhongTroChuyen>>(`/chat/private/${targetUserId}`);
  return response.data;
};

export const getMessagesApi = async (
  phongId: number,
  limit: number = 50,
  offset: number = 0,
): Promise<ApiResponse<TinNhan[]>> => {
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
