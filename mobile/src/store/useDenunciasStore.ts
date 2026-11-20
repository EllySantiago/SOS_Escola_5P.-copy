import { create } from 'zustand';
import { denunciasAPI } from '@/services/denunciaService';
import { notificarMudancaStatus } from '@/services/notifications';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApiResponse, Denuncia, DenunciaFiltros, PaginatedResponse } from '@/types';

interface DenunciasState {
  denuncias: Denuncia[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total?: number;
  filtros: DenunciaFiltros;
  opcoes: { tipos: string[]; bairros: string[] };

  setFiltros: (filtros: DenunciaFiltros) => void;
  limparFiltros: () => void;
  setPage: (page: number) => void;
  fetchDenuncias: () => Promise<void>;
  createDenuncia: (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Denuncia | null>;
  updateDenuncia: (id: number, data: Partial<Denuncia>) => Promise<ApiResponse<Denuncia>>;
  updateDenunciaLocalmente: (protocolo: string, novaSituacao: string) => void;
  deleteDenuncia: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useDenunciasStore = create<DenunciasState>((set, get) => ({
  denuncias: [],
  loading: false,
  error: null,
  page: 1,
  limit: 50,
  total: undefined,
  filtros: {},
  opcoes: { tipos: [], bairros: [] },

  setFiltros: (novos) => {
    set((state) => ({ filtros: { ...state.filtros, ...novos }, page: 1 }));
    get().fetchDenuncias();
  },

  limparFiltros: () => {
    set({ filtros: {}, page: 1 });
    get().fetchDenuncias();
  },

  setPage: (page) => {
    set({ page });
    get().fetchDenuncias();
  },

  clearError: () => set({ error: null }),

  fetchDenuncias: async () => {
    const { page, limit, filtros } = get();
    set({ loading: true, error: null });
    try {
      const currentUser = useAuthStore.getState().user;
      const response = currentUser?.role === 'DENUNCIANTE'
        ? await denunciasAPI.listarMinhas(page, limit)
        : await denunciasAPI.listarTodas(page, limit, filtros);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<Denuncia>;
        const items = Array.isArray(paginatedData)
          ? paginatedData
          : (paginatedData.data || []);

        // notifica o usuário quando a situação de uma denúncia dele mudou
        const anteriores = new Map(get().denuncias.map((d) => [d.id, d.situacao]));
        const role = useAuthStore.getState().user?.role;
        if (anteriores.size > 0 && role === 'DENUNCIANTE') {
          items.forEach((d) => {
            const antes = anteriores.get(d.id);
            if (antes && antes !== d.situacao) {
              notificarMudancaStatus(d.protocolo, d.tipoDenuncia, d.situacao);
            }
          });
        }

        const opcoes = get().opcoes;
        const unir = (a: string[], b: string[]) =>
          Array.from(new Set([...a, ...b.filter(Boolean)])).sort();

        set({
          denuncias: items,
          opcoes: {
            tipos: unir(opcoes.tipos, items.map((d) => d.tipoDenuncia)),
            bairros: unir(opcoes.bairros, items.map((d) => d.bairroOcorrencia)),
          },
          loading: false,
          total: !Array.isArray(paginatedData) && paginatedData.meta ? paginatedData.meta.total : undefined,
        });
      } else {
        set({
          error: response.error || 'Falha ao buscar denúncias',
          denuncias: [],
          loading: false,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      set({ error: message, denuncias: [], loading: false });
    }
  },

  createDenuncia: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await denunciasAPI.create(data);
      if (response.success && response.data) {
        const newData = response.data as Denuncia;
        set((state) => ({ denuncias: [newData, ...state.denuncias], loading: false }));
        return newData;
      } else {
        set({ error: response.error || 'Falha ao criar denúncia', loading: false });
        return null;
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro desconhecido', loading: false });
      return null;
    }
  },

  updateDenuncia: async (id, data) => {
    try {
      const response = await denunciasAPI.update(id, data);
      if (response.success && response.data) {
        const anterior = get().denuncias.find((denuncia) => denuncia.id === id);
        set((state) => ({
          denuncias: state.denuncias.map((d) => d.id === id ? { ...d, ...data } : d),
        }));
        if (data.situacao && anterior && data.situacao !== anterior.situacao) {
          notificarMudancaStatus(anterior.protocolo, anterior.tipoDenuncia, data.situacao);
        }
      }
      return response;
    } catch (err) {
      console.error('Erro ao atualizar denúncia:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      };
    }
  },

  updateDenunciaLocalmente: (protocolo, novaSituacao) => {
    set((state) => ({
      denuncias: state.denuncias.map((d) =>
        d.protocolo === protocolo ? { ...d, situacao: novaSituacao } : d
      ),
    }));
  },

  deleteDenuncia: async (id) => {
    try {
      await denunciasAPI.delete(id);
      set((state) => ({
        denuncias: state.denuncias.filter((d) => d.id !== id),
      }));
    } catch (err) {
      console.error('Erro ao deletar denúncia:', err);
    }
  },
}));
