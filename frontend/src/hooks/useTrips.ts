import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/types/api';
import { Trip } from '@/types/models';

interface CreateTripData {
  routeId: number;
  departureTime: string;
  duration: string;
  price: number;
  driverId: string;
  busId: number;
}

interface UpdateTripData extends Partial<CreateTripData> {
  id: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface AvailableResources {
  busyDriverIds: string[];
  busyBusIds: number[];
  availableBuses: {
    id: number;
    registrationNumber: string;
    seats: number;
  }[];
}

export function useTrips(date?: string) {
  return useQuery<Trip[], ApiError>({
    queryKey: ['trips', date],
    queryFn: async () => {
      const response = await api.get('/trips', {
        params: { date },
      });
      return response.data;
    },
  });
}

export function useUpcomingTrips(startDate: string) {
  return useQuery<Trip[], ApiError>({
    queryKey: ['trips', 'upcoming', startDate],
    queryFn: async () => {
      const response = await api.get('/trips/upcoming', {
        params: { startDate },
      });
      return response.data;
    },
  });
}

export function useTripsByIds(tripIds?: number[]) {
  return useQuery<Trip[], ApiError>({
    queryKey: ['trips', tripIds],
    queryFn: async () => {
      const response = await api.get('/trips/by-ids', {
        params: { ids: tripIds?.join(',') }
      });
      return response.data;
    },
    enabled: !!tripIds?.length,
  });
}

export function useTripById(id: number) {
  return useQuery<Trip, ApiError>({
    queryKey: ['trips', id],
    queryFn: async () => {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useAvailableResources(date: string) {
  return useQuery<AvailableResources, ApiError>({
    queryKey: ['available-resources', date],
    queryFn: async () => {
      const response = await api.get('/trips/available-resources', {
        params: { date },
      });
      return response.data;
    },
    enabled: !!date,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation<Trip, ApiError, CreateTripData>({
    mutationFn: async (data) => {
      const response = await api.post('/trips', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation<Trip, ApiError, UpdateTripData>({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.put(`/trips/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      await api.delete(`/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}