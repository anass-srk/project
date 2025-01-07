import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { User } from '@/types/user';

interface CreateDriverData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UpdateDriverData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export function useDrivers() {
  return useQuery<User[], ApiError>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await api.get('/users/drivers');
      return response.data;
    },
  });
}

export function useDriversByIds(driverIds?: string[]) {
  return useQuery<User[], ApiError>({
    queryKey: ['drivers', driverIds],
    queryFn: async () => {
      const response = await api.get('/users/drivers/by-ids', {
        params: { ids: driverIds?.join(',') }
      });
      return response.data;
    },
    enabled: !!driverIds?.length,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, CreateDriverData>({
    mutationFn: async (data) => {
      const response = await api.post('/users/drivers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, UpdateDriverData>({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.put(`/users/drivers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => {
      await api.delete(`/users/drivers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}