import api from './api';
import type { LoginRequest, RegisterRequest, Token, User } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<Token> {
    // FastAPI OAuth2PasswordRequestForm expects form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    const res = await api.post<Token>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const res = await api.post<User>('/auth/register', data);
    return res.data;
  },
};
