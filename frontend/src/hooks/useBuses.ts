import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { Bus } from '@/types/models';

interface CreateBusData {
  registrationNumber: string;
  seats: number;
}

interface UpdateBusData extends CreateBusData {
  id: number;
}

export function useBuses() {
  return useQuery<Bus[], ApiError>({
    queryKey: ['buses'],
    queryFn: async () => {
      const response = await api.get('/buses');
      return response.data;
    },
  });
}

export function useCreateBus() {
  const queryClient = useQueryClient();

  return useMutation<Bus, ApiError, CreateBusData>({
    mutationFn: async (data) => {
      const response = await api.post('/buses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });
}

export function useUpdateBus() {
  const queryClient = useQueryClient();

  return useMutation<Bus, ApiError, UpdateBusData>({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.put(`/buses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });
}

export function useDeleteBus() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      await api.delete(`/buses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });
}