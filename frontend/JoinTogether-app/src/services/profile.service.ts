import api from './api';
import type { HoSoNguoiDung } from '../types/profile';
import type { ApiResponse } from '../types/auth';

export const getMyProfile = async (): Promise<ApiResponse<HoSoNguoiDung>> => {
    const response = await api.get<ApiResponse<HoSoNguoiDung>>('/profile/my-profile');
    return response.data;
};

export const getProfile = async (id: number): Promise<ApiResponse<HoSoNguoiDung>> => {
    const response = await api.get<ApiResponse<HoSoNguoiDung>>(`/profile/${id}`);
    return response.data;
};

export const updateProfile = async (data: {
    tieuSu?: string;
    ngaySinh?: string;
    khuVuc?: string;
    mucTieuThamGia?: string;
    thoiGianRanh?: string;
}): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/profile', data);
    return response.data;
};

export const updateAvatar = async (formData: FormData): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
