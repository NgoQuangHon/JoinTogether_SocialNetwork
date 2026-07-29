import api from './api';
import type { ApiResponse } from '../types/auth';

export interface InterestCategory {
  danhMucSoThichId: number;
  tenDanhMuc: string;
  moTa?: string;
  soThich: Interest[];
}

export interface Interest {
  soThichId: number;
  danhMucSoThichId?: number;
  tenSoThich: string;
  moTa?: string;
  tenDanhMuc: string;
}

export const getInterestCategories = async (): Promise<ApiResponse<InterestCategory[]>> => {
  const response = await api.get<ApiResponse<InterestCategory[]>>('/profile/interests/categories');
  return response.data;
};

export const addInterest = async (soThichId: number, mucDoQuanTam?: number): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/profile/interests', { soThichId, mucDoQuanTam });
  return response.data;
};

export const updateGoals = async (data: { mucTieuThamGia?: string; thoiGianRanh?: string; banKinhMongMuon?: number | null }): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>('/profile/interests/goals', data);
  return response.data;
};
