import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { Ticket } from '@/types/models';
import { useAuthStore } from '@/store/authStore';

interface BookTicketData {
  roundTrip: boolean;
  price: number;
  tripIds: number[];
}

interface CancelTicketData {
  ticketId: number;
  reason: string;
}

export function useTickets() {
  const { user } = useAuthStore();

  return useQuery<Ticket[], ApiError>({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets', {
        params: { userId: user?.id },
      });
      return response.data;
    },
    enabled: !!user,
  });
}

export function useBookTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation<Ticket, ApiError, BookTicketData>({
    mutationFn: async (data) => {
      const response = await api.post('/tickets', {
        ...data,
        userId: user?.id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useCancelTicket() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, CancelTicketData>({
    mutationFn: async ({ ticketId, reason }) => {
      await api.post(`/tickets/${ticketId}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}