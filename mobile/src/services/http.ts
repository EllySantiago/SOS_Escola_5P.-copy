import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/constants/config';
import type { ApiResponse } from '@/types';

type ApiRequestOptions = RequestInit & { authenticated?: boolean };

export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  try {
    const { authenticated = true, ...requestOptions } = options ?? {};
    const token = authenticated ? await SecureStore.getItemAsync(AUTH_TOKEN_KEY) : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestOptions.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return {
      success: true,
      data: await response.json() as T,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
