import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { NotificationPreference } from '@/types/notification';

export function useNotificationPreferences(userId?: string) {
  return useQuery<NotificationPreference, ApiError>({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      const response = await api.get(`/notifications/preferences/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreference, ApiError, NotificationPreference>({
    mutationFn: async (data) => {
      if (data.id) {
        const response = await api.put(`/notifications/preferences/${data.id}`, data);
        return response.data;
      } else {
        const response = await api.post('/notifications/preferences', data);
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', data.userId] });
    },
  });
}