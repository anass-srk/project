import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { Subscription, SubscriptionType } from '@/types/subscription';

interface CreateSubscriptionData {
  userId: string;
  subscriptionTypeId: number;
}

interface CreateSubscriptionTypeData {
  name: string;
  duration: number;
  availabilityStartDate: string;
  availabilityEndDate: string;
  price: number;
  discount: number;
}

interface UpdateSubscriptionTypeData extends CreateSubscriptionTypeData {
  id: number;
}

export function useSubscriptionTypes() {
  return useQuery<SubscriptionType[], ApiError>({
    queryKey: ['subscription-types'],
    queryFn: async () => {
      const response = await api.get('/subscription-types');
      return response.data;
    },
  });
}

export function useSubscriptionType(id: number) {
  return useQuery<SubscriptionType, ApiError>({
    queryKey: ['subscription-types', id],
    queryFn: async () => {
      const response = await api.get(`/subscription-types/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubscriptionType() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionType, ApiError, CreateSubscriptionTypeData>({
    mutationFn: async (data) => {
      const response = await api.post('/subscription-types', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-types'] });
    },
  });
}

export function useUpdateSubscriptionType() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionType, ApiError, UpdateSubscriptionTypeData>({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.put(`/subscription-types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-types'] });
    },
  });
}

export function useDeleteSubscriptionType() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      await api.delete(`/subscription-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-types'] });
    },
  });
}

export function useUserSubscription(userId?: string) {
  return useQuery<Subscription | null, ApiError>({
    queryKey: ['subscriptions', userId],
    queryFn: async () => {
      const response = await api.get(`/subscriptions/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation<Subscription, ApiError, CreateSubscriptionData>({
    mutationFn: async (data) => {
      const response = await api.post('/subscriptions', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.userId] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      await api.post(`/subscriptions/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}