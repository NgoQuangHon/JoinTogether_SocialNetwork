import api from './api';
import type { ApiResponse } from '../types/auth';
import type {
  BaoCaoViPham,
  CreateReportRequest,
  LoaiViPham,
  ProcessReportRequest,
} from '../types/report';

export const createReportApi = async (
  data: CreateReportRequest,
): Promise<ApiResponse<BaoCaoViPham>> => {
  const res = await api.post<ApiResponse<BaoCaoViPham>>('/reports', data);
  return res.data;
};

export const getReportsApi = async (
  trangThai?: string,
): Promise<ApiResponse<BaoCaoViPham[]>> => {
  const params = trangThai ? { trangThai } : {};
  const res = await api.get<ApiResponse<BaoCaoViPham[]>>('/reports', { params });
  return res.data;
};

export const getReportByIdApi = async (
  id: number,
): Promise<ApiResponse<BaoCaoViPham>> => {
  const res = await api.get<ApiResponse<BaoCaoViPham>>(`/reports/${id}`);
  return res.data;
};

export const processReportApi = async (
  id: number,
  data: ProcessReportRequest,
): Promise<ApiResponse<BaoCaoViPham>> => {
  const res = await api.put<ApiResponse<BaoCaoViPham>>(`/reports/${id}/process`, data);
  return res.data;
};

export const getViolationTypesApi = async (): Promise<ApiResponse<LoaiViPham[]>> => {
  const res = await api.get<ApiResponse<LoaiViPham[]>>('/reports/violation-types');
  return res.data;
};

export const getViolationStatsApi = async (): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/reports/stats');
  return res.data;
};
