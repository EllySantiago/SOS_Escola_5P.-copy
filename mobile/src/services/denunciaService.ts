import { apiRequest } from './http';
import type { Denuncia, DenunciaFiltros, NovaDenunciaInput, PaginatedResponse } from '@/types';

/**
 * Service: só conhece o endpoint /denuncias.
 */
export const DenunciaService = {
  async criar(dados: NovaDenunciaInput): Promise<Denuncia> {
    const response = await apiRequest<Denuncia>('/denuncias', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Não foi possível registrar a denúncia');
    }
    return response.data;
  },

  async listarMinhas(): Promise<Denuncia[]> {
    const response = await denunciasAPI.listarMinhas();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Não foi possível carregar suas denúncias');
    }
    return response.data.data;
  },
};

function paginationQuery(page: number, limit: number, includeMeta = false): string {
  const params = new URLSearchParams({
    _page: String(page),
    _limit: String(limit),
  });
  if (includeMeta) params.set('_meta', '1');
  return params.toString();
}

export const denunciasAPI = {
  listarMinhas: async (page = 1, limit = 50) =>
    apiRequest<PaginatedResponse<Denuncia>>(
      `/denuncias/minhas?${paginationQuery(page, limit)}`
    ),

  listarTodas: async (page = 1, limit = 50, filtros: DenunciaFiltros = {}) => {
    const params = new URLSearchParams(paginationQuery(page, limit, true));
    (Object.keys(filtros) as (keyof DenunciaFiltros)[]).forEach((key) => {
      const value = filtros[key];
      if (value) params.append(key, value);
    });
    return apiRequest<PaginatedResponse<Denuncia>>(`/denuncias?${params.toString()}`);
  },

  list: async (page = 1, limit = 50, filtros: DenunciaFiltros = {}) =>
    denunciasAPI.listarTodas(page, limit, filtros),

  getById: async (id: number) => apiRequest<Denuncia>(`/denuncias/${id}`),

  create: async (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<Denuncia>('/denuncias', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),

  update: async (id: number, data: Partial<Denuncia>) =>
    apiRequest<Denuncia>(`/denuncias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: async (id: number) => apiRequest<void>(`/denuncias/${id}`, {
    method: 'DELETE',
  }),
};
