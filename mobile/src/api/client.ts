import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Priority: 1. EXPO_PUBLIC_API_URL (.env / EAS Secrets), 2. app.json extra.apiUrl, 3. Fallback
export const DEFAULT_API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  Constants.expoConfig?.extra?.apiUrl || 
  'http://localhost:3000/api';


const API_STORAGE_KEY = '@kwikbill_api_base_url';
const TOKEN_STORAGE_KEY = '@kwikbill_auth_token';

export async function getApiBaseUrl(): Promise<string> {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  try {
    const saved = await AsyncStorage.getItem(API_STORAGE_KEY);
    return saved || DEFAULT_API_BASE_URL;
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_STORAGE_KEY, url);
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function getFreshAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('./firebase.ts');
    if (auth.currentUser) {
      // Force refresh the token if it's nearing expiry or expired
      const freshToken = await auth.currentUser.getIdToken(false);
      await setAuthToken(freshToken);
      return freshToken;
    }
  } catch (e) {
    console.log('Error refreshing token from Firebase:', e);
  }
  return await getAuthToken();
}

export async function apiClient<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
  } = {}
): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  let token = await getFreshAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  let response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // If unauthorized / token expired, force refresh token from Firebase once and retry
  if (response.status === 401) {
    try {
      const { auth } = await import('./firebase.ts');
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken(true);
        await setAuthToken(token);
        headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
      }
    } catch (refreshErr) {
      console.log('Failed to force refresh Firebase token:', refreshErr);
    }
  }

  let data: any = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  } else {
    try {
      const text = await response.text();
      data = { error: text };
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `HTTP ${response.status}: Failed request`;
    throw new Error(errorMsg);
  }

  return data;
}
