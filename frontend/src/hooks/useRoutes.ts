import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { Route } from '@/types/models';

interface CreateRouteData {
  name: string;
  duration: string; // ISO duration
  stops: Array<{
    name: string;
    order: number;
    latitude: number;
    longitude: number;
    arrivalTime: string; // HH:mm format
  }>;
}

interface UpdateRouteData extends CreateRouteData {
  id: number;
}

export function useRoutes() {
  return useQuery<Route[], ApiError>({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await api.get('/routes');
      return response.data;
    },
  });
}

export function useRoute(id: number) {
  return useQuery<Route, ApiError>({
    queryKey: ['routes', id],
    queryFn: async () => {
      const response = await api.get(`/routes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation<Route, ApiError, CreateRouteData>({
    mutationFn: async (data) => {
      const response = await api.post('/routes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation<Route, ApiError, UpdateRouteData>({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.put(`/routes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      await api.delete(`/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
