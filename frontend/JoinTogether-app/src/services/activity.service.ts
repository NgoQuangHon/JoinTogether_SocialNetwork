import api from './api';
import type { ApiResponse } from '../types/auth';
import type { CreateActivityRequest, DanhMucHoatDong, HoatDongResponse } from '../types/activity';

export const createActivityApi = async (data: CreateActivityRequest): Promise<ApiResponse<HoatDongResponse>> => {
  const response = await api.post<ApiResponse<HoatDongResponse>>('/activities', data);
  return response.data;
};

export const getCategoriesApi = async (): Promise<ApiResponse<DanhMucHoatDong[]>> => {
  const response = await api.get<ApiResponse<DanhMucHoatDong[]>>('/activities/categories');
  return response.data;
};

export const getMyActivitiesApi = async (): Promise<ApiResponse<HoatDongResponse[]>> => {
  const response = await api.get<ApiResponse<HoatDongResponse[]>>('/activities/my');
  return response.data;
};

export const cancelActivityApi = async (id: number, lyDoHuy?: string): Promise<ApiResponse<HoatDongResponse>> => {
  const response = await api.patch<ApiResponse<HoatDongResponse>>(`/activities/${id}/cancel`, { lyDoHuy });
  return response.data;
};

export const updateActivityApi = async (id: number, data: Partial<CreateActivityRequest>): Promise<ApiResponse<HoatDongResponse>> => {
  const response = await api.put<ApiResponse<HoatDongResponse>>(`/activities/${id}`, data);
  return response.data;
};

export const getActivityByIdApi = async (id: number): Promise<ApiResponse<HoatDongResponse>> => {
  const response = await api.get<ApiResponse<HoatDongResponse>>(`/activities/${id}`);
  return response.data;
};

export const getAllActivitiesApi = async (): Promise<ApiResponse<HoatDongResponse[]>> => {
  const response = await api.get<ApiResponse<HoatDongResponse[]>>('/activities');
  return response.data;
};

export const getFeaturedActivitiesApi = async (): Promise<ApiResponse<HoatDongResponse[]>> => {
  const response = await api.get<ApiResponse<HoatDongResponse[]>>('/activities/featured');
  return response.data;
};
