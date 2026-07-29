import api from './api';
import type { ApiResponse } from '../types/auth';
import type { ConnectionRequest, ConnectionStatus } from '../types/connection';

export const getSuggestionsApi = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>('/connections/suggestions');
  return response.data;
};

export const followUserApi = async (userId: number): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/connections/${userId}/follow`);
  return response.data;
};

export const unfollowUserApi = async (userId: number): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/connections/${userId}/follow`);
  return response.data;
};

export const checkFollowingApi = async (userId: number): Promise<ApiResponse<{ isFollowing: boolean }>> => {
  const response = await api.get<ApiResponse<{ isFollowing: boolean }>>(`/connections/${userId}/follow`);
  return response.data;
};

// ==================== CONNECTION REQUESTS ====================

export const sendConnectionRequestApi = async (nguoiNhanId: number, loiNhan?: string): Promise<ApiResponse<ConnectionRequest>> => {
  const response = await api.post<ApiResponse<ConnectionRequest>>('/connections/request', { nguoiNhanId, loiNhan });
  return response.data;
};

export const respondToRequestApi = async (yeuCauId: number, accept: boolean): Promise<ApiResponse<ConnectionRequest>> => {
  const response = await api.put<ApiResponse<ConnectionRequest>>(`/connections/request/${yeuCauId}`, { accept });
  return response.data;
};

export const getPendingRequestsApi = async (): Promise<ApiResponse<ConnectionRequest[]>> => {
  const response = await api.get<ApiResponse<ConnectionRequest[]>>('/connections/requests');
  return response.data;
};

export const getConnectionsApi = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>('/connections');
  return response.data;
};

export const removeConnectionApi = async (userId: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/connections/${userId}`);
  return response.data;
};

// ==================== CONNECTION STATUS ====================

export const getConnectionStatusApi = async (userId: number): Promise<ApiResponse<ConnectionStatus>> => {
  const response = await api.get<ApiResponse<ConnectionStatus>>(`/connections/status/${userId}`);
  return response.data;
};

// ==================== BLOCK ====================

export const blockUserApi = async (userId: number): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(`/connections/block/${userId}`);
  return response.data;
};

export const unblockUserApi = async (userId: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/connections/block/${userId}`);
  return response.data;
};

export const checkBlockedApi = async (userId: number): Promise<ApiResponse<{ blocked: boolean }>> => {
  const response = await api.get<ApiResponse<{ blocked: boolean }>>(`/connections/block/${userId}`);
  return response.data;
};
