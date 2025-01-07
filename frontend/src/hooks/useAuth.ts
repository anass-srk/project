import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/types/api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/user';

export function useLogin() {
  const setAuth = useAuthStore(state => state.setAuth);

  return useMutation<AuthResponse, ApiError, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      setAuth(response.data.user, response.data.token);
      return response.data;
    },
  });
}

export function useRegister() {
  return useMutation<User, ApiError, RegisterData>({
    mutationFn: async (data) => {
      const response = await api.post<User>('/auth/register', data);
      return response.data;
    },
  });
}

export function useUpdateProfile() {
  const setAuth = useAuthStore(state => state.setAuth);

  return useMutation<User, ApiError, Partial<User> & {currentPassword?:string} >({
    mutationFn: async (data) => {
      const response = await api.put<User>('/users/profile', data);
      setAuth(response.data, useAuthStore.getState().token!);
      return response.data;
    },
  });
}