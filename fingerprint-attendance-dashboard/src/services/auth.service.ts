import api from './api';
import { LoginDto, LoginResponseDto } from '@/types/auth.types';

export const authService = {
    login: async (credentials: LoginDto): Promise<LoginResponseDto> => {
        const response = await api.post<LoginResponseDto>('/api/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
    },

    refreshToken: async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const response = await api.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh-token', { refreshToken: token });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/api/auth/profile');
        return response.data;
    },
};
