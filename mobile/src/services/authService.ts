import { setToken, clearToken } from './tokenStorage';
import { apiRequest } from './http';
import type { AuthLoginResponse, AuthLogoutResponse } from '@/types';

/**
 * Service: só conhece o endpoint /auth. Não sabe nada sobre
 * tela, formulário ou estado — isso é trabalho do ViewModel.
 */
export const AuthService = {
  async login(email: string, password: string): Promise<AuthLoginResponse> {
    const response = await apiRequest<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      authenticated: false,
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login falhou');
    }
    const session = response.data;
    await setToken(session.token);
    return session;
  },

  async logout(): Promise<void> {
    await clearToken();
  },
};

export const authAPI = {
  login: async (email: string, password: string) => apiRequest<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  logout: async () => apiRequest<AuthLogoutResponse>('/auth/logout', {
    method: 'POST',
  }),
};
