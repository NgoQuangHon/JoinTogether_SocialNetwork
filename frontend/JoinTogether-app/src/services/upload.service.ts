import api from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    size: number;
  };
}

export const uploadFileApi = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
