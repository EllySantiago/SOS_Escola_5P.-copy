import * as SecureStore from 'expo-secure-store';
import { LEGACY_AUTH_TOKEN_KEY } from '@/constants/config';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(LEGACY_AUTH_TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(LEGACY_AUTH_TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(LEGACY_AUTH_TOKEN_KEY);
}
