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
    hoTen?: string;
    email?: string;
    soDienThoai?: string;
    tieuSu?: string;
    ngaySinh?: string;
    khuVuc?: string;
    gioiTinh?: string;
    mucTieuThamGia?: string;
    thoiGianRanh?: string;
}): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/profile', data);
    return response.data;
};

export const updateAvatar = async (anhDaiDien: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/profile/avatar', { anhDaiDien });
    return response.data;
};
