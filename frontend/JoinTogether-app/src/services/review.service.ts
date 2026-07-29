import api from './api';
import type { ApiResponse } from '../types/auth';
import type {
  CreateReviewRequest,
  DanhGia,
  DiemUyTin,
  LichSuDiemUyTin,
  TieuChiDanhGia,
} from '../types/review';

export const createReviewApi = async (
  data: CreateReviewRequest,
): Promise<ApiResponse<DanhGia>> => {
  const res = await api.post<ApiResponse<DanhGia>>('/reviews', data);
  return res.data;
};

export const getReviewsByActivityApi = async (
  hoatDongId: number,
): Promise<ApiResponse<DanhGia[]>> => {
  const res = await api.get<ApiResponse<DanhGia[]>>(`/reviews/activity/${hoatDongId}`);
  return res.data;
};

export const getReviewsForUserApi = async (
  nguoiDungId: number,
): Promise<ApiResponse<DanhGia[]>> => {
  const res = await api.get<ApiResponse<DanhGia[]>>(`/reviews/user/${nguoiDungId}`);
  return res.data;
};

export const getReviewDetailApi = async (
  danhGiaId: number,
): Promise<ApiResponse<DanhGia>> => {
  const res = await api.get<ApiResponse<DanhGia>>(`/reviews/detail/${danhGiaId}`);
  return res.data;
};

export const getAllTieuChiApi = async (): Promise<ApiResponse<TieuChiDanhGia[]>> => {
  const res = await api.get<ApiResponse<TieuChiDanhGia[]>>('/reviews/criteria');
  return res.data;
};

export const getReputationApi = async (
  nguoiDungId: number,
): Promise<ApiResponse<DiemUyTin>> => {
  const res = await api.get<ApiResponse<DiemUyTin>>(`/reviews/reputation/${nguoiDungId}`);
  return res.data;
};

export const getReputationHistoryApi = async (
  nguoiDungId: number,
): Promise<ApiResponse<LichSuDiemUyTin[]>> => {
  const res = await api.get<ApiResponse<LichSuDiemUyTin[]>>(
    `/reviews/reputation/${nguoiDungId}/history`,
  );
  return res.data;
};

export const replyToReviewApi = async (
  danhGiaId: number,
  phanHoi: string,
): Promise<ApiResponse<DanhGia>> => {
  const res = await api.post<ApiResponse<DanhGia>>(`/reviews/${danhGiaId}/reply`, { phanHoi });
  return res.data;
};
