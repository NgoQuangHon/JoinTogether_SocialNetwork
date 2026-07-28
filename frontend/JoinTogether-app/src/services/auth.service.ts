// src/services/auth.service.ts

import api from './api';

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
        email,
        password,
    });

    return response.data;
};

export const register = async (data: any) => {
    const response = await api.post('/auth/register', data);

    return response.data;
};
