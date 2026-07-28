import api from './api';

export const getMyProfile = async () => {
    const response = await api.get('/profile/my-profile');
    return response.data;
};

export const updateProfile = async (data: any) => {
    const response = await api.put('/profile', data);
    return response.data;
};

export const updateAvatar = async (formData: FormData) => {
    const response = await api.put('/profile/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
