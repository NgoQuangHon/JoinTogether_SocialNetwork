import api from './api';
import type { ApiResponse } from '../types/auth';
import type { CreateActivityRequest, DanhMucHoatDong, HoatDongResponse, TieuChiThamGia, SearchFilters, SearchResult } from '../types/activity';

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

// ==================== CRITERIA ====================

export const getCriteriaByActivityApi = async (hoatDongId: number): Promise<ApiResponse<TieuChiThamGia[]>> => {
  const response = await api.get<ApiResponse<TieuChiThamGia[]>>(`/activities/${hoatDongId}/criteria`);
  return response.data;
};

export const addCriteriaApi = async (hoatDongId: number, data: Partial<TieuChiThamGia>): Promise<ApiResponse<TieuChiThamGia>> => {
  const response = await api.post<ApiResponse<TieuChiThamGia>>(`/activities/${hoatDongId}/criteria`, data);
  return response.data;
};

export const updateCriteriaApi = async (id: number, data: Partial<TieuChiThamGia>): Promise<ApiResponse<TieuChiThamGia>> => {
  const response = await api.put<ApiResponse<TieuChiThamGia>>(`/activities/criteria/${id}`, data);
  return response.data;
};

export const deleteCriteriaApi = async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/activities/criteria/${id}`);
  return response.data;
};

// ==================== SEARCH ====================

export const searchActivitiesApi = async (filters: SearchFilters): Promise<ApiResponse<SearchResult>> => {
  const params: Record<string, string> = {};
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.danhMucHoatDongId) params.danhMucHoatDongId = String(filters.danhMucHoatDongId);
  if (filters.diaDiemId) params.diaDiemId = String(filters.diaDiemId);
  if (filters.tuNgay) params.tuNgay = filters.tuNgay;
  if (filters.denNgay) params.denNgay = filters.denNgay;
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.offset) params.offset = String(filters.offset);
  const response = await api.get<ApiResponse<SearchResult>>('/activities/search', { params });
  return response.data;
};

// ==================== JOIN REQUESTS MANAGEMENT ====================

export interface YeuCauThamGia {
  yeuCauId: number;
  hoatDongId: number;
  nguoiDungId: number;
  hoTen?: string;
  email?: string;
  trangThai: string;
  thoiGianGui?: string;
}

export const getPendingRequestsApi = async (hoatDongId: number): Promise<ApiResponse<YeuCauThamGia[]>> => {
  const response = await api.get<ApiResponse<YeuCauThamGia[]>>(`/activities/${hoatDongId}/requests`);
  return response.data;
};

export const approveRequestApi = async (hoatDongId: number, yeuCauId: number): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/activities/${hoatDongId}/requests/${yeuCauId}/approve`);
  return response.data;
};

export const rejectRequestApi = async (hoatDongId: number, yeuCauId: number): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/activities/${hoatDongId}/requests/${yeuCauId}/reject`);
  return response.data;
};

// ==================== JOIN / LEAVE ====================

export const joinActivityApi = async (hoatDongId: number): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/activities/${hoatDongId}/join`);
  return response.data;
};

export const leaveActivityApi = async (hoatDongId: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/activities/${hoatDongId}/leave`);
  return response.data;
};

// ==================== CHECK-IN & ATTENDANCE ====================

export const getMembersApi = async (hoatDongId: number): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`/activities/${hoatDongId}/members`);
  return response.data;
};

export const userCheckInApi = async (hoatDongId: number, maCheckIn?: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/activities/${hoatDongId}/checkin`, { maCheckIn });
  return response.data;
};

export const cancelParticipationApi = async (hoatDongId: number, lyDo?: string): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(`/activities/${hoatDongId}/cancel-participation`, { lyDo });
  return response.data;
};

export const sendReminderApi = async (hoatDongId: number): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(`/activities/${hoatDongId}/reminder`);
  return response.data;
};

export const getAttendanceListApi = async (hoatDongId: number): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`/activities/${hoatDongId}/attendance`);
  return response.data;
};

export const updateAttendanceStatusApi = async (hoatDongId: number, thanhVienId: number, trangThaiThamDu: string): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/activities/${hoatDongId}/members/${thanhVienId}/attendance-status`, { trangThaiThamDu });
  return response.data;
};
